import type {Json} from "~/types/supabase";

export interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  abstract: string | null;
  is_featured?: boolean | null;
  is_premium?: boolean | null;
  topic: string[] | null;
  published_at: string;
  page_view: number;
  cover: {
    alt: string | null;
    storage_key: string;
    width: number;
    height: number;
  } | null;
  category: {
    title: string;
    slug: string;
  };
  comments: { count: number }[];
  content_json?: Json;
}
