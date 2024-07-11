import {LoaderFunctionArgs, MetaFunction, json} from "@remix-run/cloudflare";
import {redirect, useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export function loader({ params }: LoaderFunctionArgs) {
  const lang = params.lang;
  if (!lang) {
    return redirect("/en", { status: 302 });
  }
  return json({ lang });
}

export default function Index() {
  const { lang } = useLoaderData<typeof loader>();

  return (
      <div className = "font-sans p-4">
        <h1 className = "text-3xl">This page's language is {lang}</h1>
        <ul className = "list-disc mt-4 pl-6 space-y-2">
          <li>
            <a
                className = "text-blue-700 underline visited:text-purple-900"
                target = "_blank"
                href = "https://remix.run/docs"
                rel = "noreferrer"
            >
              Remix Docs
            </a>
          </li>
          <li>
            <a
                className = "text-blue-700 underline visited:text-purple-900"
                target = "_blank"
                href = "https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
                rel = "noreferrer"
            >
              Cloudflare Pages Docs - Remix guide
            </a>
          </li>
        </ul>
      </div>
  );
}
