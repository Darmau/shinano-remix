import type { Route } from "./+types/[sitemap-index.xml]";
export function loader({context}: Route.LoaderArgs) {
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
