import Breadcrumb, {BreadcrumbProps} from "~/components/Breadcrumb";
import {useLoaderData, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ThoughtText from "~/locales/thought";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Json} from "~/types/supabase";
import ContentContainer from "~/components/ContentContainer";
import ResponsiveImage from "~/components/ResponsiveImage";
import {Image} from "~/types/Image";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

export default function ThoughtDetail () {
  const { lang } = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ThoughtText, lang);

  const {thoughtData, thoughtImages} = useLoaderData<typeof loader>();

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
        <div className = "grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className = "col-span-1 lg:col-span-2">
            <ContentContainer content = {thoughtData.content_json as unknown as Json}/>
            {thoughtImages && (
                <div className = "space-y-2">
                  {thoughtImages.map((image) => (
                      <ResponsiveImage
                          key = {image.image!.id} image = {image.image as Image} width = {560}
                          classList = "rounded"
                      />
                  ))}
                </div>
            )}
          </div>

            <div className = "col-span-1 space-y-4">
              留作评论
            </div>
        </div>
      </div>
)
}


export async function loader({
  request, context, params
}: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const slug = params.slug as string;

  // thought详情
  const {data: thoughtData} = await supabase
    .from('thought')
    .select(`
      id,
      content_json,
      content_text,
      slug,
      created_at
    `)
    .eq('slug', slug)
    .single();

  if (!thoughtData) {
    throw new Response(null, {
      status: 404,
      statusText: 'Thought not exists'
    })
  }

  const {data: thoughtImages} = await supabase
    .from('thought_image')
    .select(`
      order,
      image (id, alt, storage_key, width, height, caption)
    `)
    .eq('thought_id', thoughtData.id)
    .order('order', {ascending: true});

  return json({
    thoughtData,
    thoughtImages
  })
}
