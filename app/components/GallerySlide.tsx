import "yet-another-react-lightbox/styles.css";
import { useOutletContext } from "react-router";
import Lightbox from "yet-another-react-lightbox";
import {useEffect, useMemo, useState} from "react";
import {Captions, Inline, Thumbnails} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import {ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/solid";
import debounce from "lodash/debounce";
import type {EXIFProps} from "~/components/EXIF";
import EXIF from "~/components/EXIF";
import { trackViewFullscreen } from "~/utils/zaraz";

export interface AlbumPhoto {
  order: number,
  image: {
    alt: string,
    caption: string,
    height: number,
    width: number,
    storage_key: string,
    exif: JSON,
    location: string,
    latitude?: number | null,
    longitude?: number | null
  }
}

interface GallerySlideProps {
  albumImages: AlbumPhoto[];
  onIndexChange: (index: number) => void;
  albumTitle?: string;
}

export default function GallerySlide({albumImages, onIndexChange, albumTitle}: GallerySlideProps) {
  const {prefix} = useOutletContext<{ prefix: string }>();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const debouncedOnChange = useMemo(
      () => debounce((currentIndex: number) => {
        setIndex(currentIndex);
        onIndexChange(currentIndex);
      }, 300),
      [onIndexChange]
  );

  useEffect(() => () => {
    debouncedOnChange.cancel();
  }, [debouncedOnChange]);

  const defaultSlides = generateSlides(albumImages, prefix, 1280);
  const fullscreenSlides = generateSlides(albumImages, prefix, 2400);

  return (
      <div>
        <div className="relative group">
          <Lightbox
            index={index}
            plugins={[Inline, Thumbnails]}
            inline={{
              style: { width: "100%", maxWidth: "1280", aspectRatio: "5 / 4"}
            }}
            slides={defaultSlides}
            styles={{
              container: { backgroundColor: "transparent" },
              thumbnail: { gap: "16px" },
              thumbnailsContainer: { backgroundColor: "transparent" },
              button: { filter: "none" },
              slide: { padding: 0},
            }}
            thumbnails={{
              imageFit: 'contain',
              vignette: false,
              padding: 0,
              border: 3,
              borderColor: '#52525b'
            }}
            render={{
              iconPrev: () => <div className="p-2 rounded-full bg-white/60 backdrop-blur-2xl">
                <ChevronLeftIcon aria-hidden = "true" className = "h-5 w-5 text-black"/>
              </div>,
              iconNext: () => <div className="p-2 rounded-full bg-white/60 backdrop-blur-2xl">
                <ChevronRightIcon aria-hidden = "true" className = "h-5 w-5 text-black"/>
              </div>,
              slideFooter: () => (
                  <div className="hidden md:block p-4 absolute w-full bottom-0 bg-linear-to-t from-black/60 to-transparent text-white">
                    {albumImages[index].image.caption &&
                        <p className="mb-4">
                          {albumImages[index].image.caption}
                        </p>}
                    <EXIF exif = {albumImages[index].image.exif as unknown as EXIFProps} />
                  </div>
              )
            }}
            on={{
              view: ({ index: currentIndex }) => {
                debouncedOnChange(currentIndex);
              }
            }}
          />
          <button
              onClick = {() => {
                setOpen(true);
                if (albumTitle) {
                  trackViewFullscreen(albumTitle);
                }
              }}
              type = "button"
              aria-label = "Full Screen"
              className = "absolute top-8 right-8 z-50 p-2 rounded-full bg-white/60 backdrop-blur-2xl"
          >
            <ArrowsPointingOutIcon aria-hidden = "true" className = "h-5 w-5"/>
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
          height: Math.floor(1920 * photo.image.height / photo.image.width)
        }
      ]
    }
  })
}
