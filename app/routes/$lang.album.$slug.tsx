import { createClient } from "~/utils/supabase/server";
import { Link, useActionData, useLoaderData, useOutletContext, useRouteLoaderData, useLocation } from "react-router";
import type { Route } from "./+types/$lang.album.$slug";
import type { Json } from "~/types/supabase";
import ContentContainer from "~/components/ContentContainer";
import getTime from "~/utils/getTime";
import type { AlbumPhoto } from "~/components/GallerySlide";
import GallerySlide from "~/components/GallerySlide";
import { useEffect, useState, lazy, Suspense } from "react";
import { MapPinIcon } from "@heroicons/react/20/solid";

// 动态导入 Mapbox 组件以优化加载速度
const Mapbox = lazy(() => import("~/components/Mapbox"));
import type { BreadcrumbProps } from "~/components/Breadcrumb";
import Breadcrumb from "~/components/Breadcrumb";
import getLanguageLabel from "~/utils/getLanguageLabel";
import AlbumText from "~/locales/album";
import CommentEditor from "~/components/CommentEditor";
import type { CommentProps } from "~/types/Comment.tsx";
import { CommentBlock } from "~/components/CommentBlock";
import i18nLinks from "~/utils/i18nLinks";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EyeIcon } from "@heroicons/react/24/solid";
import { parseTurnstileOutcome } from "~/utils/turnstile";
import { trackPageView } from "~/utils/trackPageView";
import { getClientIp } from "~/utils/getClientIp.server";
import type { loader as rootLoader } from "~/root";
import {
  generateAlbumStructuredData,
  generateBreadcrumbStructuredData,
  buildCommentsStructuredData
} from "~/utils/structuredData";
import ShareButton from "~/components/ShareButton";
import Reaction, {type ReactionSummary} from "~/components/Reaction";

