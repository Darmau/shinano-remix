// 本组件检测当前是否有登录，如果没有，显示登录按钮，如果有，显示用户信息

import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Form, Link, useLoaderData} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import NavbarText from "~/locales/navbar";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);
  const { data: {session}} = await supabase.auth.getSession();
  return json({
    session
  })
}

export default function Profile({lang}: {lang: string}) {
  const { session } = useLoaderData<typeof loader>();
  const label = getLanguageLabel(NavbarText, lang)

  if (!session) {
    return (
        <div className = "flex gap-4 justify-between">
          <Link
              to = {`${lang}/signup`}
              className = "flex-1 text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {label.signup}
          </Link>
          <Link
              to = {`${lang}/login`}
              className = "flex-1 text-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            {label.login}
          </Link>
        </div>
    )
  } else {
    return (
        <div className="lg:py-0 lg:flex lg:flex-col lg:items-end">
          <h3 className="text-sm font-medium text-zinc-700">{session.user.user_metadata.name}</h3>
          <p className="text-sm text-zinc-400">{session.user.user_metadata.email}</p>
        </div>
    )
  }
}
