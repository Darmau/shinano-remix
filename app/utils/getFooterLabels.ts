interface Labels {
  [key: string]: Array<{name: string, items: Array<{[key: string]: string}>}>;
}

export default function getFooterLabels(labels: Labels, lang: string) {
  //检查是否有该语言的文案，没有则返回默认文案
  if (!labels[lang]) {
    return labels.zh;
  }
  return labels[lang];
}
