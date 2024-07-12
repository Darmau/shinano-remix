// 本函数接收一个文案对象和文案标识，返回该语言下的文案
interface Label {
  [key: string]: string;
}

interface Labels {
  [key: string]: Label;
}

export default function getLanguageLabel(labels: Labels, lang: string): Label {
  return labels[lang];
}
