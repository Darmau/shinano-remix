import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import {Json} from "~/types/supabase";
import ContentContainer from "~/components/ContentContainer";
import getDate from "~/utils/getDate";
import GallerySlide, {AlbumPhoto} from "~/components/GallerySlide";
import {useState} from "react";
import Mapbox, {EXIF} from "~/components/Mapbox";
import {MapPinIcon} from "@heroicons/react/20/solid";
import Breadcrumb, {BreadcrumbProps} from "~/components/Breadcrumb";
import getLanguageLabel from "~/utils/getLanguageLabel";
import AlbumText from "~/locales/album";

export default function AlbumDetail () {
  const { lang } = useOutletContext<{ lang: string }>();
  const {
    albumContent,
    albumImages,
    MAPBOX
  } = useLoaderData<typeof loader>();

  const [currentIndex, setCurrentIndex] = useState(0);

  const label = getLanguageLabel(AlbumText, lang);

  const breadcrumbPages: BreadcrumbProps[] = [
    {
      name: label.latest_albums,
      to: `albums/all/1`,
      current: false
    },
    {
      name: albumContent.title! as string,
      to: `album/${albumContent.slug}`,
      current: true
    }
  ]

  return (
      <div className="w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
        <Breadcrumb pages={breadcrumbPages} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className = "col-span-1 lg:col-span-2">
            <GallerySlide
                albumImages = {albumImages as unknown as AlbumPhoto[]}
                onIndexChange = {setCurrentIndex}
            />
          </div>
          <div className = "col-span-1 space-y-4">
            <h2 className = "text-sm text-violet-700 font-medium">{albumContent.category!.title}</h2>
            <h1 className = "text-zinc-800 font-medium text-3xl">{albumContent.title}</h1>
            <p className = "text-zinc-600 text-sm">{getDate(albumContent.published_at!, lang)}</p>
            <ContentContainer content = {albumContent.content_json as Json}/>
            {albumContent.topic && (
                <ol className = "flex gap-2 flex-wrap">
                  {albumContent.topic.map((topic: string, index: number) => (
                      <li key = {index} className = "text-sm text-zinc-600">#{topic}</li>
                  ))}
                </ol>
            )}
            <div className = "flex gap-2 justify-start items-center">
              <MapPinIcon className = "w-6 h-6 text-violet-700 inline-block"/>
              <p className = "text-sm text-zinc-500">{albumImages![currentIndex].image!.location}</p>
            </div>
            <Mapbox mapboxToken = {MAPBOX} exifData = {albumImages![currentIndex].image!.exif as EXIF}/>
          </div>
        </div>
      </div>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const slug = params.slug as string;

  // 摄影详情
  const {data: albumContent} = await supabase
  .from('photo')
  .select(`
      id,
      title,
      slug,
      published_at,
      content_json,
      topic,
      category (title, slug),
      language!inner (lang)
    `)
  .eq('slug', slug)
  .eq('language.lang', lang)
  .single();

  if (!albumContent) {
    throw new Response(null, {
      status: 404,
      statusText: 'Album not exists'
    })
  }

  // 根据相册id去photo_image以及关联的image表查询图片详细信息
  const {data: albumImages} = await supabase
  .from('photo_image')
  .select(`
      order,
      image (alt, caption, height, width, storage_key, exif, location)
    `)
  .eq('photo_id', albumContent.id)
  .order('order', {ascending: true});

  return json({
    albumContent,
    albumImages,
    MAPBOX: context.cloudflare.env.MAPBOX_TOKEN
  });
}
