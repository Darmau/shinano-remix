import {Article} from "~/types/Article";
import {Link} from "@remix-run/react";
import getDate from "~/utils/getDate";
import {useContext} from "react";
import {Language} from "~/root";

export default function CoverArticleCard({article, prefix, isTop}: { article: Article, prefix: string, isTop: boolean }) {
  const lang = useContext(Language);

  return (
      <article
          className = "group w-full"
      >
        <Link
            to = {`/${lang}/article/${article.slug}`}
            className = {`gap-4 flex flex-col ${isTop ? 'lg:grid lg:grid-cols-2' : 'sm:flex-row-reverse'}`}
        >
          {article.cover && (
              <div className = {`${isTop ? 'sm:aspect-[3/1] lg:aspect-[3/2]' : 'sm:grow-0 sm:max-w-48'} w-full rounded-md overflow-hidden aspect-[3/2]`}>
                <img
                    className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src = {`${prefix}/cdn-cgi/image/format=auto,width=720/${article.cover.storage_key}`}
                    alt = {article.cover.alt || ''}
                    height = "320"
                    width = "960"
                />
              </div>
          )}
          <div className = "flex flex-col gap-4 sm:grow">
            <div className = "text-zinc-400 text-sm">
              <span className = "text-violet-700 font-medium">{article.category.title}</span>
              &nbsp;·&nbsp;
              <span>{getDate(article.published_at, lang)}</span>
            </div>
            <h3 className = {`${isTop? 'text-4xl' : 'text-2xl'} font-medium text-zinc-800 group-hover:text-violet-900`}>{article.title}</h3>
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
            {isTop && article.abstract && (
                <p className="bg-zinc-100 p-2 rounded-md text-zinc-600 mt-2 lg:p-4">{article.abstract}</p>
            )}
          </div>
        </Link>

      </article>
  )
}
