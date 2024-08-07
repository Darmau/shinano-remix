import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from '~/locales/homepage';
import getDate from "~/utils/getDate";

export type RssEntry = {
  title: string | null;
  link: string;
  description: string | null;
  pubDate: string | null;
  author: string | null;
  guid: number;
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
          <title>可可托海没有海的RSS</title>
          <url>https://img.darmau.co/cdn-cgi/image/format=jpeg,width=720/https://img.darmau.co/a2b148a3-5799-4be0-a8d4-907f9355f20f</url>
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
            <author>李大毛</author>
          </item>`
  ).join("")}
      </channel>
    </rss>
  `;
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);

  const {data: posts} = await supabase
  .from('thought')
  .select(`
      id,
      slug,
      content_text,
      created_at
    `)
  .order('created_at', {ascending: false})
  .limit(50);

  const feed = generateRss({
    title: `${label.title} - ${label.thought}`,
    description: label.description,
    language: lang,
    link: `https://darmau.co/${lang}`,
    entries: posts ? posts.map((post) => ({
      title: getDate(post.created_at!, lang),
      description: post.content_text,
      pubDate: post.created_at,
      author: '李大毛',
      link: `https://darmau.co/zh/thought/${post.slug}`,
      guid: post.id,
    })) : [],
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
}
