import "yet-another-react-lightbox/styles.css";
import {useOutletContext} from "@remix-run/react";
import Lightbox from "yet-another-react-lightbox";
import {useState} from "react";
import {Captions, Inline, Thumbnails} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import {ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/solid";

export interface AlbumPhoto {
  order: number,
  image: {
    alt: string,
    caption: string,
    height: number,
    width: number,
    storage_key: string,
    exif: JSON,
    location: string
  }
}

export default function GallerySlide({albumImages}: { albumImages: AlbumPhoto[] }) {
  const {prefix} = useOutletContext<{ prefix: string }>();
  const [open, setOpen] = useState(false);

  const defaultSlides = generateSlides(albumImages, prefix, 1080);
  const fullscreenSlides = generateSlides(albumImages, prefix, 1600);

  return (
      <div>
        <div>
          <Lightbox
            plugins={[Inline, Thumbnails]}
            inline={{
              style: { width: "100%", maxWidth: "1280", aspectRatio: "3 / 2"}
            }}
            slides={defaultSlides}
            styles={{
              container: { backgroundColor: "white" },
              thumbnailsContainer: { backgroundColor: "white" },
              button: { filter: "none" }
            }}
            thumbnails={{
              imageFit: 'contain',
              vignette: false,
              padding: 0,
              border: 3,
              borderColor: '#52525b',
            }}
            render={{
              iconPrev: () => <ChevronLeftIcon aria-hidden = "true" className = "h-5 w-5 text-black"/>,
              iconNext: () => <ChevronRightIcon aria-hidden = "true" className = "h-5 w-5 text-black"/>
            }}
          />
        </div>
        <div className="flex justify-center">
          <button
              onClick = {() => setOpen(true)}
              type = "button"
              className = "inline-flex items-center gap-x-1.5 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowsPointingOutIcon aria-hidden = "true" className = "h-5 w-5"/>
            Full Screen
          </button>
        </div>
        <Lightbox
            open = {open}
            close = {() => setOpen(false)}
            slides = {fullscreenSlides}
            plugins = {[Thumbnails, Captions]}
        />
      </div>
  )
}

function generateSlides(albumImages: AlbumPhoto[], prefix: string, targetWidth: number) {
  return albumImages.map((photo) => {
    return {
      src: `${prefix}/cdn-cgi/image/format=auto,width=${targetWidth}/${photo.image.storage_key}`,
      alt: photo.image.alt,
      width: photo.image.width,
      height: photo.image.height,
      title: photo.image.caption,
      secSet: [
        {
          src: `${prefix}/cdn-cgi/image/format=auto,width=640/${photo.image.storage_key}`,
          width: 640,
          height: Math.floor(640 * photo.image.height / photo.image.width)
        },
        {
          src: `${prefix}/cdn-cgi/image/format=auto,width=1080/${photo.image.storage_key}`,
          width: 1080,
          height: Math.floor(1080 * photo.image.height / photo.image.width)
        },
        {
          src: `${prefix}/cdn-cgi/image/format=auto,width=1920/${photo.image.storage_key}`,
          width: 1440,
          height: Math.floor(1440 * photo.image.height / photo.image.width)
        }
      ]
    }
  })
}
