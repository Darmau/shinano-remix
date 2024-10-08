import {Thought} from "~/routes/$lang.thoughts";
import ContentContainer from "~/components/ContentContainer";
import {Json} from "~/types/supabase";
import ResponsiveImage from "~/components/ResponsiveImage";
import getTime from "~/utils/getTime";
import {Link, useOutletContext} from "@remix-run/react";
import {EyeIcon} from "@heroicons/react/24/solid";
import {ChatBubbleOvalLeftIcon} from "@heroicons/react/24/outline";

export default function ThoughtCard({thought}: { thought: Thought }) {
  const {lang} = useOutletContext<{ lang: string }>();
  return (
      <Link
          to = {`/${lang}/thought/${thought.slug}`}
          className = "break-inside-avoid block mb-4 cursor-pointer relative rounded-2xl bg-white px-6 py-2 shadow-xl border overflow-hidden shadow-zinc-500/10 hover:shadow-zinc-500/30 hover:shadow-2xl transition-all duration-300"
      >
        <svg aria-hidden = "true" width = "105" height = "78" className = "absolute left-6 top-6 fill-slate-100">
          <path
              d = "M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z"
          ></path>
        </svg>
        <div className = "relative mb-4 space-y-4">
          <ContentContainer content = {thought.content_json as unknown as Json}/>
          <div className = "flex gap-3 justify-start items-center">
            <div className = "flex gap-1 items-center">
              <EyeIcon className = "h-4 w-4 inline-block text-zinc-400"/>
              <span className = "text-zinc-500 text-sm">{thought.page_view}</span>
            </div>
            <div className = "flex gap-1 items-center">
              <ChatBubbleOvalLeftIcon className = "h-4 w-4 inline-block text-zinc-400"/>
              <span className = "text-zinc-500 text-sm">{thought.comments[0].count}</span>
            </div>
            <p className = "text-sm text-zinc-500">{getTime(thought.created_at, lang)}</p>
          </div>
          {thought.thought_image && thought.thought_image.length > 0 && (
              <div className = "grid grid-cols-3 gap-4">
                {thought.thought_image.map((image) => (
                    <ResponsiveImage
                        key = {image.image.id} image = {image.image} width = {160} classList = "aspect-square rounded"
                    />
                ))}
              </div>
          )}
        </div>
      </Link>
  )
}
