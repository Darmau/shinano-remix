import {LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const lang = params.lang as string;
  const baseUrl = context.cloudflare.env.BASE_URL;

  const {data: articles} = await supabase
    .from('article')
    .select(`
      slug,
      updated_at,
      language!inner (lang)
    `)
    .eq('is_draft', false)
    .eq('language.lang', lang)
    .order('updated_at', {ascending: false});

  const {data: albums} = await supabase
    .from('photo')
    .select(`
      slug,
      updated_at,
      language!inner (lang)
    `)
    .eq('is_draft', false)
    .eq('language.lang', lang)
    .order('updated_at', {ascending: false});

  const {data: thoughts} = await supabase
    .from('thought')
    .select(`
      slug,
      created_at
    `)
    .order('created_at', {ascending: false});

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${articles && articles.map(article => `
            <url>
                <loc>${baseUrl}/${lang}/article/${article.slug}</loc>
                <lastmod>${article.updated_at}</lastmod>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
            </url>
            `)}
    
        ${albums && albums.map(album => `
            <url>
                <loc>${baseUrl}/${lang}/album/${album.slug}</loc>
                <lastmod>${album.updated_at}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
        `)}
    
        ${thoughts && thoughts.map(thought => `
            <url>
                <loc>${baseUrl}/${lang}/thought/${thought.slug}</loc>
                <lastmod>${thought.created_at}</lastmod>
                <changefreq>hourly</changefreq>
                <priority>0.6</priority>
            </url>
        `)}
    </urlset>
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
