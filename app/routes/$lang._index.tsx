import {LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData} from "@remix-run/react";
import {Article} from "~/types/Article";
import Subnav from "~/components/Subnav";
import NormalArticleCard from "~/components/NormalArticleCard";
import HomeTopArticle from "~/components/HomeTopArticle";

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
        <div className = "w-full max-w-8xl mx-auto px-4 space-y-8">
          <div className="flex flex-col gap-8 mt-4 lg:mt-8 lg:grid lg:grid-cols-2">
            <HomeTopArticle isTop={true} article = {articles[0]} classList="" />
            <div className="flex flex-col gap-8 md:grid md:grid-cols-3 lg:flex lg:flex-col">
              {articles.slice(1, 4).map((article) => (
                  <HomeTopArticle isTop={false} key = {article.id} article = {article} classList=""/>
              ))}
            </div>
          </div>
          <div>
            <h2>Header</h2>
            <div>
              {articles.slice(4).map((article) => (
                  <NormalArticleCard key = {article.id} article = {article}/>
              ))
              }
            </div>
          </div>
        </div>
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
      cover (alt, storage_key),
      category (title, slug),
      language!inner (lang)
      `)
  .filter('language.lang', 'eq', lang)
  .filter('is_draft', 'eq', false)
  .limit(11)
  .order('is_top', {ascending: false})
  .order('published_at', {ascending: false})
  .returns<Article[]>();

  return {
    articles: articleData,
    lang,
  }
}
