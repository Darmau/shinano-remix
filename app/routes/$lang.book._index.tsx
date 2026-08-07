import {createClient} from "~/utils/supabase/server";
import { useFetcher, useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.book._index";
import RateStars from "~/components/RateStars";
import getDate from "~/utils/getDate";
import {LinkIcon} from "@heroicons/react/24/solid";
import Subnav from "~/components/Subnav";
import getLanguageLabel from "~/utils/getLanguageLabel";
import BookText from "~/locales/books";
import i18nLinks from "~/utils/i18nLinks";
import {startTransition, useEffect, useState} from "react";
import ThoughtText from "~/locales/thought";
import { trackLoadMore } from "~/utils/zaraz";

type BookRecord = {
  id: number;
  title: string;
  rate: number;
  comment: string | null;
  link: string | null;
  date: string | null;
  cover: {
    id: string | number;
    alt: string | null;
    storage_key: string;
  } | null;
};

type LoaderData = {
  books: BookRecord[];
  prefix: string;
  baseUrl: string;
  availableLangs: string[];
  count: number | null;
};

type LoadMoreResponse = {
  books: BookRecord[];
};

const isLoadMoreResponse = (data: unknown): data is LoadMoreResponse =>
    typeof data === "object" && data !== null && Array.isArray((data as LoadMoreResponse).books);

const isLoaderData = (value: unknown): value is LoaderData =>
    typeof value === "object" &&
    value !== null &&
    "books" in value &&
    "prefix" in value &&
    "baseUrl" in value &&
    "availableLangs" in value &&
    "count" in value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const normalizeBooks = (rows: unknown): BookRecord[] => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const normalized: BookRecord[] = [];

  rows.forEach(row => {
    if (!isRecord(row)) {
      return;
    }

    const id = row["id"];
    if (typeof id !== "number") {
      return;
    }

    const title = row["title"];
    const rate = row["rate"];
    const comment = row["comment"];
    const link = row["link"];
    const date = row["date"];
    const coverValue = row["cover"];

    const cover = isRecord(coverValue) && typeof coverValue["storage_key"] === "string"
        ? {
          id: typeof coverValue["id"] === "number" || typeof coverValue["id"] === "string" ? coverValue["id"] : id,
          alt: typeof coverValue["alt"] === "string" ? coverValue["alt"] as string : null,
          storage_key: coverValue["storage_key"] as string,
        }
        : null;

    normalized.push({
      id,
      title: typeof title === "string" ? title : "",
      rate: typeof rate === "number" ? rate : 0,
      comment: typeof comment === "string" ? comment : null,
      link: typeof link === "string" ? link : null,
      date: typeof date === "string" ? date : null,
      cover,
    });
  });

  return normalized;
};

// 接收iso8601格式的日期字符串，返回

export default function Book() {
  const loaderData = useLoaderData<typeof loader>();
  const {lang} = useOutletContext<{lang: string}>();
  const fetcher = useFetcher();

  const [books, setBooks] = useState(loaderData.books);
  const [page, setPage] = useState(1);

  // 没有专属文案，套用thought里的
  const label = getLanguageLabel(ThoughtText, lang);

  useEffect(() => {
    const payload = fetcher.data;
    if (!isLoadMoreResponse(payload)) {
      return;
    }

    startTransition(() => {
      setBooks((prevBooks) => [...prevBooks, ...payload.books]);
    });
  }, [fetcher.data]);

  const loadMore = () => {
    trackLoadMore('book');
    fetcher.submit({page: page.toString()}, {method: "post"});
    setPage((prevPage) => prevPage + 1);
  };

  return (
      <>
        <Subnav active = "others"/>
        <h1 className = "sr-only">Books</h1>
        <div
            className = "w-full max-w-6xl mx-auto p-4 md:py-8 my-8 lg:my-12"
        >
          <div className = "grid grid-cols-1 gap-8 md:grid-cols-2">
            {books && books.map((book) => (
                <div
                    key = {book.id}
                    className = "flex gap-4 justify-between items-start lg:my-4"
                >
                  {book.cover && (
                      <img
                          src = {`${loaderData.prefix}/cdn-cgi/image/format=auto,width=120/${book.cover.storage_key}`}
                          alt = {book.cover.alt ?? ''}
                          className = "h-32 aspect-3/4 object-cover shadow-lg"
                      />
                  )}
                  <div className = "w-full space-y-2 lg:space-y-3">
                    <h3 className = "font-medium text-lg text-zinc-800">{book.title}</h3>
                    <RateStars n = {book.rate}/>
                    {book.comment &&
                        <p className = "text-zinc-700">{book.comment}</p>}
                    <div className = "text-sm text-zinc-500">{getDate(book.date!, lang)}</div>
                    {book.link && (
                        <a href = {book.link} target = "_blank" className = "block my-2" rel = "noreferrer">
                          <LinkIcon className = "w-4 h-4 text-zinc-500 hover:text-violet-700 cursor-pointer"/>
                        </a>
                    )}
                  </div>
                </div>
            ))}
          </div>
          <button
              className = "bg-violet-700 font-medium px-4 py-2 text-white rounded-md my-8 mx-auto block text-sm"
              onClick = {loadMore} disabled = {fetcher.state === "submitting"}
          >
            {fetcher.state === "submitting" ? label.loading : label.loadmore}
          </button>
        </div>
      </>
  )
}

export async function loader({request, context}: Route.LoaderArgs) {
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
  .order('date', {ascending: false})
  .range(0, 19);

  // 总数
  const {count} = await supabase
    .from('book')
    .select('id', {count: 'exact'});

  const availableLangs = ["zh", "en", "jp"];

  return {
    books: normalizeBooks(bookData),
    prefix: context.cloudflare.env.IMG_PREFIX,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs,
    count: count ?? null,
  };
}

export const meta: Route.MetaFunction = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(BookText, lang);
  if (!isLoaderData(data)) {
    return [{title: label.title}];
  }

  const baseUrl = data.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data.availableLangs,
      "book"
  );

  return [
    {title: `${label.title}(${data.count ?? 0})`},
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

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const page = parseInt(formData.get("page") as string);
  const {supabase} = createClient(request, context)

  const {data, error} = await supabase
  .from("book")
  .select(`
    id,
    title,
    date,
    link,
    rate,
    comment,
    cover (id, alt, storage_key)
  `)
  .range(page * 20, (page + 1) * 20 - 1)
  .order("date", {ascending: false});

  if (error) {
    throw new Error("获取更多读书数据失败");
  }

  return {
    books: normalizeBooks(data),
  };
}
