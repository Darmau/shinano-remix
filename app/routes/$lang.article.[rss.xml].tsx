import {createClient} from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from '~/locales/homepage';
import type {Json} from "~/types/supabase";
import type {FeedEnclosure, RichRssEntry} from "~/types/rss";
import type { Route } from "./+types/$lang.article.[rss.xml]";

type TipTapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type TipTapNode = {
  type?: string;
  text?: string | null;
  content?: TipTapNode[];
  attrs?: {
    level?: number;
    id?: string | number;
    start?: number;
    href?: string;
    target?: string;
    rel?: string;
    language?: string;
    alt?: string | null;
  } & Record<string, unknown>;
  marks?: TipTapMark[];
};

type TipTapDoc = {
  type?: string;
  content?: TipTapNode[];
};

const RSS_STYLE_MAP: Record<string, string> = {
  article: "font-family:'PingFang SC','Hiragino Sans','Microsoft YaHei',sans-serif;margin:0;padding:0;color:#0f172a;line-height:1.75;font-size:16px;background-color:#ffffff;",
  p: "margin:0 0 1.25rem;color:#0f172a;line-height:1.8;",
  h1: "margin:2.5rem 0 1.25rem;font-size:2.5rem;line-height:1.2;font-weight:700;color:#0f172a;",
  h2: "margin:2.25rem 0 1rem;font-size:2rem;line-height:1.25;font-weight:700;color:#0f172a;",
  h3: "margin:2rem 0 0.85rem;font-size:1.75rem;line-height:1.3;font-weight:600;color:#0f172a;",
  h4: "margin:1.5rem 0 0.75rem;font-size:1.5rem;line-height:1.35;font-weight:600;color:#0f172a;",
  h5: "margin:1.25rem 0 0.65rem;font-size:1.35rem;line-height:1.3;font-weight:600;color:#0f172a;",
  h6: "margin:1rem 0 0.5rem;font-size:1.1rem;line-height:1.3;font-weight:600;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;",
  blockquote: "margin:1.75rem 0;padding:0.75rem 1rem;border-left:4px solid #c4b5fd;background-color:#f5f3ff;color:#4c1d95;font-style:italic;",
  ul: "margin:0 0 1.25rem;padding-left:1.5rem;color:#0f172a;",
  ol: "margin:0 0 1.25rem;padding-left:1.5rem;color:#0f172a;",
  li: "margin:0.35rem 0;line-height:1.7;color:#0f172a;",
  pre: "margin:1.75rem 0;padding:1rem;border-radius:0.85rem;background-color:#0f172a;color:#f8fafc;font-size:0.9rem;line-height:1.6;overflow:auto;",
  code: "font-family:'SFMono-Regular','Consolas','Menlo',monospace;background-color:rgba(15,23,42,0.08);padding:0.15rem 0.4rem;border-radius:0.35rem;color:#0f172a;",
  hr: "margin:2.5rem 0;border:none;border-bottom:1px solid #e4e4e7;",
  table: "width:100%;border-collapse:collapse;margin:2rem 0;font-size:0.95rem;color:#0f172a;",
  tr: "border-bottom:1px solid #e4e4e7;",
  th: "text-align:left;padding:0.75rem;background-color:#eef2ff;font-weight:600;color:#312e81;",
  td: "padding:0.75rem;vertical-align:top;color:#0f172a;",
  a: "color:#4f46e5;text-decoration:none;border-bottom:1px solid rgba(79,70,229,0.5);",
  strong: "font-weight:700;color:#111827;",
  em: "font-style:italic;color:#1f2937;",
  del: "color:#94a3b8;text-decoration:line-through;",
  mark: "background-color:#fef08a;color:#78350f;padding:0 0.2em;border-radius:0.2em;",
  br: "line-height:1.6;",
};

const renderRssArticleHtml = (content: Json | null | undefined): string => {
  if (!content || typeof content !== "object") {
    return "";
  }

  const documentNode = content as TipTapDoc;
  if (!Array.isArray(documentNode.content) || documentNode.content.length === 0) {
    return "";
  }

  const body = documentNode.content.map(renderRssTipTapNode).join("");

  return body ? `<article${getStyleAttr("article")}>${body}</article>` : "";
};

