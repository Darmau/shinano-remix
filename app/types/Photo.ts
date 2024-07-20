export interface Photo {
  id: number,
  title: string,
  slug: string,
  cover: {
    alt: string | null,
    storage_key: string
  },
  published_at: string,
}
