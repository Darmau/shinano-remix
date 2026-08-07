export type GalleryItemType = "photo" | "thought";

export interface GalleryMediaImage {
  id: string;
  alt: string | null;
  storage_key: string;
  width: number;
  height: number;
}

export interface GalleryItem {
  type: GalleryItemType;
  id: number;
  slug: string | null;
  title: string;
  content: string;
  createdAt: string;
  images: GalleryMediaImage[];
}

export interface AlbumRow {
  id: number;
  title: string | null;
  slug: string | null;
  page_view: number | null;
  content_text: string | null;
  published_at: string | null;
  created_at: string | null;
  cover: {
    id: string | number;
    alt: string | null;
    storage_key: string;
    width: number | null;
    height: number | null;
  } | null;
  language: {
    lang: string | null;
  } | null;
  photo_image?:
    | {
      order?: number | null;
      image: {
        id: string | number;
        alt: string | null;
        storage_key: string;
        width: number | null;
        height: number | null;
      } | null;
    }[]
    | null;
}

export interface ThoughtRow {
  id: number;
  slug: string | null;
  content_text: string | null;
  created_at: string | null;
  page_view: number | null;
  push_to_gallery?: boolean | null;
  thought_image?:
    | {
      order?: number | null;
      image: {
        id: string | number;
        alt: string | null;
        storage_key: string;
        width: number | null;
        height: number | null;
      } | null;
    }[]
    | null;
}
