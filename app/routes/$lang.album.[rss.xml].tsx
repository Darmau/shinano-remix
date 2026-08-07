import {createClient} from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from '~/locales/homepage';
import type {FeedEnclosure, RichRssEntry} from "~/types/rss";
import type { Route } from "./+types/$lang.album.[rss.xml]";

export type RssEntry = RichRssEntry;

type AlbumImageAsset = {
  order: number;
  storageKey: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
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
          <title>积薪 - 摄影</title>
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
          <feedId>46524720022474752</feedId>
          <userId>46488520035984384</userId>
      </follow_challenge>
    </rss>
  `;
}

export async function loader({request, context, params}: Route.LoaderArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const prefix = context.cloudflare.env.IMG_PREFIX ?? "https://img.darmau.co";

  const {data: posts} = await supabase
  .from('photo')
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
  .eq('language.lang', lang)
  .eq('is_draft', false)
  .order('published_at', {ascending: false})
  .limit(30);

  const postIds = posts?.map((post) => post.id) ?? [];
  let albumImagesMap: Record<number, AlbumImageAsset[]> = {};

  if (postIds.length > 0) {
    const {data: albumImagesData} = await supabase
    .from('photo_image')
    .select(`
        photo_id,
        order,
        image (
          alt,
          caption,
          height,
          width,
          storage_key
        )
      `)
    .in('photo_id', postIds);

    albumImagesMap = buildAlbumImagesMap(albumImagesData);
  }

  const feed = generateRss({
    title: `${label.title} - ${label.photography}`,
    description: label.description,
    language: lang,
    link: `https://darmau.co/${lang}`,
    entries: posts ? posts.map((post) => ({
      description: post.abstract,
      pubDate: post.published_at,
      title: post.title,
      author: '李大毛',
      category: post.category!.title,
      link: `https://darmau.co/${lang}/album/${post.slug}`,
      guid: post.id,
      content: createEntryContent(
        post.content_text,
        albumImagesMap[post.id] ?? [],
        prefix
      ),
      enclosure: post.cover ? {
        url: `https://img.darmau.co/cdn-cgi/image/format=jpeg,width=960/https://img.darmau.co/${post.cover.storage_key}`,
        type: 'image/jpeg' as const,
        length: String(post.cover.size ?? 0),
      } : undefined,
    })) : [],
  });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
}

function getFirstThreeParagraphs(text: string | null): string {
  if (!text) {
    return '本文没有内容';
  }
  return text.split('\n')
  .filter(paragraph => paragraph.trim() !== '')
  .slice(0, 3)
  .join('\n');
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

function createEntryContent(
  text: string | null,
  images: AlbumImageAsset[],
  prefix: string
): string {
  const baseContent = getFirstThreeParagraphs(text);
  const imagesHtml = renderAlbumImagesHtml(images, prefix);
  if (!imagesHtml) {
    return baseContent;
  }
  return `${baseContent}\n\n${imagesHtml}`;
}

type RawAlbumImage =
  | {
      photo_id: number | null;
      order: number | null;
      image: {
        storage_key: string;
        width: number | null;
        height: number | null;
        alt: string | null;
        caption: string | null;
      } | null;
    };

function buildAlbumImagesMap(data: RawAlbumImage[] | null): Record<number, AlbumImageAsset[]> {
  if (!data) {
    return {};
  }

  const map: Record<number, AlbumImageAsset[]> = {};

  for (const item of data) {
    if (!item?.photo_id || !item.image?.storage_key) {
      continue;
    }

    const asset: AlbumImageAsset = {
      order: item.order ?? Number.MAX_SAFE_INTEGER,
      storageKey: item.image.storage_key,
      width: item.image.width,
      height: item.image.height,
      alt: item.image.alt,
      caption: item.image.caption,
    };

    if (!map[item.photo_id]) {
      map[item.photo_id] = [];
    }
    map[item.photo_id].push(asset);
  }

  Object.values(map).forEach((images) => {
    images.sort(
      (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    );
  });

  return map;
}

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

function renderAlbumImagesHtml(images: AlbumImageAsset[], prefix: string): string {
  if (!images.length) {
    return '';
  }

  const figures = images
    .map((image) => {
      if (!image.storageKey) {
        return '';
      }
      const src = `${prefix}/cdn-cgi/image/format=jpeg,width=1600/${image.storageKey}`;
      const widthAttr = image.width ? ` width="${image.width}"` : '';
      const heightAttr = image.height ? ` height="${image.height}"` : '';
      const caption = image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : '';
      return `<figure>
  <img src="${src}" loading="lazy" decoding="async" alt="${escapeHtml(image.alt ?? '')}"${widthAttr}${heightAttr} />
  ${caption}
</figure>`;
    })
    .filter(Boolean)
    .join('');

  if (!figures) {
    return '';
  }

  return `<div class="album-images">${figures}</div>`;
}
