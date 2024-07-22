import ArticleCard from "~/components/HomeArticleCard";
import {Article} from "~/types/Article";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import CoverArticleCard from "~/components/CoverArticleCard";
import {useContext} from "react";
import {Language} from "~/root";

export default function ArticleSection({articles, prefix}: { prefix: string, articles: Article[] | null }) {
  const lang = useContext(Language);
  if (!articles) return null;

  const label = getLanguageLabel(HomepageText, lang);

  return (
      <div className="space-y-16 my-4 lg:space-y-20 lg:my-16">
        <div>
          <h2 className="text-2xl font-medium text-zinc-800 mb-6">{label.hero_title}</h2>
          <div className="flex flex-col gap-12">
            <CoverArticleCard article = {articles[0]} prefix={prefix} isTop={true} />
            <div className="flex flex-col gap-12 lg:gap-8 lg:flex-row">
              {articles.slice(1, 3).map((article) => (
                  <CoverArticleCard key = {article.id} article = {article} prefix={prefix} isTop={false} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-medium text-zinc-800 mb-6">{label.recent_article}</h2>
          <div className = "grid gap-12 grid-cols-1 md:grid-cols-2 lg:gap-8 lg:grid-cols-3">
            {articles.slice(3, 10).map(article => (
                <ArticleCard key = {article.id} article = {article} />
            ))}
          </div>
        </div>
      </div>
  )
}
