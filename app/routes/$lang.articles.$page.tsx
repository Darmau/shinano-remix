import Subnav from "~/components/Subnav";
import { createClient } from "~/utils/supabase/server";
import type { Article } from "~/types/Article";
import { Link, useLoaderData, useLocation, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.articles.$page";
import NormalArticleCard from "~/components/NormalArticleCard";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticlesText from "~/locales/articles";
import Pagination from "~/components/Pagination";
import HomepageText from "~/locales/homepage";
import i18nLinks from "~/utils/i18nLinks";
import {
  normalizeArticles,
  normalizeYearCounts,
  normalizeCategoryCounts,
} from "~/utils/articles";
import type { YearCount, CategoryCount } from "~/utils/articles";

type LoaderData = {
  articles: Article[];
  countByYear: YearCount[];
  countByCategory: CategoryCount[];
  articleCount: number;
  page: number;
  baseUrl: string;
  prefix: string;
  availableLangs: string[];
};

const isLoaderData = (value: unknown): value is LoaderData =>
  typeof value === "object" &&
  value !== null &&
  "articles" in value &&
  "countByYear" in value &&
  "countByCategory" in value &&
  "articleCount" in value &&
  "page" in value &&
  "baseUrl" in value &&
  "prefix" in value &&
  "availableLangs" in value;

export default function AllArticles() {
  const { articles, countByYear, countByCategory, articleCount, page } = useLoaderData<typeof loader>();
  const { lang } = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ArticlesText, lang);
  const location = useLocation();
  // 将pathname末尾的page去掉
  const path = location.pathname.replace(/\/\d+$/, '');

  if (articles.length === 0) {
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
      <h1 className="sr-only">Articles</h1>
      <div
        className="w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16 flex flex-col gap-8 md:grid md:grid-cols-3"
      >
        <div className="grow flex flex-col gap-8 py-8 md:py-0 md:gap-12 md:col-span-2">
          {articles.map((article) => (
            <NormalArticleCard article={article} key={article.id} showAbstract={true} />
          ))}
          <Pagination count={articleCount} limit={12} page={page} path={path} />
        </div>
        <aside className="pb-4 space-y-8 md:col-span-1">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-violet-600">{label.year}</h3>
            <ol className="">
              {countByYear && countByYear.length > 0 ? (
                countByYear.map((year) => (
                  <li
                    key={year.year}
                    className="p-2 rounded-md hover:bg-zinc-50 cursor-pointer"
                  >
                    <Link
                      to={`/${lang}/articles/archive/${year.year}/1`}
                      className="text-base text-zinc-500 block"
                    >
                      {year.year} ({year.count})
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-zinc-400 p-2">暂无数据</li>
              )}
            </ol>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-violet-600">{label.category}</h3>
            <ol className="">
              {countByCategory && countByCategory.map((category) => {
                if (category.count === 0) {
                  return null;
                }
                return (
                  <li
                    key={category.slug}
                    className="p-2 rounded-md hover:bg-zinc-50 cursor-pointer"
                  >
                    <Link
                      to={`/${lang}/articles/category/${category.slug}/1`}
                      className="text-base text-zinc-500 block"
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

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  if (!isLoaderData(data)) {
    return [{ title: label.recent_article }];
  }

  const baseUrl = data.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
    lang,
    data.availableLangs,
    `articles/${data.page}`
  );

  return [
    { title: label.recent_article },
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
      content: `${baseUrl}/${lang}/articles/${data.page}`
    },
    {
      property: "og:image",
      content: `${data.prefix}/cdn-cgi/image/format=jpeg,width=960/a2b148a3-5799-4be0-a8d4-907f9355f20f`
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

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const lang = params.lang as string;
  const page = params.page as string;

  // 如果page无法转换为数字，返回404
  if (isNaN(Number(page))) {
    return new Response(null, { status: 404 });
  }

  const [
    articleRowsResult,
    articleCountResult,
    countByYearResult,
    countByCategoryResult
  ] = await Promise.all([
    supabase
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
        language!inner (lang),
        comments:comment(count)
      `)
      .eq('language.lang', lang)
      .eq('is_draft', false)
      .limit(12)
      .range((Number(page) - 1) * 12, Number(page) * 12 - 1)
      .order('published_at', { ascending: false }),
    supabase
      .from('article')
      .select(`
        id,
        language!inner (lang)
      `, { count: 'exact', head: true })
      .eq('is_draft', false)
      .eq('language.lang', lang),
    supabase.rpc('get_article_count_by_year', { lang_name: lang }),
    supabase.rpc('get_article_count_by_category', {
      lang_name: lang
    })
  ]);

  const articleRows = articleRowsResult.data ?? [];
  const count = articleCountResult.count ?? 0;
  const countByYearData = countByYearResult.data ?? [];
  const countByCategoryData = countByCategoryResult.data ?? [];

  const availableLangs = [lang];

  return {
    articles: normalizeArticles(articleRows),
    countByYear: normalizeYearCounts(countByYearData),
    countByCategory: normalizeCategoryCounts(countByCategoryData),
    articleCount: count ?? 0,
    page: Number(page),
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  };

}
