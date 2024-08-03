import Subnav from "~/components/Subnav";
import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import SiteText from "~/locales/site";
import {useLoaderData} from "@remix-run/react";
import Supabase from '~/icons/Supabase.svg';
import Cloudflare from '~/icons/Cloudflare.svg';
import SvelteKit from '~/icons/Svelte.svg';
import Remix from '~/icons/Remix.svg';
import Tiptap from '~/icons/Tiptap.svg';
import OpenAI from '~/icons/Openai.svg';
import {ServerStackIcon, LanguageIcon, SparklesIcon, Square3Stack3DIcon} from "@heroicons/react/24/outline";
import i18nLinks from "~/utils/i18nLinks";

export default function AboutSite() {
  const {content} = useLoaderData<typeof loader>();
  return (
      <>
        <Subnav active = "about"/>

        {/*Hero*/}
        <section className = "mx-auto max-w-7xl my-24 p-4 md:p-8 sm:my-32 space-y-8">
          <div className = "relative isolate">
            <div
                aria-hidden = "true"
                className = "absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              <div
                  style = {{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                  className = "relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div className = "py-24">
              <div className = "mx-auto max-w-7xl px-6 lg:px-8">
                <div className = "mx-auto max-w-3xl text-center">
                  <h1 className = "text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    {content.title}
                  </h1>
                  <p className = "mt-6 text-lg leading-8 text-gray-600">
                    {content.subtitle}
                  </p>
                </div>
              </div>
            </div>
            <div
                aria-hidden = "true"
                className = "absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
              <div
                  style = {{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                  className = "relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              />
            </div>
          </div>
        </section>

        {/*技术栈*/}
        <section className = "bg-gray-900 py-24 sm:py-32">
          <div className = "mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className = "text-center text-lg font-semibold leading-8 text-white">{content.techstack}</h2>
            <div
                className = "mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 lg:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none"
            >
              <img src = {Cloudflare} alt = "Cloudflare" className = "h-36"/>
              <img src = {Supabase} alt = "Supabase" className = "h-36"/>
              <img src = {SvelteKit} alt = "SvelteKit" className = "h-36"/>
              <img src = {Remix} alt = "Remix" className = "h-36"/>
              <img src = {Tiptap} alt = "Tiptap" className = "h-36"/>
              <img src = {OpenAI} alt = "OpenAI" className = "h-36"/>
            </div>
          </div>
        </section>

        {/*核心功能*/}
        <section className = "bg-white py-24 sm:py-32">
          <div className = "mx-auto max-w-7xl px-6 lg:px-8">
            <div className = "mx-auto max-w-2xl lg:text-center">
              <h2 className = "mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {content.feature_title}
              </h2>
              <p className = "mt-6 text-lg leading-8 text-gray-600">
                {content.feature_subtitle}
              </p>
            </div>
            <div className = "mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className = "grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                <div className = "relative pl-16">
                  <dt className = "text-base font-semibold leading-7 text-gray-900">
                    <div
                        className = "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600"
                    >
                      <LanguageIcon className = "h-6 w-6 text-white"/>
                    </div>
                    {content.feature_1}
                  </dt>
                  <dd className = "mt-2 text-base leading-7 text-gray-600">{content.feature_1_desc}</dd>
                </div>
                <div className = "relative pl-16">
                  <dt className = "text-base font-semibold leading-7 text-gray-900">
                    <div
                        className = "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600"
                    >
                      <ServerStackIcon className = "h-6 w-6 text-white"/>
                    </div>
                    {content.feature_2}
                  </dt>
                  <dd className = "mt-2 text-base leading-7 text-gray-600">{content.feature_2_desc}</dd>
                </div>
                <div className = "relative pl-16">
                  <dt className = "text-base font-semibold leading-7 text-gray-900">
                    <div
                        className = "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600"
                    >
                      <SparklesIcon className = "h-6 w-6 text-white"/>
                    </div>
                    {content.feature_3}
                  </dt>
                  <dd className = "mt-2 text-base leading-7 text-gray-600">{content.feature_3_desc}</dd>
                </div>
                <div className = "relative pl-16">
                  <dt className = "text-base font-semibold leading-7 text-gray-900">
                    <div
                        className = "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600"
                    >
                      <Square3Stack3DIcon className = "h-6 w-6 text-white"/>
                    </div>
                    {content.feature_4}
                  </dt>
                  <dd className = "mt-2 text-base leading-7 text-gray-600">{content.feature_4_desc}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/*网站架构*/}
        <section className = "mx-auto max-w-4xl my-16 px-4 lg:p-0 lg:my-24 space-y-8">
          <header className = "mb-12">
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
        </section>

        {/*声明*/}
        <section className = "isolate overflow-hidden bg-white px-6 lg:px-8">
          <div className = "relative mx-auto max-w-2xl py-24 sm:py-32 lg:max-w-4xl">
            <div
                className = "absolute left-1/2 top-0 -z-10 h-[50rem] w-[90rem] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_top,theme(colors.indigo.100),white)] opacity-20 lg:left-36"
            />
            <div
                className = "absolute inset-y-0 right-1/2 -z-10 mr-12 w-[150vw] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-20 md:mr-0 lg:right-full lg:-mr-36 lg:origin-center"
            />
            <figure className = "grid grid-cols-1 items-center gap-x-6 gap-y-8 lg:gap-x-10">
              <div className = "relative col-span-2 lg:col-start-1 lg:row-start-2">
                <svg
                    fill = "none"
                    viewBox = "0 0 162 128"
                    aria-hidden = "true"
                    className = "absolute -top-12 left-0 -z-10 h-32 stroke-gray-900/10"
                >
                  <path
                      d = "M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                      id = "b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb"
                  />
                  <use x = {86} href = "#b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb"/>
                </svg>
                <blockquote className = "text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
                  <p>{content.statement}</p>
                </blockquote>
              </div>
              <figcaption className = "text-base lg:col-start-1 lg:row-start-3">
                <div className = "font-semibold text-gray-900">李大毛</div>
              </figcaption>
            </figure>
          </div>
        </section>
      </>
  )
}

export async function loader({params, context}: LoaderFunctionArgs) {
  const lang = params.lang as string;
  const content = SiteText(lang);

  const availableLangs = ["zh", "en", "jp"];

  return json({
    content,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  })
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;

  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      "site"
  );

  return [
    {title: data!.content.title},
    {
      name: "description",
      content: data!.content.subtitle,
    },
    ...multiLangLinks
  ];
};
