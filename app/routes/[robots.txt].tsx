import type { Route } from "./+types/[robots.txt]";
export const loader = async ({context}: Route.LoaderArgs) => {
  const baseUrl = context.cloudflare.env.BASE_URL;

  const robotText = [
    "User-agent: Googlebot",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /*/login",
    "Disallow: /*/unsubscribe",
    "Disallow: /auth/*",
    "",
    `Sitemap: ${baseUrl}/sitemap-index.xml`,
    ""
  ].join("\n");
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(robotText,{
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    }
  });
};
