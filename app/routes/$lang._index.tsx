import {MetaFunction} from "@remix-run/cloudflare";
import {useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";

export const meta: MetaFunction = ({ params }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  return [
    {title: label.title},
    {
      name: "description",
      content: label.description,
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
