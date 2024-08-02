import {ActionFunctionArgs, json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useFetcher, useLoaderData, useOutletContext} from "@remix-run/react";
import {useEffect, useState} from "react";
import ThoughtCard from "~/components/ThoughtCard";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ThoughtText from "~/locales/thought";

export interface Thought {
  id: number,
  slug: string,
  content_json: JSON,
  created_at: string,
  thought_image: {
    image: {
      id: number,
      alt: string,
      storage_key: string,
      width: number,
      height: number
    }
  }[] | null
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);

  const {data: thoughts} = await supabase
  .from('thought')
  .select(`
      id,
      slug,
      content_json,
      created_at,
      thought_image (
        image (id, alt, storage_key, width, height)
      )
   `)
  .order('created_at', {ascending: false})
  .limit(12);

  if (!thoughts) {
    throw new Response(null, {
      status: 404,
      statusText: 'Thoughts not exists'
    })
  }

  return json({
    thoughts
  })
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const page = parseInt(formData.get("page") as string);
  const {supabase} = createClient(request, context)

  const {data, error} = await supabase
  .from("thought")
  .select(`
    id,
    slug,
    content_json,
    created_at,
    thought_image (
      image (id, alt, storage_key, width, height)
    )
  `)
  .range(page * 12, (page + 1) * 12 - 1)
  .order("created_at", {ascending: false});

  if (error) {
    throw new Error("获取更多思想数据失败");
  }

  return json<{thoughts: Thought[]}>({thoughts: data as unknown as Thought[] || []});
}

export default function Thoughts() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(ThoughtText, lang);

  const [thoughts, setThoughts] = useState(loaderData.thoughts);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (fetcher.data?.thoughts) {
      setThoughts((prevThoughts) => [...prevThoughts, ...fetcher.data.thoughts]);
    }
  }, [fetcher.data]);

  const loadMore = () => {
    fetcher.submit({page: page.toString()}, {method: "post"});
    setPage((prevPage) => prevPage + 1);
  };

  return (
      <div className = "w-full flex-1 min-h-full max-w-8xl mx-auto p-4 md:py-8 lg:mb-16">
        <div className = "columns-1 sm:columns-2 md:columns-3 gap-4">
          {thoughts.map((thought) => (
              <ThoughtCard thought = {thought as unknown as Thought} key = {thought.id}/>
          ))}
        </div>
        <button
            className="bg-violet-700 font-medium px-4 py-2 text-white rounded-md mt-4 mx-auto block text-sm"
            onClick = {loadMore} disabled = {fetcher.state === "submitting"}
        >
          {fetcher.state === "submitting" ? label.loading : label.loadmore}
        </button>
      </div>
  )
}