import Subnav from "~/components/Subnav";
import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Article} from "~/types/Article";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import NormalArticleCard from "~/components/NormalArticleCard";

export default function AllArticles () {
  const {articles} = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{ lang: string }>();

  if (!articles || articles.length === 0) {
    return (
        <div>
          No articles found
        </div>
    )
  }

  return (
      <>
        <Subnav active="article" />
        <div className = "w-full max-w-8xl mx-auto px-4 space-y-8 lg:space-y-12 mb-8 lg:mb-16">
          {articles.map((article) => (
              <NormalArticleCard article={article} key={article.id} />
          ))}
        </div>
      </>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const page = params.page as string;

  const {data, error} = await supabase
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
    .filter('is_draft', 'eq', false)
    .order('published_at', {ascending: false})
    .returns<Article[]>();

  return {
    articles: data,
  }

}
