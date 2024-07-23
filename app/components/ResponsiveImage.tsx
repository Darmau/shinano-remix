import {Image} from "~/types/Image";
import {useOutletContext} from "@remix-run/react";

export default function ResponsiveImage({image}: {image: Image}) {
  const {prefix} = useOutletContext<{prefix: string}>();

  return (
      <img
          className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src = {`${prefix}/cdn-cgi/image/format=auto,width=360/${article.cover.storage_key}`}
          srcSet = ""
          alt = {image.alt || ''}
          height = "320"
          width = "960"
      />
  )
}
