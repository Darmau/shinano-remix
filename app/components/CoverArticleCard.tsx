import {Article} from "~/types/Article";
import {Link} from "@remix-run/react";
import getDate from "~/utils/getDate";

export default function CoverArticleCard({article, prefix, lang}: { article: Article, prefix: string, lang: string }) {

  return (
      <article
          title={article.abstract || ''}
          className={`row-span-2 group p-2 lg:p-4 rounded-md lg:rounded-3xl cursor-pointer transition-transform duration-300 hover:bg-zinc-100`}
      >
        <Link
            to = {`/article/${article.slug}`}
            className="gap-4 h-full flex flex-col gap-4"
        >
          <div className = {`w-full h-full aspect-[3/2] md:aspect-[3/1] rounded-md lg:rounded-2xl overflow-hidden`}>
            {article.cover && (
                <img
                    className="object-cover w-full h-full group-hover:scale-105  transition-transform duration-300"
                    src = {`${prefix}/cdn-cgi/image/format=auto,width=640/${article.cover.storage_key}`}
                    alt = {article.cover.alt || ''}
                />
            )}
          </div>
          <div className="space-y-2">
            <div className = "text-violet-800 font-medium text-sm">
              <span>{article.category!.title}</span>
              ·
              <span>{getDate(article.published_at, lang)}</span>
            </div>
            <h3 className = "text-xl font-medium">{article.title}</h3>
            <h4 className = "text-base text-zinc-500 line-clamp-2">{article.subtitle}</h4>
            {article.abstract && (
                <p>{article.abstract}</p>
            )}
            <div className = "flex flex-wrap gap-2 pt-2">
              {article.topic && (
                  article.topic.map((topic, index) => (
                      <span
                          key = {index}
                          className = "inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 group-hover:bg-zinc-200"
                      >
                      {topic}
                    </span>
                  ))
              )}
            </div>
          </div>
        </Link>

      </article>
  )
}
