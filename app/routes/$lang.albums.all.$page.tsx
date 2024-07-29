import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import {FeaturedPhoto, generatePhotoAlbum} from "~/utils/generatePhotoAlbum";
import {UnstableServerPhotoAlbum as ServerPhotoAlbum} from "react-photo-album/server";
import GalleryImage from "~/components/GalleryImage";
import "react-photo-album/columns.css";
import Pagination from "~/components/Pagination";

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
                      <div
                          className = "absolute -bottom-12 z-20 p-4 w-full bg-gradient-to-b from-transparent to-black/50 text-white font-medium text-base group-hover:bottom-0 group-active:bottom-0 transition-all duration-300"
                      >
                        {photo.alt}
                      </div>
                      <GalleryImage image = {photo} width = {640} classList = "group w-full h-auto"/>
                    </Link>
                )
              }}
          />
          <Pagination count={count || 0} limit={16} page={page} path={path} />
        </div>
      </>
  )
}

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

  return json({
    albums: albums,
    count: count,
    page: Number(page)
  })
}
