import Subnav from "~/components/Subnav";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import RSSText from "~/locales/rss";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useState} from "react";
import i18nLinks from "~/utils/i18nLinks";

export default function RSS() {
  const {lang, prefix} = useOutletContext<{ lang: string, prefix: string }>();
  const {articles, photos, thoughts} = useLoaderData<typeof loader>();
  const label = getLanguageLabel(RSSText, lang);

  const [copiedArticle, setCopiedArticle] = useState(false);
  const [copiedPhoto, setCopiedPhoto] = useState(false);
  const [copiedThought, setCopiedThought] = useState(false);

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === 'article') {
        setCopiedPhoto(false);
        setCopiedThought(false);
        setCopiedArticle(true);
      } else if (type === 'photo') {
        setCopiedArticle(false);
        setCopiedThought(false);
        setCopiedPhoto(true);
      } else {
        setCopiedArticle(false);
        setCopiedPhoto(false);
        setCopiedThought(true);
      }
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
      <>
        <Subnav active = "about"/>
        <div className = "w-full max-w-8xl mx-auto p-4 md:py-8 my-8">
          <header className = "text-center space-y-2 mb-12">
            <h2 className = "font-medium text-sm text-violet-700">RSS</h2>
            <h1 className = "font-medium text-zinc-900 text-3xl lg:text-4xl">{label.title}</h1>
            <p className = "text-base text-zinc-600">{label.description}</p>
          </header>

          <div className = "grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className = "rounded-2xl border shadow-lg">
              <div className="p-4 lg:p-8 border-b space-y-4">
                <h3 className = "font-medium text-lg text-zinc-700">{label.article}</h3>
                <code className = "text-sm block font-mono text-zinc-600">{`https://darmau.co/${lang}/article/rss.xml`}</code>
                <button
                    data-umami-event = "RSS"
                    data-umami-event-type = "Article"
                    onClick = {() => copyToClipboard(`https://darmau.co/${lang}/article/rss.xml`, 'article')}
                    className="bg-violet-600 text-white font-medium py-3 w-full rounded-md"
                >
                  {copiedArticle ? label.copied : label.copy}
                </button>
              </div>
              {articles && <ol className = "space-y-4 p-4 lg:p-8">
                {articles.map((article) => (
                    <li key = {article.id}>
                      <h4 className = "font-medium text-zinc-700">{article.title}</h4>
                      <p className = "text-zinc-500 mt-1">{article.subtitle}</p>
                    </li>
                ))}
              </ol>}
            </section>
            <section className = "rounded-2xl border shadow-lg">
              <div className = "p-4 lg:p-8 border-b space-y-4">
                <h3 className = "font-medium text-lg text-zinc-700">{label.photography}</h3>
                <code className = "text-sm block font-mono text-zinc-600">{`https://darmau.co/${lang}/album/rss.xml`}</code>
                <button
                    data-umami-event = "RSS"
                    data-umami-event-type = "Photography"
                    onClick = {() => copyToClipboard(`https://darmau.co/${lang}/album/rss.xml`, 'photo')}
                    className = "bg-violet-600 text-white font-medium py-3 w-full rounded-md"
                >
                  {copiedPhoto ? label.copied : label.copy}
                </button>
              </div>
              <div className = "grid grid-cols-3 gap-2 mt-8 p-4 lg:p-8">
                {photos && photos.map((photo) => (
                    <div
                        key = {photo.id}
                        className = "aspect-square overflow-hidden rounded"
                    >
                      <img
                          src = {`${prefix}/cdn-cgi/image/format=auto,width=240/${photo.cover.storage_key}`}
                          alt = {photo.title!}
                          className = "w-full h-full object-cover"
                      />
                    </div>
                ))}
              </div>
            </section>
            <section className = "rounded-2xl border shadow-lg">
              <div className = "p-4 lg:p-8 border-b space-y-4">
                <h3 className = "font-medium text-lg text-zinc-700">{label.thought}</h3>
                <code className = "text-sm block font-mono text-zinc-600">{`https://darmau.co/${lang}/thought/rss.xml`}</code>
                <button
                    data-umami-event = "RSS"
                    data-umami-event-type = "Thought"
                    onClick = {() => copyToClipboard(`https://darmau.co/${lang}/thought/rss.xml`, 'thought')}
                    className = "bg-violet-600 text-white font-medium py-3 w-full rounded-md"
                >
                  {copiedThought ? label.copied : label.copy}
                </button>
              </div>
              {thoughts && <ol className = "space-y-4 p-4 lg:p-8 pl-8 lg:pl-12 list-decimal">
                {thoughts.map((thought) => (
                    <li key = {thought.id}>
                      <p className = "text-zinc-700">{thought.content_text}</p>
                    </li>
                ))}
              </ol>}
            </section>
          </div>
        </div>
      </>
  )
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(RSSText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      "rss"
  );

  return [
    {title: label.page_title},
    {
      name: "description",
      content: label.page_description,
    },
    ...multiLangLinks
  ];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;

  const {data: articles} = await supabase
  .from('article')
  .select(`
      id,
      title,
      subtitle,
      published_at,
      language!inner (lang)
    `)
  .eq('is_draft', false)
  .eq('language.lang', lang)
  .order('published_at', {ascending: false})
  .limit(5);

  const {data: photos} = await supabase
  .from('photo')
  .select(`
      id,
      title,
      published_at,
      language!inner (lang),
      cover (storage_key)
    `)
  .eq('is_draft', false)
  .eq('is_featured', true)
  .eq('language.lang', lang)
  .order('published_at', {ascending: false})
  .limit(9);

  const {data: thoughts} = await supabase
  .from('thought')
  .select(`
      id,
      content_text,
      created_at
    `)
  .order('created_at', {ascending: false})
  .limit(7);

  const availableLangs = ["zh", "en", "jp"];

  return json({
    articles,
    photos,
    thoughts,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  })
}
