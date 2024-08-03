import Subnav from "~/components/Subnav";
import {LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Article} from "~/types/Article";
import {Link, useLoaderData, useLocation, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticlesText from "~/locales/articles";
import NormalArticleCard from "~/components/NormalArticleCard";
import Pagination from "~/components/Pagination";
import ResponsiveImage from "~/components/ResponsiveImage";
import {Image} from "~/types/Image";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";

export default function ArticlesByCategory() {
  const {articles, countByYear, countByCategory, articleCount, page, category} = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ArticlesText, lang);
  const location = useLocation();
  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  if (!articles || articles.length === 0 || category === null) {
    return (
        <>
          <Subnav active = "article"/>
          <header className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
            <h1 className = "text-3xl font-black text-zinc-700 text-center my-16">{label.no_articles}</h1>
          </header>
        </>
    )
  }

  return (
      <>
        <Subnav active = "article"/>
        <header className = "relative w-full max-w-6xl mx-auto px-4 my-8 space-y-4">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-white text-center space-y-4">
            <h1 className = "font-medium text-3xl md:text-5xl shadow-2x">{category.title}</h1>
            {category.description && (
                <p>{category.description}</p>
            )}
          </div>
          <div className = "relative overflow-hidden rounded-2xl w-full aspect-[3/1]">
            <div className = "absolute inset-0 bg-gradient-to-b from-transparent to-zinc-800/60"></div>
            <ResponsiveImage
                image = {category.cover as unknown as Image}
                width = {640}
                classList = "w-full h-full object-cover"
            />
          </div>
        </header>
        <div
            className = "w-full max-w-6xl mx-auto p-4 flex flex-col-reverse gap-8 md:py-8 mb-8 lg:mb-16 md:grid md:grid-cols-3"
        >
          <div className = "grow flex flex-col gap-8 md:gap-12 md:col-span-2">
            {articles.map((article) => (
                <NormalArticleCard article = {article as Article} key = {article.id} showAbstract = {true}/>
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

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `articles/category/${data!.category!.slug}/${data!.page}`
  );

  return [
    {title: label.category_article_title},
    {
      name: "description",
      content: label.category_article_description,
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
      content: label.category_article_title
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/articles/category/${data!.category!.slug}/${data!.page}`
    },
    {
      property: "og:image",
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/${data!.category!.cover.storage_key || 'a2b148a3-5799-4be0-a8d4-907f9355f20f'}`
    },
    {
      property: "og:description",
      content: label.category_article_description
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
  const category = params.category as string;
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
      category!inner (title, slug),
      language!inner (lang)
      `)
  .eq('language.lang', lang)
  .eq('category.slug', category)
  .eq('is_draft', false)
  .limit(12)
  .order('published_at', {ascending: false})
  .range((Number(page) - 1) * 12, Number(page) * 12 - 1)
  .returns<Article[]>();

  // 指定语言article的数量，排除草稿
  const {count} = await supabase
  .from('article')
  .select(`
    id,
    language!inner (lang),
    category!inner (slug)
  `, {count: 'exact', head: true})
  .eq('is_draft', false)
  .eq('category.slug', category)
  .eq('language.lang', lang);

  const {data: countByYear} = await supabase.rpc('get_article_count_by_year', {lang_name: lang});

  const {data: countByCategory} = await supabase.rpc('get_article_count_by_category', {
    lang_name: lang
  }).returns<{
    title: string,
    slug: string,
    count: number
  }[]>();

  // 分类数据
  const {data: categoryData} = await supabase
  .from('category')
  .select(`
      title,
      slug,
      description,
      cover (alt, storage_key, width, height),
      language!inner (lang)
    `)
  .eq('slug', category)
  .eq('type', 'article')
  .eq('language.lang', lang)
  .single();

  const availableLangs = [lang];

  return {
    articles: articles,
    category: categoryData,
    countByYear: countByYear,
    countByCategory: countByCategory,
    articleCount: count,
    page: Number(page),
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  }
}
