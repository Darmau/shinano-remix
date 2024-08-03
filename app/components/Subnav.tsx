import {Link, useOutletContext} from "@remix-run/react";
import SubNavItems from "~/locales/subnav";

export default function Subnav ({active}: {active: string}) {
  const {lang} = useOutletContext<{lang: string}>();
  const subnavItems = SubNavItems(lang, active);

  return (
      <div className = "flex gap-8 justify-center p-4 border-b z-5 relative">
        {subnavItems.map((item, index) => {
          return (
              <Link
                  className = "text-sm hover:text-violet-700 hover:font-medium text-zinc-500"
                  to = {item.link}
                  key = {index}
              >
                {item.name}
              </Link>
          )
        })}
      </div>
  )
}
