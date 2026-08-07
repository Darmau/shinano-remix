/**
 * Utility functions for generating Schema.org structured data
 * 用于生成 Schema.org 结构化数据的工具函数
 */

import type { Article } from "~/types/Article";
import type { Image } from "~/types/Image";

// 站点作者信息
const SITE_AUTHOR = {
  "@type": "Person" as const,
  name: "李大毛",
  url: "https://darmau.co",
  sameAs: [
    "https://x.com/darmau8964",
    "https://github.com/Darmau",
    "https://www.threads.com/@uedashishi",
    "https://www.youtube.com/@darmau",
  ],
};

// 站点组织信息
const SITE_PUBLISHER = {
  "@type": "Organization" as const,
  name: "李大毛的个人网站",
  url: "https://darmau.co",
  logo: {
    "@type": "ImageObject" as const,
    url: "https://darmau.co/logo.svg",
  },
};

/**
 * 生成网站级别的结构化数据
 * Generate structured data for the WebSite entity
 */
export function generateWebsiteStructuredData(params: {
  baseUrl: string;
  name: string;
  alternateName?: string[];
  inLanguage?: string;
}) {
  const { baseUrl, name, alternateName, inLanguage } = params;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    alternateName: alternateName && alternateName.length > 0 ? alternateName : undefined,
    url: baseUrl,
    inLanguage,
    publisher: SITE_PUBLISHER,
  };
}

/**
 * 生成文章的结构化数据
 * Generate structured data for an article
 */
export function generateArticleStructuredData(params: {
  article: Article & { updated_at?: string | null };
  baseUrl: string;
  imgPrefix: string;
  lang: string;
  url: string;
}) {
  const { article, baseUrl, imgPrefix, lang, url } = params;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.abstract || article.subtitle || "",
    author: SITE_AUTHOR,
    publisher: SITE_PUBLISHER,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    url,
    inLanguage: lang,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  // 添加封面图片
  if (article.cover) {
    structuredData.image = {
      "@type": "ImageObject",
      url: `${imgPrefix}/cdn-cgi/image/format=jpeg,width=960/${article.cover.storage_key}`,
      width: article.cover.width,
      height: article.cover.height,
      caption: article.cover.alt || article.title,
    };
  }

  // 添加分类
  if (article.category) {
    structuredData.articleSection = article.category.title;
  }

  // 添加标签
  if (article.topic && article.topic.length > 0) {
    structuredData.keywords = article.topic.join(", ");
  }

  // 添加评论数
  if (article.comments && article.comments.length > 0) {
    structuredData.commentCount = article.comments[0].count;
  }

  // 添加浏览量
  if (article.page_view) {
    structuredData.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: article.page_view,
    };
  }

  // Premium 文章支持
  if (article.is_premium) {
    structuredData.isAccessibleForFree = false;
    structuredData.hasPart = {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".article-content",
    };
    structuredData.isPartOf = {
      "@type": ["CreativeWork", "Product"],
      name: "Premium Membership",
      productID: "premium-article",
    };
  } else {
    structuredData.isAccessibleForFree = true;
  }

  return structuredData;
}

/**
 * 生成相册的结构化数据
 * Generate structured data for an album (photo gallery)
 */
export function generateAlbumStructuredData(params: {
  album: {
    id: number;
    title: string;
    slug: string;
    abstract: string | null;
    published_at: string;
    page_view: number;
    images: Array<{
      id: number;
      alt: string | null;
      caption: string | null;
      storage_key: string;
      width: number;
      height: number;
      exif: any;
      location: string | null;
      latitude: number | null;
      longitude: number | null;
      date: string | null;
      taken_at: string | null;
    }>;
    comments?: { count: number }[];
  };
  baseUrl: string;
  imgPrefix: string;
  lang: string;
  url: string;
}) {
  const { album, imgPrefix, lang, url } = params;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.title,
    description: album.abstract,
    author: SITE_AUTHOR,
    publisher: SITE_PUBLISHER,
    datePublished: album.published_at,
    url,
    inLanguage: lang,
  };

  // 添加浏览量
  if (album.page_view) {
    structuredData.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: album.page_view,
    };
  }

  // 添加评论数
  if (album.comments && album.comments.length > 0) {
    structuredData.commentCount = album.comments[0].count;
  }

  // 添加所有图片
  if (album.images && album.images.length > 0) {
    structuredData.associatedMedia = album.images.map((image) => {
      const imageObject: any = {
        "@type": "ImageObject",
        contentUrl: `${imgPrefix}/${image.storage_key}`,
        url: `${imgPrefix}/cdn-cgi/image/format=jpeg,width=960/${image.storage_key}`,
        width: image.width,
        height: image.height,
        caption: image.caption || image.alt,
        name: image.alt,
      };

      // 添加拍摄日期
      if (image.taken_at || image.date) {
        imageObject.dateCreated = image.taken_at || image.date;
      }

      // 添加 EXIF 数据
      if (image.exif) {
        imageObject.exifData = image.exif;
      }

      // 添加地理位置信息
      if (image.latitude && image.longitude) {
        imageObject.contentLocation = {
          "@type": "Place",
          geo: {
            "@type": "GeoCoordinates",
            latitude: image.latitude,
            longitude: image.longitude,
          },
        };

        if (image.location) {
          imageObject.contentLocation.name = image.location;
        }
      }

      return imageObject;
    });

    // 设置封面图片
    if (album.images[0]) {
      structuredData.image = {
        "@type": "ImageObject",
        url: `${imgPrefix}/cdn-cgi/image/format=jpeg,width=960/${album.images[0].storage_key}`,
        width: album.images[0].width,
        height: album.images[0].height,
      };
    }
  }

  return structuredData;
}

