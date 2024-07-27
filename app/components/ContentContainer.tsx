import {Json} from "~/types/supabase";

type ContentStructure = {
  content: Content[];
};

type Content = {
  type: string;
  content?: ContentItem[];
  attrs?: {
    level?: number;
    id?: string;
    language?: string;
    start?: number;
    href?: string;
    target?: string;
    rel?: string;
    class?: string | null;
  };
  text?: string;
  marks?: Mark[];
};

type ContentItem = Content;

type Mark = {
  type: string;
  attrs?: {
    href?: string;
    target?: string;
    rel?: string;
    class?: string | null;
  };
};

type ImageAttrs = {
  id: number;
  alt: string;
  storage_key: string;
  prefix: string;
  caption: string;
};

// 类型守卫函数
function isContentStructure(content: Json): content is ContentStructure {
  return (
      typeof content === "object" &&
      content !== null &&
      "content" in content &&
      Array.isArray((content as ContentStructure).content)
  );
}

export default function ContentContainer({content}: { content: Json }) {
  if (!content || !isContentStructure(content)) {
    return (
        <div>
          <p>没有内容</p>
        </div>
    )
  }

  const article = content.content as Content[];

  return (
      <>
        {article.map((node: Content, index: number) => (
            <Node key = {index} node = {node}/>
        ))}
      </>
  )
}

const Node = ({node}: { node: Content }) => {
  switch (node.type) {
    case 'paragraph':
      return <Paragraph content = {node.content}/>;
    case 'headingWithID':
      return <Heading attrs = {node.attrs} content = {node.content}/>;
    case 'blockquote':
      return <Blockquote content = {node.content}/>;
    case 'customCodeBlock':
      return <CodeBlock attrs = {node.attrs} content = {node.content}/>;
    case 'horizontalRule':
      return <Horizental />;
    case 'image':
      return <Image attrs = {node.attrs as unknown as ImageAttrs}/>;
    case 'table':
      return <Table content = {node.content}/>;
    case 'bulletList':
      return <BulletList content = {node.content}/>;
    case 'orderedList':
      return <OrderedList attrs = {node.attrs} content = {node.content}/>;
    default:
      return null;
  }
};

const Paragraph = ({content}: { content?: ContentItem[] }) => (
    <p className = "my-4 text-zinc-800 leading-7">
      {content?.map((item, index) => (
          <TextNode key = {index} node = {item}/>
      ))}
    </p>
);

const Heading = ({attrs, content}: { attrs?: Content["attrs"]; content?: ContentItem[] }) => {
  switch (attrs?.level) {
    case 2:
      return <h2 className="mt-12 font-bold text-3xl text-zinc-800">
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h2>;
    case 3:
      return <h3 className="mt-8 mb-4 font-bold text-2xl text-zinc-700">
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h3>;
    case 4:
      return <h4 className="mt-6 mb-4 font-bold text-xl text-zinc-600">
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h4>;
    default:
      return <h2 className="mb-4 font-bold text-3xl text-zinc-800">
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h2>;
  }
};

const Blockquote = ({content}: { content?: ContentItem[] }) => (
    <blockquote className="my-4 py-1 pl-4 border-l-2 border-violet-800 text-lg font-medium">
      {content?.map((item, index) => (
          <Node key = {index} node = {item}/>
      ))}
    </blockquote>
);

const CodeBlock = ({attrs, content}: { attrs?: Content["attrs"]; content?: ContentItem[] }) => (
    <pre>
    <code className = {`language-${attrs?.language}`}>{content?.[0].text}</code>
  </pre>
);

const Horizental = () => (
    <div className = "relative my-8">
      <div aria-hidden = "true" className = "absolute inset-0 flex items-center">
        <div className = "w-full border-t border-gray-300"/>
      </div>
      <div className = "relative flex justify-center">
        <span className = "bg-white px-2 text-sm text-gray-500">Continue</span>
      </div>
    </div>
);

const Image = ({attrs}: { attrs: ImageAttrs }) => (
    <figure>
      <img
          src = {`${attrs.prefix}/${attrs.storage_key}`}
          alt = {attrs.alt}
          id = {attrs.id.toString()}
      />
      <figcaption>{attrs.caption}</figcaption>
    </figure>
);

const Table = ({content}: { content?: ContentItem[] }) => (
    <table>
      <tbody>
      {content?.map((row, rowIndex) => (
          <tr key = {rowIndex}>
            {row.content?.map((cell, cellIndex) => {
              const CellTag = cell.type === 'tableHeader' ? 'th' : 'td';
              return (
                  <CellTag key = {cellIndex}>
                    <Node node = {cell.content?.[0] as Content}/>
                  </CellTag>
              );
            })}
          </tr>
      ))}
      </tbody>
    </table>
);

const BulletList = ({content}: { content?: ContentItem[] }) => (
    <ul className="list-disc pl-4">
      {content?.map((item, index) => (
          <li key = {index}>
            {item.content?.map((node, nodeIndex) => (
                <Node key = {nodeIndex} node = {node}/>
            ))}
          </li>
      ))}
    </ul>
);

const OrderedList = ({attrs, content}: { attrs?: Content["attrs"]; content?: ContentItem[] }) => (
    <ol start = {attrs?.start} className="list-decimal pl-4">
      {content?.map((item, index) => (
          <li key = {index}>
            {item.content?.map((node, nodeIndex) => (
                <Node key = {nodeIndex} node = {node}/>
            ))}
          </li>
      ))}
    </ol>
);

const TextNode = ({node}: { node: Content }) => {
  if (node.type === 'hardBreak') {
    return <br/>;
  }

  let content: React.ReactNode = node.text;

  if (node.marks) {
    node.marks.forEach(mark => {
      switch (mark.type) {
        case 'link':
          content = (
              <a className="text-violet-700 after:content-['_↗'] hover:underline hover:decoration-2 hover:underline-offset-4" href = {mark.attrs?.href} target = {mark.attrs?.target} rel = {mark.attrs?.rel}>
                {content}
              </a>
          );
          break;
        case 'bold':
          content = <strong className="font-medium">{content}</strong>;
          break;
        case 'italic':
          content = <em className="italic">{content}</em>;
          break;
        case 'strike':
          content = <del className="line-through decoration-red-400">{content}</del>;
          break;
        case 'highlight':
          content = <mark className="bg-yellow-300">{content}</mark>;
          break;
        case 'code':
          content = <code>{content}</code>;
          break;
      }
    });
  }

  return content;
};
