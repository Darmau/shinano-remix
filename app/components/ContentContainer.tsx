import type {Json} from "~/types/supabase";
import ArticleImage from "~/components/ArticleImage";
import {useEffect, useState} from "react";

type ContentStructure = {
  content: Content[];
};

export type Content = {
  type: string;
  content?: ContentItem[];
  attrs?: {
    level?: number;
    id?: string | number;
    language?: string;
    start?: number;
    href?: string;
    target?: string;
    rel?: string;
    class?: string | null;
    alt?: string | null;
    storage_key?: string;
    prefix?: string;
    caption?: string | null;
    width?: number;
    height?: number;
    code?: string;
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

export type ImageAttrs = {
  id: number | string;
  alt: string | null;
  storage_key: string;
  prefix: string;
  caption: string | null;
  width?: number;
  height?: number;
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

  const article = content.content;

  return (
      <>
        {article.map((node: Content, index: number) => (
            <Node key = {index} node = {node}/>
        ))}
      </>
  )
}

const hasImageAttrs = (attrs: Content["attrs"]): attrs is ImageAttrs => Boolean(
    attrs &&
    (typeof attrs.id === "number" || typeof attrs.id === "string") &&
    typeof attrs.storage_key === "string" &&
    typeof attrs.prefix === "string"
);

const Node = ({node}: { node: Content }) => {
  switch (node.type) {
    case 'paragraph':
      return <Paragraph content = {node.content}/>;
    case 'heading':
      return <Heading attrs = {node.attrs} content = {node.content}/>;
    case 'blockquote':
      return <Blockquote content = {node.content}/>;
    case 'customCodeBlock':
      return <CodeBlock attrs = {node.attrs} content = {node.content}/>;
    case 'codeBlock':
      return <CodeBlock attrs = {node.attrs} content = {node.content}/>;
    case 'horizontalRule':
      return <Horizental/>;
    case 'image':
      return hasImageAttrs(node.attrs) ? <Image attrs = {node.attrs}/> : null;
    case 'table':
      return <Table content = {node.content}/>;
    case 'bulletList':
      return <BulletList content = {node.content}/>;
    case 'orderedList':
      return <OrderedList attrs = {node.attrs} content = {node.content}/>;
    case 'embed':
      return <Iframe attrs = {node.attrs}/>;
    default:
      return null;
  }
};

const Paragraph = ({content}: { content?: ContentItem[] }) => (
    <p className = "my-4 text-zinc-800 leading-8">
      {content?.map((item, index) => (
          <TextNode key = {index} node = {item}/>
      ))}
    </p>
);

const Heading = ({attrs, content}: { attrs?: Content["attrs"]; content?: ContentItem[] }) => {
  const headingId = attrs?.id !== undefined ? String(attrs.id) : undefined;

  switch (attrs?.level) {
    case 2:
      return <h2
          className = "mt-16 font-bold text-3xl text-zinc-800"
          id = {headingId}
      >
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h2>;
    case 3:
      return <h3
          className = "mt-12 mb-4 font-bold text-2xl text-zinc-700"
          id = {headingId}
      >
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h3>;
    case 4:
      return <h4
          className = "mt-8 mb-4 font-bold text-xl text-zinc-600"
          id = {headingId}
      >
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h4>;
    default:
      return <h2
          className = "mb-4 font-bold text-3xl text-zinc-800"
          id = {headingId}
      >
        {content?.map((item, index) => (
            <TextNode key = {index} node = {item}/>
        ))}
      </h2>;
  }
};

const Blockquote = ({content}: { content?: ContentItem[] }) => (
    <blockquote className = "my-4 py-1 pl-4 border-l-2 border-violet-800 text-lg font-medium">
      {content?.map((item, index) => (
          <Node key = {index} node = {item}/>
      ))}
    </blockquote>
);

const CodeBlock = ({attrs, content}: { attrs?: Content["attrs"]; content?: ContentItem[] }) => {
  const language = attrs?.language ?? "";
  const codeContent = content?.[0]?.text ?? "";
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 动态导入 highlight.js 和相关样式
    const loadHighlight = async () => {
      try {
        // 加载样式（CSS 导入不需要返回值）
        await import('highlight.js/styles/github-dark-dimmed.css');
        
        // 加载 highlight.js
        const hljs = await import('highlight.js');
        
        // 高亮代码（检查是默认导出还是命名导出）
        const hljsModule = hljs.default || hljs;
        const result = hljsModule.highlight(codeContent, {language});
        setHighlightedCode(result.value);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load highlight.js:', error);
        // 如果加载失败，使用原始代码
        setHighlightedCode(codeContent);
        setIsLoading(false);
      }
    };

    loadHighlight();
  }, [codeContent, language]);

  return (
      <pre className = "hljs rounded-xl overflow-hidden p-4">
      <div className = "flex justify-between mb-2">
        <span className = "flex items-center gap-1">
          <span className = "w-3 h-3 rounded-full bg-red-500"/>
          <span className = "w-3 h-3 rounded-full bg-yellow-500"/>
          <span className = "w-3 h-3 rounded-full bg-green-500"/>
        </span>
        <p>{language}</p>
      </div>
      {isLoading ? (
          <code className = {language ? `language-${language}` : ''}>
            {codeContent}
          </code>
      ) : (
          <code
              className = {language ? `language-${language}` : ''}
              dangerouslySetInnerHTML = {{__html: highlightedCode}}
          />
      )}
    </pre>
  );
};

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
    <ArticleImage attrs = {attrs}/>
);

