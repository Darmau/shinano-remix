import Subnav from "~/components/Subnav";
import {createClient} from "~/utils/supabase/server";
import { Link, useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.albums.featured";
import {ServerPhotoAlbum} from "~/components/ServerPhotoAlbum";
import "react-photo-album/masonry.css";
import type {FeaturedPhoto} from "~/utils/generatePhotoAlbum";
import {generatePhotoAlbum} from "~/utils/generatePhotoAlbum";
import GalleryImage from "~/components/GalleryImage";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";

type FeaturedRow = {
  id: number;
  slug: string | null;
  title: string | null;
  page_view: number | null;
  language: {
    lang: string | null;
  } | null;
  cover: {
    id: string | number;
    alt: string | null;
    storage_key: string;
    width: number | null;
    height: number | null;
  } | null;
};

type LoaderData = {
  featuredPhotos: FeaturedPhoto[];
  baseUrl: string;
  prefix: string;
  availableLangs: string[];
};

const normalizeFeatured = (rows: unknown, fallbackLang: string): FeaturedPhoto[] => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const normalized: FeaturedPhoto[] = [];

  rows.forEach(row => {
    if (!row || typeof row !== "object") {
      return;
    }

    const candidate = row as FeaturedRow;
    if (typeof candidate.id !== "number" || !candidate.cover || !candidate.language) {
      return;
    }

    normalized.push({
      id: candidate.id,
      slug: candidate.slug,
      title: candidate.title ?? "",
      language: {
        lang: candidate.language.lang ?? fallbackLang,
      },
      cover: {
        id: String(candidate.cover.id),
        alt: candidate.cover.alt,
        storage_key: candidate.cover.storage_key,
        width: candidate.cover.width ?? 0,
        height: candidate.cover.height ?? 0,
      },
    });
  });

  return normalized;
};

const isLoaderData = (value: unknown): value is LoaderData =>
    typeof value === "object" &&
    value !== null &&
    "baseUrl" in value &&
    "availableLangs" in value &&
    "prefix" in value &&
    "featuredPhotos" in value;

export default function AllFeaturedAlbums() {
  const {prefix, lang} = useOutletContext<{prefix: string, lang: string}>();
  const {featuredPhotos} = useLoaderData<typeof loader>();

  const photos = generatePhotoAlbum(featuredPhotos, prefix, lang);

  return (
      <>
        <Subnav active = "photography"/>
        <h1 className = "sr-only">Featured Photography</h1>
        <div className = "w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
          <ServerPhotoAlbum
              layout = "masonry"
              photos = {photos}
              breakpoints = {[480, 720, 960]}
              spacing = {0}
              columns = {(containerWidth: number) => {
                if (containerWidth < 480) return 1;
                if (containerWidth < 720) return 2;
                if (containerWidth < 960) return 3;
                return 4;
              }}
              render = {{
                // eslint-disable-next-line no-empty-pattern
                photo: ({}, {photo}: { photo: typeof photos[number] }) => (
                    <Link
                        to = {photo.href} className = "group m-1 md:m-2 relative rounded-md overflow-hidden"
                        key = {photo.key}
                    >
                      <div className = "z-20 absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent">
                        <div
                            className = "transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 p-4"
                        >
                          <p className = "text-white font-medium text-base">{photo.title}</p>
                        </div>
                      </div>
                      <GalleryImage image = {photo} width = {640} classList = "w-full h-full group"/>
                    </Link>
                )
              }}
          />
        </div>
      </>
  )
}

export const meta: Route.MetaFunction = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  
  if (!isLoaderData(data)) {
    return [{title: 'Not Found'}];
  }
  
  const baseUrl = data.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data.availableLangs,
      "albums/featured"
  );

  return [
    {title: label.featured_albums_title},
    {
      name: "description",
      content: label.featured_albums_description,
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
      content: label.featured_albums_title
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/albums/featured`
    },
    {
      property: "og:image",
      // 没有推荐摄影的时候会有bug
      content: `${data.prefix}/cdn-cgi/image/format=jpeg,width=960/${data.featuredPhotos[0]?.cover.storage_key ?? "a2b148a3-5799-4be0-a8d4-907f9355f20f"}`
    },
    {
      property: "og:description",
      content: label.featured_albums_description
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

export async function loader({request, context, params}: Route.LoaderArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;

  const table = `random_${lang}_photos` as "random_en_photos" | "random_jp_photos" | "random_zh_photos";

  // 从photo表中获取lang对应的language.lang字段的数据，并从photo_image表中获取photo_id对应的数据
  const {data: rawFeaturedPhotos, error} = await supabase
    .from(table)
    .select(`
      id,
      slug,
      title,
      page_view,
      language!inner (lang),
      cover (id, alt, storage_key, width, height)
      `)
    .limit(32);

  if (error) {
    return new Response(error.message, {status: 500});
  }

  const availableLangs = ["zh", "en", "jp"];

  return {
    featuredPhotos: normalizeFeatured(rawFeaturedPhotos, lang),
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs,
  };
}
