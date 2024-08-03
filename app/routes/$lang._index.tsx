import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData} from "@remix-run/react";
import {Article} from "~/types/Article";
import Subnav from "~/components/Subnav";
import NormalArticleCard from "~/components/NormalArticleCard";
import HomeTopArticle from "~/components/HomeTopArticle";
import CTA from "~/components/CTA";
import i18nLinks from "~/utils/i18nLinks";

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      ""
  );

  return [
    {title: label.title},
    {
      name: "description",
      content: label.description,
    },
    {
      tagName: "link",
      rel: "sitemap",
      type: "application/xml",
      href: `${baseUrl}/sitemap-index.xml`,
      title: "Sitemap",
    },
    {
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: "RSS",
      href: `${baseUrl}/${lang}/article/rss.xml`,
    },
    ...multiLangLinks
  ];
};

export default function Index() {
  const {articles, label} = useLoaderData<typeof loader>();

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
            <HomeTopArticle isTop = {true} article = {articles[0] as Article} classList = "group"/>
            <div className = "flex flex-col gap-8 md:grid md:grid-cols-3 lg:flex lg:flex-col">
              {articles.slice(1, 4).map((article) => (
                  <HomeTopArticle
                      isTop = {false} key = {article.id} article = {article as Article} classList = "group"
                  />
              ))}
            </div>
          </div>
          <div className = "space-y-8">
            <h2 className = "font-medium text-lg text-zinc-700">{label.recent_article}</h2>
            <div className = "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {articles.slice(4).map((article) => (
                  <NormalArticleCard key = {article.id} article = {article as Article} showAbstract = {false}/>
              ))
              }
            </div>
          </div>
        </div>
        <CTA/>
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
  .limit(16)
  .order('is_top', {ascending: false})
  .order('published_at', {ascending: false})
  .returns<Article[]>();

  const label = getLanguageLabel(HomepageText, lang);
  const availableLangs = ["zh", "en", "jp"];

  return json({
    articles: articleData,
    label,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  })
}
