import ArticleCard from "~/components/HomeArticleCard";
import {Article} from "~/types/Article";
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import CoverArticleCard from "~/components/CoverArticleCard";

export default function ArticleSection({articles, prefix, lang}: { prefix: string, articles: Article[] | null, lang: string }) {
  if (!articles) return null;

  const label = getLanguageLabel(HomepageText, lang);

  return (
      <div className="space-y-16 my-4 lg:my-16">
        <div>
          <h2 className="px-2 lg:px-4 text-2xl font-medium text-zinc-800 mb-6">{label.hero_title}</h2>
          <div className = "grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
            <CoverArticleCard
                article = {articles[0]}
                prefix = {prefix}
            />
            {articles.slice(1, 3).map(article => (
                <ArticleCard
                    key = {article.id}
                    article = {article}
                    prefix = {prefix}
                    lang = {lang}
                    type="featured"
                />
            ))}
          </div>
        </div>
        <div>
          <h2 className="px-2 lg:px-4 text-2xl font-medium text-zinc-800 mb-6">{label.recent_article}</h2>
          <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(3, 10).map(article => (
                <ArticleCard key = {article.id} article = {article} prefix = {prefix} lang={lang} type="default"/>
            ))}
          </div>
        </div>
      </div>
  )
}
