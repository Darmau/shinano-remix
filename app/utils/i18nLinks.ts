// 对于固定页面：接收当前语言
// 对于动态页面，接收当前语言和拥有的语言
export default function i18nLinks(baseUrl: string,currentLang: string, availableLangs: string[], url: string) {
  const canonical = {
    tagName: "link",
    rel: "canonical",
    href: `${baseUrl}/${currentLang}/${url}`,
  };
  // 从availableLangs中过滤掉当前语言
  const langs = availableLangs.filter((l) => l !== currentLang);

  const links = langs.map((l) => {
    return {
      tagName: "link",
      rel: "alternate",
      href: `${baseUrl}/${l}/${url}`,
      hrefLang: l,
    };
  });

  // 展开语言链接，返回数组
  return [canonical, ...links];
}
