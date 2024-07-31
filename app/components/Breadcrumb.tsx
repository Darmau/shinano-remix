import {HomeIcon} from "@heroicons/react/24/solid";
import {Link, useOutletContext} from "@remix-run/react";

export interface BreadcrumbProps {
  name: string;
  to: string;
  current? : boolean;
}

export default function Breadcrumb({pages}: {pages: BreadcrumbProps[]}) {
  const {lang} = useOutletContext<{lang: string}>();
  return (
      <nav aria-label="Breadcrumb" className="flex my-4">
        <ol className="flex items-center space-x-4">
          <li>
            <div>
              <Link to={`/${lang}`} className="text-gray-400 hover:text-gray-500">
                <HomeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              </Link>
            </div>
          </li>
          {pages.map((page) => (
              <li key={page.name}>
                <div className="flex items-center">
                  <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="h-5 w-5 flex-shrink-0 text-gray-300"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link
                      to={`/${lang}/${page.to}`}
                      aria-current={page.current ? 'page' : undefined}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {page.name}
                  </Link>
                </div>
              </li>
          ))}
        </ol>
      </nav>
  )
}
