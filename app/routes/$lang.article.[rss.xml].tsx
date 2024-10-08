import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from '~/locales/homepage';

export type RssEntry = {
  title: string | null;
  link: string;
  description: string | null;
  pubDate: string | null;
  author: string | null;
  guid: number;
  content: string;
  category: string | null;
  enclosure?: {
    url: string;
    type: string;
    length: string;
  };
};

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

export async function loader({request, context, params}: LoaderFunctionArgs) {
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
      category (title),
      cover (alt, size, storage_key),
      language!inner (lang)
    `)
    .eq('language.lang', lang)
    .eq('is_draft', false)
    .order('published_at', {ascending: false})
    .limit(30);

  const feed = generateRss({
    title: `${label.title} - ${label.article}`,
    description: label.description,
    language: lang,
    link: `https://darmau.co/${lang}`,
    entries: posts ? posts.map((post) => ({
      description: post.subtitle,
      pubDate: post.published_at,
      title: post.title,
      author: '李大毛',
      category: post.category!.title,
      link: `https://darmau.co/${lang}/article/${post.slug}`,
      guid: post.id,
      content: `
        <p>${post.abstract}</p>
        <p>请移步博客继续阅读。Please go to the blog to continue reading</p>
        <p><a href="https://darmau.co/${lang}/article/${post.slug}">Continue</a></p
      `,
      enclosure: post.cover && {
        url: `https://img.darmau.co/cdn-cgi/image/format=jpeg,width=960/${post.cover.storage_key}`,
        type: 'image/jpeg',
        length: post.cover.size,
      },
    })) : [],
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
}

function generateEnclosure(enclosure: {url: string, type: string, length: string} | undefined): string {
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
