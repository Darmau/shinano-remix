import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Article} from "~/types/Article";
import {Link, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import NormalArticleCard from "~/components/NormalArticleCard";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticlesText from "~/locales/articles";
import Pagination from "~/components/Pagination";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";

export default function AllArticles() {
  const {articles, countByYear, countByCategory, articleCount, page} = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ArticlesText, lang);
  const location = useLocation();
  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  if (!articles || articles.length === 0) {
    return (
        <>
          <Subnav active="article" />
          <header className="w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
            <h1 className="text-3xl font-black text-zinc-700 text-center my-16">{label.no_articles}</h1>
          </header>
        </>
    )
  }

  return (
      <>
        <Subnav active = "article"/>
        <div
            className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16 flex flex-col-reverse gap-4 md:grid md:gap-8 md:grid-cols-3"
        >
          <div className = "grow flex flex-col gap-8 md:gap-12 md:col-span-2">
            {articles.map((article) => (
                <NormalArticleCard article = {article as Article} key = {article.id} showAbstract={true}/>
            ))}
            <Pagination count={articleCount || 0} limit={12} page={page} path={path} />
          </div>
          <aside className = "space-y-8 md:col-span-1">
            <div className = "space-y-4">
              <h3 className = "text-sm font-semibold text-violet-600">{label.year}</h3>
              <ol className = "">
                {countByYear && countByYear.map((year) => (
                    <li
                        key = {year.year}
                        className = "p-2 rounded-md hover:bg-zinc-50 cursor-pointer"
                    >
                      <Link
                          to = {`/${lang}/articles/archive/${year.year}/1`}
                          className = "text-base text-zinc-500 block"
                      >
                        {year.year} ({year.count})
                      </Link>
                    </li>
                ))}
              </ol>
            </div>
            <div className = "space-y-4">
              <h3 className = "text-sm font-semibold text-violet-600">{label.category}</h3>
              <ol className = "">
                {countByCategory && countByCategory.map((category) => {
                  if (category.count === 0) {
                    return null;
                  }
                  return (
                      <li
                          key = {category.slug}
                          className = "p-2 rounded-md hover:bg-zinc-50 cursor-pointer"
                      >
                        <Link
                            to = {`/${lang}/articles/category/${category.slug}/1`}
                            className = "text-base text-zinc-500 block"
                        >
                          {category.title} ({category.count})
                        </Link>
                      </li>
                  )
                })}
              </ol>
            </div>
          </aside>
        </div>
      </>
  )
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `articles/${data!.page}`
  );

  return [
    {title: label.recent_article},
    {
      name: "description",
      content: label.recent_article_description,
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
      content: label.recent_article
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/articles/${data!.page}`
    },
    {
      property: "og:image",
      content: `${data!.prefix}/cdn-cgi/image/format=jpeg,width=960/a2b148a3-5799-4be0-a8d4-907f9355f20f`
    },
    {
      property: "og:description",
      content: label.recent_article_description
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

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const page = params.page as string;

  // 如果page无法转换为数字，返回404
  if (isNaN(Number(page))) {
    return new Response(null, {status: 404});
  }

  const {data} = await supabase
  .from('article')
  .select(`
      id,
      title,
      slug,
      subtitle,
      abstract,
      is_featured,
      is_premium,
      topic,
      published_at,
      page_view,
      category (title, slug),
      language!inner (lang)
    `)
  .eq('language.lang', lang)
  .eq('is_draft', false)
  .limit(12)
  .range((Number(page) - 1) * 12, Number(page) * 12 - 1)
  .order('published_at', {ascending: false})
  .returns<Article[]>();

  // 指定语言article的数量，排除草稿
  const {count} = await supabase
  .from('article')
  .select(`
    id,
    language!inner (lang)
  `, {count: 'exact', head: true})
  .eq('is_draft', false)
  .eq('language.lang', lang);

  const {data: countByYear} = await supabase.rpc('get_article_count_by_year', {lang_name: lang});

  const {data: countByCategory} = await supabase.rpc('get_article_count_by_category', {
    lang_name: lang
  }).returns<{
    title: string,
    slug: string,
    count: number
  }[]>();

  const availableLangs = [lang];

  return json({
    articles: data,
    countByYear: countByYear,
    countByCategory: countByCategory,
    articleCount: count,
    page: Number(page),
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  })

}
