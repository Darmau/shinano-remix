import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['zh', 'en', 'jp']
const defaultLocale = 'zh'

export function getLang (request: Request) {
  const acceptLanguage = request.headers.get('Accept-Language') || '';
  const headers = { 'accept-language': acceptLanguage };
  const languages = new Negotiator({ headers }).languages()

  return match(languages, locales, defaultLocale)
}
