import type {Article} from "~/types/Article";
import type {Image} from "~/types/Image";
import {isJsonValue} from "~/utils/json";

export type YearCount = {
  year: number;
  count: number;
};

export type CategoryCount = {
  title: string;
  slug: string;
  count: number;
};

export type CategorySummary = {
  title: string;
  slug: string;
  description: string | null;
  cover: Image | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export const normalizeArticles = (rows: unknown): Article[] => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const normalized: Article[] = [];

  rows.forEach(item => {
    if (!isRecord(item)) {
      return;
    }

    const id = item["id"];
    const title = item["title"];
    const slug = item["slug"];

    if (typeof id !== "number" || typeof title !== "string" || typeof slug !== "string") {
      return;
    }

    const categoryValue = item["category"];
    const category = isRecord(categoryValue)
        ? {
          title: typeof categoryValue["title"] === "string" ? categoryValue["title"] as string : "",
          slug: typeof categoryValue["slug"] === "string" ? categoryValue["slug"] as string : "",
        }
        : {title: "", slug: ""};

    const coverValue = item["cover"];
    const cover = isRecord(coverValue) && typeof coverValue["storage_key"] === "string"
        ? {
          alt: typeof coverValue["alt"] === "string" ? coverValue["alt"] as string : null,
          storage_key: coverValue["storage_key"] as string,
          width: typeof coverValue["width"] === "number" ? coverValue["width"] as number : 0,
          height: typeof coverValue["height"] === "number" ? coverValue["height"] as number : 0,
        }
        : null;

    const commentsValue = item["comments"];
    const comments = Array.isArray(commentsValue)
        ? commentsValue
            .map(comment => {
              if (!isRecord(comment)) {
                return null;
              }
              const count = comment["count"];
              return typeof count === "number" ? {count} : null;
            })
            .filter((comment): comment is { count: number } => comment !== null)
        : [];

    const topicValue = item["topic"];
    const contentJson = item["content_json"];

    normalized.push({
      id,
      title,
      slug,
      subtitle: typeof item["subtitle"] === "string" ? item["subtitle"] as string : null,
      abstract: typeof item["abstract"] === "string" ? item["abstract"] as string : null,
      is_featured: typeof item["is_featured"] === "boolean" ? item["is_featured"] as boolean : null,
      is_premium: typeof item["is_premium"] === "boolean" ? item["is_premium"] as boolean : null,
      topic: Array.isArray(topicValue)
          ? topicValue.filter((entry): entry is string => typeof entry === "string")
          : null,
      published_at: typeof item["published_at"] === "string" ? item["published_at"] as string : new Date(0).toISOString(),
      page_view: typeof item["page_view"] === "number" ? item["page_view"] as number : 0,
      cover,
      category,
      comments: comments.length > 0 ? comments : [{count: 0}],
      content_json: isJsonValue(contentJson) ? contentJson : undefined,
    } satisfies Article);
  });

  return normalized;
};

export const normalizeYearCounts = (value: unknown): YearCount[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
      .map(item => {
        if (!isRecord(item)) {
          return null;
        }
        const yearValue = item["year"];
        const count = item["count"];
        
        // RPC 函数返回的 year 可能是 string 或 number，需要统一处理
        let year: number;
        if (typeof yearValue === "number") {
          year = yearValue;
        } else if (typeof yearValue === "string") {
          const parsedYear = parseInt(yearValue, 10);
          if (isNaN(parsedYear)) {
            return null;
          }
          year = parsedYear;
        } else {
          return null;
        }
        
        if (typeof count !== "number") {
          return null;
        }
        
        return {year, count};
      })
      .filter((entry): entry is YearCount => entry !== null);
};

export const normalizeCategoryCounts = (value: unknown): CategoryCount[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
      .map(item => {
        if (!isRecord(item)) {
          return null;
        }
        const title = item["title"];
        const slug = item["slug"];
        const count = item["count"];
        if (typeof title !== "string" || typeof slug !== "string" || typeof count !== "number") {
          return null;
        }
        return {title, slug, count};
      })
      .filter((entry): entry is CategoryCount => entry !== null);
};

export const normalizeCategorySummary = (value: unknown): CategorySummary | null => {
  if (!isRecord(value)) {
    return null;
  }

  const title = value["title"];
  const slug = value["slug"];
  if (typeof title !== "string" || typeof slug !== "string") {
    return null;
  }

  const coverValue = value["cover"];
  const cover = isRecord(coverValue) && typeof coverValue["storage_key"] === "string"
      ? {
        alt: typeof coverValue["alt"] === "string" ? coverValue["alt"] as string : null,
        storage_key: coverValue["storage_key"] as string,
        width: typeof coverValue["width"] === "number" ? coverValue["width"] as number : 0,
        height: typeof coverValue["height"] === "number" ? coverValue["height"] as number : 0,
      }
      : null;

  return {
    title,
    slug,
    description: typeof value["description"] === "string" ? value["description"] as string : null,
    cover,
  };
};