/**
 * 生成想法的结构化数据
 * Generate structured data for a thought (social media posting)
 */
export function generateThoughtStructuredData(params: {
  thought: {
    id: number;
    slug: string;
    content_text: string;
    content_html: string | null;
    created_at: string;
    location: string | null;
    page_view: number;
    images?: Array<{
      alt: string | null;
      storage_key: string;
      width: number;
      height: number;
    }>;
    comments?: { count: number }[];
  };
  baseUrl: string;
  imgPrefix: string;
  lang: string;
  url: string;
}) {
  const { thought, imgPrefix, lang, url } = params;

  // 使用前100个字符作为标题
  const headline = thought.content_text.slice(0, 100);

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline,
    articleBody: thought.content_text,
    author: SITE_AUTHOR,
    publisher: SITE_PUBLISHER,
    datePublished: thought.created_at,
    url,
    inLanguage: lang,
  };

  // 添加位置信息
  if (thought.location) {
    structuredData.contentLocation = {
      "@type": "Place",
      name: thought.location,
    };
  }

  // 添加图片
  if (thought.images && thought.images.length > 0) {
    if (thought.images.length === 1) {
      structuredData.image = {
        "@type": "ImageObject",
        url: `${imgPrefix}/cdn-cgi/image/format=jpeg,width=800/${thought.images[0].storage_key}`,
        width: thought.images[0].width,
        height: thought.images[0].height,
        caption: thought.images[0].alt,
      };
    } else {
      structuredData.image = thought.images.map((image) => ({
        "@type": "ImageObject",
        url: `${imgPrefix}/cdn-cgi/image/format=jpeg,width=800/${image.storage_key}`,
        width: image.width,
        height: image.height,
        caption: image.alt,
      }));
    }
  }

  // 添加浏览量
  if (thought.page_view) {
    structuredData.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: thought.page_view,
    };
  }

  // 添加评论数
  if (thought.comments && thought.comments.length > 0) {
    structuredData.commentCount = thought.comments[0].count;
  }

  return structuredData;
}

/**
 * 生成面包屑导航的结构化数据
 * Generate structured data for breadcrumb navigation
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

/**
 * 生成评论的结构化数据
 * Generate structured data for comments
 */
export function generateCommentStructuredData(params: {
  comments: Array<{
    id: number;
    content_text: string;
    created_at: string;
    user_id: number | null;
    name: string | null;
    is_anonymous: boolean;
    reply_to: number | null;
    users: {
      id: number;
      name: string;
    } | null;
  }>;
  baseUrl: string;
  articleUrl: string;
}) {
  const { comments, articleUrl } = params;

  return comments.map((comment) => {
    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "Comment",
      "@id": `${articleUrl}#comment-${comment.id}`,
      text: comment.content_text,
      dateCreated: comment.created_at,
      author: comment.is_anonymous
        ? {
            "@type": "Person",
            name: comment.name || "匿名用户",
          }
        : {
            "@type": "Person",
            name: comment.users?.name || "用户",
          },
    };

    // 如果是回复，添加父评论引用
    if (comment.reply_to) {
      structuredData.parentItem = {
        "@type": "Comment",
        "@id": `${articleUrl}#comment-${comment.reply_to}`,
      };
    }

    return structuredData;
  });
}

// `users` is typed as unknown because the comments SQL select asks for a
// non-existent `website` column on `users`, which makes Supabase produce a
// SelectQueryError. Runtime returns a usable object; the SQL bug is tracked
// separately.
type RawSupabaseComment = {
  id: number;
  content_text: string | null;
  created_at: string | null;
  name: string | null;
  is_anonymous: boolean | null;
  reply_to: { id: number } | null;
  users: unknown;
};

export function buildCommentsStructuredData(
  comments: ReadonlyArray<RawSupabaseComment>,
  baseUrl: string,
  articleUrl: string,
) {
  if (comments.length === 0) return [];
  return generateCommentStructuredData({
    comments: comments.map((comment) => ({
      id: comment.id,
      content_text: comment.content_text ?? "",
      created_at: comment.created_at ?? "",
      user_id: null,
      name: comment.name,
      is_anonymous: comment.is_anonymous ?? false,
      reply_to: comment.reply_to?.id ?? null,
      users: comment.users as { id: number; name: string } | null,
    })),
    baseUrl,
    articleUrl,
  });
}

/**
 * 生成个人资料页面的结构化数据
 * Generate structured data for about/person page
 */
export function generatePersonStructuredData(params: {
  name: string;
  description: string;
  image: {
    url: string;
    width: number;
    height: number;
  };
  url: string;
  sameAs?: string[];
}) {
  const { name, description, image, url, sameAs } = params;

  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "ProfilePage"],
    url,
    mainEntity: {
      "@type": "Person",
      name,
      description,
      image: {
        "@type": "ImageObject",
        url: image.url,
        width: image.width,
        height: image.height,
      },
      url,
      sameAs: sameAs || [
        "https://x.com/darmau8964",
        "https://github.com/Darmau",
        "https://www.threads.com/@uedashishi",
        "https://www.youtube.com/@darmau",
      ],
    },
  };
}

/**
 * 将结构化数据序列化为 JSON-LD script 标签
 * Serialize structured data to JSON-LD script tag
 */
export function serializeStructuredData(data: any): string {
  return JSON.stringify(data, null, 2);
}