// iframe
const Iframe = ({ attrs }: { attrs: Content["attrs"] }) => {
  const code = attrs!.code;
  return (
    // dangerouslySetInnerHTML
    <div className = "iframe-container" dangerouslySetInnerHTML = {{__html: code as string}} />
  );
};

const Table = ({content}: { content?: ContentItem[] }) => {
  // 假设第一行总是表头
  const headerRow = content?.[0];
  const bodyRows = content?.slice(1);

  return (
      <table className = "min-w-full divide-y divide-gray-300 mt-8 border border-gray-300">
        <thead>
        {headerRow && (
            <tr>
              {headerRow.content?.map((cell, cellIndex) => (
                  <th
                      scope = "col"
                      key = {cellIndex}
                      className = "px-4 py-1 text-left text-sm font-bold text-gray-900"
                  >
                    <Node node = {cell.content?.[0] as Content}/>
                  </th>
              ))}
            </tr>
        )}
        </thead>
        <tbody>
        {bodyRows?.map((row, rowIndex) => (
            <tr key = {rowIndex} className = "even:bg-gray-50">
              {row.content?.map((cell, cellIndex) => (
                  <td key = {cellIndex} className = "whitespace-nowrap px-4 py-1 text-sm text-gray-500">
                    <Node node = {cell.content?.[0] as Content}/>
                  </td>
              ))}
            </tr>
        ))}
        </tbody>
      </table>
  );
};

const BulletList = ({content}: { content?: ContentItem[] }) => (
    <ul className = "list-disc pl-4">
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
    <ol start = {attrs?.start} className = "list-decimal pl-4">
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
              <a
                  className = "text-violet-700 after:content-['_↗'] hover:underline hover:decoration-2 hover:underline-offset-4"
                  href = {mark.attrs?.href} target = {mark.attrs?.target} rel = {mark.attrs?.rel}
              >
                {content}
              </a>
          );
          break;
        case 'bold':
          content = <strong className = "font-medium">{content}</strong>;
          break;
        case 'italic':
          content = <em className = "italic">{content}</em>;
          break;
        case 'strike':
          content = <del className = "line-through decoration-red-400">{content}</del>;
          break;
        case 'highlight':
          content = <mark className = "bg-yellow-300">{content}</mark>;
          break;
        case 'code':
          content = <code className = "font-mono px-2">{content}</code>;
          break;
        case 'superscript':
          content = <sup className = "text-sm">{content}</sup>;
      }
    });
  }

  return content;
};
