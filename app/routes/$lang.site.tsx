import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import SiteText from "~/locales/site";
import {useLoaderData} from "@remix-run/react";
import Supabase from '~/icons/Supabase.svg';
import Cloudflare from '~/icons/Cloudflare.svg';
import SvelteKit from '~/icons/Svelte.svg';
import Remix from '~/icons/Remix.svg';
import Tiptap from '~/icons/Tiptap.svg';
import OpenAI from '~/icons/Openai.svg';

export default function AboutSite () {
  const {content} = useLoaderData<typeof loader>();
  return (
      <>
        <Subnav active="about" />
        <div className="mx-auto max-w-7xl mt-24 p-4 md:p-8 sm:mt-32 md:mt-56 space-y-8">
          <h1 className="font-medium text-zinc-800 text-4xl lg:text-5xl">{content.title}</h1>
          <h2 className="text-lg text-zinc-600">{content.subtitle}</h2>
        </div>
        <div className="mt-24 rounded-3xl bg-neutral-950 sm:mt-32 lg:mt-56">
          <div className="mx-auto max-w-7xl p-4 md:p-8 lg:py-16">
            <h2 className = "text-white font-medium text-lg my-8">{content.techstack}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3">
              <img src={Cloudflare} alt="Cloudflare" className="h-36"/>
              <img src={Supabase} alt="Supabase" className="h-36"/>
              <img src={SvelteKit} alt="SvelteKit" className="h-36"/>
              <img src={Remix} alt="Remix" className="h-36"/>
              <img src={Tiptap} alt="Tiptap" className="h-36"/>
              <img src={OpenAI} alt="OpenAI" className="h-36"/>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-16 p-4 md:p-8 lg:mt-24 space-y-8">
          <header>
            <h2 className="text-3xl font-medium text-zinc-800 mb-6">{content.feature_title}</h2>
            <p className="text-lg text-zinc-600">{content.feature_subtitle}</p>
          </header>
          <div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className = "p-4 lg:p-8 rounded-3xl border">
              <h3 className = "font-medium text-zinc-800 text-2xl mb-4">{content.feature_1}</h3>
              <p className = "text-zinc-600 leading-relaxed">{content.feature_1_desc}</p>
            </div>
            <div className = "p-4 lg:p-8 rounded-3xl border">
              <h3 className = "font-medium text-zinc-800 text-2xl mb-4">{content.feature_2}</h3>
              <p className = "text-zinc-600 leading-relaxed">{content.feature_2_desc}</p>
            </div>
            <div className = "p-4 lg:p-8 rounded-3xl border">
              <h3 className = "font-medium text-zinc-800 text-2xl mb-4">{content.feature_3}</h3>
              <p className = "text-zinc-600 leading-relaxed">{content.feature_3_desc}</p>
            </div>
            <div className = "p-4 lg:p-8 rounded-3xl border">
              <h3 className = "font-medium text-zinc-800 text-2xl mb-4">{content.feature_4}</h3>
              <p className = "text-zinc-600 leading-relaxed">{content.feature_4_desc}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-16 p-4 md:p-8 lg:mt-24 space-y-8">
          <header className="mb-12">
            <h2 className = "text-3xl font-medium text-zinc-800 mb-6">{content.structure_title}</h2>
            <p className = "text-lg text-zinc-600">{content.structure_subtitle}</p>
          </header>
          <div>
            <div className = "mb-10">
              <span className = "font-medium text-zinc-700">{content.structure_1_title}</span>
              <span className = "text-zinc-500">{content.structure_1_desc}</span>
            </div>
            <div
                className = "pt-10 mb-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:left-0 before:top-0 before:h-px before:w-6 after:left-8 after:right-0 after:top-0 after:h-px"
            >
              <span className = "font-medium text-zinc-700">{content.structure_2_title}</span>
              <span className = "text-zinc-500">{content.structure_2_desc}</span>
            </div>
            <div
                className = "pt-10 mb-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:left-0 before:top-0 before:h-px before:w-6 after:left-8 after:right-0 after:top-0 after:h-px"
            >
              <span className = "font-medium text-zinc-700">{content.structure_3_title}</span>
              <span className = "text-zinc-500">{content.structure_3_desc}</span>
            </div>
            <div
                className = "pt-10 mb-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden relative before:absolute after:absolute before:bg-neutral-950 after:bg-neutral-950/10 before:left-0 before:top-0 before:h-px before:w-6 after:left-8 after:right-0 after:top-0 after:h-px"
            >
              <span className = "font-medium text-zinc-700">{content.structure_4_title}</span>
              <span className = "text-zinc-500">{content.structure_4_desc}</span>
            </div>
          </div>
        </div>
        <div className="bg-zinc-50 py-12 lg:py-20">
          <div className = "mx-auto max-w-7xl p-4 md:p-8 space-y-8">
            <header>
              <h2 className = "text-3xl font-medium text-zinc-800 mb-6 leading-snug">{content.statement}</h2>
            </header>
          </div>
        </div>
      </>
  )
}

export async function loader({params}: LoaderFunctionArgs) {
  const lang = params.lang as string;
  const content = SiteText(lang);

  return json({
    content
  })
}
