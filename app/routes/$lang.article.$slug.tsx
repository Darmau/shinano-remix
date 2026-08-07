import {createClient} from "~/utils/supabase/server";
import { Link, useActionData, useLoaderData, useLocation, useOutletContext, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/$lang.article.$slug";
import ResponsiveImage from "~/components/ResponsiveImage";
import type {Image} from "~/types/Image";
import getTime from "~/utils/getTime";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticleText from '~/locales/article';
import ContentContainer from "~/components/ContentContainer";
import type {Json} from "~/types/supabase";
import Catalog from "~/components/Catalog";
import ReadingProcess from "~/components/ReadingProcess";
import type {NeighboringPost} from "~/components/NextAndPrev";
import NextAndPrev from "~/components/NextAndPrev";
import Reaction, {type ReactionSummary} from "~/components/Reaction";
import type {BreadcrumbProps} from "~/components/Breadcrumb";
import Breadcrumb from "~/components/Breadcrumb";
import CommentEditor from "~/components/CommentEditor";
import type { CommentProps} from "~/types/Comment.tsx";
import {CommentBlock} from "~/components/CommentBlock";
import i18nLinks from "~/utils/i18nLinks";
import {useEffect, useMemo, useState} from "react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {EyeIcon, LockClosedIcon} from "@heroicons/react/24/solid";
import {parseTurnstileOutcome} from "~/utils/turnstile";
import {trackPageView} from "~/utils/trackPageView";
import {getClientIp} from "~/utils/getClientIp.server";
import type {loader as rootLoader} from "~/root";
import {
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  buildCommentsStructuredData
} from "~/utils/structuredData";

type TipTapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type TipTapNode = {
  type?: string;
  text?: string | null;
  content?: TipTapNode[];
  attrs?: {
    level?: number;
    id?: string | number;
    start?: number;
    href?: string;
    target?: string;
    rel?: string;
    language?: string;
    alt?: string | null;
  } & Record<string, unknown>;
  marks?: TipTapMark[];
};

type TipTapDoc = {
  type?: string;
  content?: TipTapNode[];
};

const renderPlainArticleHtml = (content: Json | null | undefined): string => {
  if (!content || typeof content !== "object") {
    return "";
  }

  const documentNode = content as TipTapDoc;
  if (!Array.isArray(documentNode.content) || documentNode.content.length === 0) {
    return "";
  }

  const body = documentNode.content.map(renderTipTapNode).join("");

  return body ? `<article>${body}</article>` : "";
};

const renderTipTapNode = (node?: TipTapNode): string => {
  if (!node || typeof node.type !== "string") {
    return "";
  }

  switch (node.type) {
    case "doc":
      return renderChildren(node.content);
    case "text":
      return applyMarks(escapeHtml(node.text ?? ""), node.marks);
    case "hardBreak":
      return "<br />";
    case "paragraph":
      return `<p>${renderChildren(node.content)}</p>`;
    case "heading": {
      const level = getHeadingLevel(node.attrs?.level);
      return `<h${level}>${renderChildren(node.content)}</h${level}>`;
    }
    case "blockquote":
      return `<blockquote>${renderChildren(node.content)}</blockquote>`;
    case "bulletList":
      return `<ul>${renderChildren(node.content)}</ul>`;
    case "orderedList": {
      const start = typeof node.attrs?.start === "number" && node.attrs.start > 1
        ? ` start="${node.attrs.start}"`
        : "";
      return `<ol${start}>${renderChildren(node.content)}</ol>`;
    }
    case "listItem":
      return `<li>${renderChildren(node.content)}</li>`;
    case "codeBlock":
    case "customCodeBlock": {
      const language = typeof node.attrs?.language === "string" && node.attrs.language.trim()
        ? ` class="language-${escapeAttr(node.attrs.language.trim())}"`
        : "";
      const code = escapeHtml(getTextContent(node.content));
      return `<pre><code${language}>${code}</code></pre>`;
    }
    case "horizontalRule":
      return "<hr />";
    case "table":
      return `<table>${renderChildren(node.content)}</table>`;
    case "tableRow":
      return `<tr>${renderChildren(node.content)}</tr>`;
    case "tableHeader":
      return `<th>${renderChildren(node.content)}</th>`;
    case "tableCell":
      return `<td>${renderChildren(node.content)}</td>`;
    case "image": {
      const altText = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return altText ? `<p>${escapeHtml(altText)}</p>` : "";
    }
    default:
      return renderChildren(node.content);
  }
};

const renderChildren = (children?: TipTapNode[]): string => {
  if (!Array.isArray(children) || children.length === 0) {
    return "";
  }

  return children.map(renderTipTapNode).join("");
};

const applyMarks = (text: string, marks?: TipTapMark[]): string => {
  if (!text || !Array.isArray(marks) || marks.length === 0) {
    return text;
  }

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "strike":
        return `<del>${acc}</del>`;
      case "code":
        return `<code>${acc}</code>`;
      case "highlight":
        return `<mark>${acc}</mark>`;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        const targetAttr = typeof mark.attrs?.target === "string" ? ` target="${escapeAttr(mark.attrs.target)}"` : "";
        const relAttr = typeof mark.attrs?.rel === "string" ? ` rel="${escapeAttr(mark.attrs.rel)}"` : "";
        return `<a href="${escapeAttr(href)}"${targetAttr}${relAttr}>${acc}</a>`;
      }
      default:
        return acc;
    }
  }, text);
};

