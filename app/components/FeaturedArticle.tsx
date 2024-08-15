import {Article} from "~/types/Article";
import {Link, useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";
import ResponsiveImage from "~/components/ResponsiveImage";
import {ChatBubbleOvalLeftIcon, EyeIcon} from "@heroicons/react/24/outline";

export default function FeaturedArticle({article}: {
  article: Article,
}) {
  const {lang} = useOutletContext<{ lang: string }>();

  return (
      <article
          className = "group"
      >
        <Link
            to = {`/${lang}/article/${article.slug}`}
            prefetch="intent"
        >
          {article.cover &&
              <ResponsiveImage
                  image = {article.cover} width = {480}
                  classList = "aspect-[5/3] sm:aspect-[3/1] md:aspect-[3/2] w-full rounded-md overflow-hidden mb-4"
              />}
          <div className = "flex flex-col gap-3">
            <div className = "text-zinc-400 text-sm">
              <span className = "text-violet-700 font-medium">{article.category.title}</span>
              &nbsp;·&nbsp;
              <span>{getDate(article.published_at, lang)}</span>
            </div>
            <h3 className = "font-medium text-zinc-800 group-hover:text-violet-900 text-xl lg:text-2xl">{article.title}</h3>
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
            <div className = "flex gap-3 justify-start items-center">
              <div className = "flex gap-1 items-center">
                <EyeIcon className = "h-4 w-4 inline-block text-zinc-400"/>
                <span className = "text-zinc-500 text-sm">{article.page_view}</span>
              </div>
              <div className = "flex gap-1 items-center">
                <ChatBubbleOvalLeftIcon className = "h-4 w-4 inline-block text-zinc-400"/>
                <span className = "text-zinc-500 text-sm">{article.comments[0].count}</span>
              </div>
            </div>
          </div>
        </Link>

      </article>
  )
}
