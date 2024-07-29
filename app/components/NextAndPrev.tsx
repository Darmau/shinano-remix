import {Link, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ArticleText from '~/locales/article';

export interface NeighboringPost {
  title: string,
  slug: string,
}

export default function NextAndPrev({type, next, prev}: {
  type: string,
  next: NeighboringPost | null,
  prev: NeighboringPost | null
}) {
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ArticleText, lang);
  return (
      <div className = "flex justify-between items-center flex-wrap border-t pt-8 mt-12">
        {prev && (
            <div className="flex flex-col gap-2">
              <h3 className = "font-medium text-violet-900 text-sm">{label.previous}</h3>
              <Link
                  to = {`/${lang}/${type}/${prev.slug}`}
                  prefetch = "viewport"
              >
                <h4 className = "font-medium text-zinc-800 text-lg">
                  {prev.title}
                </h4>
              </Link>
            </div>
        )}
        {next && (
            <div className = "flex flex-col gap-2 items-end text-right ml-auto">
              <h3 className = "font-medium text-violet-900 text-sm">{label.next}</h3>
              <Link
                  prefetch = "viewport"
                  to = {`/${lang}/${type}/${next.slug}`}
              >
                <h4 className = "font-medium text-zinc-800 text-lg">
                  {next.title}
                </h4>
              </Link>
            </div>
        )}
      </div>
  )
}
