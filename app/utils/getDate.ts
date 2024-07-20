// 根据语言以及iso string，生成符合当地使用习惯的日期格式字符串
export default function getDate(date: string, lang: string) {
  const time = new Date(date);
  let locale = '';

  switch (lang) {
    case 'zh':
      locale = 'zh-Hans-CN-u-ca-gregory';
      break
    case 'en':
      locale = 'en-US-u-hc-h12';
      break;
    case 'jp':
      locale = 'ja-JP-u-ca-japanese';
      break;
    default: locale = 'en-US-u-hc-h12'
  }

  // 创建格式化选项
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  };

  // 使用Intl.DateTimeFormat进行格式化
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(time);
}
