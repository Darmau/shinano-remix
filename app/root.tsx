import {Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useLoaderData} from "@remix-run/react";
import "./tailwind.css";
import Navbar from "~/components/Navbar";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createBrowserClient, createServerClient, parseCookieHeader} from "@supabase/ssr";
import {createSupabaseServerClient} from "~/utils/supabase.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];

  if (!['zh-CN', 'en', 'jp'].includes(lang)) {
    // 检测浏览器语言
    const acceptLanguage = request.headers.get("Accept-Language");
    let detectedLang = 'zh-CN';

    if (acceptLanguage) {
      if (acceptLanguage.includes('zh')) {
        detectedLang = 'zh-CN';
      } else if (acceptLanguage.includes('ja')) {
        detectedLang = 'jp';
      } else if (acceptLanguage.includes('en')) detectedLang = 'en';
    }

    // 重定向到正确的语言路径
    return redirect(`/${detectedLang}${url.pathname}`);
  }

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: {
      fetch
    },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      }
    }
  });

  const {data: {session}} = await supabase.auth.getSession();

  const {data: {user}} = await supabase.auth.getUser()

  return json({
    lang,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      DOMAIN: process.env.DOMAIN!
    },
    supabase,
    session,
    user
  });
};

export default function App() {
  const {lang, env, session, user} = useLoaderData<typeof loader>();

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

  return (
      <html lang = {lang}>
      <head>
        <meta charSet = "utf-8"/>
        <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
      <Navbar lang = {lang}/>
      <Outlet context = {{lang, supabase, session, user, env}}/>
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  )
}
