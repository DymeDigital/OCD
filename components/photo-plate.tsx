import Image from "next/image";
import type { Photo } from "@/content/data/photos";

export function PhotoPlate({ photo, priority = false }: { photo: Photo; priority?: boolean }) {
  return (
    <figure className="group relative aspect-[4/5] overflow-hidden rounded-[4px] bg-icing">
      <Image
        src={`/images/${photo.file}`}
        alt={photo.alt}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        priority={priority}
      />
    </figure>
  );
}
