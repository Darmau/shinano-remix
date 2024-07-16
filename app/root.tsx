import {Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useLoaderData} from "@remix-run/react";
import "./tailwind.css";
import Navbar from "~/components/Navbar";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {getLang} from "~/utils/getLang";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const lang = url.pathname.split('/')[1];
  const multiLangContent = ['', 'article', 'articles', 'photography', 'photographies', 'thought', 'about', 'contact', 'signup', 'login']

  if (!['zh', 'en', 'jp'].includes(lang) && multiLangContent.includes(lang)) {
    // 检测浏览器语言
    const detectedLang = getLang(request)

    // 重定向到正确的语言路径
    return redirect(`/${detectedLang}${url.pathname}`);
  }

  const response = new Response()

  return json({
    lang
  }, {headers: response.headers});
};

export default function App() {
  const {lang} = useLoaderData<typeof loader>();

  return (
      <html lang = {lang}>
      <head>
        <meta charSet = "utf-8"/>
        <meta name = "viewport" content = "width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
      <Navbar lang = {lang} />
      <Outlet context = {{lang}}/>
      <ScrollRestoration/>
      <Scripts/>
      </body>
      </html>
  )
}
