import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const baseUrl = context.cloudflare.env.BASE_URL;

  const sitemap = `
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${baseUrl}/zh/sitemap.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${baseUrl}/en/sitemap.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${baseUrl}/jp/sitemap.xml</loc>
      </sitemap>
    </sitemapindex>
  `

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      "encoding": "UTF-8"
    }
  });
}
