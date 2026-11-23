"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { asset } from "@/lib/assets";
import type { LetterContent, LetterImage } from "@/lib/content";

export function Photo({
  image,
  className = "",
}: {
  image: LetterImage;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={asset(image.src)}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  );
}
export function PhotoGallery({ photos }: { photos: LetterContent["gallery"] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const selected = photos[index];
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
  const open = (i: number) => {
    setIndex(i);
    setActive(true);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setActive(false);
  };
  const move = (delta: number) =>
    setIndex((i) => (i + delta + photos.length) % photos.length);
  if (!photos.length) return null;
  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <button
            className={`gallery-photo reveal gallery-photo-${i % 3}`}
            key={photo.id}
            onClick={() => open(i)}
            aria-label={`بزرگ‌نمایی ${photo.caption}`}
          >
            <span className="photo-image">
              <Photo image={photo} />
              <span className="photo-expand">
                <Expand size={18} />
              </span>
            </span>
            <span className="photo-caption">
              <span>{photo.caption}</span>
              <span className="latin">0{i + 1}</span>
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="نمایش بزرگ تصاویر"
        onClose={() => setActive(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        <div className="lightbox-inner">
          <button
            className="icon-button lightbox-close"
            onClick={close}
            aria-label="بستن تصویر"
          >
            <X />
          </button>
          <Photo image={selected} />
          <div className="lightbox-toolbar">
            <button
              className="icon-button"
              onClick={() => move(-1)}
              aria-label="تصویر قبلی"
            >
              <ArrowRight />
            </button>
            <p>
              {selected.caption}
              <small>
                {index + 1} / {photos.length}
              </small>
            </p>
            <button
              className="icon-button"
              onClick={() => move(1)}
              aria-label="تصویر بعدی"
            >
              <ArrowLeft />
            </button>
          </div>
          <a
            className="original-photo-link"
            href={asset(selected.src)}
            target="_blank"
            rel="noreferrer"
          >
            باز کردن فایل تصویر
          </a>
        </div>
      </dialog>
    </>
  );
}
