import {ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useActionData, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import ResponsiveImage from "~/components/ResponsiveImage";
import {Image} from "~/types/Image";
import getDate from "~/utils/getDate";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticleText from '~/locales/article';
import ContentContainer from "~/components/ContentContainer";
import {Json} from "~/types/supabase";
import Catalog from "~/components/Catalog";
import ReadingProcess from "~/components/ReadingProcess";
import NextAndPrev, {NeighboringPost} from "~/components/NextAndPrev";
import Breadcrumb, {BreadcrumbProps} from "~/components/Breadcrumb";
import CommentEditor from "~/components/CommentEditor";
import {CommentBlock, CommentProps} from "~/components/CommentBlock";
import i18nLinks from "~/utils/i18nLinks";
import {useEffect, useState} from "react";
import {SupabaseClient} from "@supabase/supabase-js";
import {EyeIcon} from "@heroicons/react/24/solid";

export default function ArticleDetail() {
  const {lang, supabase} = useOutletContext<{ lang: string, supabase: SupabaseClient }>();
  const {
    article,
    domain,
    previousArticle,
    nextArticle,
    comments,
    page,
    limit,
    totalPage,
    session
  } = useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();

  const label = getLanguageLabel(ArticleText, lang);
  const {pathname} = useLocation();

  if (!article) {
    throw new Response(null, {
      status: 404,
      statusText: 'Article not exists'
    })
  }

  const breadcrumbPages: BreadcrumbProps[] = [
    {
      name: label.latest_articles,
      to: `articles/1`,
      current: false
    },
    {
      name: article.title! as string,
      to: `article/${article.slug}`,
      current: true
    }
  ]

  // 存储被回复评论的id
  const [replyingTo, setReplyingTo] = useState<CommentProps | null>(null);

  const handleReply = (comment: CommentProps) => {
    setReplyingTo(comment);
    document.getElementById('comment-editor')?.scrollIntoView({behavior: 'smooth'});
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // 阅读量计算
  const [pageView, setPageView] = useState(article.page_view);
  useEffect(() => {
    supabase.rpc('article_page_view', {article_id: article.id})
    .then(({data, error}) => {
      if (error) {
        console.error('阅读量增加失败:', error);
      } else if (data !== null) {
        setPageView(data);
      }
    });
  }, [article.id, supabase]);

  return (
      <div className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
        <ReadingProcess/>
        <Breadcrumb pages = {breadcrumbPages}/>
        <div className = "flex flex-col gap-8 md:gap-16">
          <div className = "grid grid-cols-1 md:grid-cols-2 grid-rows-1 mt-4 gap-6 md:gap-8">
            <header className = "space-y-4">
              <div className = "flex gap-4 flex-wrap justify-start items-center">
                <h3 className = "text-sm text-violet-700 font-medium">{article.category!.title}</h3>
                <time className = "text-zinc-600 text-sm">{getDate(article.published_at!, lang)}</time>
              </div>
              <h1 className = "font-medium text-zinc-800 leading-normal text-4xl lg:text-5xl">{article.title}</h1>
              <h2 className = "text-zinc-600 text-lg lg:text-xl">{article.subtitle}</h2>
              {article.abstract &&
                  <p className = "p-4 rounded-md bg-zinc-100 text-zinc-600 leading-normal text-sm lg:text-base">
                    {article.abstract}
                  </p>}
              {article.topic && (
                  <ol className = "flex gap-2 flex-wrap">
                    {article.topic.map((topic: string, index: number) => (
                        <li key = {index} className = "text-sm text-zinc-600">#{topic}</li>
                    ))}
                  </ol>
              )}
              <div className = "flex gap-1 items-center justify-start">
                <EyeIcon className = "h-4 w-4 inline-block text-zinc-500"/>
                <p className = "text-zinc-500 text-sm">{pageView}</p>
              </div>
            </header>
            {article.cover && (
                <ResponsiveImage
                    image = {article.cover as unknown as Image} width = {960}
                    classList = "w-full rounded-md overflow-hiden object-cover aspect-[3/2]"
                />
            )}
          </div>

          {/*正文*/}
          <div className = "relative grid grid-cols-1 md:grid-cols-3 md:gap-24">
            <div className = "col-span-1 md:col-span-2 selection:bg-violet-800/60 selection:text-white">
              <ContentContainer content = {article.content_json as Json}/>
              <NextAndPrev
                  type = "article"
                  next = {nextArticle as NeighboringPost}
                  prev = {previousArticle as NeighboringPost}
              />

              <div className = "mt-16 col-span-1 lg:col-span-2">
                <CommentEditor
                    contentTable = {'to_article'}
                    contentId = {article.id}
                    session = {session}
                    replyingTo = {replyingTo}
                    onCancelReply = {handleCancelReply}
                />
                <div className = "flex flex-col gap-4 divide-y">
                  {actionResponse?.error && <p className = "error">{actionResponse.error}</p>}
                  {comments && comments.map((comment) => (
                      <CommentBlock
                          key = {comment.id}
                          comment = {comment as unknown as CommentProps}
                          onReply = {handleReply}
                      />
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
            <aside className = "hidden md:flex md:col-span-1 md:h-full">
              <Catalog
                  content = {article.content_json as Json}
                  url = {`${domain}${pathname}`}
                  title = {article.title!}
                  lang = {lang}
              />
            </aside>
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

  // 文章详情
  const {data: articleContent} = await supabase
  .from('article')
  .select(`
      id,
      title,
      slug,
      subtitle,
      abstract,
      updated_at,
      published_at,
      is_premium,
      is_featured,
      is_top,
      topic,
      content_json,
      page_view,
      category (title, slug),
      cover (alt, height, width, storage_key),
      language!inner (lang),
      lang
    `)
  .eq('slug', slug)
  .eq('language.lang', lang)
  .single();

  if (!articleContent) {
    throw new Response(null, {
      status: 404,
      statusText: 'Article not exists'
    })
  }

  // 前一篇和后一篇文章
  const {data: previousArticle} = await supabase
  .from('article')
  .select('title, slug, subtitle')
  .eq('lang', articleContent.lang!)
  .lt('published_at', articleContent.published_at)
  .order('published_at', {ascending: false})
  .limit(1)
  .single();

  const {data: nextArticle} = await supabase
  .from('article')
  .select('title, slug')
  .eq('lang', articleContent.lang!)
  .gt('published_at', articleContent.published_at)
  .order('published_at', {ascending: true})
  .limit(1)
  .single();

  // 评论数据
  const {data: comments} = await supabase
  .from('comment')
  .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name, role),
      reply_to (id, content_text, users (id, name))
    `)
  .eq('to_article', articleContent.id)
  .eq('is_blocked', false)
  .eq('is_public', true)
  .order('created_at', {ascending: false})
  .range((page - 1) * limit, page * limit - 1);

  // 评论总数
  const {count} = await supabase
  .from('comment')
  .select('id', {count: 'exact'})
  .eq('to_article', articleContent.id)
  .eq('is_blocked', false)
  .eq('is_public', true);

  // 总页数
  const totalPage = count ? Math.ceil(count / limit) : 1;

  // 查询同样的slug是否有其他语言版本
  const {data: availableArticle} = await supabase
  .from('article')
  .select(`
    language!inner (lang)
  `)
  .eq('slug', slug)

  // 转换成lang的数组，如['zh', 'en']
  const availableLangs = availableArticle!.map((item: { language: { lang: string | null } }) => {
    return item.language.lang as string
  });

  return json({
    article: articleContent,
    previousArticle: previousArticle || null,
    nextArticle: nextArticle || null,
    domain: context.cloudflare.env.BASE_URL,
    comments,
    page,
    limit,
    totalPage,
    session,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  })
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `article/${data!.article.slug}`
  );

  return [
    {title: data!.article.title},
    {
      name: "description",
      content: data!.article.abstract || data!.article.subtitle,
    },
    {
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: "RSS",
      href: `${baseUrl}/${lang}/article/rss.xml`,
    },
    {
      property: "og:title",
      content: data!.article.title
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/article/${data!.article.slug}`
    },
    {
      property: "og:image",
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/${data!.article.cover?.storage_key || 'a2b148a3-5799-4be0-a8d4-907f9355f20f'}`
    },
    {
      property: "og:description",
      content: data!.article.abstract || data!.article.subtitle
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
  const to_article = parseInt(formData.get('to_article') as string);
  const is_anonymous = formData.get('is_anonymous') === 'on';
  const reply_to = formData.get('reply_to') ? parseInt(formData.get('reply_to') as string) : null;

  const {data: newComment} = await supabase
  .from('comment')
  .insert({
    user_id: userProfile.id,
    content_text,
    to_article,
    is_anonymous,
    reply_to
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

  return json({
    success: true,
    error: null,
    comment: newComment
  })
}
