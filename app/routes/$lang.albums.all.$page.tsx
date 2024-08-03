import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import {FeaturedPhoto, generatePhotoAlbum} from "~/utils/generatePhotoAlbum";
import {UnstableServerPhotoAlbum as ServerPhotoAlbum} from "react-photo-album/server";
import GalleryImage from "~/components/GalleryImage";
import "react-photo-album/columns.css";
import Pagination from "~/components/Pagination";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";

export default function AllAlbums () {
  const {prefix, lang} = useOutletContext<{prefix: string, lang: string}>();
  const {albums, count, page} = useLoaderData<typeof loader>();
  const location = useLocation();
  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  const photos = generatePhotoAlbum(albums as unknown as FeaturedPhoto[], prefix, lang);

  return (
      <>
        <Subnav active="photography" />
        <div className = "w-full max-w-8xl mx-auto p-4 lg:mb-16 space-y-8">
          <ServerPhotoAlbum
              layout = "columns"
              photos = {photos}
              breakpoints = {[480, 720, 1080]}
              spacing = {0}
              render = {{
                // eslint-disable-next-line no-empty-pattern
                photo: ({}, {photo}) => (
                    <Link
                        to = {photo.href} className = "group m-2 relative rounded-md overflow-hidden" key = {photo.key}
                    >
                      <div className = "z-20 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent">
                        <div
                            className = "transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 p-4"
                        >
                          <p className = "text-white font-medium text-base">{photo.title}</p>
                        </div>
                      </div>
                      <GalleryImage image = {photo} width = {640} classList = "group w-full h-auto"/>
                    </Link>
                )
              }}
          />
          <Pagination count = {count || 0} limit = {16} page = {page} path = {path}/>
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
      `albums/all/${data!.page}`
  );

  return [
    {title: label.albums_title},
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
      content: `${baseUrl}/${lang}/albums/all/${data!.page}`
    },
    {
      property: "og:image",
      // 没有数据的时候会有bug
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/${data!.albums![0].cover.storage_key || 'a2b148a3-5799-4be0-a8d4-907f9355f20f'}`
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

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const page = params.page as string;

  const {data: albums} = await supabase
  .from('photo')
  .select(`
      id,
      title,
      slug,
      cover (id, alt, storage_key, width, height),
      language!inner (lang)
    `)
  .eq('language.lang', lang)
  .eq('is_draft', false)
  .limit(12)
  .range((Number(page) - 1) * 16, Number(page) * 16 - 1)
  .order('published_at', {ascending: false})

  // 指定语言album的数量，排除草稿
  const {count} = await supabase
  .from('photo')
  .select(`
    id,
    language!inner (lang)
  `, {count: 'exact', head: true})
  .eq('is_draft', false)
  .eq('language.lang', lang);

  const availableLangs = [lang];

  return json({
    albums: albums,
    count: count,
    page: Number(page),
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  })
}
