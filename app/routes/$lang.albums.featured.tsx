import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData, useOutletContext} from "@remix-run/react";
import {UnstableServerPhotoAlbum as ServerPhotoAlbum} from "react-photo-album/server";
import "react-photo-album/masonry.css";
import {FeaturedPhoto, generatePhotoAlbum} from "~/utils/generatePhotoAlbum";
import GalleryImage from "~/components/GalleryImage";

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
              breakpoints = {[480, 720, 1080]}
              spacing={0}
              render={{
                // eslint-disable-next-line no-empty-pattern
                photo: ({}, { photo}) => (
                    <Link to={photo.href} className="group m-2 relative rounded-md overflow-hidden" key={photo.key}>
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
