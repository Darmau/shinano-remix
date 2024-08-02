import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import AboutText from "~/locales/about";
import {useLoaderData} from "@remix-run/react";
import ResponsiveImage from "~/components/ResponsiveImage";
import {createClient} from "~/utils/supabase/server";
import {Image} from "~/types/Image";
import TwitterIcon from "~/icons/Twitter";
import GithubIcon from "~/icons/Github";
import InstagramIcon from "~/icons/Instagram";
import YoutubeIcon from "~/icons/Youtube";

export default function AboutMe () {
  const {content, profileImage} = useLoaderData<typeof loader>();
  return (
      <>
        <Subnav active="about" />
        <div className="w-full max-w-6xl mx-auto p-4 md:py-8 my-8 lg:my-16 grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <ResponsiveImage image={profileImage as Image} width={560} classList="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover" />
          </div>
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl leading-tight sm:leading-tight font-bold tracking-tight text-zinc-800 sm:text-5xl">{content[0]}</h1>
            <div className="mt-8 space-y-7 text-base text-zinc-600">
              {content.slice(1).map((text, index) => (
                  <p key={index} className="leading-relaxed">{text}</p>
              ))}
            </div>
          </div>
          <div className = "lg:pl-20 space-y-6">
            <div className = "group flex justify-start gap-4">
              <TwitterIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  href = "https://x.com/darmau8964" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Twitter</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <GithubIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  href = "https://github.com/Darmau" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Github</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <InstagramIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  href = "https://www.instagram.com/ridamoe" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Instagram</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <YoutubeIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  href = "https://www.youtube.com/@darmau" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >YouTube</a>
            </div>
          </div>
        </div>
      </>
  )
}

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const lang = params.lang as string;
  const {supabase} = createClient(request, context);

  const content = AboutText(lang);

  const {data: profileImage} = await supabase
  .from('image')
  .select(`
      alt,
      storage_key,
      width,
      height,
      height,
      caption
    `)
    .eq('storage_key', 'ba07adad-3f02-409b-ad39-2814b6f2ede3')
    .single();

  return json({
    content,
    profileImage
  });
}
