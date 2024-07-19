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
  const { prefix, articles } = useLoaderData<typeof loader>();

  return (
      <div className="mx-auto flex flex-col max-w-7xl px-6 lg:px-8">
        <ArticleSection articles={articles} prefix={prefix} />
      </div>
  );
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;

  const { data: language, error: langError } = await supabase.from('language').select('id').eq('lang', lang).single();

  if (langError) {
    throw new Response("Language not found", {status: 404});
  }

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
      category (title, slug)`)
    .filter('lang', 'eq', language.id)
    .filter('is_draft', 'eq', false)
    .limit(9)
    .order('is_top', {ascending: false})
    .order('published_at', {ascending: false});


  return {
    articles: articleData,
    prefix: context.cloudflare.env.IMG_PREFIX
  }

}

