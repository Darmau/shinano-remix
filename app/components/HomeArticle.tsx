import {Article} from "~/types/Article";
import ArticleCard from "~/components/HomeArticleCard";

export default function ArticleSection({articles, prefix}: { prefix: string, articles: Article[] | null }) {
  if (!articles) return null;
  return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {articles.map(article => (
            <ArticleCard key={article.id} article={article} prefix={prefix} />
        ))}
      </div>
  )
}
