
import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import {Photo} from "~/types/Photo";

export default function PhotoSection({photos, prefix, lang}: {
  prefix: string,
  photos: Photo[] | null,
  lang: string
}) {
  if (!photos) return null;

  const label = getLanguageLabel(HomepageText, lang);

  return (
      <div className = "space-y-16 my-4 lg:my-16">
        <h2 className = "px-2 lg:px-4 text-2xl font-medium text-zinc-800 mb-6">{label.photo_title}</h2>
        <div className = "grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
          {JSON.stringify(photos)}
        </div>
      </div>
  )
}
