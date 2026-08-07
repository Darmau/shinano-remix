// 本组件检测当前是否有登录，如果没有，显示登录按钮，如果有，显示用户信息
import { Link, useRouteLoaderData } from "react-router";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ProfileText from "~/locales/profile";
import type {loader as rootLoader} from "~/root";

export default function Profile({lang}: {lang: string}) {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const session = rootData?.session;
  const label = getLanguageLabel(ProfileText, lang)

  if (!session) {
    return (
        <div className = "flex justify-end items-center">
          <Link
              to = {`${lang}/login`}
              className = "rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {label.login}
          </Link>
        </div>
    )
  } else {
    return (
        <div className = "flex gap-4 justify-end items-center">
          <Link to = {`${lang}/profile/${session.user.id}`} className = "lg:py-0 flex flex-col items-end">
            <h3 className = "text-sm font-medium text-zinc-700">{session.user.user_metadata.name}</h3>
            <p className = "text-xs text-zinc-400">{session.user.user_metadata.email}</p>
          </Link>
        </div>
    )
  }
}
