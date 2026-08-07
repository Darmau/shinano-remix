export type FeedEnclosure = {
  url: string;
  type: string;
  length: string;
};

export type RichRssEntry = {
  title: string | null;
  link: string;
  description: string | null;
  pubDate: string | null;
  author: string | null;
  guid: number;
  content: string;
  category: string | null;
  enclosure?: FeedEnclosure;
};
