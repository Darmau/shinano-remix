export interface Photo {
  id: number,
  title: string,
  slug: string,
  cover: {
    alt: string | null,
    storage_key: string,
    width: number,
    height: number
  },
  published_at: string,
  href: string
}
