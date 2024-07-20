import {Article} from "~/types/Article";
import {Link} from "@remix-run/react";

export default function CoverArticleCard({article, prefix}: { article: Article, prefix: string }) {

  return (
      <article
          title={article.abstract || ''}
          className={`row-span-2 group p-2 lg:p-4 rounded-md lg:rounded-3xl cursor-pointer transition-transform duration-300 hover:bg-zinc-100`}
      >
        <Link
            to = {`/article/${article.slug}`}
            className = "relative gap-4 min-h-80 h-full flex flex-col rounded-md lg:rounded-2xl overflow-hidden"
        >
          <div className = "mt-auto p-4 space-y-3 z-10 py-8 lg:mb-0 bg-black/20 group-hover:backdrop-blur transition-all duration-300">
            <h3 className = "text-white text-3xl font-medium">{article.title}</h3>
            <h4 className = "text-base text-white lg:line-clamp-2">{article.subtitle}</h4>
            <div className = "hidden lg:flex flex-wrap gap-2 pt-2">
              {article.topic && (
                  article.topic.map((topic, index) => (
                      <span
                          key = {index}
                          className = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white border border-white"
                      >
                      {topic}
                    </span>
                  ))
              )}
            </div>
          </div>
          {article.cover && (
              <div className = "absolute top-0 left-0 h-full w-full z-0">
                <img
                    className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src = {`${prefix}/cdn-cgi/image/format=auto,width=960/${article.cover.storage_key}`}
                    alt = {article.cover.alt || ''}
                />
              </div>
          )}
        </Link>

      </article>
  )
}
