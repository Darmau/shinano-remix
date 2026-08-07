export type SearchResult = {
  file_id: string;
  filename: string;
  score: number;
  attributes: Record<string, unknown>;
};