const getHeadingLevel = (level?: number): number => {
  if (typeof level !== "number") {
    return 2;
  }
  if (level < 1) {
    return 1;
  }
  if (level > 6) {
    return 6;
  }
  return Math.round(level);
};

const getTextContent = (children?: TipTapNode[]): string => {
  if (!Array.isArray(children) || children.length === 0) {
    return "";
  }

  return children.map((child) => {
    if (!child || typeof child !== "object") {
      return "";
    }
    if (child.type === "text") {
      return child.text ?? "";
    }
    if (child.type === "hardBreak") {
      return "\n";
    }
    return getTextContent(child.content);
  }).join("");
};

const HTML_ESCAPE_REGEX = /[&<>"'`]/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

const escapeHtml = (value: string): string => {
  return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] ?? char);
};

const escapeAttr = (value: string): string => {
  return escapeHtml(value);
};

export default function ArticleDetail() {
  const {lang, supabase} = useOutletContext<{ lang: string, supabase: SupabaseClient }>();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const session = rootData?.session ?? null;
  const {
    article,
    domain,
    previousArticle,
    nextArticle,
    comments,
    page,
    limit,
    totalPage,
    structuredData
  } = useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();

  const label = getLanguageLabel(ArticleText, lang);
  const {pathname} = useLocation();
  const isPremiumArticle = article.is_premium === true;
  const canViewContent = !isPremiumArticle || !!session;
  const plainArticleHtml = useMemo(
    () => renderPlainArticleHtml(article.content_json as Json | null | undefined),
    [article.content_json]
  );

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
      name: article.title!,
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
    trackPageView('article', article.id, supabase, (newPageView) => {
      setPageView(newPageView);
    }).catch((error) => {
      console.error(error);
    });
  }, [article.id, supabase]);

  return (
      <>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.article)
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

        <div className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
          <ReadingProcess/>
          <Breadcrumb pages = {breadcrumbPages}/>
        <div className = "flex flex-col gap-8 md:gap-16">
          <div className = "grid grid-cols-1 md:grid-cols-2 grid-rows-1 mt-4 gap-6 md:gap-8">
            <header className = "space-y-4">
              <div className = "flex gap-4 flex-wrap justify-start items-center">
                <h3 className = "text-sm text-violet-700 font-medium">{article.category!.title}</h3>
                <time className = "text-zinc-600 text-sm">{getTime(article.published_at!, lang)}</time>
              </div>
              <div className = "flex items-center gap-3 text-zinc-800">
                <h1 className = "font-medium leading-normal text-4xl lg:text-5xl">{article.title}</h1>
              </div>
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
                    classList = "w-full rounded-md overflow-hiden object-cover aspect-3/2"
                />
            )}
          </div>

          {/*正文*/}
          <div className = {`relative grid grid-cols-1 ${canViewContent ? "md:grid-cols-3" : "md:grid-cols-2"} md:gap-24`}>
            <div className = "col-span-1 md:col-span-2 selection:bg-violet-800/60 selection:text-white">
              <div className = "flex flex-col">
                  {canViewContent ? (
                    article.content_json ? (
                      <ContentContainer content = {article.content_json as Json}/>
                    ) : null
                  ) : (
                    <>
                      <div className = "relative overflow-hidden rounded-lg border border-violet-200 bg-white/80 p-4 md:p-6">
                        <div
                          className = "pointer-events-none select-none blur-sm"
                          aria-hidden = "true"
                        >
                          <div className = "space-y-3 text-left text-lg font-semibold leading-8 text-gray-300">
                            <p>我们认为下面这些真理是不证自明的：人人生而平等，造物主赋予他们若干不可剥夺的权利，其中包括生命权、自由权和追求幸福的权利。为了保障这些权利，人们才在他们之间建立政府，而政府之正当权力，则来自被统治者的同意。任何形式的政府，只要破坏上述目的，人民就有权利改变或废除它，并建立新政府；新政府赖以奠基的原则，得以组织权力的方式，都要最大可能地增进民众的安全和幸福。的确，从慎重考虑，不应当由于轻微和短暂的原因而改变成立多年的政府。过去的一切经验也都说明，任何苦难，只要尚能忍受，人类都宁愿容忍，而无意废除他们久已习惯了的政府来恢复自身的权益。但是，当政府一贯滥用职权、强取豪夺，一成不变地追逐这一目标，足以证明它旨在把人民置于绝对专制统治之下时，那么，人民就有权利，也有义务推翻这个政府，并为他们未来的安全建立新的保障。</p>
                          </div>
                        </div>
                        <div className = "absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg px-6 py-8 text-center">
                          <LockClosedIcon className = "h-10 w-10 text-violet-600"/>
                          <p className = "text-base text-zinc-600 md:text-lg">{label.premium_content_locked}</p>
                          <Link
                            to = {`/${lang}/login`}
                            className = "inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                          >
                            {label.login_to_read}
                          </Link>
                        </div>
                      </div>
                      {plainArticleHtml && (
                        <div
                          aria-hidden = "true"
                          style = {{display: "none"}}
                          dangerouslySetInnerHTML = {{__html: plainArticleHtml}}
                        />
                      )}
                    </>
                  )}
                <Reaction
                    contentType = "article"
                    contentId = {article.id}
                    reactions = {article.reactions as ReactionSummary | null}
                    className = "mt-10"
                />
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
                  <div className= "flex flex-col gap-4 divide-y divide-none">
                    {actionResponse?.error && <p className = "mt-2 text-sm text-red-500">{actionResponse.error}</p>}
                    {actionResponse?.success && <p className = "mt-2 text-sm text-green-500">{actionResponse.success}</p>}
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
                              search: `?page=${page - 1}&limit=${limit}`,
                              hash: '#comment-editor'
                            }}
                            className = "rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >{label.previous}</Link>
                    )}
                    {page < totalPage && (
                        <Link
                            to = {{
                              search: `?page=${page + 1}&limit=${limit}`,
                              hash: '#comment-editor'
                            }}
                            className = "ml-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >{label.next}</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {canViewContent && article.content_json && (
              <aside className = "hidden md:flex md:col-span-1 md:h-full">
                <Catalog
                    content = {article.content_json as Json}
                    url = {`${domain}${pathname}`}
                    title = {article.title!}
                    lang = {lang}
                />
              </aside>
            )}
          </div>
        </div>
      </div>
      </>
  )
}

