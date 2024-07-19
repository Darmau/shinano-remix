interface Article {
  id: number,
  title: string | null,
  slug: string | null,
  subtitle: string | null,
  abstract: string | null,
  is_featured: boolean | null,
  is_premium: boolean | null,
  cover: {
    alt: string,
    storage_key: string
  } | null,
  category: {
    title: string,
    slug: string
  } | null
}

export default function ArticleSection({articles}: { articles: Article[] }) {

  return (
      <div>{JSON.stringify(articles)}</div>
  )
}
