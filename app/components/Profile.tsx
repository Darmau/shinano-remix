// 本组件检测当前是否有登录，如果没有，显示登录按钮，如果有，显示用户信息
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Link, useLoaderData} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ProfileText from "~/locales/profile";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const { supabase } = createClient(request, context);
  const { data: {session}} = await supabase.auth.getSession();
  return json({
    session
  })
}

export default function Profile({lang}: {lang: string}) {
  const { session } = useLoaderData<typeof loader>();
  const label = getLanguageLabel(ProfileText, lang)

  if (!session) {
    return (
        <div className = "flex gap-4 justify-between items-center">
          <Link to={`${lang}/search`} reloadDocument>
            <MagnifyingGlassIcon className = "w-6 h-6 text-gray-500 hover:text-violet-700"/>
          </Link>
          <Link
              to = {`${lang}/signup`}
              className = "flex-1 text-center break-keep rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {label.signup}
          </Link>
          <Link
              to = {`${lang}/login`}
              className = "flex-1 text-center break-keep rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            {label.login}
          </Link>
        </div>
    )
  } else {
    return (
        <div className = "flex gap-4 justify-between items-center">
          <Link to={`${lang}/search`} reloadDocument>
            <MagnifyingGlassIcon className = "w-6 h-6 text-gray-500 hover:text-violet-700"/>
          </Link>
          <div className = "lg:py-0 flex flex-col items-end">
            <h3 className = "text-sm font-medium text-zinc-700">{session.user.user_metadata.name}</h3>
            <p className = "text-xs text-zinc-400">{session.user.user_metadata.email}</p>
          </div>
        </div>
    )
  }
}
