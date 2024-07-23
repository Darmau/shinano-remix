import {Image} from "~/types/Image";
import {useOutletContext} from "@remix-run/react";

export default function ResponsiveImage({image, width, classList}: {image: Image, width: number, classList: string}) {
  const {prefix} = useOutletContext<{prefix: string}>();

  return (
      <img
          className = {classList}
          src = {`${prefix}/cdn-cgi/image/format=auto,width=${width}/${image.storage_key}`}
          srcSet = {`${prefix}/cdn-cgi/image/format=auto,width=${width}/${image.storage_key} 1x, ${prefix}/cdn-cgi/image/format=auto,width=${width * 2}/${image.storage_key} 2x`}
          alt = {image.alt || ''}
          width = {width}
      />
  )
}
