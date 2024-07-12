import {Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useLoaderData} from "@remix-run/react";
import "./tailwind.css";
import Navbar from "~/components/Navbar";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";

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

  return json({lang});
};

export function Layout({children, lang}: { children: React.ReactNode, lang: string }) {

  return (
      <html lang = {lang}>
      <head>
        <meta charSet = "utf-8"/>
        <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
      {children}
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  );
}

export default function App() {
  const {lang} = useLoaderData<typeof loader>();
  return (
      <Layout lang = {lang}>
        <Navbar lang = {lang}/>
        <Outlet context = {{lang}}/>
      </Layout>
  )
}
