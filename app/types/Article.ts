export interface Article {
  id: number,
  title: string | null,
  slug: string | null,
  subtitle: string | null,
  abstract: string | null,
  is_featured: boolean | null,
  is_premium: boolean | null,
  topic: string[] | null,
  published_at: string | null,
  cover: {
    alt: string | null,
    storage_key: string
  } | null,
  category: {
    title: string,
    slug: string
  } | null
}
