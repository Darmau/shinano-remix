import {LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import {Article} from "~/types/Article";
import Subnav from "~/components/Subnav";
import NormalArticleCard from "~/components/NormalArticleCard";
import HomeTopArticle from "~/components/HomeTopArticle";
import CTA from "~/components/CTA";

export const meta: MetaFunction = ({params}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  return [
    {title: label.title},
    {
      name: "description",
      content: label.description,
    },
  ];
};


export default function Index() {
  const {articles} = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(HomepageText, lang);

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
        <div className = "w-full max-w-8xl mx-auto px-4 space-y-8 lg:space-y-12 mb-8 lg:mb-16">
          <div className = "flex flex-col gap-8 mt-4 border-b pb-8 lg:pb-12 lg:mt-8 lg:grid lg:grid-cols-2">
            <HomeTopArticle isTop = {true} article = {articles[0]} classList = "group"/>
            <div className = "flex flex-col gap-8 md:grid md:grid-cols-3 lg:flex lg:flex-col">
              {articles.slice(1, 4).map((article) => (
                  <HomeTopArticle isTop = {false} key = {article.id} article = {article} classList = "group"/>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="font-medium text-lg text-zinc-700">{label.recent_article}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {articles.slice(4).map((article) => (
                  <NormalArticleCard key = {article.id} article = {article}/>
              ))
              }
            </div>
          </div>
        </div>
        <CTA />
      </>
  );
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;

  // 获取指定语言的文章，is_top为true的排第一，剩下按published_at倒序排列
  const {data: articleData} = await supabase
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
      cover (alt, storage_key, width, height),
      category (title, slug),
      language!inner (lang)
      `)
  .eq('language.lang', lang)
  .filter('is_draft', 'eq', false)
  .limit(13)
  .order('is_top', {ascending: false})
  .order('published_at', {ascending: false})
  .returns<Article[]>();

  return {
    articles: articleData,
  }
}
