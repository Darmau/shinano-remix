import {LoaderFunctionArgs} from "@remix-run/cloudflare";

export const loader = ({context}: LoaderFunctionArgs) => {
  const baseUrl = context.cloudflare.env.BASE_URL;

  const robotText = `
    User-agent: Googlebot

    User-agent: *
    Allow: /
    Disallow: /*/login
    Disallow: /*/signup

    Sitemap: ${baseUrl}/sitemap-index.xml
    `
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(robotText,{
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    }
  });
};
