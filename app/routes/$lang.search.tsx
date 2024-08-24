import {json, LoaderFunctionArgs, ActionFunctionArgs, SerializeFrom} from "@remix-run/cloudflare";
import {useLoaderData, useActionData, useSubmit, Form, useOutletContext} from "@remix-run/react";
import SearchResults, {SearchResultsProps} from "~/components/SearchResult";
import getLanguageLabel from "~/utils/getLanguageLabel";
import SearchText from "~/locales/search";
import {createClient} from "~/utils/supabase/server";

function createSearchBody(query: string) {
  return {
    queries: [
      {
        indexUid: "article",
        q: query,
        limit: 10,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 24,
        cropMarker: "...",
        attributesToHighlight: ["title", "abstract", "content_text", "topic"],
        highlightPreTag: "<span class=\"text-violet-600\">",
        highlightPostTag: "</span>",
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.4
        }
      },
      {
        indexUid: "photo",
        q: query,
        limit: 15,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 24,
        cropMarker: "...",
        attributesToHighlight: ["title", "abstract", "content_text", "topic"],
        highlightPreTag: "<span class=\"text-violet-600\">",
        highlightPostTag: "</span>",
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      },
      {
        indexUid: "thought",
        q: query,
        limit: 5,
        attributesToCrop: ["content_text"],
        cropLength: 24,
        cropMarker: "...",
        attributesToHighlight: ["content_text", "topic"],
        highlightPreTag: "<span class=\"text-violet-600\">",
        highlightPostTag: "</span>",
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      }
    ]
  };
}

async function performSearch(query: string, MEILI_URL: string, MEILI_KEY: string): Promise<SearchResultsProps> {
  const searchBody = createSearchBody(query);

  const response = await fetch(`${MEILI_URL}/multi-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MEILI_KEY}`
    },
    body: JSON.stringify(searchBody)
  });

  if (!response.ok) {
    throw new Error("搜索失败");
  }

  return await response.json();
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("keyword") || "";

  if (!query) {
    return json({ results: null, query });
  }

  const MEILI_URL = context.cloudflare.env.MEILI_URL;
  const MEILI_KEY = context.cloudflare.env.MEILI_KEY;

  // 从language表中获取语言数据，按照{1: 'zh', 2: 'en', 3: 'jp'}的格式返回
  const {supabase} = createClient(request, context);
  const {data: languages} = await supabase
    .from('language')
    .select('id, lang');

  const langs = languages!.reduce((acc: Record<number, string>, lang) => {
    acc[lang.id] = lang.lang as string;
    return acc;
  }, {});

  try {
    const data = await performSearch(query, MEILI_URL, MEILI_KEY);
    return json({
      results: data.results,
      query,
      langs
    });
  } catch (error) {
    console.error("搜索错误:", error);
    return json({ results: null, error: "搜索过程中发生错误", query, langs });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const query = formData.get("keyword") as string;

  if (!query) {
    return json({ results: null });
  }

  const MEILI_URL = context.cloudflare.env.MEILI_URL;
  const MEILI_KEY = context.cloudflare.env.MEILI_KEY;

  try {
    const data = await performSearch(query, MEILI_URL, MEILI_KEY);
    return json({ results: data.results });
  } catch (error) {
    console.error("搜索错误:", error);
    return json({ results: null, error: "搜索过程中发生错误" });
  }
}

export default function Search() {
  const loaderData = useLoaderData<SerializeFrom<typeof loader>>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(SearchText, lang);

  const results = actionData?.results || loaderData.results;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget);
  };

  return (
      <div className="w-full max-w-3xl mx-auto p-4 mb-8 lg:mb-16">
        <h1 className="sr-only">{label.search}</h1>
        <Form method="post" onSubmit={handleSubmit} className="flex w-full gap-4 my-8 lg:my-16">
          <input
              type="text"
              name="keyword"
              placeholder={label.placeholder}
              defaultValue={loaderData.query}
              className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
          />
          <button
              type="submit"
              className="flex-none rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {label.search}
          </button>
        </Form>

        {results && <SearchResults results={results} langs={loaderData.langs} />}
      </div>
  );
}
