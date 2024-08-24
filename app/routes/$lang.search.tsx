import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, useSubmit, Form } from "@remix-run/react";
import SearchResults from "~/components/SearchResult";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("keyword") || "";

  if (!query) {
    return json({ results: null, query });
  }

  const MEILI_URL = context.cloudflare.env.MEILI_URL;
  const MEILI_KEY = context.cloudflare.env.MEILI_KEY;

  const searchBody = {
    queries: [
      {
        indexUid: "article",
        q: query,
        limit: 3,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["abstract", "content_text"],
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      },
      {
        indexUid: "photo",
        q: query,
        limit: 3,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["abstract", "content_text"],
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      },
      {
        indexUid: "thought",
        q: query,
        limit: 3,
        attributesToCrop: ["content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["content_text"],
        showRankingScore: true,
      }
    ]
  };

  try {
    const response = await fetch(`${MEILI_URL}/multi-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MEILI_KEY}`
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      return json({ results: null, error: "搜索失败", query });
    }

    const data = await response.json();
    return json({ results: data.results, query });
  } catch (error) {
    console.error("搜索错误:", error);
    return json({ results: null, error: "搜索过程中发生错误", query });
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

  const searchBody = {
    queries: [
      {
        indexUid: "article",
        q: query,
        limit: 3,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["abstract", "content_text"],
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      },
      {
        indexUid: "photo",
        q: query,
        limit: 3,
        attributesToCrop: ["abstract", "content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["abstract", "content_text"],
        showRankingScore: true,
        hybrid: {
          embedder: "default",
          semanticRatio: 0.5
        }
      },
      {
        indexUid: "thought",
        q: query,
        limit: 3,
        attributesToCrop: ["content_text"],
        cropLength: 10,
        cropMarker: "...",
        attributesToHighlight: ["content_text"],
        showRankingScore: true,
      }
    ]
  };

  try {
    const response = await fetch(`${MEILI_URL}/multi-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MEILI_KEY}`
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      return json({ results: null, error: "搜索失败" });
    }

    const data = await response.json();
    return json({ results: data.results });
  } catch (error) {
    console.error("搜索错误:", error);
    return json({ results: null, error: "搜索过程中发生错误" });
  }
}

export default function Search() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const results = actionData?.results || loaderData.results;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget);
  };

  return (
      <div className="search-page">
        <h1>搜索</h1>
        <Form method="post" onSubmit={handleSubmit}>
          <input
              type="text"
              name="keyword"
              placeholder="输入搜索关键词"
              defaultValue={loaderData.query}
          />
          <button type="submit">搜索</button>
        </Form>
        {results && <SearchResults results={results} />}
      </div>
  );
}
