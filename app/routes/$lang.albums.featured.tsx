import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData, useOutletContext} from "@remix-run/react";
import { UnstableServerPhotoAlbum as ServerPhotoAlbum } from "react-photo-album/server";
import { UnstableInfiniteScroll as InfiniteScroll } from "react-photo-album/scroll";
import "react-photo-album/rows.css";

export default function AllFeaturedAlbums () {
  const {prefix, lang} = useOutletContext<{prefix: string, lang: string}>();
  const {featuredPhotos} = useLoaderData<typeof loader>();

  const photos = generatePhotoAlbum(featuredPhotos, prefix, lang);

  return (
      <>
        <Subnav active="photography" />
        <div className="w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
          <div>推荐摄影</div>
          <ServerPhotoAlbum
              layout = "rows"
              photos = {photos}
              breakpoints = {[480, 720, 1080]}
          />
        </div>
      </>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;

  // 从photo表中获取lang对应的language.lang字段的数据，并从photo_image表中获取photo_id对应的数据
  const {data: featuredPhotos} = await supabase
    .from('photo')
    .select(`
      id,
      slug,
      title,
      language!inner (lang),
      cover (id, alt, storage_key, width, height)
      `)
    .eq('is_featured', true)
    .eq('language.lang', lang)
    .limit(8)

  return json({
    featuredPhotos
  })
}

// 生成能被react-photo-album使用的数据
function generatePhotoAlbum(featuredPhotos: any, prefix: string, lang: string) {
  return featuredPhotos.map((photo: any) => ({
    key: photo.id,
    src: `${prefix}/cdn-cgi/image/format=auto,width=640/${photo.cover.storage_key}`,
    width: photo.cover.width,
    height: photo.cover.height,
    alt: photo.title,
    href: `/${lang}/album/${photo.slug}`,
    label: photo.title,
  }))
}
