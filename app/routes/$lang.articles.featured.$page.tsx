import Subnav from "~/components/Subnav";
import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Article} from "~/types/Article";
import {useLoaderData, useLocation} from "@remix-run/react";
import Pagination from "~/components/Pagination";
import FeaturedArticle from "~/components/FeaturedArticle";

export default function AllFeaturedArticles() {
  const {articles, articleCount, page} = useLoaderData<typeof loader>();
  const location = useLocation();
  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  if (!articles || articles.length === 0) {
    return (
        <div>
          No articles found
        </div>
    )
  }

  return (
      <>
        <Subnav active = "article"/>
        <div
            className = "w-full max-w-8xl mx-auto p-4 md:py-8 mb-8 lg:mb-16 space-y-8 lg:space-y-12"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
                <FeaturedArticle article = {article as Article} key = {article.id}/>
            ))}
          </div>
          <Pagination count = {articleCount || 0} limit = {12} page = {page} path = {path}/>
        </div>
      </>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const page = params.page as string;

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
      category (title, slug),
      cover (alt, storage_key, width, height),
      language!inner (lang)
    `)
  .eq('language.lang', lang)
  .limit(12)
  .range((Number(page) - 1) * 12, Number(page) * 12 - 1)
  .filter('is_draft', 'eq', false)
  .filter('is_featured', 'eq', true)
  .order('published_at', {ascending: false})
  .returns<Article[]>();

  // 指定语言article的数量，排除草稿
  const {count} = await supabase
  .from('article')
  .select(`
    id,
    language!inner (lang)
  `, {count: 'exact', head: true})
  .filter('is_draft', 'eq', false)
  .filter('is_featured', 'eq', true)
  .eq('language.lang', lang);


  return {
    articles: data,
    articleCount: count,
    page: Number(page)
  }

}
