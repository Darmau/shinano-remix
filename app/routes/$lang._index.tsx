import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import {supabaseServerClient} from "~/utils/supabase.server";

export const meta: MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = supabaseServerClient(request);

  const {data} = await supabase.from('photo').select();

  return json({ data });
}

export default function Index() {
  const { lang } = useOutletContext<{lang: string}>();
  const { data } = useLoaderData<typeof loader>();

  return (
      <div className = "font-sans p-4">
        <h1 className = "text-3xl">这是首页{lang}</h1>
        <p>{JSON.stringify(data)}</p>
      </div>
  );
}
