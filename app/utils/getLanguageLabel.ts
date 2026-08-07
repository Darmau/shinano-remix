// 本函数接收一个文案对象和文案标识，返回该语言下的文案
interface Label {
  [key: string]: string;
}

interface Labels {
  [key: string]: Label;
}

export default function getLanguageLabel(labels: Labels, lang: string): Label {
  //检查是否有该语言的文案，没有则返回默认文案
  if (!labels[lang]) {
    return labels.zh;
  }
  return labels[lang];
}
