import HomepageText from "~/locales/homepage";
import getLanguageLabel from "~/utils/getLanguageLabel";
import { createClient } from "~/utils/supabase/server";
import getTime from "~/utils/getTime";
import type { FeedEnclosure } from "~/types/rss";
import type { Route } from "./+types/$lang.[rss.xml]";

type RssEntry = {
  title: string;
  description: string;
  pubDate: string | null;
  link: string;
  guid: string;
  category?: string;
  content?: string;
  author?: string;
  enclosure?: FeedEnclosure;
};

function formatPubDate(date: string | null): string {
  if (!date) {
    return new Date().toUTCString();
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toUTCString();
  }
  return parsed.toUTCString();
}

function normalizeCdata(value?: string | null): string {
  if (!value) {
    return "";
  }
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function shouldRenderContent(content?: string | null): content is string {
  return Boolean(content && content.trim().length > 0);
}

function generateEnclosure(enclosure: FeedEnclosure | undefined): string {
  if (!enclosure) {
    return "";
  }
  return `
            <enclosure
              url="${enclosure.url}"
              type="${enclosure.type}"
              length="${enclosure.length}"
            />
    `;
}

function generateRss({ description, entries, language, link, title }: {
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
          <title>积薪</title>
          <url>https://img.darmau.co/cdn-cgi/image/format=jpeg,width=720/a2b148a3-5799-4be0-a8d4-907f9355f20f</url>
          <link>https://darmau.co/${language}</link>
          <width>720</width>
          <height>432</height>
        </image>
        ${entries.map((entry) => `
          <item>
            <title><![CDATA[${normalizeCdata(entry.title)}]]></title>
            <description><![CDATA[${normalizeCdata(entry.description)}]]></description>
            <pubDate>${formatPubDate(entry.pubDate)}</pubDate>
            <link>${entry.link}</link>
            <guid isPermaLink="false">${entry.guid}</guid>
            ${entry.author ? `<author>${entry.author}</author>` : ""}
            ${entry.category ? `<category>${entry.category}</category>` : ""}
            ${shouldRenderContent(entry.content) ? `
            <content:encoded><![CDATA[${normalizeCdata(entry.content)}]]></content:encoded>
            ` : ""}
            ${generateEnclosure(entry.enclosure)}
          </item>`
  ).join("")}
      </channel>
    </rss>
  `;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;
  const availableLangs = ["zh", "en", "jp"];

  if (!availableLangs.includes(lang)) {
    throw new Response(null, {
      status: 404,
      statusText: "No such language",
    });
  }

  const label = getLanguageLabel(HomepageText, lang);
  const baseLink = `https://darmau.co/${lang}`;
  const prefix = context.cloudflare.env.IMG_PREFIX ?? "https://img.darmau.co";

  const [articleResult, photoResult, thoughtResult] = await Promise.all([
    supabase
      .from("article")
      .select(`
        id,
        title,
        slug,
        subtitle,
        abstract,
        published_at,
        category (title),
        cover (alt, size, storage_key),
        language!inner (lang)
      `)
      .eq("language.lang", lang)
      .eq("is_draft", false)
      .order("published_at", { ascending: false })
      .limit(30),
    supabase
      .from("photo")
      .select(`
        id,
        title,
        slug,
        abstract,
        content_text,
        published_at,
        category (title),
        cover (alt, size, storage_key),
        language!inner (lang)
      `)
      .eq("language.lang", lang)
      .eq("is_draft", false)
      .order("published_at", { ascending: false })
      .limit(30),
    supabase
      .from("thought")
      .select(`
        id,
        slug,
        content_text,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const articleEntries: RssEntry[] = (articleResult.data ?? []).map((article) => {
    const summary = article.abstract ?? article.subtitle ?? "";
    const slug = article.slug ?? article.id;
    return {
      title: article.title ?? "",
      description: summary || article.title || "",
      pubDate: article.published_at,
      link: `${baseLink}/article/${slug}`,
      guid: `article-${article.id}`,
      category: article.category?.title ?? label.article,
      content: summary ? `<p>${summary}</p>` : "",
      author: "李大毛",
      enclosure: article.cover ? {
        url: `${prefix}/cdn-cgi/image/format=jpeg,width=960/${article.cover.storage_key}`,
        type: "image/jpeg",
        length: String(article.cover.size ?? 0),
      } : undefined,
    };
  });

  const photoEntries: RssEntry[] = (photoResult.data ?? []).map((photo) => {
    const baseDescription = photo.abstract ?? photo.title ?? "";
    const slug = photo.slug ?? photo.id;
    const coverHtml = photo.cover
      ? `<p><img src="${prefix}/cdn-cgi/image/format=jpeg,width=1280/${photo.cover.storage_key}" alt="${normalizeCdata(photo.cover.alt ?? photo.title ?? "")}" /></p>`
      : "";
    const body = [
      baseDescription ? `<p>${baseDescription}</p>` : "",
      coverHtml,
      photo.content_text ? `<div>${photo.content_text}</div>` : "",
    ].filter((chunk): chunk is string => Boolean(chunk)).join("");
    return {
      title: photo.title ?? label.photography,
      description: baseDescription || label.photography,
      pubDate: photo.published_at,
      link: `${baseLink}/album/${slug}`,
      guid: `photo-${photo.id}`,
      category: photo.category?.title ?? label.photography,
      content: body,
      author: "李大毛",
      enclosure: photo.cover ? {
        url: `${prefix}/cdn-cgi/image/format=jpeg,width=960/${photo.cover.storage_key}`,
        type: "image/jpeg",
        length: String(photo.cover.size ?? 0),
      } : undefined,
    };
  });

  const thoughtEntries: RssEntry[] = (thoughtResult.data ?? []).map((thought) => {
    const title = thought.created_at ? getTime(thought.created_at, lang) : label.thought;
    const slug = thought.slug ?? thought.id;
    return {
      title,
      description: thought.content_text ?? "",
      pubDate: thought.created_at,
      link: `${baseLink}/thought/${slug}`,
      guid: `thought-${thought.id}`,
      category: label.thought,
      content: thought.content_text ? `<p>${thought.content_text}</p>` : "",
      author: "李大毛",
    };
  });

  const entries = [...articleEntries, ...photoEntries, ...thoughtEntries]
    .sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 60);

  const feed = generateRss({
    title: `${label.title} - RSS`,
    description: label.description,
    language: lang,
    link: baseLink,
    entries,
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
}
