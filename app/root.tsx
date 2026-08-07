import { isRouteErrorResponse, Link, Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useLoaderData, useNavigation, useRevalidator, useRouteError } from "react-router";
import type { ErrorResponse } from "react-router";import "./tailwind.css";
import type { Route } from "./+types/root";
import {getLang} from "~/utils/getLang";
import {createClient} from "~/utils/supabase/server";
import {useEffect, useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import PendingNavigation from "~/components/PendingNavigation";
import NavbarItems from "~/locales/navbar";
import getFooterLabels from "~/utils/getFooterLabels";
import FooterText from "~/locales/footer";
import {generateWebsiteStructuredData, serializeStructuredData} from "~/utils/structuredData";
import Banners from "./components/Banners";

export const loader = async ({request, context}: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];
  const multiLangContent = ['', 'article', 'articles', 'album', 'albums', 'thoughts', 'thought', 'about', 'contact', 'site', 'rss', 'signup', 'login', 'book', 'terms-of-use']

  if (!['zh', 'en', 'jp'].includes(lang) && multiLangContent.includes(lang)) {
    // 检测浏览器语言
    const detectedLang = getLang(request)

    // 重定向到正确的语言路径
    return redirect(`/${detectedLang}${url.pathname}`);
  }

  const runtimeEnv = context?.cloudflare?.env ?? globalThis.process?.env ?? {};
  const env = {
    SUPABASE_URL: runtimeEnv.SUPABASE_URL ?? "",
    SUPABASE_ANON_KEY: runtimeEnv.SUPABASE_ANON_KEY ?? "",
    PREFIX: runtimeEnv.IMG_PREFIX ?? "",
    TURNSTILE_SITE_KEY: runtimeEnv.TURNSTILE_SITE_KEY ?? "",
  };

  const {supabase} = createClient(request, context);

  const {
    data: {session},
  } = await supabase.auth.getSession();

  // 生成当前年份
  const currentYear = new Date().getFullYear();

  // 获取导航栏文案
  const navbarItems = NavbarItems(lang);

  // 获取footer文案
  const footerItems = getFooterLabels(FooterText, lang);

  return {
    lang,
    baseUrl: url.origin,
    env,
    session,
    currentYear,
    navbarItems,
    footerItems
  };
};

// Headers are handled automatically by Single Fetch


export default function App() {
  const {
    lang,
    baseUrl,
    env,
    session,
    currentYear,
    navbarItems,
    footerItems
  } = useLoaderData<typeof loader>();

  const prefix = env.PREFIX;
  const turnstileSiteKey = env.TURNSTILE_SITE_KEY;

  const {revalidate} = useRevalidator()

  // localized site names
  const SITE_NAMES: Record<string, string> = { zh: "积薪", en: "Firewood", jp: "積薪" };
  const siteName = SITE_NAMES[lang] ?? "积薪";
  const alternateNames = ["积薪", "Firewood", "積薪", "darmau.co"].filter(n => n !== siteName);
  const websiteJsonLd = generateWebsiteStructuredData({
    baseUrl,
    name: siteName,
    alternateName: alternateNames,
    inLanguage: lang,
  });

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

  const navigation = useNavigation();

  return (
      <html lang = {lang} className = "scroll-smooth">
      <head>
        <meta charSet = "utf-8"/>
        <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
        <link rel = "icon" href = "/favicon.ico" type = "image/x-icon"/>
        <meta property = "og:site_name" content = {siteName}/>
        <meta name = "application-name" content = {siteName}/>
        <script
          type = "application/ld+json"
          dangerouslySetInnerHTML = {{__html: serializeStructuredData(websiteJsonLd)}}
        />
        <Meta/>
        <Links/>
      </head>
      <body className = "min-h-screen flex flex-col relative">
      <Navbar lang = {lang} items = {navbarItems}/>
      <PendingNavigation/>
      <main className = {`flex-1 w-full mt-[76px] ${navigation.state === 'loading' && 'opacity-30'}`}>
        <Banners lang={lang}/>
        <Outlet context = {{supabase, lang, prefix, turnstileSiteKey}}/>
      </main>
      <Footer lang = {lang} currentYear = {currentYear} items = {footerItems}/>
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  )
}

export function ErrorBoundary() {
  const caughtError = useRouteError();

  if (isRouteErrorResponse(caughtError)) {
    const routeError = caughtError as ErrorResponse;
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
            <p className = "text-base font-semibold text-indigo-600">{routeError.status}</p>
            <h1 className = "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{routeError.statusText}</h1>
            <p className = "mt-6 text-base leading-7 text-gray-600">{routeError.data}</p>
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
  } else if (caughtError instanceof Error) {
    const { name, message, stack } = caughtError;
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
            <p className = "text-base font-semibold text-indigo-600">{name}</p>
            <h1 className = "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{message}</h1>
            <p className = "mt-6 text-base leading-7 text-gray-600">{stack}</p>
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
