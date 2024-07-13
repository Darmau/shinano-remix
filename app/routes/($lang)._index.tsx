import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {redirect, useLoaderData, useOutletContext} from "@remix-run/react";
import {createSupabaseServerClient} from "~/utils/supabase.server";

export const meta: MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const lang = params.lang;

  return json({ lang });
}

export default function Index() {
  const { lang, supabase, session, user} = useOutletContext<{lang: string, supabase: any, session: any, user: any}>();

  return (
      <div className = "font-sans p-4">
        <h1 className = "text-3xl">这是首页{lang}</h1>
        <section>
          <h2>User</h2>
          <p>{JSON.stringify(user)}</p>
        </section>
        <section>
          <h2>session</h2>
          <p>{JSON.stringify(session)}</p>
        </section>
        <section>
          <h2>Supabase</h2>
          <p>{JSON.stringify(supabase)}</p>
        </section>
      </div>
  );
}
