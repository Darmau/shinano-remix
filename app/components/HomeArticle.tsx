import ArticleCard from "~/components/HomeArticleCard";
import {Article} from "~/types/Article";

export default function ArticleSection({articles, prefix, lang}: { prefix: string, articles: Article[] | null, lang: string }) {
  if (!articles) return null;
  return (
      <div>
        <div className = "grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {articles.slice(0, 3).map(article => (
              <ArticleCard key = {article.id} article = {article} prefix = {prefix} lang={lang}/>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {articles.slice(3, 10).map(article => (
              <ArticleCard key = {article.id} article = {article} prefix = {prefix} lang={lang}/>
          ))}
        </div>
      </div>
  )
}
