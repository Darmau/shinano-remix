import {Link, useOutletContext} from "@remix-run/react";
import Labels from '~/locales/utils';
import getLanguageLabel from "~/utils/getLanguageLabel";

function generatePages(count: number, limit: number, page: number) {
  let pages = [];
  const total = Math.ceil(count / limit);
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (page <= 3) {
      pages = [1, 2, 3, 4, 5, '...', total];
    } else if (page >= total - 2) {
      pages = [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    } else {
      pages = [1, '...', page - 1, page, page + 1, '...', total];
    }
  }
  return pages;
}


export default function Pagination({count, limit, page, path}: {
  count: number,
  limit: number,
  page: number,
  path: string
}) {
  const {lang} = useOutletContext<{ lang: string }>();
  const pages = generatePages(count, limit, page);
  const label = getLanguageLabel(Labels, lang);

  return (
      <div className="flex justify-between">
        <div className="text-sm text-zinc-500">
          {label.total}: {count}
        </div>
        <nav className = "isolate inline-flex -space-x-px rounded-md" aria-label = "Pagination">
          {page === 1 ?
              <PrevPageDisabled/> :
              <PrevPageButton path = {path} page = {page} label = {label.prev_page}/>
          }
          {pages.map((p, index) => {
            if (p === '...') {
              return (
                  <span
                      key = {index}
                      className = "relative inline-flex items-center px-4 py-2 -ml-px text-zinc-700 ring-1 ring-inset ring-zinc-300"
                  >
                  ...
                </span>
              )
            } else {
              return (
                  <Link
                      prefetch = "intent"
                      key = {index}
                      className = "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 hover:text-violet-600 focus:z-20 focus:outline-offset-0"
                      to = {`${path}/${p}`}
                  >
                    {p}
                  </Link>
              )
            }
          })}
          {page === Math.ceil(count / limit) ?
              <NextPageDisabled/> :
              <NextPageButton path = {path} page = {page} label = {label.next_page}/>
          }
        </nav>
      </div>
  )
}


function PrevPageButton({path, page, label}: { path: string, page: number, label: string }) {
  return (
      <Link
          prefetch = "intent"
          to = {`${path}/${page - 1}`}
          className = "relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0"
      >
        <span className = "sr-only">{label}</span>
        <svg className = "h-5 w-5" viewBox = "0 0 20 20" fill = "currentColor" aria-hidden = "true">
          <path
              fillRule = "evenodd"
              d = "M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule = "evenodd"
          />
        </svg>
      </Link>
  )
}

function PrevPageDisabled() {
  return (
      <div
          className = "relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-300 ring-1 ring-inset ring-zinc-300 bg-zinc-50"
      >
        <svg className = "h-5 w-5" viewBox = "0 0 20 20" fill = "currentColor" aria-hidden = "true">
          <path
              fillRule = "evenodd"
              d = "M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule = "evenodd"
          />
        </svg>
      </div>
  )
}

function NextPageButton({path, page, label}: {path: string, page: number, label: string}) {
  return (
      <Link
          prefetch="intent"
          to = {`${path}/${page + 1}`}
          className = "relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0"
      >
        <span className = "sr-only">{label}</span>
        <svg className = "h-5 w-5" viewBox = "0 0 20 20" fill = "currentColor" aria-hidden = "true">
          <path
              fillRule = "evenodd"
              d = "M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule = "evenodd"
          />
        </svg>
      </Link>
  )
}

function NextPageDisabled() {
  return (
      <div
          className = "relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-300 ring-1 ring-inset ring-zinc-300 bg-zinc-50"
      >
        <svg className = "h-5 w-5" viewBox = "0 0 20 20" fill = "currentColor" aria-hidden = "true">
          <path
              fillRule = "evenodd"
              d = "M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule = "evenodd"
          />
        </svg>
      </div>
  )
}
