import {createClient} from "~/utils/supabase/server";
import { useFetcher, useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.thoughts";
import {startTransition, useEffect, useState} from "react";
import ThoughtCard from "~/components/ThoughtCard";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ThoughtText from "~/locales/thought";
import i18nLinks from "~/utils/i18nLinks";
import Subnav from "~/components/Subnav";
import type {Json} from "~/types/supabase";
import {isJsonValue} from "~/utils/json";
import { trackLoadMore } from "~/utils/zaraz";

export interface Thought {
  id: number,
  slug: string,
  content_json: Json,
  content_text: string,
  created_at: string,
  page_view: number,
  comments: { count: number }[],
  thought_image: {
    image: {
      id: number,
      alt: string | null,
      storage_key: string,
      width: number,
      height: number
    }
  }[]
}

type LoaderData = {
  thoughts: Thought[];
  baseUrl: string;
  availableLangs: string[];
};

type LoadMoreResponse = {
  thoughts: Thought[];
};

const isLoadMoreThoughts = (data: unknown): data is LoadMoreResponse =>
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as { thoughts?: unknown }).thoughts);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const toComments = (value: unknown): { count: number }[] => {
  if (!Array.isArray(value)) {
    return [{count: 0}];
  }

  const comments = value
      .map(item => {
        if (!isRecord(item)) {
          return null;
        }
        const count = item["count"];
        return typeof count === "number" ? {count} : null;
      })
      .filter((item): item is { count: number } => item !== null);

  return comments.length > 0 ? comments : [{count: 0}];
};

const toThoughtImages = (value: unknown): Thought["thought_image"] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
      .map(item => {
        if (!isRecord(item)) {
          return null;
        }
        const image = item["image"];
        if (!isRecord(image)) {
          return null;
        }

        const id = image["id"];
        const storageKey = image["storage_key"];
        if (typeof id !== "number" || typeof storageKey !== "string") {
          return null;
        }

        const altValue = image["alt"];
        const widthValue = image["width"];
        const heightValue = image["height"];

        return {
          image: {
            id,
            storage_key: storageKey,
            alt: typeof altValue === "string" ? altValue : null,
            width: typeof widthValue === "number" ? widthValue : 0,
            height: typeof heightValue === "number" ? heightValue : 0,
          }
        };
      })
      .filter((item): item is Thought["thought_image"][number] => item !== null);
};

const asThought = (value: unknown): Thought | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = value["id"];
  const slug = value["slug"];
  const contentJson = value["content_json"];
  const contentText = value["content_text"];
  const createdAt = value["created_at"];
  const pageView = value["page_view"];

  if (typeof id !== "number") {
    return null;
  }
  if (typeof slug !== "string" || slug.length === 0) {
    return null;
  }
  if (typeof createdAt !== "string" || createdAt.length === 0) {
    return null;
  }

  const content_json = isJsonValue(contentJson) ? contentJson : null;
  const comments = toComments(value["comments"]);
  const thought_image = toThoughtImages(value["thought_image"]);

  return {
    id,
    slug,
    content_json,
    content_text: typeof contentText === "string" ? contentText : "",
    created_at: createdAt,
    page_view: typeof pageView === "number" ? pageView : 0,
    comments,
    thought_image,
  };
};

const normalizeThoughts = (value: unknown): Thought[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
      .map(asThought)
      .filter((item): item is Thought => item !== null);
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {supabase} = createClient(request, context);

  const {data: thoughts} = await supabase
  .from('thought')
  .select(`
      id,
      slug,
      content_json,
      content_text,
      created_at,
      page_view,
      comments:comment(count),
      thought_image (
        image (id, alt, storage_key, width, height)
      )
   `)
  .order('created_at', {ascending: false})
  .limit(12);

  const availableLangs = ["zh", "en", "jp"];

  return {
    thoughts: normalizeThoughts(thoughts),
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs,
  };
}

export const meta: Route.MetaFunction = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(ThoughtText, lang);
  const baseUrl = data!.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      "thoughts"
  );

  return [
    {title: label.all_thoughts},
    {
      name: "description",
      content: label.description,
    },
    {
      tagName: "link",
      rel: "alternate",
      type: "application/rss+xml",
      title: "RSS",
      href: `${baseUrl}/${lang}/thought/rss.xml`,
    },
    {
      property: "og:title",
      content: label.all_thoughts
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/thoughts`
    },
    {
      property: "og:description",
      content: label.description
    },
    {
      property: "twitter:card",
      content: "summary"
    },
    {
      property: "twitter:creator",
      content: "@darmau8964"
    },
    ...multiLangLinks
  ];
};

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const page = parseInt(formData.get("page") as string);
  const {supabase} = createClient(request, context)

  const {data, error} = await supabase
  .from("thought")
  .select(`
    id,
    slug,
    content_json,
    content_text,
    created_at,
    page_view,
    comments:comment(count),
    thought_image (
      image (id, alt, storage_key, width, height)
    )
  `)
  .range(page * 12, (page + 1) * 12 - 1)
  .order("created_at", {ascending: false});

  if (error) {
    throw new Error("获取更多思想数据失败", {cause: error});
  }

  return {thoughts: normalizeThoughts(data)};
}

export default function Thoughts() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(ThoughtText, lang);

  const [thoughts, setThoughts] = useState(loaderData.thoughts);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const payload = fetcher.data;
    if (!isLoadMoreThoughts(payload)) {
      return;
    }

    startTransition(() => {
      setThoughts((prevThoughts) => [...prevThoughts, ...payload.thoughts]);
    });
  }, [fetcher.data]);

  const loadMore = () => {
    trackLoadMore('thought');
    fetcher.submit({page: page.toString()}, {method: "post"});
    setPage((prevPage) => prevPage + 1);
  };

  return (
      <>
        <Subnav active = "others"/>
        <h1 className = "sr-only">Thought Detail</h1>
        <div className = "w-full flex-1 min-h-full max-w-2xl mx-auto p-4 md:py-8 lg:mb-16">
          <div className = "flex flex-col gap-4">
            {thoughts.map((thought) => (
                <ThoughtCard thought = {thought} key = {thought.id}/>
            ))}
          </div>
          <button
              className = "bg-violet-700 font-medium px-4 py-2 text-white rounded-md mt-4 mx-auto block text-sm"
              onClick = {loadMore} disabled = {fetcher.state === "submitting"}
          >
            {fetcher.state === "submitting" ? label.loading : label.loadmore}
          </button>
        </div>
      </>
  )
}
