import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import RateStars from "~/components/RateStars";
import getDate from "~/utils/getDate";
import {LinkIcon} from "@heroicons/react/24/solid";
import Subnav from "~/components/Subnav";
import getLanguageLabel from "~/utils/getLanguageLabel";
import BookText from "~/locales/books";
import i18nLinks from "~/utils/i18nLinks";

// 接收iso8601格式的日期字符串，返回

export default function Book () {
  const {books, prefix} = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{lang: string}>();

  return (
      <>
        <Subnav active="others" />
        <div
            className = "w-full max-w-6xl mx-auto p-4 md:py-8 my-8 lg:my-16 grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          {books && books.map((book) => (
              <div
                  key={book.id}
                  className="flex gap-4 justify-between items-start lg:my-4"
              >
                <img
                    src = {`${prefix}/cdn-cgi/image/format=auto,width=120/${book.cover.storage_key}`}
                    alt = {book.cover.alt}
                    className = "h-32 aspect-[3/4] object-cover shadow-lg"
                />
                <div className="w-full space-y-2 lg:space-y-3">
                  <h3 className="font-medium text-lg text-zinc-800">{book.title}</h3>
                  <RateStars n={book.rate}/>
                  {book.comment &&
                      <p className="text-zinc-700">{book.comment}</p>}
                  <div className="text-sm text-zinc-500">{getDate(book.date!, lang)}</div>
                  {book.link && (
                      <a href={book.link} target="_blank" className="block my-2" rel="noreferrer">
                        <LinkIcon className="w-4 h-4 text-zinc-500 hover:text-violet-700 cursor-pointer"/>
                      </a>
                  )}
                </div>
              </div>
          ))}
        </div>
      </>
  )
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const {data: bookData} = await supabase
    .from('book')
    .select(`
      id,
      title,
      rate,
      comment,
      link,
      date,
      cover (id, alt, storage_key)
    `)
    .order('date', {ascending: false});

  const availableLangs = ["zh", "en", "jp"];

  return json({
    books: bookData,
    prefix: context.cloudflare.env.IMG_PREFIX,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  })
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(BookText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      "book"
  );

  return [
    {title: label.title},
    {
      name: "description",
      content: label.description,
    },
    {
      property: "og:title",
      content: label.title
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/book`
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