const renderRssTipTapNode = (node?: TipTapNode): string => {
  if (!node || typeof node.type !== "string") {
    return "";
  }

  switch (node.type) {
    case "doc":
      return renderRssChildren(node.content);
    case "text":
      return applyRssMarks(escapeHtml(node.text ?? ""), node.marks);
    case "hardBreak":
      return `<br${getStyleAttr("br")} />`;
    case "paragraph":
      return `<p${getStyleAttr("p")}>${renderRssChildren(node.content)}</p>`;
    case "heading": {
      const level = getHeadingLevel(node.attrs?.level);
      return `<h${level}${getStyleAttr(`h${level}`)}>${renderRssChildren(node.content)}</h${level}>`;
    }
    case "blockquote":
      return `<blockquote${getStyleAttr("blockquote")}>${renderRssChildren(node.content)}</blockquote>`;
    case "bulletList":
      return `<ul${getStyleAttr("ul")}>${renderRssChildren(node.content)}</ul>`;
    case "orderedList": {
      const start = typeof node.attrs?.start === "number" && node.attrs.start > 1
        ? ` start="${escapeAttr(String(node.attrs.start))}"`
        : "";
      return `<ol${getStyleAttr("ol")}${start}>${renderRssChildren(node.content)}</ol>`;
    }
    case "listItem":
      return `<li${getStyleAttr("li")}>${renderRssChildren(node.content)}</li>`;
    case "codeBlock":
    case "customCodeBlock": {
      const language = typeof node.attrs?.language === "string" && node.attrs.language.trim()
        ? ` class="language-${escapeAttr(node.attrs.language.trim())}"`
        : "";
      const code = escapeHtml(getTextContent(node.content));
      return `<pre${getStyleAttr("pre")}><code${getStyleAttr("code")}${language}>${code}</code></pre>`;
    }
    case "horizontalRule":
      return `<hr${getStyleAttr("hr")} />`;
    case "table":
      return `<table${getStyleAttr("table")}>${renderRssChildren(node.content)}</table>`;
    case "tableRow":
      return `<tr${getStyleAttr("tr")}>${renderRssChildren(node.content)}</tr>`;
    case "tableHeader":
      return `<th${getStyleAttr("th")}>${renderRssChildren(node.content)}</th>`;
    case "tableCell":
      return `<td${getStyleAttr("td")}>${renderRssChildren(node.content)}</td>`;
    case "image": {
      const altText = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return altText ? `<p${getStyleAttr("p")}>${escapeHtml(altText)}</p>` : "";
    }
    default:
      return renderRssChildren(node.content);
  }
};

const renderRssChildren = (children?: TipTapNode[]): string => {
  if (!Array.isArray(children) || children.length === 0) {
    return "";
  }

  return children.map(renderRssTipTapNode).join("");
};

const applyRssMarks = (text: string, marks?: TipTapMark[]): string => {
  if (!text || !Array.isArray(marks) || marks.length === 0) {
    return text;
  }

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong${getStyleAttr("strong")}>${acc}</strong>`;
      case "italic":
        return `<em${getStyleAttr("em")}>${acc}</em>`;
      case "strike":
        return `<del${getStyleAttr("del")}>${acc}</del>`;
      case "code":
        return `<code${getStyleAttr("code")}>${acc}</code>`;
      case "highlight":
        return `<mark${getStyleAttr("mark")}>${acc}</mark>`;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        const targetAttr = typeof mark.attrs?.target === "string" ? ` target="${escapeAttr(mark.attrs.target)}"` : "";
        const relAttr = typeof mark.attrs?.rel === "string" ? ` rel="${escapeAttr(mark.attrs.rel)}"` : "";
        return `<a href="${escapeAttr(href)}"${getStyleAttr("a")}${targetAttr}${relAttr}>${acc}</a>`;
      }
      default:
        return acc;
    }
  }, text);
};

const getHeadingLevel = (level?: number): number => {
  if (typeof level !== "number") {
    return 2;
  }
  if (level < 1) {
    return 1;
  }
  if (level > 6) {
    return 6;
  }
  return Math.round(level);
};

const getTextContent = (children?: TipTapNode[]): string => {
  if (!Array.isArray(children) || children.length === 0) {
    return "";
  }

  return children.map((child) => {
    if (!child || typeof child !== "object") {
      return "";
    }
    if (child.type === "text") {
      return child.text ?? "";
    }
    if (child.type === "hardBreak") {
      return "\n";
    }
    return getTextContent(child.content);
  }).join("");
};

const HTML_ESCAPE_REGEX = /[&<>"'`]/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

