import {Article} from "~/types/Article";
import {Link} from "@remix-run/react";
import getDate from "~/utils/getDate";

export default function ArticleCard({article, lang}: {
  article: Article,
}) {

  return (
      <article
          title = {article.abstract || ''}
          className="group"
      >
        <Link
            to = {`/article/${article.slug}`}
            className = "flex flex-col gap-2"
        >
          <div className = "text-zinc-400 text-sm">
            <span>{article.category!.title}</span>
            &nbsp;·&nbsp;
            <span>{getDate(article.published_at, lang)}</span>
          </div>
          <h3 className = "text-xl font-medium text-zinc-800 group-hover:text-violet-900">{article.title}</h3>
          <h4 className = "text-base text-zinc-500 line-clamp-2">{article.subtitle}</h4>
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
