import {MetaFunction} from "@remix-run/cloudflare";
import {useOutletContext} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};


export default function Index() {
  const { lang } = useOutletContext<{lang: string}>();

  return (
      <div className = "font-sans p-4">
        <h1 className = "text-3xl">这是首页{lang}</h1>
      </div>
  );
}
