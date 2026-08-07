import { useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.albums.map";
import { lazy, Suspense } from "react";
import { createClient } from "~/utils/supabase/server";
import type { MapImageCollection } from "~/components/MapGallery";
import getLanguageLabel from "~/utils/getLanguageLabel";
import AlbumText from "~/locales/album";
import i18nLinks from "~/utils/i18nLinks";
import Subnav from "~/components/Subnav";

// 懒加载 MapGallery 组件
const MapGallery = lazy(() => import("~/components/MapGallery"));

export default function AlbumsMap() {
  const { imageCollection, MAPBOX, imgPrefix } = useLoaderData<typeof loader>();
  const { lang } = useOutletContext<{ lang: string }>();

  return (
    <>
      <Subnav active="photography" />
      <div className="w-full max-w-8xl mx-auto p-4 md:py-8">
        <h1 className="sr-only">Albums Map</h1>
        <Suspense
          fallback={
            <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg text-gray-600">加载地图中...</div>
              </div>
            </div>
          }
        >
          <MapGallery
            mapboxToken={MAPBOX}
            imageCollection={imageCollection}
            imgPrefix={imgPrefix}
            lang={lang}
          />
        </Suspense>
      </div>
    </>
  );
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;

  const startTime = Date.now();

  // 🚀 一行调用数据库函数，直接获取完整的 GeoJSON！
  // @ts-ignore - 自定义数据库函数，未在类型定义中
  const { data: geojson, error } = await supabase.rpc("get_photo_map_geojson", {
    lang_code: lang,
  });

  if (error) {
    console.error("Error fetching map data:", error);
    return {
      imageCollection: { type: "FeatureCollection", features: [] } as MapImageCollection,
      MAPBOX: context.cloudflare.env.MAPBOX_TOKEN,
      imgPrefix: context.cloudflare.env.IMG_PREFIX,
      baseUrl: context.cloudflare.env.BASE_URL,
      availableLangs: ["zh", "en", "jp"],
      latestPhotoStorageKey: null,
    };
  }

  // 获取最新相册的封面图片，用于 OpenGraph
  const { data: latestPhoto } = await supabase
    .from('photo')
    .select(`
      cover (storage_key)
    `)
    .eq('language.lang', lang)
    .eq('is_draft', false)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const elapsed = Date.now() - startTime;
  const imageCollection = (geojson || { type: "FeatureCollection", features: [] }) as unknown as MapImageCollection;
  const featureCount = imageCollection.features?.length || 0;

  const availableLangs = ["zh", "en", "jp"];

  return {
    imageCollection,
    MAPBOX: context.cloudflare.env.MAPBOX_TOKEN,
    imgPrefix: context.cloudflare.env.IMG_PREFIX,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs,
    latestPhotoStorageKey: latestPhoto?.cover?.storage_key || null,
  };
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(AlbumText, lang);

  if (!data) {
    return [{ title: "Not Found" }];
  }

  const baseUrl = data.baseUrl;
  const imgPrefix = data.imgPrefix;
  const multiLangLinks = i18nLinks(baseUrl, lang, data.availableLangs, "albums/map");
  
  // 使用最新相册的封面图片，如果没有则使用默认图片
  const ogImage = data.latestPhotoStorageKey 
    ? `${imgPrefix}/cdn-cgi/image/format=jpeg,width=960/${data.latestPhotoStorageKey}`
    : `${imgPrefix}/cdn-cgi/image/format=jpeg,width=960/a2b148a3-5799-4be0-a8d4-907f9355f20f`;

  return [
    { title: label.map_title },
    {
      name: "description",
      content: label.map_description,
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
      content: label.map_title,
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/albums/map`,
    },
    {
      property: "og:image",
      content: ogImage,
    },
    {
      property: "og:description",
      content: label.map_description,
    },
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
    {
      property: "twitter:image",
      content: ogImage,
    },
    {
      property: "twitter:creator",
      content: "@darmau8964",
    },
    ...multiLangLinks,
  ];
};
