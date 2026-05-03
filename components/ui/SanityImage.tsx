"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface SanityImageProps {
  value: {
    asset: {
      _id?: string;
      _ref?: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
          aspectRatio: number;
        };
      };
    };
    alt?: string;
  };
}

/**
 * Komponen SanityImage: Merender gambar dari Sanity menggunakan next/image.
 * Mendukung placeholder "blur" jika metadata lqip tersedia.
 */
export default function SanityImage({ value }: SanityImageProps) {
  if (!value?.asset?._id && !value?.asset?._ref) return null;

  const { metadata } = value.asset;
  const width = metadata?.dimensions?.width || 800;
  const height = metadata?.dimensions?.height || 600;

  return (
    <div className="my-10 relative overflow-hidden rounded-3xl border border-border shadow-2xl group">
      <Image
        src={urlFor(value).url()}
        alt={value.alt || "Gambar Ilustrasi"}
        width={width}
        height={height}
        placeholder={metadata?.lqip ? "blur" : "empty"}
        blurDataURL={metadata?.lqip}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 800px"
      />
      {value.alt && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <p className="text-xs font-medium italic">{value.alt}</p>
        </div>
      )}
    </div>
  );
}
