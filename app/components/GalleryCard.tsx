import { Link } from "react-router";
import type { GalleryItem, GalleryMediaImage } from "~/types/Gallery";
import getTime from "~/utils/getTime";

// 根据图片数量返回对应的 grid 布局类名
const getGridClass = (count: number): string => {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-2";
    default:
      // 5+ 图片：3x3 网格
      return "grid-cols-3";
  }
};

export default function GalleryCard({
  item,
  lang,
  prefix,
}: {
  item: GalleryItem;
  lang: string;
  prefix: string;
}) {
  const href =
    item.type === "photo"
      ? `/${lang}/album/${item.slug ?? item.id}`
      : `/${lang}/thought/${item.slug ?? item.id}`;

  const images = item.images;

  if (images.length === 0) {
    return null;
  }

  // 最多显示 9 张图片
  const displayImages = images.slice(0, 9);
  const remainingCount = images.length - 9;
  const gridClass = getGridClass(images.length);

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {item.type === "photo" && item.title && (
          <Link
            to={href}
            className="text-xl font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            {item.title}
          </Link>
        )}
      </div>

      {item.type === "thought" && item.content && (
        <Link to={href} className="block text-sm text-zinc-700 line-clamp-3">
          {item.content}
        </Link>
      )}

      <time className="text-sm text-zinc-500 tabular-nums">
        {getTime(item.createdAt, lang)}
      </time>

      <Link to={href} className={`grid ${gridClass} gap-1 rounded-lg overflow-hidden`}>
        {displayImages.map((image, index) => {
          const isLastWithMore = index === 8 && remainingCount > 0;

          return (
            <div key={image.id} className="relative overflow-hidden aspect-square">
              <img
                src={`${prefix}/cdn-cgi/image/format=auto,width=720/${image.storage_key}`}
                alt={image.alt ?? ""}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {isLastWithMore && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">+{remainingCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </Link>
    </li>
  );
}
