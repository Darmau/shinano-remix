import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Subnav from "~/components/Subnav";
import { createClient } from "~/utils/supabase/server";
import { useLoaderData, useLocation, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.albums.all.$page";
import Pagination from "~/components/Pagination";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";
import type { GalleryItem, GalleryMediaImage } from "~/types/Gallery";
import GalleryCard from "~/components/GalleryCard";

type LoaderData = {
  items: GalleryItem[];
  count: number;
  page: number;
  baseUrl: string;
  prefix: string;
  availableLangs: string[];
};

const PAGE_SIZE = 20;

// gallery_feed view 返回的行类型
type GalleryFeedRow = {
  content_type: "photo" | "thought";
  id: number;
  slug: string | null;
  title: string | null;
  content_text: string | null;
  created_at: string | null;
  sort_date: string | null;
  lang: string | null;
  cover: {
    id: string | number;
    alt: string | null;
    storage_key: string;
    width: number | null;
    height: number | null;
  } | null;
  images: {
    order: number | null;
    image: {
      id: string | number;
      alt: string | null;
      storage_key: string;
      width: number | null;
      height: number | null;
    };
  }[] | null;
};

const normalizeGalleryFeed = (rows: unknown): GalleryItem[] => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.flatMap(row => {
    if (!row || typeof row !== "object") {
      return [];
    }

    const item = row as GalleryFeedRow;
    if (typeof item.id !== "number") {
      return [];
    }

    // 从 images 数组提取图片，按 order 排序
    const images: GalleryMediaImage[] = (item.images ?? [])
      .filter(entry => entry?.image?.storage_key)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(entry => ({
        id: String(entry.image.id),
        alt: entry.image.alt ?? null,
        storage_key: entry.image.storage_key,
        width: entry.image.width ?? 0,
        height: entry.image.height ?? 0,
      }));

    // 如果没有 images 但有 cover，使用 cover 作为图片
    if (images.length === 0 && item.cover?.storage_key) {
      images.push({
        id: String(item.cover.id),
        alt: item.cover.alt ?? null,
        storage_key: item.cover.storage_key,
        width: item.cover.width ?? 0,
        height: item.cover.height ?? 0,
      });
    }

    return [{
      type: item.content_type,
      id: item.id,
      slug: item.slug,
      title: item.title ?? "",
      content: item.content_text ?? "",
      createdAt: item.sort_date ?? "",
      images,
    }];
  });
};

const isLoaderData = (value: unknown): value is LoaderData =>
  typeof value === "object" &&
  value !== null &&
  "baseUrl" in value &&
  "availableLangs" in value &&
  "page" in value &&
  "prefix" in value &&
  "items" in value &&
  "count" in value;

export default function AllAlbums() {
  const { prefix, lang } = useOutletContext<{ prefix: string, lang: string }>();
  const { items, count, page } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [visibleCount, setVisibleCount] = useState(5);

  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  const visibleItems = useMemo(
    () => items.slice(0, Math.min(visibleCount, items.length)),
    [items, visibleCount]
  );

  const hasMore = visibleCount < items.length;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(items.length, prev + 5));
  }, [items.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <Subnav active="photography" />
      <h1 className="sr-only">Photography</h1>
      <div className="w-full max-w-5xl mx-auto p-4 lg:mb-16 space-y-6">
        <ul className="mx-auto space-y-12 lg:space-y-16 max-w-lg">
          {visibleItems.map((item) => (
            <GalleryCard item={item} lang={lang} prefix={prefix} key={`${item.type}-${item.id}`} />
          ))}
        </ul>

        {hasMore && (
          <div ref={sentinelRef} className="h-10" aria-hidden="true" />
        )}

        <Pagination count={count ?? 0} limit={PAGE_SIZE} page={page} path={path} />
      </div>
    </>
  )
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);

  if (!isLoaderData(data)) {
    return [{ title: 'Not Found' }];
  }

  const baseUrl = data.baseUrl;
  const ogCover = data.items.find(item => item.images.length > 0)?.images[0]?.storage_key ?? "a2b148a3-5799-4be0-a8d4-907f9355f20f";
  const multiLangLinks = i18nLinks(baseUrl,
    lang,
    data.availableLangs,
    `albums/all/${data.page}`
  );

  return [
    { title: label.albums_title },
    {
      name: "description",
      content: label.albums_description,
    },
    {
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: "RSS",
      href: `${baseUrl}/${lang}/album/rss.xml`,
    },
    {
      property: "og:title",
      content: label.albums_title
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/albums/all/${data.page}`
    },
    {
      property: "og:image",
      content: `${data.prefix}/cdn-cgi/image/format=jpeg,width=960/${ogCover}`
    },
    {
      property: "og:description",
      content: label.albums_description
    },
    {
      property: "twitter:card",
      content: "summary_large_image"
    },
    {
      property: "twitter:creator",
      content: "@darmau8964"
    },
    ...multiLangLinks
  ];
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;
  const page = Number(params.page);

  // 如果page无法转换为数字，返回404
  if (!Number.isInteger(page) || page < 1) {
    return new Response(null, { status: 404 });
  }

  // 使用 gallery_feed view 进行数据库层分页
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  // 使用类型断言绕过 gallery_feed view 的类型检查
  const [feedResult, countResult] = await Promise.all([
    supabase
      .from('gallery_feed' as 'photo')
      .select('*')
      .or(`lang.eq.${lang},lang.is.null`)  // photo 按语言过滤，thought 无语言限制
      .order('sort_date', { ascending: false })
      .range(start, end),
    supabase
      .from('gallery_feed' as 'photo')
      .select('*', { count: 'exact', head: true })
      .or(`lang.eq.${lang},lang.is.null`)
  ]);

  if (feedResult.error) {
    return new Response(feedResult.error.message, { status: 500 });
  }

  const items = normalizeGalleryFeed(feedResult.data);
  const availableLangs = ["zh", "en", "jp"];

  return {
    items,
    count: countResult.count ?? 0,
    page,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs,
  };
}
