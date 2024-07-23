import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
  useRouteError
} from "@remix-run/react";
import "./tailwind.css";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {getLang} from "~/utils/getLang";
import {createClient} from "~/utils/supabase/server";
import {useEffect, useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];
  const multiLangContent = ['', 'article', 'articles', 'album', 'albums', 'thoughts', 'thought', 'about', 'contact', 'site', 'rss', 'signup', 'login']

  if (!['zh', 'en', 'jp'].includes(lang) && multiLangContent.includes(lang)) {
    // 检测浏览器语言
    const detectedLang = getLang(request)

    // 重定向到正确的语言路径
    return redirect(`/${detectedLang}${url.pathname}`);
  }

  const env = {
    SUPABASE_URL: context.cloudflare.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: context.cloudflare.env.SUPABASE_ANON_KEY,
    PREFIX: context.cloudflare.env.IMG_PREFIX
  };

  const response = new Response();
  const {supabase} = createClient(request, context);

  const {
    data: {session},
  } = await supabase.auth.getSession();

  return json({
    lang,
    env,
    session
  }, {headers: response.headers});
};


export default function App() {
  const {lang, env, session} = useLoaderData<typeof loader>();

  const prefix = env.PREFIX

  const {revalidate} = useRevalidator()

  const [supabase] = useState(() =>
      createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  )

  const serverAccessToken = session?.access_token

  useEffect(() => {
    const {
      data: {subscription},
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
      <body className = "min-h-screen flex flex-col relative">
        <Navbar lang={lang}/>
        <main className = "flex-1 w-full">
          <Outlet context = {{supabase, lang, prefix}}/>
        </main>
        <Footer lang={lang} />
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
        <html lang = "en">
        <head>
          <title>Error</title>
          <meta charSet = "utf-8"/>
          <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
          <Meta/>
          <Links/>
        </head>
        <body className = "min-h-screen flex flex-col">
        <main className = "grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className = "text-center">
            <p className = "text-base font-semibold text-indigo-600">{error.status}</p>
            <h1 className = "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{error.statusText}</h1>
            <p className = "mt-6 text-base leading-7 text-gray-600">{error.data}</p>
            <div className = "mt-10 flex items-center justify-center gap-x-6">
              <Link
                  to = "/"
                  className = "rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home
              </Link>
            </div>
          </div>
        </main>
        <Scripts/>
        </body>
        </html>
    )
        ;
  } else if (error instanceof Error) {
    return (
        <html lang = "en">
        <head>
          <title>Error</title>
          <meta charSet = "utf-8"/>
          <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
          <Meta/>
          <Links/>
        </head>
        <body className = "min-h-screen flex flex-col">
        <main className = "grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className = "text-center">
            <p className = "text-base font-semibold text-indigo-600">{error.name}</p>
            <h1 className = "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{error.message}</h1>
            <p className = "mt-6 text-base leading-7 text-gray-600">{error.stack}</p>
            <div className = "mt-10 flex items-center justify-center gap-x-6">
              <Link
                  to = "/"
                  className = "rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home
              </Link>
            </div>
          </div>
        </main>
        <Scripts/>
        </body>
        </html>
    )
        ;
  } else {
    return <h1>Unknown Error</h1>;
  }
}
