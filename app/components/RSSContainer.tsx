import type { Json } from "~/types/supabase";

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
};

function isContentStructure(content: Json): content is ContentStructure {
  return (
      typeof content === "object" &&
      content !== null &&
      "content" in content &&
      Array.isArray((content as ContentStructure).content)
  );
}

export function contentToHtml(content: Json, prefix: string = "https://img.darmau.co"): string {
  if (!content || !isContentStructure(content)) {
    return "<p>没有内容</p>";
  }

  return content.content.map(node => renderNode(node, prefix)).join("");
}

function hasImageAttrs(attrs: Content["attrs"]): attrs is ImageAttrs {
  return Boolean(
      attrs &&
      (typeof attrs.id === "number" || typeof attrs.id === "string") &&
      typeof attrs.storage_key === "string" &&
      typeof attrs.prefix === "string"
  );
}

function renderImage(node: Content, prefix: string): string {
  if (!hasImageAttrs(node.attrs)) {
    return "";
  }

  const {alt, storage_key, caption} = node.attrs;
  // 使用传入的prefix参数，如果节点中没有prefix信息
  const imagePrefix = node.attrs?.prefix || prefix;
  const captionHtml = caption ? `<figcaption style="margin-top: 0.5rem; text-align: center; font-size: 0.875rem; color: #6b7280;">${escapeHtml(caption)}</figcaption>` : "";

  return `<figure style="margin: 1rem 0;"><img src="${imagePrefix}/cdn-cgi/image/format=auto,width=960/${storage_key}" alt="${alt ? escapeHtml(alt) : ""}" style="max-width: 100%; height: auto; border-radius: 0.375rem;" />${captionHtml}</figure>`;
}

function renderNode(node: Content, prefix: string): string {
  switch (node.type) {
    case "paragraph":
      return `<p style="margin: 1rem 0; color: #27272a; line-height: 2rem;">${renderContent(node.content, prefix)}</p>`;
    case "heading":
      return renderHeading(node, prefix);
    case "blockquote":
      return `<blockquote style="margin: 1rem 0; padding: 0.25rem 0 0.25rem 1rem; border-left: 2px solid #6d28d9; font-size: 1.125rem; font-weight: 500; color: #27272a;">${renderContent(node.content, prefix)}</blockquote>`;
    case "codeBlock":
    case "customCodeBlock":
      return renderCodeBlock(node);
    case "horizontalRule":
      return `<div style="position: relative; margin: 2rem 0;"><div style="position: absolute; inset: 0; display: flex; align-items: center;"><div style="width: 100%; border-top: 1px solid #d1d5db;"></div></div><div style="position: relative; display: flex; justify-content: center;"><span style="background: white; padding: 0 0.5rem; font-size: 0.875rem; color: #6b7280;">Continue</span></div></div>`;
    case "image":
      return renderImage(node, prefix);
    case "table":
      return renderTable(node.content, prefix);
    case "orderedList":
      return renderOrderedList(node, prefix);
    case "bulletList":
      return renderBulletList(node.content, prefix);
    default:
      return "";
  }
}

function renderHeading(node: Content, prefix: string): string {
  const level = node.attrs?.level ?? 2;
  const headingId = node.attrs?.id !== undefined ? ` id="${node.attrs.id}"` : "";
  
  switch (level) {
    case 2:
      return `<h2${headingId} style="margin-top: 4rem; font-weight: 700; font-size: 1.875rem; color: #27272a;">${renderContent(node.content, prefix)}</h2>`;
    case 3:
      return `<h3${headingId} style="margin-top: 3rem; margin-bottom: 1rem; font-weight: 700; font-size: 1.5rem; color: #374151;">${renderContent(node.content, prefix)}</h3>`;
    case 4:
      return `<h4${headingId} style="margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; color: #52525b;">${renderContent(node.content, prefix)}</h4>`;
    default:
      return `<h2${headingId} style="margin-bottom: 1rem; font-weight: 700; font-size: 1.875rem; color: #27272a;">${renderContent(node.content, prefix)}</h2>`;
  }
}

