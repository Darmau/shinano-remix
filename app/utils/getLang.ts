export function getLang (request: Request) {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];

  if (!langs.includes(lang)) {
    return 'zh'
  }

  return lang;
}

const langs = ['zh', 'en', 'jp'];
