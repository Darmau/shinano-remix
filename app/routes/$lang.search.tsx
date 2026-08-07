import { Form, useActionData, useOutletContext, useNavigation } from "react-router";
import getLanguageLabel from "~/utils/getLanguageLabel";
import type { Route } from "./+types/$lang.search";
import SearchText from "~/locales/search";
import i18nLinks from "~/utils/i18nLinks";
import SearchResult from "~/components/SearchResult";
import MarkdownContent from "~/components/MarkdownContent";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const availableLangs = ["zh", "en", "jp"];

  return {
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query");

    if (!query || typeof query !== "string" || query.trim() === "") {
      return { 
        error: "Query is required", 
        results: null 
      };
    }

    const ai = context.cloudflare.env.AI;
    if (!ai) {
      return { 
        error: "AI service is not available", 
        results: null 
      };
    }

    const autorag = ai.autorag("blog-ai");

    // @ts-expect-error AutoRag runtime accepts `model` and `retrieval_options` but @cloudflare/workers-types omits them.
    const response = await autorag.aiSearch({
      query: query.trim(),
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      rewrite_query: true,
      max_num_results: 10,
      retrieval_options: {
        enabled: true,
        model: "@cf/qwen/qwen3-30b-a3b-fp8"
      },
      ranking_options: {
        score_threshold: 0.3
      },
      reranking: {
        enabled: true,
        model: "@cf/baai/bge-reranker-base"
      },
      stream: false
    });

    return {
      error: null,
      results: response
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
      results: null
    };
  }
};

export default function Search() {
  const actionData = useActionData<typeof action>();
  const { lang } = useOutletContext<{ lang: string }>();
  const navigation = useNavigation();
  const label = getLanguageLabel(SearchText, lang);
  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  return (
      <div className="max-w-2xl mx-auto my-8 lg:my-12 px-4 lg:p-0">
        <header className="text-center space-y-4 mb-8">
          <h1 className="font-medium text-3xl text-zinc-700">{label.title}</h1>
          <p className="text-zinc-500">{label.description}</p>
        </header>

        <Form method="post" className="space-y-6">
          <div className="mb-4">
            <label htmlFor="query" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              {label.search_placeholder}
            </label>
            <input
              id="query"
              name="query"
              type="text"
              className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
              placeholder={label.search_placeholder}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? label.loading : label.search_button}
          </button>
        </Form>

        {actionData?.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{label.error}: {actionData.error}</p>
          </div>
        )}

        {actionData?.results && (
          <div className="mt-8 space-y-6">
            {actionData.results.response && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">
                  {label.answer_heading}
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                <MarkdownContent content={actionData.results.response} />
                </div>
              </div>
            )}

            {actionData.results.data && actionData.results.data.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  {label.results_heading}
                </h3>
                <div className="space-y-4">
                  {actionData.results.data.map((result) => (
                    <SearchResult key={result.file_id} result={result} />
                  ))}
                </div>
              </div>
            )}

            {actionData.results.data && actionData.results.data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {label.no_results}
              </div>
            )}
          </div>
        )}
      </div>
  );
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(SearchText, lang);
  const baseUrl = data!.baseUrl;
  const multiLangLinks = i18nLinks(
    baseUrl,
    lang,
    data!.availableLangs,
    "search"
  );

  return [
    { title: label.title },
    {
      name: "description",
      content: label.description,
    },
    ...multiLangLinks
  ];
};
