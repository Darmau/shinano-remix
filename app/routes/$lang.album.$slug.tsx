import {ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useActionData, useLoaderData, useOutletContext} from "@remix-run/react";
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
import CommentEditor from "~/components/CommentEditor";
import {CommentBlock, CommentProps} from "~/components/CommentBlock";
import i18nLinks from "~/utils/i18nLinks";

export default function AlbumDetail() {
  const {lang} = useOutletContext<{ lang: string }>();
  const {
    albumContent,
    albumImages,
    MAPBOX,
    comments,
    page,
    limit,
    totalPage,
    session
  } = useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();

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
      <div className = "w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
        <Breadcrumb pages = {breadcrumbPages}/>
        <div className = "grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className = "col-span-1 lg:col-span-2 lg:self-start">
            <GallerySlide
                albumImages = {albumImages as unknown as AlbumPhoto[]}
                onIndexChange = {setCurrentIndex}
            />
          </div>
          <div className = "col-span-1 lg:row-span-2 space-y-4">
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
          <div className = "col-span-1 lg:col-span-2 lg:self-start">
            <CommentEditor contentTable = {'to_photo'} contentId = {albumContent.id} session = {session}/>
            <div className = "flex flex-col gap-4 divide-y">
              {actionResponse?.error && <p className = "error">{actionResponse.error}</p>}
              {comments && comments.map((comment) => (
                  <CommentBlock key = {comment.id} comment = {comment as unknown as CommentProps}/>
              ))}
            </div>
            <div className = "py-8 flex justify-between">
              {page > 1 && (
                  <Link
                      to = {{
                        search: `?page=${page - 1}&limit=${limit}`
                      }}
                      className = "rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >{label.previous}</Link>
              )}
              {page < totalPage && (
                  <Link
                      to = {{
                        search: `?page=${page + 1}&limit=${limit}`
                      }}
                      className = "ml-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >{label.next}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const {data: {session}} = await supabase.auth.getSession();
  const lang = params.lang as string;
  const slug = params.slug as string;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20;

  // 摄影详情
  const {data: albumContent} = await supabase
  .from('photo')
  .select(`
      id,
      title,
      slug,
      abstract,
      published_at,
      content_json,
      content_text,
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

  // 评论数据
  const {data: comments} = await supabase
  .from('comment')
  .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name)
    `)
  .eq('to_photo', albumContent.id)
  .eq('is_blocked', false)
  .eq('is_public', true)
  .order('created_at', {ascending: false})
  .range((page - 1) * limit, page * limit - 1);

  // 评论总数
  const {count} = await supabase
  .from('comment')
  .select('id', {count: 'exact'})
  .eq('to_photo', albumContent.id)
  .eq('is_blocked', false)
  .eq('is_public', true);

  // 总页数
  const totalPage = count ? Math.ceil(count / limit) : 1;

  // 查询同样的slug是否有其他语言版本
  const {data: availableAlbums} = await supabase
  .from('photo')
  .select(`
    language!inner (lang)
  `)
  .eq('slug', slug)

  // 转换成lang的数组，如['zh', 'en']
  const availableLangs = availableAlbums!.map((item: {language: {lang: string | null}}) => {
    return item.language.lang as string
  });

  return json({
    albumContent,
    albumImages,
    MAPBOX: context.cloudflare.env.MAPBOX_TOKEN,
    comments,
    page,
    limit,
    totalPage,
    session,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  });
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `album/${data!.albumContent.slug}`
  );

  return [
    {title: data!.albumContent.title},
    {
      name: "description",
      content: data!.albumContent.abstract || data!.albumContent.content_text,
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
      content: data!.albumContent.title
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/album/${data!.albumContent.slug}`
    },
    {
      property: "og:image",
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/${data!.albumImages![0].image!.storage_key}`
    },
    {
      property: "og:description",
      content: data!.albumContent.abstract || data!.albumContent.content_text
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

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const {supabase} = createClient(request, context);
  const {data: {session}} = await supabase.auth.getSession();

  if (!session) {
    return json({
      success: false,
      error: 'Unauthorized',
      comment: null
    })
  }

  const {data: userProfile} = await supabase
  .from('users')
  .select('id, user_id')
  .eq('user_id', session.user.id)
  .single();

  if (!userProfile) {
    return json({
      success: false,
      error: 'User not exists',
      comment: null
    })
  }

  const content_text = formData.get('content_text') as string;
  const to_photo = parseInt(formData.get('to_photo') as string);
  const is_anonymous = formData.get('is_anonymous') === 'on';

  const {data: newComment} = await supabase
  .from('comment')
  .insert({
    user_id: userProfile.id,
    content_text,
    to_photo,
    is_anonymous
  })
  .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name)
    `)
  .single();

  return json({
    success: true,
    error: null,
    comment: newComment
  })
}
