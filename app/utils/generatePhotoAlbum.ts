export interface FeaturedPhoto {
  id: number;
  slug: string | null;
  title: string;
  language: {
    lang: string | null;
  };
  cover: {
    id: string;
    alt: string | null;
    storage_key: string;
    width: number;
    height: number;
  };
}

export interface GalleryPhoto {
  key: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  label: string;
  title: string;
  storage_key?: string;
}

export function generatePhotoAlbum(featuredPhotos: FeaturedPhoto[], prefix: string, lang: string) {
  return featuredPhotos.map((photo: FeaturedPhoto) => ({
    key: photo.id.toString(),
    src: `${prefix}/cdn-cgi/image/format=auto,width=560/${photo.cover.storage_key}`,
    width: photo.cover.width,
    height: photo.cover.height,
    alt: photo.title,
    href: `/${lang}/album/${photo.slug}`,
    label: photo.title,
    storage_key: photo.cover.storage_key,
    title: photo.title
  }))
}
