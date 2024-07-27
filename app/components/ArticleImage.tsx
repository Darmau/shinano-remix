import {useEffect, useRef, useState} from "react";
import {useOutletContext} from "@remix-run/react";
import {ImageAttrs} from "~/components/ContentContainer";
import { InformationCircleIcon} from "@heroicons/react/20/solid";

export default function ArticleImage({attrs}: { attrs: ImageAttrs }) {
  const {prefix} = useOutletContext<{ prefix: string }>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  const highResSrc = `${prefix}/cdn-cgi/image/format=auto,width=740/${attrs.storage_key}`;
  const highResSrcSet = `${highResSrc} 1x, ${prefix}/cdn-cgi/image/format=auto,width=1280/${attrs.storage_key} 2x`;

  return (
      <figure>
        <div className = "relative overflow-hidden rounded-md" id = {`image-${attrs.id}`}>
          {/* Low resolution blurred image */}
          <img
              className = {`brightness-110 absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              src = {`${prefix}/cdn-cgi/image/format=auto,width=56/${attrs.storage_key}`}
              alt = {attrs.alt || ''}
              width = "740"
              style = {{filter: 'blur(20px)'}}
          />

          {/* High resolution image */}
          <picture className = {`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <source
                media = "(max-width: 639px)"
                srcSet = {highResSrc}
            />
            <source
                media = "(min-width: 640px)"
                srcSet = {highResSrcSet}
            />
            <img
                ref = {imgRef}
                className = "group-hover:scale-105 w-full h-full object-cover transition-all duration-300"
                src = {highResSrc}
                srcSet = {highResSrcSet}
                sizes = "(max-width: 720px) 100vw, 2x"
                alt = {attrs.alt || ''}
                width = "740"
                onLoad = {() => setImageLoaded(true)}
            />
          </picture>
        </div>
        {attrs.caption && (
            <figcaption className="my-3 flex justify-start items-start gap-2 text-zinc-600">
              <InformationCircleIcon className = "mt-0.5 w-5 h-5 inline-block text-zinc-400"/>
              {attrs.caption}
            </figcaption>)}
      </figure>
  );
}
