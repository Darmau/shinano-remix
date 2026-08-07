export default function getDate(date: string, lang: string) {
  const time = new Date(date);
  let locale = '';

  switch (lang) {
    case 'zh':
      locale = 'zh-Hans-CN';
      break
    case 'en':
      locale = 'en-US';
      break;
    case 'jp':
      locale = 'ja-JP';
      break;
    default: locale = 'en-US'
  }

  // 创建格式化选项
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // 使用Intl.DateTimeFormat进行格式化
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(time);
}