export default function AlbumDetail() {
  const { lang, supabase } = useOutletContext<{ lang: string, supabase: SupabaseClient }>();
  const {
    albumContent,
    albumImages,
    MAPBOX,
    comments,
    page,
    limit,
    totalPage,
    structuredData,
    baseUrl
  } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const session = rootData?.session ?? null;
  const actionResponse = useActionData<typeof action>();
  const { pathname } = useLocation();

  const [currentIndex, setCurrentIndex] = useState(0);

  const label = getLanguageLabel(AlbumText, lang);

  const breadcrumbPages: BreadcrumbProps[] = [
    {
      name: label.latest_albums,
      to: `albums/all/1`,
      current: false
    },
    {
      name: albumContent.title!,
      to: `album/${albumContent.slug}`,
      current: true
    }
  ]

  // 存储被回复评论的id
  const [replyingTo, setReplyingTo] = useState<CommentProps | null>(null);

  const handleReply = (comment: CommentProps) => {
    setReplyingTo(comment);
    document.getElementById('comment-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // 阅读量计算
  const [pageView, setPageView] = useState(albumContent.page_view);
  useEffect(() => {
    trackPageView('album', albumContent.id, supabase, (newPageView) => {
      setPageView(newPageView);
    }).catch((error) => {
      console.error(error);
    });
  }, [albumContent.id, supabase]);

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.album)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb)
        }}
      />
      {structuredData.comments.length > 0 && structuredData.comments.map((comment, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(comment)
          }}
        />
      ))}

      <div className="w-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
        <Breadcrumb pages={breadcrumbPages} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 lg:self-start">
            <GallerySlide
              albumImages={albumImages as unknown as AlbumPhoto[]}
              onIndexChange={setCurrentIndex}
              albumTitle={albumContent.title!}
            />
          </div>

          <div className="col-span-1 lg:row-span-2 space-y-4">
            <h2 className="text-sm text-violet-700 font-medium">{albumContent.category!.title}</h2>
            <h1 className="text-zinc-800 font-medium text-3xl">{albumContent.title}</h1>
            <p className="text-zinc-600 text-sm">{getTime(albumContent.published_at!, lang)}</p>
            <div className="flex gap-1 items-center justify-start">
              <EyeIcon className="h-4 w-4 inline-block text-zinc-500" />
              <p className="text-zinc-500 text-sm">{pageView}</p>
            </div>

            <ContentContainer content={albumContent.content_json as Json} />
            {albumContent.topic && (
              <ol className="flex gap-2 flex-wrap">
                {albumContent.topic.map((topic: string, index: number) => (
                  <li key={index} className="text-sm text-zinc-600">#{topic}</li>
                ))}
              </ol>
            )}

            <Reaction
              contentType="photo"
              contentId={albumContent.id}
              reactions={albumContent.reactions as ReactionSummary | null}
            />
            
            <div className="flex gap-2 justify-start items-center">
              <MapPinIcon className="w-6 h-6 text-violet-700 inline-block" />
              <p className="text-sm text-zinc-500">{albumImages![currentIndex].image.location}</p>
            </div>
            {albumImages && albumImages[currentIndex] && (
              <Suspense fallback={
                <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-sm text-gray-500">加载地图中...</div>
                </div>
              }>
                <Mapbox
                  mapboxToken={MAPBOX}
                  exifData={{
                    latitude: albumImages[currentIndex].image.latitude ?? null,
                    longitude: albumImages[currentIndex].image.longitude ?? null
                  }}
                  lang={lang}
                />
              </Suspense>
            )}
            <ShareButton 
              url={`${baseUrl}${pathname}`}
              title={albumContent.title!}
              lang={lang}
              contentType="album" />
          </div>
          <div className="col-span-1 lg:col-span-2 lg:self-start">
            <CommentEditor
              contentTable={'to_photo'}
              contentId={albumContent.id}
              session={session}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
            <div className="flex flex-col gap-4 divide-y divide-none">
              {actionResponse?.error && <p className="mt-2 text-sm text-red-500">{actionResponse.error}</p>}
              {actionResponse?.success && <p className="mt-2 text-sm text-green-500">{actionResponse.success}</p>}
              {comments && comments.map((comment) => (
                <CommentBlock
                  key={comment.id}
                  comment={comment as unknown as CommentProps}
                  onReply={handleReply}
                />
              ))}
            </div>
            <div className="py-8 flex justify-between">
              {page > 1 && (
                <Link
                  to={{
                    search: `?page=${page - 1}&limit=${limit}`,
                    hash: '#comment-editor'
                  }}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >{label.previous}</Link>
              )}
              {page < totalPage && (
                <Link
                  to={{
                    search: `?page=${page + 1}&limit=${limit}`,
                    hash: '#comment-editor'
                  }}
                  className="ml-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >{label.next}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;
  const slug = params.slug as string;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20;

  // 摄影详情
  const { data: albumContent } = await supabase
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
      page_view,
      reactions,
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
    });
  }

  // 根据相册id去photo_image以及关联的image表查询图片详细信息
  const [
    albumImagesResult,
    commentsResult,
    commentCountResult,
    availableAlbumsResult
  ] = await Promise.all([
    supabase
      .from('photo_image')
      .select(`
        order,
        image (
          alt,
          caption,
          height,
          width,
          storage_key,
          exif,
          location,
          latitude,
          longitude
        )
      `)
      .eq('photo_id', albumContent.id)
      .order('order', { ascending: true }),
    supabase
      .from('comment')
      .select(`
        id,
        user_id,
        name,
        website,
        content_text,
        created_at,
        is_anonymous,
        users (id, name, role, website),
        reply_to (id, content_text, is_anonymous, name, users (id, name))
      `)
      .eq('to_photo', albumContent.id)
      .eq('is_blocked', false)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1),
    supabase
      .from('comment')
      .select('id', { count: 'exact' })
      .eq('to_photo', albumContent.id)
      .eq('is_blocked', false)
      .eq('is_public', true),
    supabase
      .from('photo')
      .select(`
        language!inner (lang)
      `)
      .eq('slug', slug)
  ]);

  const albumImages = albumImagesResult.data ?? null;
  const comments = commentsResult.data ?? [];
  const count = commentCountResult.count;
  const availableAlbums = availableAlbumsResult.data ?? [];

  // 总页数
  const totalPage = count ? Math.ceil(count / limit) : 1;

  // 转换成lang的数组，如['zh', 'en']
  const availableLangs = availableAlbums.map((item: { language: { lang: string | null } }) => {
    return item.language.lang as string
  });

  // 生成结构化数据
  const baseUrl = context.cloudflare.env.BASE_URL;
  const imgPrefix = context.cloudflare.env.IMG_PREFIX;
  const currentUrl = `${baseUrl}/${lang}/album/${slug}`;

  // 处理图片数据，提取 EXIF 和位置信息
  const processedImages = albumImages?.map((item: any) => {
    const image = item.image;
    return {
      id: image.id || 0,
      alt: image.alt,
      caption: image.caption,
      storage_key: image.storage_key,
      width: image.width,
      height: image.height,
      exif: image.exif,
      location: image.location,
      latitude: image.latitude,
      longitude: image.longitude,
      date: null,
      taken_at: null
    };
  }) || [];

  // 相册结构化数据
  const albumStructuredData = generateAlbumStructuredData({
    album: {
      id: albumContent.id || 0,
      title: albumContent.title || "",
      slug: albumContent.slug || "",
      abstract: albumContent.abstract,
      published_at: albumContent.published_at || new Date().toISOString(),
      page_view: albumContent.page_view || 0,
      images: processedImages,
      comments: [{ count: count || 0 }]
    },
    baseUrl,
    imgPrefix,
    lang,
    url: currentUrl
  });

  // 面包屑结构化数据
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: "Home", url: `${baseUrl}/${lang}` },
    { name: "Albums", url: `${baseUrl}/${lang}/albums/all/1` },
    { name: albumContent.title || "Album", url: currentUrl }
  ]);

  // 评论结构化数据
  const commentStructuredData = buildCommentsStructuredData(comments, baseUrl, currentUrl);

  return {
    albumContent,
    albumImages,
    MAPBOX: context.cloudflare.env.MAPBOX_TOKEN,
    comments,
    page,
    limit,
    totalPage,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs,
    structuredData: {
      album: albumStructuredData,
      breadcrumb: breadcrumbStructuredData,
      comments: commentStructuredData
    }
  };
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const baseUrl = data!.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
    lang,
    data!.availableLangs,
    `album/${data!.albumContent.slug}`
  );

  return [
    { title: data!.albumContent.title },
    {
      name: "description",
      content: data!.albumContent.abstract ?? data!.albumContent.content_text,
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
      content: `${data!.prefix}/cdn-cgi/image/format=jpeg,width=960/${data!.albumImages![0].image.storage_key}`
    },
    {
      property: "og:description",
      content: data!.albumContent.abstract ?? data!.albumContent.content_text
    },
    {
      property: "twitter:image",
      content: `${data!.prefix}/cdn-cgi/image/format=jpeg,width=960/${data!.albumImages![0].image.storage_key}`
    },
    {
      property: "twitter:title",
      content: data!.albumContent.title
    },
    {
      property: "twitter:description",
      content: data!.albumContent.abstract ?? data!.albumContent.content_text
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

export async function action({ request, context, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();
  const content_text = formData.get('content_text') as string;
  const to_photo = parseInt(formData.get('to_photo') as string);
  const reply_to = formData.get('reply_to') ? parseInt(formData.get('reply_to') as string) : null;
  const receiveNotification = formData.get('receive_notification') === 'true';
  const ipAddress = getClientIp(request);

  if (!session) {
    const turnstileToken = formData.get('cf-turnstile-response');
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: context.cloudflare.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const outcome = parseTurnstileOutcome(await turnstileResponse.json());
    if (!outcome.success) {
      return {
        success: false,
        error: '验证失败,请重试。',
        comment: null
      };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;

    const { data: newComment, error } = await supabase
      .from('comment')
      .insert({
        name,
        email,
        website,
        content_text,
        to_photo,
        is_anonymous: true,
        reply_to,
        receive_notification: receiveNotification,
        ip: ipAddress
      })
      .select(`
        id,
        name,
        content_text,
        created_at,
        is_anonymous,
        reply_to (id, content_text, is_anonymous)
      `)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        comment: null
      }
    }

    return {
      success: '提交成功，请等待审核。Please wait for review.',
      error: null,
      comment: newComment
    };
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('id, user_id, name')
    .eq('user_id', session.user.id)
    .single();

  if (!userProfile) {
    return {
      success: false,
      error: 'User not exists',
      comment: null
    }
  }

  const { data: newComment } = await supabase
    .from('comment')
    .insert({
      user_id: userProfile.id,
      content_text,
      to_photo,
      is_anonymous: false,
      reply_to,
      receive_notification: receiveNotification,
      ip: ipAddress
    })
    .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name),
      reply_to (id, content_text, users (id, name))
    `)
    .single();

  return {
    success: '评论成功。Comment success.',
    error: null,
    comment: newComment
  }
}
