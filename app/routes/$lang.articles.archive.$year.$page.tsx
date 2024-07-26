import Subnav from "~/components/Subnav";
import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Article} from "~/types/Article";
import NormalArticleCard from "~/components/NormalArticleCard";
import Pagination from "~/components/Pagination";
import {Link, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticlesText from "~/locales/articles";

export default function ArchiveArticles () {
  const {articles, countByYear, countByCategory, articleCount, page, year} = useLoaderData<typeof loader>();
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
        <Subnav active="article" />
        <header className="w-full max-w-6xl mx-auto px-4 py-8 my-8 space-y-4">
          <p className="font-medium text-violet-700 text-sm">{label.published_at}</p>
          <h1 className="font-bold text-3xl md:text-4xl">{year}</h1>
        </header>
        <div
            className = "w-full max-w-6xl mx-auto p-4 flex flex-col-reverse gap-8 md:py-8 mb-8 lg:mb-16 md:grid md:grid-cols-3"
        >
          <div className = "grow flex flex-col gap-8 md:gap-12 md:col-span-2">
            {articles.map((article) => (
                <NormalArticleCard article = {article} key = {article.id} showAbstract={true}/>
            ))}
            <Pagination count = {articleCount || 0} limit = {12} page = {page} path = {path}/>
          </div>
          <aside className = "border-b pb-4 md:border-0 space-y-8 md:col-span-1">
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

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const year = params.year as string;
  const page = params.page as string;

  // 查询指定语言，published_at在年份之间，排除草稿
  const {data: articles} = await supabase
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
      category (title, slug),
      language!inner (lang)
      `)
  .eq('language.lang', lang)
  .limit(12)
  .filter('is_draft', 'eq', false)
  .gte('published_at', `${year}-01-01T00:00:00Z`)
  .lte('published_at', `${year}-12-31T23:59:59Z`)
  .order('published_at', {ascending: false})
  .range((Number(page) - 1) * 12, Number(page) * 12 - 1)
  .returns<Article[]>();

  // 指定语言article的数量，排除草稿
  const {count} = await supabase
  .from('article')
  .select(`
    id,
    language!inner (lang)
  `, {count: 'exact', head: true})
  .filter('is_draft', 'eq', false)
  .gte('published_at', `${year}-01-01T00:00:00Z`)
  .lte('published_at', `${year}-12-31T23:59:59Z`)
  .eq('language.lang', lang);

  const {data: countByYear} = await supabase.rpc('get_article_count_by_year', {lang_name: lang});

  const {data: countByCategory} = await supabase.rpc('get_article_count_by_category', {
    lang_name: lang
  }).returns<{
    title: string,
    slug: string,
    count: number
  }[]>();

  return {
    articles: articles,
    year: year,
    countByYear: countByYear,
    countByCategory: countByCategory,
    articleCount: count,
    page: Number(page)
  }
}
