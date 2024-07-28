import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import {UnstableServerPhotoAlbum as ServerPhotoAlbum} from "react-photo-album/server";
import "react-photo-album/rows.css";
import {generatePhotoAlbum} from "~/utils/generatePhotoAlbum";

export default function AllFeaturedAlbums () {
  const {prefix, lang} = useOutletContext<{prefix: string, lang: string}>();
  const {featuredPhotos} = useLoaderData<typeof loader>();

  const photos = generatePhotoAlbum(featuredPhotos, prefix, lang);

  return (
      <>
        <Subnav active="photography" />
        <div className="w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
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

  return json({
    featuredPhotos: featuredPhotos
  })
}
