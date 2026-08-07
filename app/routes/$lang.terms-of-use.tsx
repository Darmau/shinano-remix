import { useLoaderData } from "react-router";
import type { Route } from "./+types/$lang.terms-of-use";
import { marked } from "marked";
import LegalText from "~/locales/legal";
import HomepageText from "~/locales/homepage";
import getLanguageLabel from "~/utils/getLanguageLabel";
import i18nLinks from "~/utils/i18nLinks";
import zhContent from "~/content/legal/zh.md?raw";
import enContent from "~/content/legal/en.md?raw";
import jpContent from "~/content/legal/jp.md?raw";

type SupportedLang = "zh" | "en" | "jp";

const TERMS_BY_LANG: Record<SupportedLang, string> = {
  zh: zhContent,
  en: enContent,
  jp: jpContent,
};

const AVAILABLE_LANGS = Object.keys(TERMS_BY_LANG) as SupportedLang[];

marked.setOptions({
  gfm: true,
  breaks: true,
});

type LoaderData = {
  lang: SupportedLang;
  html: string;
  baseUrl: string;
  availableLangs: SupportedLang[];
};

export const loader = async ({
  params,
  context,
}: Route.LoaderArgs): Promise<LoaderData> => {
  const langParam = (params.lang ?? "zh") as SupportedLang;
  const lang = AVAILABLE_LANGS.includes(langParam) ? langParam : "zh";
  const markdown = TERMS_BY_LANG[lang];
  const html = await marked.parse(markdown);

  const runtimeEnv = context?.cloudflare?.env ?? globalThis.process?.env ?? {};
  const baseUrl = runtimeEnv.BASE_URL ?? "";

  return {
    lang,
    html,
    baseUrl,
    availableLangs: AVAILABLE_LANGS,
  };
};

export const meta: Route.MetaFunction = function meta({ data }) {

  if (!data) {
    return [];
  }

  const { lang, baseUrl, availableLangs } = data;
  const legalCopy = LegalText(lang);
  const siteLabel = getLanguageLabel(HomepageText, lang);
  const pageTitle = `${legalCopy.title} | ${siteLabel.title}`;
  const links = i18nLinks(baseUrl, lang, availableLangs, "terms-of-use");

  const descriptors = [
    { title: pageTitle },
    {
      name: "description",
      content: legalCopy.description,
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: legalCopy.description,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: pageTitle,
    },
    {
      name: "twitter:description",
      content: legalCopy.description,
    },
  ];

  if (baseUrl) {
    descriptors.splice(5, 0, {
      property: "og:url",
      content: `${baseUrl}/${lang}/terms-of-use`,
    });
  }

  return [...descriptors, ...links];
};

export default function TermsOfUse() {
  const { html, lang } = useLoaderData<typeof loader>();
  const legalCopy = LegalText(lang);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-800 sm:text-4xl">
          {legalCopy.title}
        </h1>
        <p className="text-sm text-zinc-500">{legalCopy.description}</p>
      </header>
      <article
        className="mt-10 space-y-6 text-base leading-8 text-zinc-700 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-800 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-zinc-700 [&_strong]:font-semibold [&_a]:text-violet-700 [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-violet-600 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600 [&_hr]:my-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
