const bannerCopy = {
  zh: {
    body: "你的评论对我持续更新非常重要。",
  },
  en: {
    body: "Your feedback keeps the updates coming.",
  },
  jp: {
    body: "あなたのコメントが更新の励みになります。",
  },
} as const;

export type BannerLocale = typeof bannerCopy;
export type BannerLang = keyof BannerLocale;

const isBannerLang = (lang: string): lang is BannerLang => {
  return lang === "zh" || lang === "en" || lang === "jp";
};

export const getBannerCopy = (lang: string) => {
  if (isBannerLang(lang)) {
    return bannerCopy[lang];
  }
  return bannerCopy.en;
};

export default bannerCopy;