export async function loader({request, context, params}: Route.LoaderArgs) {
  const {supabase} = createClient(request, context);
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
      reactions,
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
  const [
    previousArticleResult,
    nextArticleResult,
    commentsResult,
    commentCountResult,
    availableArticleResult
  ] = await Promise.all([
    supabase
      .from('article')
      .select('title, slug, subtitle')
      .eq('lang', articleContent.lang!)
      .lt('published_at', articleContent.published_at)
      .order('published_at', {ascending: false})
      .limit(1)
      .maybeSingle(),
    supabase
      .from('article')
      .select('title, slug')
      .eq('lang', articleContent.lang!)
      .gt('published_at', articleContent.published_at)
      .order('published_at', {ascending: true})
      .limit(1)
      .maybeSingle(),
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
      .eq('to_article', articleContent.id)
      .eq('is_blocked', false)
      .eq('is_public', true)
      .order('created_at', {ascending: false})
      .range((page - 1) * limit, page * limit - 1),
    supabase
      .from('comment')
      .select('id', {count: 'exact'})
      .eq('to_article', articleContent.id)
      .eq('is_blocked', false)
      .eq('is_public', true),
    supabase
      .from('article')
      .select(`
        language!inner (lang)
      `)
      .eq('slug', slug)
  ]);

  const previousArticle = previousArticleResult.data ?? null;
  const nextArticle = nextArticleResult.data ?? null;
  const comments = commentsResult.data ?? [];
  const count = commentCountResult.count;
  const availableArticle = availableArticleResult.data ?? [];

  // 总页数
  const totalPage = count ? Math.ceil(count / limit) : 1;

  // 转换成lang的数组，如['zh', 'en']
  const availableLangs = availableArticle.map((item: { language: { lang: string | null } }) => {
    return item.language.lang as string
  });

  // 生成结构化数据
  const baseUrl = context.cloudflare.env.BASE_URL;
  const imgPrefix = context.cloudflare.env.IMG_PREFIX;
  const currentUrl = `${baseUrl}/${lang}/article/${slug}`;

  // 文章结构化数据
  const articleStructuredData = generateArticleStructuredData({
    article: {
      id: articleContent.id,
      title: articleContent.title || "",
      slug: articleContent.slug || "",
      subtitle: articleContent.subtitle,
      abstract: articleContent.abstract,
      is_featured: articleContent.is_featured,
      is_premium: articleContent.is_premium,
      topic: articleContent.topic,
      published_at: articleContent.published_at || new Date().toISOString(),
      updated_at: articleContent.updated_at,
      page_view: articleContent.page_view || 0,
      cover: articleContent.cover ? {
        alt: articleContent.cover.alt,
        storage_key: articleContent.cover.storage_key,
        width: articleContent.cover.width || 0,
        height: articleContent.cover.height || 0
      } : null,
      category: {
        title: articleContent.category?.title || "",
        slug: articleContent.category?.slug || ""
      },
      comments: [{count: count || 0}],
      content_json: articleContent.content_json
    },
    baseUrl,
    imgPrefix,
    lang,
    url: currentUrl
  });

  // 面包屑结构化数据
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    {name: "Home", url: `${baseUrl}/${lang}`},
    {name: "Articles", url: `${baseUrl}/${lang}/articles/1`},
    {name: articleContent.title || "Article", url: currentUrl}
  ]);

  // 评论结构化数据
  const commentStructuredData = buildCommentsStructuredData(comments, baseUrl, currentUrl);

  return {
    article: articleContent,
    previousArticle,
    nextArticle,
    domain: context.cloudflare.env.BASE_URL,
    comments,
    page,
    limit,
    totalPage,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs,
    structuredData: {
      article: articleStructuredData,
      breadcrumb: breadcrumbStructuredData,
      comments: commentStructuredData
    }
  };
}

