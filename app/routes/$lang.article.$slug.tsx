import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
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

export default function ArticleDetail () {
  const { lang } = useOutletContext<{ lang: string }>();
  const {
    article,
    domain,
    previousArticle,
    nextArticle,
  } = useLoaderData<typeof loader>();
  const label = getLanguageLabel(ArticleText, lang);
  const { pathname } = useLocation();

  if (!article) {
    throw new Response(null, {
      status: 404,
      statusText: 'Article not exists'
    })
  }

  return (
      <div className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReadingProcess/>
        <header className = "md:my-4 col-span-1 md:col-span-2 space-y-3 md:space-y-4">
          <h1 className = "font-medium text-zinc-800 leading-normal text-4xl lg:text-5xl">{article.title}</h1>
          <h2 className = "text-zinc-600 text-lg lg:text-xl">{article.subtitle}</h2>
          {article.abstract &&
              <p className = "p-4 rounded-md bg-zinc-100 text-zinc-600 leading-normal text-sm lg:text-base">{article.abstract}</p>}
        </header>
        <div className = "my-4 col-span-1 flex flex-col gap-6">
          <div className = "space-y-2">
            <h4 className = "text-sm text-violet-700 font-medium">{label.category}</h4>
            <h3 className = "text-zinc-600 text-sm">{article.category!.title}</h3>
          </div>
          <div className = "space-y-2">
            <h4 className = "text-sm text-violet-700 font-medium">{label.published_at}</h4>
            <h3 className = "text-zinc-600 text-sm">{getDate(article.published_at!, lang)}</h3>
          </div>
          {article.topic && (
              <div className = "space-y-2">
                <h4 className = "text-sm text-violet-700 font-medium">{label.topic}</h4>
                <ol className = "flex gap-2 flex-wrap">
                  {article.topic.map((topic: string, index: number) => (
                      <li key = {index} className = "text-sm text-zinc-600">#{topic}</li>
                  ))}
                </ol>
              </div>
          )}
        </div>
        <div className = "col-span-1 space-y-4 md:space-y-8 md:col-span-3">
          {article.cover && (
              <div>
                <ResponsiveImage
                    image = {article.cover as unknown as Image} width = {960}
                    classList = "w-full h-full rounded-md overflow-hiden object-cover aspect-[5/3]"
                />
              </div>
          )}
        </div>
        <div className = "relative grid grid-cols-1 md:grid-cols-3 col-span-1 md:gap-24 md:col-span-3">
          <div className = "col-span-1 md:col-span-2 selection:bg-violet-800/60 selection:text-white">
            <ContentContainer content = {article.content_json as Json}/>
            <NextAndPrev
                type="article"
                next={nextArticle as NeighboringPost}
                prev={previousArticle as NeighboringPost}
            />
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
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const slug = params.slug as string;

  // 文章详情
  const {data: articleContent} = await supabase
  .from('article')
  .select(`
      id,
      title,
      slug,
      subtitle,
      abstract,
      published_at,
      is_premium,
      is_featured,
      is_top,
      topic,
      content_json,
      category (title, slug),
      cover (alt, height, width, storage_key),
      language!inner (lang),
      lang
    `)
  .eq('slug', slug)
  .eq('language.lang', lang)
  .single();

  if(!articleContent) {
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


  return json({
    article: articleContent,
    previousArticle: previousArticle || null,
    nextArticle: nextArticle || null,
    domain: context.cloudflare.env.BASE_URL
  })
}
