import {Article} from "~/types/Article";
import {Link, useOutletContext} from "@remix-run/react";
import getTime from "~/utils/getTime";
import ResponsiveImage from "~/components/ResponsiveImage";
import {ChatBubbleOvalLeftIcon, EyeIcon} from "@heroicons/react/24/outline";

export default function HomeTopArticle({article, isTop, classList}: {
  article: Article,
  isTop: boolean,
  classList?: string
}) {
  const {lang} = useOutletContext<{ lang: string }>();

  return (
      <article
          className = {classList}
      >
        <Link
            prefetch="render"
            to = {`/${lang}/article/${article.slug}`}
            className = {`gap-4 flex flex-col lg:gap-6
              ${isTop ? 'lg:flex-col' : 'lg:flex-row'}
            `}
        >
          {article.cover && (
              isTop ? (
                  <ResponsiveImage
                      image = {article.cover} width = {640}
                      classList = "aspect-[5/3] sm:aspect-[3/1] w-full rounded-md overflow-hidden"
                  />
              ) : (
                  <ResponsiveImage
                      image = {article.cover} width = {640}
                      classList = "aspect-[5/3] sm:aspect-[3/1] w-full rounded-md overflow-hidden md:aspect-[3/2] lg:grow-0 lg:max-w-48"
                  />
              )
          )
          }
          <div className = "flex flex-col gap-3 sm:grow">
            <div className = "text-zinc-400 text-sm">
              <span className = "text-violet-700 font-medium">{article.category.title}</span>
              &nbsp;·&nbsp;
              <span>{getTime(article.published_at, lang)}</span>
            </div>
            <h3 className = {`font-medium text-zinc-800 group-hover:text-violet-900 ${isTop ? 'text-3xl' : 'text-2xl'}`}>{article.title}</h3>
            <h4 className = "text-base text-zinc-500 leading-7">{article.subtitle}</h4>
            {article.topic && (
                <div className = "flex flex-wrap gap-2">
                  {article.topic.map((topic, index) => (
                      <span
                          key = {index}
                          className = "inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
                      >
                      {topic}
                    </span>
                  ))}
                </div>
            )}
            {isTop && article.abstract && (
                <p className = "text-sm bg-zinc-50 p-2 rounded-md text-zinc-500 mt-2 lg:p-4">{article.abstract}</p>
            )}
            <div className = "flex gap-3 justify-start items-center">
              <div className="flex gap-1 items-center">
                <EyeIcon className = "h-4 w-4 inline-block text-zinc-400"/>
                <span className = "text-zinc-500 text-sm">{article.page_view}</span>
              </div>
              <div className="flex gap-1 items-center">
                <ChatBubbleOvalLeftIcon className = "h-4 w-4 inline-block text-zinc-400"/>
                <span className = "text-zinc-500 text-sm">{article.comments[0].count}</span>
              </div>
            </div>
          </div>
        </Link>

      </article>
  )
}
