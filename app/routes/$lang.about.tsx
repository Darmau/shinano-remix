import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import AboutText from "~/locales/about";
import HomepageText from "~/locales/homepage";
import {useLoaderData} from "@remix-run/react";
import ResponsiveImage from "~/components/ResponsiveImage";
import {createClient} from "~/utils/supabase/server";
import {Image} from "~/types/Image";
import TwitterIcon from "~/icons/Twitter";
import GithubIcon from "~/icons/Github";
import InstagramIcon from "~/icons/Instagram";
import YoutubeIcon from "~/icons/Youtube";
import getLanguageLabel from "~/utils/getLanguageLabel";
import i18nLinks from "~/utils/i18nLinks";

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
                  data-umami-event = "Social Link"
                  data-umami-social = "X"
                  href = "https://x.com/darmau8964" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Twitter</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <GithubIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  data-umami-event = "Social Link"
                  data-umami-social = "GitHub"
                  href = "https://github.com/Darmau" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Github</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <InstagramIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  data-umami-event = "Social Link"
                  data-umami-social = "Instagram"
                  href = "https://www.instagram.com/ridamoe" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >Instagram</a>
            </div>
            <div className = "group flex justify-start gap-4">
              <YoutubeIcon className = "w-6 h-6 text-zinc-700 group-hover:text-violet-700"/>
              <a
                  data-umami-event = "Social Link"
                  data-umami-social = "YouTube"
                  href = "https://www.youtube.com/@darmau" target = "_blank" rel = "noreferrer"
                  className = "font-medium text-gray-700 group-hover:text-violet-700"
              >YouTube</a>
            </div>
          </div>
        </div>
      </>
  )
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(HomepageText, lang);
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      "about"
  );

  return [
    {title: label.about_title},
    {
      name: "description",
      content: label.about_description,
    },
    {
      property: "og:title",
      content: label.about_title
    },
    {
      property: "og:type",
      content: "profile"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/about`
    },
    {
      property: "og:image",
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/ba07adad-3f02-409b-ad39-2814b6f2ede3`
    },
    {
      property: "og:description",
      content: label.about_description
    },
    {
      property: "twitter:image",
      content: `${data!.prefix}/cdn-cgi/image/format=webp,width=960/ba07adad-3f02-409b-ad39-2814b6f2ede3`
    },
    {
      property: "twitter:title",
      content: label.about_title
    },
    {
      property: "twitter:description",
      content: label.about_description,
    },
    {
      property: "twitter:card",
      content: "summary_large_image"
    },
    {
      property: "twitter:creator",
      content: "@darmau8964"
    },
    ...multiLangLinks
  ];
};

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

  const availableLangs = ["zh", "en", "jp"];

  return json({
    content,
    profileImage,
    baseUrl: context.cloudflare.env.BASE_URL,
    prefix: context.cloudflare.env.IMG_PREFIX,
    availableLangs
  });
}