const escapeHtml = (value: string): string => {
  return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] ?? char);
};

const escapeAttr = (value: string): string => {
  return escapeHtml(value);
};

const getStyleAttr = (tag: string): string => {
  const style = RSS_STYLE_MAP[tag];
  return style ? ` style="${style}"` : "";
};

export type RssEntry = RichRssEntry;

export function generateRss({description, entries, link, title, language}: {
  title: string;
  language: string;
  description: string;
  link: string;
  entries: RssEntry[];
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
      <channel>
        <title>${title}</title>
        <description>${description}</description>
        <link>${link}</link>
        <language>${language}</language>
        <ttl>60</ttl>
        <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
        <generator>Shinano Remix</generator>
        <image>
          <title>积薪 - 文章</title>
          <url>https://img.darmau.co/cdn-cgi/image/format=jpeg,width=720/a2b148a3-5799-4be0-a8d4-907f9355f20f</url>
          <link>https://darmau.co/${language}</link>
          <width>720</width>
          <height>432</height>
        </image>
        ${entries.map((entry) => `
          <item>
          <title><![CDATA[${entry.title}]]></title>
            <description><![CDATA[${entry.description}]]></description>
            <pubDate>${entry.pubDate}</pubDate>
            <link>${entry.link}</link>
            <guid isPermaLink="false">${entry.guid}</guid>
            <content:encoded>
              <![CDATA[${entry.content}]]>
            </content:encoded>
            <author>李大毛</author>
            <category>${entry.category}</category>
            ${generateEnclosure(entry.enclosure)}
          </item>`
      ).join("")}
      </channel>
      <follow_challenge>
          <feedId>42864851888759808</feedId>
          <userId>46488520035984384</userId>
      </follow_challenge>
    </rss>
  `;
}

export async function loader({request, context, params}: Route.LoaderArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);

  const {data: posts} = await supabase
    .from('article')
    .select(`
      id,
      title,
      slug,
      subtitle,
      abstract,
      published_at,
      content_json,
      category (title),
      cover (alt, size, storage_key),
      language!inner (lang)
    `)
    .eq('language.lang', lang)
    .eq('is_draft', false)
    .order('published_at', {ascending: false})
    .limit(30);

  const prefix = context.cloudflare.env.IMG_PREFIX;
  
  const feed = generateRss({
    title: `${label.title} - ${label.article}`,
    description: label.description,
    language: lang,
    link: `https://darmau.co/${lang}`,
    entries: posts ? posts.map((post) => {
      const summary = post.abstract ?? post.subtitle ?? "";
      const fullContent = renderRssArticleHtml(post.content_json as Json | null | undefined);
      const fallbackContent = summary ? `<p${getStyleAttr("p")}>${escapeHtml(summary)}</p>` : "";
      return {
        description: post.subtitle ?? summary,
        pubDate: post.published_at,
        title: post.title,
        author: '李大毛',
        category: post.category!.title,
        link: `https://darmau.co/${lang}/article/${post.slug}`,
        guid: post.id,
        content: fullContent || fallbackContent,
        enclosure: post.cover ? {
          url: `${prefix}/cdn-cgi/image/format=jpeg,width=960/${post.cover.storage_key}`,
          type: 'image/jpeg' as const,
          length: String(post.cover.size ?? 0),
        } : undefined,
      };
    }) : [],
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
}

function generateEnclosure(enclosure: FeedEnclosure | undefined): string {
  if (!enclosure) {
    return `
      <enclosure
        url="https://img.darmau.co/cdn-cgi/image/format=jpeg,width=720/https://img.darmau.co/a2b148a3-5799-4be0-a8d4-907f9355f20f"
        type="image/jpeg"
        length="373254"
      />
    `;
  }
  return `
    <enclosure
      url="${enclosure.url}"
      type="${enclosure.type}"
      length="${enclosure.length}"
    />
  `;
}