function renderCodeBlock(node: Content): string {
  const codeContent = node.content?.[0]?.text ?? "";
  // 转义HTML特殊字符
  const escapedCode = codeContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  
  return `<pre style="background: #1e1e1e; border-radius: 0.75rem; overflow: hidden; padding: 1rem; margin: 1rem 0;"><code style="color: #d4d4d4; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${escapedCode}</code></pre>`;
}

function renderOrderedList(node: Content, prefix: string): string {
  const start = node.attrs?.start ?? 1;
  return `<ol start="${start}" style="list-style-type: decimal; padding-left: 1rem; margin: 1rem 0;">${renderList(node.content, prefix)}</ol>`;
}

function renderBulletList(content?: ContentItem[], prefix?: string): string {
  return `<ul style="list-style-type: disc; padding-left: 1rem; margin: 1rem 0;">${renderList(content, prefix ?? "https://img.darmau.co")}</ul>`;
}

function renderContent(content?: ContentItem[], prefix?: string): string {
  if (!content) return "";
  const imagePrefix = prefix ?? "https://img.darmau.co";
  return content.map(node => {
    if (node.type === "text" || !node.type) {
      return renderTextNode(node);
    } else {
      return renderNode(node, imagePrefix);
    }
  }).join("");
}

function renderTextNode(node: Content): string {
  if (node.type === "hardBreak") {
    return "<br />";
  }

  let content = escapeHtml(node.text ?? "");
  if (node.marks) {
    // 从后往前处理marks，这样最外层的mark会在最外层
    const marks = [...node.marks].reverse();
    marks.forEach(mark => {
      switch (mark.type) {
        case "link":
          const href = mark.attrs?.href ?? "#";
          const target = mark.attrs?.target ? ` target="${mark.attrs.target}"` : "";
          const rel = mark.attrs?.rel ? ` rel="${mark.attrs.rel}"` : "";
          content = `<a href="${href}"${target}${rel} style="color: #6d28d9; text-decoration: none;">${content} ↗</a>`;
          break;
        case "bold":
          content = `<strong style="font-weight: 500;">${content}</strong>`;
          break;
        case "italic":
          content = `<em style="font-style: italic;">${content}</em>`;
          break;
        case "strike":
          content = `<del style="text-decoration: line-through; text-decoration-color: #f87171;">${content}</del>`;
          break;
        case "highlight":
          content = `<mark style="background-color: #fef08a;">${content}</mark>`;
          break;
        case "code":
          content = `<code style="font-family: 'Courier New', monospace; padding: 0 0.5rem; background-color: #f3f4f6; border-radius: 0.25rem;">${content}</code>`;
          break;
      }
    });
  }
  return content;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTable(content?: ContentItem[], prefix?: string): string {
  if (!content) return "";
  const imagePrefix = prefix ?? "https://img.darmau.co";
  const [headerRow, ...bodyRows] = content;
  const header = headerRow ? `<thead><tr>${renderTableRow(headerRow, true, imagePrefix)}</tr></thead>` : "";
  const body = `<tbody>${bodyRows.map((row, index) => `<tr style="background-color: ${index % 2 === 0 ? 'white' : '#f9fafb'};"}>${renderTableRow(row, false, imagePrefix)}</tr>`).join("")}</tbody>`;
  return `<table style="min-width: 100%; border-collapse: collapse; margin-top: 2rem; border: 1px solid #d1d5db;">${header}${body}</table>`;
}

function renderTableRow(row: ContentItem, isHeader: boolean, prefix: string): string {
  const tag = isHeader ? "th" : "td";
  const style = isHeader 
    ? "padding: 0.25rem 1rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #111827;"
    : "padding: 0.25rem 1rem; font-size: 0.875rem; color: #6b7280; white-space: nowrap;";
  return row.content?.map(cell => `<${tag} style="${style}">${renderContent(cell.content, prefix)}</${tag}>`).join("") ?? "";
}

function renderList(content?: ContentItem[], prefix?: string): string {
  if (!content) return "";
  const imagePrefix = prefix ?? "https://img.darmau.co";
  return content.map(item => {
    let listItemContent = "";
    if (item.type === "listItem" && item.content) {
      listItemContent = item.content.map(node => renderNode(node, imagePrefix)).join("");
    }
    return `<li>${listItemContent}</li>`;
  }).join("");
}
