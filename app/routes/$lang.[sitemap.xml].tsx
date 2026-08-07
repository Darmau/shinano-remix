import {createClient} from "~/utils/supabase/server";
import type { Route } from "./+types/$lang.[sitemap.xml]";

type RecordWithKeys = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordWithKeys =>
    typeof value === "object" && value !== null;

const toRecordArray = (value: unknown): RecordWithKeys[] =>
    Array.isArray(value) ? value.filter(isRecord) : [];

const toEntryMarkup = (
    rows: RecordWithKeys[],
    dateKey: "updated_at" | "created_at",
    baseUrl: string,
    lang: string,
    pathSegment: string,
    changefreq: string,
    priority: string
) =>
    rows
        .map(row => {
          const slug = row["slug"];
          const timestamp = row[dateKey];

          if (typeof slug !== "string" || slug.length === 0) {
            return null;
          }
          if (typeof timestamp !== "string" || timestamp.length === 0) {
            return null;
          }

          return `
            <url>
                <loc>${baseUrl}/${lang}/${pathSegment}/${slug}</loc>
                <lastmod>${timestamp}</lastmod>
                <changefreq>${changefreq}</changefreq>
                <priority>${priority}</priority>
            </url>`;
        })
        .filter((entry): entry is string => typeof entry === "string")
        .join("");

export async function loader({request, context, params}: Route.LoaderArgs) {
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

  const now = new Date().toISOString();

  const articleEntries = toEntryMarkup(
      toRecordArray(articles),
      "updated_at",
      baseUrl,
      lang,
      "article",
      "daily",
      "1.0"
  );

  const albumEntries = toEntryMarkup(
      toRecordArray(albums),
      "updated_at",
      baseUrl,
      lang,
      "album",
      "daily",
      "0.8"
  );

  const thoughtEntries = toEntryMarkup(
      toRecordArray(thoughts),
      "created_at",
      baseUrl,
      lang,
      "thought",
      "hourly",
      "0.6"
  );

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${baseUrl}/${lang}</loc>
            <lastmod>${now}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/about</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/site</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/contact</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/rss</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/book</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${baseUrl}/${lang}/terms-of-use</loc>
            <lastmod>${now}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        ${articleEntries}

        ${albumEntries}

        ${thoughtEntries}
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
