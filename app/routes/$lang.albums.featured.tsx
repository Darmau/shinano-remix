import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData, useOutletContext} from "@remix-run/react";
import {UnstableServerPhotoAlbum as ServerPhotoAlbum} from "react-photo-album/server";
import "react-photo-album/masonry.css";
import {FeaturedPhoto, generatePhotoAlbum} from "~/utils/generatePhotoAlbum";
import GalleryImage from "~/components/GalleryImage";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";

export default function AllFeaturedAlbums () {
  const {prefix, lang} = useOutletContext<{prefix: string, lang: string}>();
  const {featuredPhotos} = useLoaderData<typeof loader>();

  const photos = generatePhotoAlbum(featuredPhotos as unknown as FeaturedPhoto[], prefix, lang);

  return (
      <>
        <Subnav active="photography" />
        <div className="w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
          <ServerPhotoAlbum
              layout = "masonry"
              photos = {photos}
              breakpoints = {[480, 720, 960]}
              spacing={0}
              render={{
                // eslint-disable-next-line no-empty-pattern
                photo: ({}, { photo}) => (
                    <Link to={photo.href} className="group m-1 md:m-2 relative rounded-md overflow-hidden" key={photo.key}>
                      <div className = "z-20 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent">
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

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
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
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/${data!.featuredPhotos![0].cover.storage_key || "a2b148a3-5799-4be0-a8d4-907f9355f20f"}`
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

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;

  const table = `random_${lang}_photos` as "random_en_photos" | "random_jp_photos" | "random_zh_photos";

  // 从photo表中获取lang对应的language.lang字段的数据，并从photo_image表中获取photo_id对应的数据
  const {data: featuredPhotos} = await supabase
    .from(table)
    .select(`
      id,
      slug,
      title,
      language!inner (lang),
      cover (id, alt, storage_key, width, height)
      `)
    .limit(24);

  const availableLangs = ["zh", "en", "jp"];

  return json({
    featuredPhotos: featuredPhotos,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  })
}
