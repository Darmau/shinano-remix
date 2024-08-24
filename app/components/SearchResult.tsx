import {Link, useOutletContext} from "@remix-run/react";

export interface SearchResultsProps {
  results: {
    indexUid: string,
    hits: Hit[]
  }[];
  langs: {
    [key: string]: string
  }[]
}

interface Hit {
  id: number,
  lang?: number,
  slug: string,
  title?: string,
  subtitle?: string,
  abstract?: string,
  content_text: string,
  topic?: Array<string>,
  _formatted: {
    id: string,
    slug: string,
    lang?: string,
    title?: string,
    subtitle?: string,
    abstract?: string,
    content_text: string,
    topic?: Array<string>,
  },
  _rankingScore: number,
}

// 接收一个id、语言对象数组、目标语言id、默认语言，如果目标语言id为undefined或者不存在，返回默认语言
function languageTag(langs: { [key: string]: string }[], id: number | undefined, fallback: string) {
  if (id === undefined) {
    return fallback;
  }
  return langs[id];
}

// 将内容type转换成存在的url。接收一个字符串，对于'article', 'thought'返回值不变，如果是'photo'，返回'album'
function typeToUrl(type: string) {
  if (type === 'photo') {
    return 'album';
  }
  return type;
}

export default function SearchResults({results, langs}: SearchResultsProps) {
  const allHits = results.flatMap(result =>
      result.hits.map((hit: Hit) => ({
        ...hit,
        type: result.indexUid // 将indexUid作为type添加到每个hit中
      }))
  );
  const sortedHits = allHits.sort((a, b) => b._rankingScore - a._rankingScore);
  const {lang} = useOutletContext<{ lang: string }>();

  return (
      <div>
        {sortedHits.length === 0 ? (
            <p className = "text-base text-gray-600">没有找到相关结果</p>
        ) : (
            <ul className = "divide-y divide-gray-200">
              {sortedHits.map((hit) => (
                  <li key = {`${hit.type}-${hit.id}`} className = "py-8 hover:opacity-70">
                    <Link
                        to = {`/${languageTag(langs, hit.lang, lang)}/${typeToUrl(hit.type)}/${hit.slug}`}
                        className="space-y-2"
                    >
                      {hit._formatted.title && (
                          <h3
                              className="text-lg font-semibold text-gray-900"
                              dangerouslySetInnerHTML = {{__html: hit._formatted.title}}/>
                      )}
                      {hit._formatted.abstract && (
                          <p
                              className="text-sm text-gray-600"
                              dangerouslySetInnerHTML = {{__html: hit._formatted.abstract}}/>
                      )}
                      {hit._formatted.content_text && (
                          <p dangerouslySetInnerHTML = {{__html: hit._formatted.content_text}}/>
                      )}
                    </Link>
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
}
