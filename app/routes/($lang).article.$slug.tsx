import {json} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";

export async function loader({ params }: { params: { lang: string; slug: string } }) {
  const lang = params.lang;
  const slug = params.slug;

  return json({ lang, slug});
}

export default function Article() {
  const { lang, slug } = useLoaderData<typeof loader>();
  return (
      <div>
        <h1>This is an article page</h1>
        <p>{lang}</p>
        <p>{slug}</p>
      </div>
  )
}
