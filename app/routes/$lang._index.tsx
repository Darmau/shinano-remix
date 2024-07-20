import {LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import ArticleSection from "~/components/HomeArticle";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = ({ params }) => {
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
  const { prefix, articles, photos, lang } = useLoaderData<typeof loader>();

  return (
      <div className="w-full flex flex-col px-4 lg:px-8">
        <ArticleSection articles={articles} prefix={prefix} lang={lang} />
      </div>
  );
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;

  // 获取指定语言的文章，is_top为true的排第一，剩下按published_at倒序排列
  const { data: articleData } = await supabase
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
    .limit(9)
    .order('is_top', {ascending: false})
    .order('published_at', {ascending: false});

  // 获取摄影作品
  const {data: photographyData} = await supabase
    .from('photo')
    .select(`
      id,
      title,
      slug,
      cover (alt, storage_key),
      published_at,
      language!inner (lang)
    `)
    .filter('language.lang', 'eq', lang)
    .filter('is_draft', 'eq', false)
    .limit(24)
    .order('is_top', {ascending: false})
    .order('published_at', {ascending: false})

  return {
    articles: articleData,
    photos: photographyData,
    prefix: context.cloudflare.env.IMG_PREFIX,
    lang,
  }

}

