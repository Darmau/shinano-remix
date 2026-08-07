const legalContent = {
  zh: {
    title: "使用协议",
    description: "阅读本站的使用协议，了解数据收集、隐私与评论规则等详细说明。"
  },
  en: {
    title: "Terms of Use",
    description: "Read the site's terms of use to understand data collection, privacy, and comment policies."
  },
  jp: {
    title: "利用規約",
    description: "当サイトの利用規約をお読みいただき、データ収集・プライバシー・コメントポリシーについてご確認ください。"
  }
};

export default function LegalText(lang: string) {
  if (lang !== "zh" && lang !== "en" && lang !== "jp") {
    return legalContent.zh;
  }
  return legalContent[lang];
}

