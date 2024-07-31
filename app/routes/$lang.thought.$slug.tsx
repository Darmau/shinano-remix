import Breadcrumb, {BreadcrumbProps} from "~/components/Breadcrumb";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ThoughtText from "~/locales/thought";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Json} from "~/types/supabase";
import ContentContainer from "~/components/ContentContainer";

export default function ThoughtDetail () {
  const { lang } = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ThoughtText, lang);

  const {thoughtData} = useLoaderData<typeof loader>();

  const breadcrumbPages: BreadcrumbProps[] = [
    {
      name: label.all_thoughts,
      to: `thoughts`,
      current: false
    },
    {
      name: thoughtData.content_text ? `${thoughtData.content_text.slice(0, 10)}...` : '',
      to: `thought/${thoughtData.slug}`,
      current: true
    }
  ]

  return (
      <div className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
        <Breadcrumb pages={breadcrumbPages} />
        <ContentContainer content = {thoughtData.content_json as unknown as Json}/>
      </div>
  )
}


export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const slug = params.slug as string;

  // thought详情
  const {data: thoughtData} = await supabase
    .from('thought')
    .select(`
      content_json,
      content_text,
      slug,
      created_at,
      thought_image (
        image (id, alt, storage_key, width, height)
      )
    `)
    .eq('slug', slug)
    .single();

  if (!thoughtData) {
    throw new Response(null, {
      status: 404,
      statusText: 'Thought not exists'
    })
  }

  return json({
    thoughtData
  })
}
