import {Article} from "~/types/Article";

export default function ArticleSection({articles}: { articles: Article[] | null }) {
  if (!articles) return null;

  return (
      <div className="space-y-16 my-4 lg:space-y-20 lg:my-16">
        待更新
      </div>
  )
}
