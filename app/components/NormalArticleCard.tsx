import {Article} from "~/types/Article";
import {Link, useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";

export default function NormalArticleCard({article, showAbstract}: {
  article: Article
  showAbstract?: boolean
}) {
  const {lang} = useOutletContext<{lang: string}>();

  return (
      <article
          title = {article.abstract || ''}
          className="group"
      >
        <Link
            to = {`/${lang}/article/${article.slug}`}
            className = "flex flex-col gap-2"
        >
          <div className = "text-zinc-400 text-sm">
            <span className="text-violet-700 font-medium">{article.category.title}</span>
            &nbsp;·&nbsp;
            <span>{getDate(article.published_at, lang)}</span>
          </div>
          <h3 className = "text-2xl font-medium text-zinc-800 group-hover:text-violet-900">{article.title}</h3>
          <h4 className = "text-base text-zinc-500 leading-7">{article.subtitle}</h4>
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
          {showAbstract && article.abstract && (
              <div className="bg-zinc-100 p-2 text-sm text-zinc-700 mt-3 rounded-md md:p-4 leading-6">{article.abstract}</div>
          )}
        </Link>

      </article>
  )
}
