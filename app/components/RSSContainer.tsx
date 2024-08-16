import { Json } from "~/types/supabase";

type ContentStructure = {
  content: Content[];
};

export type Content = {
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

export type ImageAttrs = {
  id: number;
  alt: string;
  storage_key: string;
  prefix: string;
  caption: string;
};

function isContentStructure(content: Json): content is ContentStructure {
  return (
      typeof content === "object" &&
      content !== null &&
      "content" in content &&
      Array.isArray((content as ContentStructure).content)
  );
}

export function contentToHtml(content: Json): string {
  if (!content || !isContentStructure(content)) {
    return "<p>没有内容</p>";
  }

  return content.content.map(renderNode).join("");
}

function renderImage(node: Content): string {
  const { alt, storage_key, caption, prefix } = node.attrs as unknown as ImageAttrs;
  return `<figure><img src="${prefix}/cdn-cgi/image/format=auto,width=960/${storage_key}" alt="${alt}" />${caption &&
  <figcaption>${caption}</figcaption>}</figure>`;
}

function renderNode(node: Content): string {
  switch (node.type) {
    case "paragraph":
      return `<p>${renderContent(node.content)}</p>`;
    case "heading":
      return `<h${node.attrs?.level}>${renderContent(node.content)}</h${node.attrs?.level}>`;
    case "blockquote":
      return `<blockquote>${renderContent(node.content)}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${renderContent(node.content)}</code></pre>`;
    case "horizontalRule":
      return "<hr />";
    case "image":
      return renderImage(node);
    case "table":
      return renderTable(node.content);
    case "orderedList":
      return `<ol>${renderList(node.content)}</ol>`;
    case "bulletList":
      return `<ul>${renderList(node.content)}</ul>`;
    default:
      return "";
  }
}

function renderContent(content?: ContentItem[]): string {
  if (!content) return "";
  return content.map(renderTextNode).join("");
}

function renderTextNode(node: Content): string {
  if (node.type === "hardBreak") {
    return "<br />";
  }

  let content = node.text || "";
  if (node.marks) {
    node.marks.forEach(mark => {
      switch (mark.type) {
        case "link":
          content = `<a href="${mark.attrs?.href}">${content}</a>`;
          break;
        case "bold":
          content = `<strong>${content}</strong>`;
          break;
        case "italic":
          content = `<em>${content}</em>`;
          break;
        case "strike":
          content = `<del>${content}</del>`;
          break;
        case "highlight":
          content = `<mark>${content}</mark>`;
          break;
        case "code":
          content = `<code>${content}</code>`;
          break;
      }
    });
  }
  return content;
}

function renderTable(content?: ContentItem[]): string {
  if (!content) return "";
  const [headerRow, ...bodyRows] = content;
  const header = `<thead><tr>${renderTableRow(headerRow)}</tr></thead>`;
  const body = `<tbody>${bodyRows.map(row => `<tr>${renderTableRow(row)}</tr>`).join("")}</tbody>`;
  return `<table>${header}${body}</table>`;
}

function renderTableRow(row: ContentItem): string {
  return row.content?.map(cell => `<td>${renderContent(cell.content)}</td>`).join("") || "";
}

function renderList(content?: ContentItem[]): string {
  if (!content) return "";
  return content.map(item => {
    let listItemContent = "";
    if (item.type === "listItem" && item.content) {
      listItemContent = item.content.map(renderNode).join("");
    }
    return `<li>${listItemContent}</li>`;
  }).join("");
}
