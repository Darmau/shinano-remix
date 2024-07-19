import {Article} from "~/types/Article";
import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {Link, useLoaderData} from "@remix-run/react";

export default function ArticleCard({article, prefix}: { article: Article, prefix: string }) {

  return (
      <article>
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
            <span>{article.published_at}</span>
          </div>
          <h3>{article.title}</h3>
          <p>{article.subtitle}</p>
          <p>{article.abstract}</p>
          <div>
            {article.topic && (
                article.topic.map(topic => (
                    <span>{topic}</span>
                ))
            )}
          </div>
        </Link>

      </article>
  )
}
