import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

/**
 * Mapbox 语言代码映射
 * 将网站语言代码映射到 Mapbox 支持的语言代码
 */
export const mapboxLangMap: Record<string, string> = {
  'zh': 'zh-Hans', // 简体中文
  'en': 'en', // 英语
  'jp': 'ja', // 日语
};

/**
 * 获取 Mapbox 语言代码
 * @param lang 网站语言代码
 * @returns Mapbox 语言代码，默认为 'en'
 */
export function getMapboxLang(lang: string): string {
  return mapboxLangMap[lang] || 'en';
}

/**
 * 为 Mapbox 地图添加语言控制插件
 * @param map Mapbox 地图实例
 * @param lang 网站语言代码
 */
export function setupMapboxLanguage(map: mapboxgl.Map, lang: string): void {
  const mapboxLang = getMapboxLang(lang);
  const language = new MapboxLanguage({
    defaultLanguage: mapboxLang,
  });
  map.addControl(language);
}