export const meta: Route.MetaFunction = ({params, data}) => {
  const lang = params.lang as string;
  const baseUrl = data!.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `article/${data!.article.slug}`
  );

  return [
    {title: data!.article.title},
    {
      name: "description",
      content: data!.article.abstract ?? data!.article.subtitle,
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
      content: `${data!.prefix}/cdn-cgi/image/format=jpeg,width=960/${data!.article.cover?.storage_key ?? "a2b148a3-5799-4be0-a8d4-907f9355f20f"}`
    },
    {
      property: "og:description",
      content: data!.article.subtitle
    },
    {
      property: "twitter:image",
      content: `${data!.prefix}/cdn-cgi/image/format=jpeg,width=960/${data!.article.cover?.storage_key ?? "a2b148a3-5799-4be0-a8d4-907f9355f20f"}`
    },
    {
      property: "twitter:title",
      content: data!.article.title
    },
    {
      property: "twitter:description",
      content: data!.article.subtitle
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

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const {supabase} = createClient(request, context);
  const {data: {session}} = await supabase.auth.getSession();
  const content_text = formData.get('content_text') as string;
  const to_article = parseInt(formData.get('to_article') as string);
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
        to_article,
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
      };
    }

    return {
      success: '提交成功，请等待审核。Please wait for review.',
      error: null,
      comment: newComment
    };
  }

  const {data: userProfile} = await supabase
  .from('users')
  .select('id, user_id, name')
  .eq('user_id', session.user.id)
  .single();

  if (!userProfile) {
    return {
      success: false,
      error: 'User not exists',
      comment: null
    };
  }

  const {data: newComment} = await supabase
  .from('comment')
  .insert({
    user_id: userProfile.id,
    content_text,
    to_article,
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
  };
}
