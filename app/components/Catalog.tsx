import {Json} from "~/types/supabase";
import {Content} from "~/components/ContentContainer";
import {Link} from "@remix-run/react";

type ContentStructure = {
  content: Content[];
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

function generateTableOfContents(nodes: Content[]): JSX.Element {
  const createTocItem = (item: Content, index: number): JSX.Element | null => {
    if (item.type === "heading") {
      const level = item.attrs?.level;
      const id = item.attrs?.id;
      const text = item.content?.[0].text;

      return (
          <li key={index} className="text-base font-medium text-zinc-500">
            <Link to={{ hash: `#${id}`}}>{text}</Link>
            {nodes
            .slice(index + 1)
            .filter(node => node.type === "heading" && node.attrs.level > level)
                .length > 0 && (
                <ul>
                  {nodes
                  .slice(index + 1)
                  .map((node, i) => {
                    if (node.type === "heading" && node.attrs.level > level) {
                      return createTocItem(node, i + index + 1);
                    }
                    return null;
                  })
                  .filter(Boolean)}
                </ul>
            )}
          </li>
      );
    }
    return null;
  };

  const tocItems = nodes
  .map((node, index) => {
    if (node.type === "heading" && node.attrs?.level === 2) {
      return createTocItem(node, index);
    }
    return null;
  })
  .filter(Boolean);

  return <ul className="space-y-3">{tocItems}</ul>;
}

export default function Catalog({content}: { content: Json }) {
  if (!content || !isContentStructure(content)) {
    return (
        <div>
          <p>没有目录</p>
        </div>
    );
  }

  const article = content.content as Content[];

  return (
      <nav aria-label="Table of contents">
        {generateTableOfContents(article)}
      </nav>
  );
}
