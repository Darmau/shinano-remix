import {Article} from "~/types/Article";
import {Link} from "@remix-run/react";
import getDate from "~/utils/getDate";

export default function ArticleCard({article, prefix, lang, direction = 'vertical'}: { article: Article, prefix: string, lang: string, direction?: string }) {

  return (
      <article title={article.abstract || ''}>
        <Link to = {`/article/${article.slug}`}>
          {article.cover && (
              <img
                  className = {"w-full h-48 object-cover"}
                  src = {`${prefix}/cdn-cgi/image/format=auto,width=640/${article.cover.storage_key}`}
                  alt = {article.cover.alt || ''}
              />
          )}
          <div>
            <span>{article.category!.title}</span>
            <span>{getDate(article.published_at, lang)}</span>
          </div>
          <h3>{article.title}</h3>
          <p>{article.subtitle}</p>
          <div>
            {article.topic && (
                article.topic.map((topic, index) => (
                    <span key={index}>{topic}</span>
                ))
            )}
          </div>
        </Link>

      </article>
  )
}
