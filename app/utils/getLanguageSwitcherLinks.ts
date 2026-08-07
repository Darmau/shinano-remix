/**
 * 根据当前路径和可用语言生成语言切换链接
 * @param currentLang 当前语言
 * @param currentPath 当前路径（不包含语言前缀，例如 "article/my-article" 或 "" 表示首页）
 * @param availableLangs 当前内容可用的语言列表（如果有）
 * @param allLangs 所有支持的语言列表
 * @returns 语言切换链接的 Map，key 为语言代码，value 为链接路径
 */
export function getLanguageSwitcherLinks(
  currentLang: string,
  currentPath: string,
  availableLangs?: string[],
  allLangs: string[] = ['zh', 'en', 'jp']
): Map<string, string> {
  const links = new Map<string, string>();
  
  // 获取所有需要生成链接的语言（排除当前语言）
  const targetLangs = allLangs.filter(lang => lang !== currentLang);
  
  // 判断是否为动态内容页面（需要检查可用语言）
  const isDynamicContent = currentPath.startsWith('article/') || 
                          currentPath.startsWith('album/') || 
                          currentPath.startsWith('thought/');
  
  for (const lang of targetLangs) {
    // 如果是动态内容页面且有可用语言信息
    if (isDynamicContent && availableLangs && availableLangs.length > 0) {
      if (availableLangs.includes(lang)) {
        // 该语言有对应内容，生成相同路径的链接
        links.set(lang, `/${lang}/${currentPath}`);
      } else {
        // 该语言没有对应内容，跳转到该语言的首页
        links.set(lang, `/${lang}`);
      }
    } else if (!currentPath) {
      // 首页，直接跳转到对应语言的首页
      links.set(lang, `/${lang}`);
    } else {
      // 固定页面或其他情况，假设所有语言都有对应内容
      links.set(lang, `/${lang}/${currentPath}`);
    }
  }
  
  return links;
}

