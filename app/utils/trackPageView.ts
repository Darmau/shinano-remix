/**
 * 跟踪页面访问量，使用 localStorage 防止重复计数
 * @param contentType 内容类型：'article' | 'album' | 'thought'
 * @param contentId 内容ID
 * @param supabase Supabase 客户端实例
 * @param onSuccess 成功回调，接收新的阅读量
 * @returns Promise<boolean> 是否成功记录了访问
 */

import type { SupabaseClient } from "@supabase/supabase-js";

type ContentType = 'article' | 'album' | 'thought';
type RpcFunctionName = 'article_page_view' | 'photo_page_view' | 'thought_page_view';

const STORAGE_KEY_PREFIX = 'page_view_';
const VIEW_EXPIRY_HOURS = 24; // 24小时内不重复计数

interface PageViewRecord {
  contentId: number;
  timestamp: number;
  contentType: ContentType;
}

function getStorageKey(contentType: ContentType, contentId: number): string {
  return `${STORAGE_KEY_PREFIX}${contentType}_${contentId}`;
}

function getRpcFunctionName(contentType: ContentType): RpcFunctionName {
  const map: Record<ContentType, RpcFunctionName> = {
    article: 'article_page_view',
    album: 'photo_page_view',
    thought: 'thought_page_view',
  };
  return map[contentType];
}

function getRpcParamName(contentType: ContentType): string {
  const map: Record<ContentType, string> = {
    article: 'article_id',
    album: 'photo_id',
    thought: 'thought_id',
  };
  return map[contentType];
}

/**
 * 检查是否在有效期内已访问过
 */
function hasViewedRecently(contentType: ContentType, contentId: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const storageKey = getStorageKey(contentType, contentId);
    const recordStr = localStorage.getItem(storageKey);
    
    if (!recordStr) return false;
    
    const record: PageViewRecord = JSON.parse(recordStr);
    const now = Date.now();
    const expiryTime = VIEW_EXPIRY_HOURS * 60 * 60 * 1000; // 转换为毫秒
    
    // 检查是否是相同的内容ID，且时间在有效期内
    if (record.contentId === contentId && 
        record.contentType === contentType &&
        (now - record.timestamp) < expiryTime) {
      return true;
    }
    
    // 如果已过期，清除记录
    localStorage.removeItem(storageKey);
    return false;
  } catch (error) {
    console.error('读取访问记录失败:', error);
    return false;
  }
}

/**
 * 记录访问时间戳
 */
function recordView(contentType: ContentType, contentId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const storageKey = getStorageKey(contentType, contentId);
    const record: PageViewRecord = {
      contentId,
      timestamp: Date.now(),
      contentType,
    };
    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch (error) {
    console.error('保存访问记录失败:', error);
  }
}

/**
 * 清理过期的访问记录（可选，用于维护）
 */
export function cleanupExpiredViews(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key);
      }
    }
    
    const now = Date.now();
    const expiryTime = VIEW_EXPIRY_HOURS * 60 * 60 * 1000;
    
    keys.forEach(key => {
      try {
        const recordStr = localStorage.getItem(key);
        if (recordStr) {
          const record: PageViewRecord = JSON.parse(recordStr);
          if ((now - record.timestamp) >= expiryTime) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // 如果解析失败，删除无效记录
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清理过期记录失败:', error);
  }
}

/**
 * 跟踪页面访问量
 */
export async function trackPageView(
  contentType: ContentType,
  contentId: number,
  supabase: SupabaseClient,
  onSuccess?: (newPageView: number) => void
): Promise<boolean> {
  // 检查是否在有效期内已访问过
  if (hasViewedRecently(contentType, contentId)) {
    return false;
  }
  
  // 调用 RPC 函数增加阅读量
  try {
    const rpcFunctionName = getRpcFunctionName(contentType);
    const rpcParamName = getRpcParamName(contentType);
    
    const { data, error } = await supabase.rpc(rpcFunctionName, {
      [rpcParamName]: contentId,
    });
    
    if (error) {
      console.error('阅读量增加失败:', error);
      return false;
    }
    
    if (data !== null && typeof data === 'number') {
      // 记录访问时间戳
      recordView(contentType, contentId);
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess(data);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('跟踪页面访问失败:', error);
    return false;
  }
}

