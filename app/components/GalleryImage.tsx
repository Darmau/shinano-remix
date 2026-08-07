import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router";
import type {GalleryPhoto} from "~/utils/generatePhotoAlbum";

export default function GalleryImage({ image, width, classList }: { image: GalleryPhoto; width: number; classList: string }) {
  const { prefix } = useOutletContext<{ prefix: string }>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const base = image.width > image.height ? 'width' : 'height';
  const logPrefix = `[GalleryImage] ${image.storage_key}`;

  useEffect(() => {
    const imgElement = imgRef.current;

    if (imgElement && imgElement.complete) {
      console.log(`${logPrefix} already complete on mount, forcing loaded state`);
      setImageLoaded(true);
    }
  }, [image.storage_key, logPrefix]);

  const highResSrc = `${prefix}/cdn-cgi/image/format=auto,${base}=${width}/${image.storage_key}`;
  const highResSrcSet = `${highResSrc} 1x, ${prefix}/cdn-cgi/image/format=auto,${base}=${width * 2}/${image.storage_key} 2x`;

  return (
      <div className={`${classList} relative overflow-hidden`}>
        {/* Low resolution blurred image */}
        <img
            className={`scale-110 brightness-110 absolute inset-0 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            src={`${prefix}/cdn-cgi/image/format=auto,${base}=24}/${image.storage_key}`}
            alt={image.alt ?? ""}
            width={width}
            style={{ filter: 'blur(32px)' }}
        />

        {/* High resolution image */}
        <picture className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <source
              media="(max-width: 639px)"
              srcSet={highResSrc}
          />
          <source
              media="(min-width: 640px)"
              srcSet={highResSrcSet}
          />
          <img
              ref={imgRef}
              className="group-hover:scale-105 transition-all duration-300"
              src={highResSrc}
              srcSet={highResSrcSet}
              sizes="(max-width: 720px) 100vw, 2x"
              alt={image.alt ?? ""}
              width={width}
              onLoad={() => setImageLoaded(true)}
          />
        </picture>
      </div>
  );
}
