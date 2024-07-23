import {Article} from "~/types/Article";
import {Link, useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";

export default function ArticleCardWithCover({article}: {
  article: Article
}) {
  const {lang, prefix} = useOutletContext<{lang: string, prefix: string}>();

  return (
      <article
          title = {article.abstract || ''}
          className="group"
      >
        <Link
            to = {`/${lang}/article/${article.slug}`}
            className = "flex flex-col gap-2"
        >
          <div className="w-full rounded-md overflow-hidden aspect-[3/1]">
            <img
                alt={article.cover?.alt || ''}
                src={`${prefix}/cdn-cgi/image/format=auto,width=720/${article.cover?.storage_key}`}
                srcSet={`${prefix}/cdn-cgi/image/format=auto,width=560/${article.cover?.storage_key} 1x, ${prefix}/cdn-cgi/image/format=auto,width=1280/${article.cover?.storage_key} 2x`}
                className="w-full"
            />
          </div>
          <div className = "text-zinc-400 text-sm">
            <span className="text-violet-700 font-medium">{article.category.title}</span>
            &nbsp;·&nbsp;
            <span>{getDate(article.published_at, lang)}</span>
          </div>
          <h3 className = "text-xl font-medium text-zinc-800 group-hover:text-violet-900">{article.title}</h3>
          <h4 className = "text-base text-zinc-500 leading-7">{article.subtitle}</h4>
          {article.abstract && (
              <p className = "text-zinc-500">{article.abstract}</p>
          )}
          {article.topic && (
              <div className = "flex flex-wrap gap-2 pt-2">
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
        </Link>

      </article>
  )
}
