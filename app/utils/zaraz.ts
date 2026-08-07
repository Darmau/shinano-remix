/**
 * Zaraz 事件追踪工具
 * 用于记录用户交互事件到 Cloudflare Zaraz
 */

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

/**
 * 事件类型枚举
 */
export const ZarazEvents = {
  // 分享相关
  COPY_LINK: 'copy_link',
  SHARE_X: 'share_x',
  
  // 摄影相关
  VIEW_FULLSCREEN: 'view_fullscreen',
  
  // 内容交互
  LOAD_MORE: 'load_more',
  TRANSLATE: 'translate',
  
  // RSS 相关
  RSS_CLICK: 'rss_click',
} as const;

export type ZarazEventName = typeof ZarazEvents[keyof typeof ZarazEvents];

/**
 * 内容类型
 */
export type ContentType = 'article' | 'album' | 'thought' | 'book';

/**
 * RSS 类型
 */
export type RSSType = 'article' | 'photo' | 'thought';

/**
 * 发送 Zaraz 事件
 * @param eventName 事件名称
 * @param properties 事件属性
 */
export function trackZarazEvent(
  eventName: ZarazEventName,
  properties?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.zaraz) {
    return;
  }
  
  window.zaraz.track(eventName, properties);
}

/**
 * 记录分享事件 - 复制链接
 * @param title 页面标题
 * @param contentType 内容类型
 */
export function trackCopyLink(title: string, contentType: ContentType): void {
  trackZarazEvent(ZarazEvents.COPY_LINK, {
    title,
    content_type: contentType,
  });
}

/**
 * 记录分享事件 - 分享到 X/Twitter
 * @param title 页面标题
 * @param contentType 内容类型
 */
export function trackShareX(title: string, contentType: ContentType): void {
  trackZarazEvent(ZarazEvents.SHARE_X, {
    title,
    content_type: contentType,
  });
}

/**
 * 记录查看大图事件
 * @param title 相册标题
 */
export function trackViewFullscreen(title: string): void {
  trackZarazEvent(ZarazEvents.VIEW_FULLSCREEN, {
    title,
  });
}

/**
 * 记录加载更多事件
 * @param contentType 内容类型
 */
export function trackLoadMore(contentType: ContentType): void {
  trackZarazEvent(ZarazEvents.LOAD_MORE, {
    content_type: contentType,
  });
}

/**
 * 记录翻译事件
 */
export function trackTranslate(): void {
  trackZarazEvent(ZarazEvents.TRANSLATE, {});
}

/**
 * 记录 RSS 链接点击事件
 * @param rssType RSS 类型
 */
export function trackRSSClick(rssType: RSSType): void {
  trackZarazEvent(ZarazEvents.RSS_CLICK, {
    rss_type: rssType,
  });
}

