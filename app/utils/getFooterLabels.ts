export interface footerLabels {
  [key: string]: footerLinks[];
}

export interface footerLinks {
  name: string;
  items: Array<{name: string, href: string}>;
}

export default function getFooterLabels(labels: footerLabels, lang: string) {
  //检查是否有该语言的文案，没有则返回默认文案
  if (!labels[lang]) {
    return labels.zh;
  }
  return labels[lang];
}
