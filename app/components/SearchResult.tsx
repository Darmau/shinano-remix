import { Link } from "@remix-run/react";


interface SearchResultsProps {
  results: {
    indexUid: string,
    hits: Hit[]
  }[];
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

export default function SearchResults({ results }: SearchResultsProps) {
  const allHits = results.flatMap(result =>
      result.hits.map((hit: Hit) => ({
        ...hit,
        type: result.indexUid // 将indexUid作为type添加到每个hit中
      }))
  );
  const sortedHits = allHits.sort((a, b) => b._rankingScore - a._rankingScore);

  return (
      <div className="search-results">
        <h2>搜索结果</h2>
        {sortedHits.length === 0 ? (
            <p>没有找到相关结果</p>
        ) : (
            <ul className="space-y-4">
              {sortedHits.map((hit) => (
                  <li key={`${hit.type}-${hit.id}`} className="search-result-item">
                    <h3>
                      <Link to={`/${hit.lang === 1 ? 'zh' : hit.lang === 3 ? 'ja' : 'en'}/${hit.slug}`}>
                        {hit._formatted.title}
                      </Link>
                    </h3>
                    {hit._formatted.abstract && (
                        <p dangerouslySetInnerHTML={{ __html: hit._formatted.abstract }} />
                    )}
                    {hit._formatted.content_text && (
                        <p dangerouslySetInnerHTML={{ __html: hit._formatted.content_text }} />
                    )}
                    <p className="search-result-meta">
                      类型: {hit.type} | 相关度: {hit._rankingScore.toFixed(2)}
                    </p>
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
}
