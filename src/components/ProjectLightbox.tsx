"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: Array<{
    url: string;
    altText?: string;
    caption?: string;
  }>;
}

export default function ProjectLightbox({ images }: LightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images.length) return null;

  return (
    <>
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
            className="group relative overflow-hidden rounded-xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={image.url}
                alt={image.altText || `Project image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % images.length);
          }}
          tabIndex={-1}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            autoFocus
          >
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute left-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="relative w-[90vw] max-w-4xl aspect-video">
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].altText || `Project image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          {images[lightboxIndex]?.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded text-sm">
              {images[lightboxIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
