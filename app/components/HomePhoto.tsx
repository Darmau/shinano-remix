import getLanguageLabel from "~/utils/getLanguageLabel";
import HomepageText from "~/locales/homepage";
import {Photo} from "~/types/Photo";
import { RowsPhotoAlbum } from "react-photo-album";
import { UnstableSSR as SSR } from "react-photo-album/ssr";
import "react-photo-album/rows.css";

export default function PhotoSection({photos, prefix, lang}: {
  prefix: string,
  photos: Photo[] | null,
  lang: string
}) {
  if (!photos) return null;

  const label = getLanguageLabel(HomepageText, lang);

  const AlbumPhotos = photos.map((photo) => {
    return {
      key: photo.id,
      src: `${prefix}/cdn-cgi/image/format=auto,width=720/${photo.cover.storage_key}`,
      alt: photo.cover.alt,
      width: photo.cover.width,
      height: photo.cover.height,
      title: photo.title,
      href: `/${lang}/album/${photo.slug}`
    }
  })

  return (
      <div className = "my-8 lg:my-16">
        <h2 className = "px-2 lg:px-4 text-2xl font-medium text-zinc-800 mb-6">{label.photo_title}</h2>
        <SSR breakpoints = {[640, 768, 1024, 1280]}>
          <RowsPhotoAlbum photos={AlbumPhotos} defaultContainerWidth={1376} />
        </SSR>
      </div>
  )
}
