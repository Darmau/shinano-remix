import {Image} from "~/types/Image";
import {useOutletContext} from "@remix-run/react";

export default function ResponsiveImage({image, width, classList}: {image: Image, width: number, classList: string}) {
  const {prefix} = useOutletContext<{prefix: string}>();

  // 根据宽高比，决定以那条边为基准
  const base = image.width > image.height ? 'width' : 'height';

  return (
      <picture>
        <source
            media = "(max-width: 639px)"
            srcSet = {`${prefix}/cdn-cgi/image/format=auto,${base}=${width}/${image.storage_key}`}
        />
        <source
            media = "(min-width: 640px)"
            srcSet = {`${prefix}/cdn-cgi/image/format=auto,${base}=${width}/${image.storage_key} 1x, ${prefix}/cdn-cgi/image/format=auto,${base}=${width * 2}/${image.storage_key} 2x`}
        />
        <img
            className = {classList}
            src = {`${prefix}/cdn-cgi/image/format=auto,${base}=${width}/${image.storage_key}`}
            srcSet = {`${prefix}/cdn-cgi/image/format=auto,${base}=${width}/${image.storage_key} 1x, ${prefix}/cdn-cgi/image/format=auto,${base}=${width * 2}/${image.storage_key} 2x`}
            sizes = "(max-width: 720px) 100vw, 2x"
            alt = {image.alt || ''}
            width = {width}
        />
      </picture>
  )
}
