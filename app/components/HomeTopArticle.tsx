import {Article} from "~/types/Article";
import {Link, useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";
import ResponsiveImage from "~/components/ResponsiveImage";

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
            to = {`/${lang}/article/${article.slug}`}
            className = {`gap-4 flex flex-col lg:gap-6
              ${isTop ? 'lg:flex-col' : 'lg:flex-row'}
            `}
        >
          {article.cover && (
              <div
                  className = {`aspect-[5/3] sm:aspect-[3/1] w-full rounded-md overflow-hidden ${isTop ? '' : 'md:aspect-[3/2] lg:grow-0 lg:max-w-48'}`}
              >
                {isTop ? (
                    <ResponsiveImage
                        image = {article.cover} width = {640}
                        classList = {'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'}
                    />
                ) : (
                    <ResponsiveImage
                        image = {article.cover} width = {240} classList = {'w-full h-full object-cover' +
                        ' group-hover:scale-105 transition-transform duration-300'}
                    />
                )}
              </div>
          )}
          <div className = "flex flex-col gap-3 sm:grow">
            <div className = "text-zinc-400 text-sm">
              <span className = "text-violet-700 font-medium">{article.category.title}</span>
              &nbsp;·&nbsp;
              <span>{getDate(article.published_at, lang)}</span>
            </div>
            <h3 className = {`font-medium text-zinc-800 group-hover:text-violet-900 ${isTop ? 'text-3xl' : 'text-xl'}`}>{article.title}</h3>
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
          </div>
        </Link>

      </article>
  )
}
