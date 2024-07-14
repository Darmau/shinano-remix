import {
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator
} from "@remix-run/react";
import "./tailwind.css";
import Navbar from "~/components/Navbar";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader} from "@supabase/ssr";
import {useEffect, useState} from "react";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];
  const multiLangContent = ['', 'article', 'articles', 'photography', 'photographies', 'thought', 'about', 'contact', 'signup', 'login']

  if (!['zh-CN', 'en', 'jp'].includes(lang) && multiLangContent.includes(lang)) {
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

  const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      }

  const response = new Response()
  const headers = new Headers();

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({name, value, options}) =>
                headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
            )
          },
        },
      })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return json({
    lang,
    env,
    session
  }, {
    headers: response.headers
  });
};

export default function App() {
  const {lang, env, session} = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator()

  const [supabase] = useState(() =>
      createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  )

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION' && session?.access_token !== serverAccessToken) {
        // server and client are out of sync.
        revalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [serverAccessToken, supabase, revalidate])

  return (
      <html lang = {lang}>
      <head>
        <meta charSet = "utf-8"/>
        <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
      <Navbar />
      <Outlet context = {{lang, supabase}}/>
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  )
}
