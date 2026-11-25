"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { photoFastener, type Fastener } from "@/lib/photo-fasteners";
import { CopyText } from "./copy-text";
import responsiveImages from "@/content/responsive-images.json";
import { ui } from "@/lib/ui";
import { asset } from "@/lib/assets";
import type { LetterContent, LetterImage } from "@/lib/content";
export function Photo({
  image,
  className = "",
  eager = false,
  sizes = "(max-width: 760px) 88vw, (max-width: 1100px) 40vw, 500px",
}: {
  image: LetterImage;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <img
      className={`photo-load ${className}`}
      src={asset(image.src)}
      srcSet={!eager ? (responsiveImages as Record<string, {width:number;src:string}[]>)[image.src]?.map(copy=>`${asset(copy.src)} ${copy.width}w`).join(", ") : undefined}
      sizes={!eager ? sizes : undefined}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={(event) => event.currentTarget.classList.add("photo-decoded")}
      onError={(event) => event.currentTarget.classList.add("photo-decoded")}
    />
  );
}
// Pins, clips and tape are drawn over the frame edge, never over the photograph itself.
export function FastenerMark({ kind }: { kind: Fastener }) {
  if (kind === "none") return null;
  if (kind === "corners")
    return (
      <span className="fastener fastener-corners" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
    );
  return <span className={`fastener fastener-${kind}`} aria-hidden="true" />;
}
export function PhotoGallery({
  photos,
  swipeable = false,
  fasteners,
  captions = true,
  sizes,
  className = "",
}: {
  photos: LetterContent["gallery"];
  swipeable?: boolean;
  fasteners?: Fastener[];
  captions?: boolean;
  sizes?: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
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
      <div className={`gallery-grid${swipeable ? " gallery-swipeable" : ""} ${className}`}>
        {photos.map((photo, i) => {
          const fastener = fasteners?.[i] ?? photoFastener(photo.src);
          return (
            <button
              className={`gallery-photo gallery-photo-${i % 3}`}
              key={photo.id}
              data-fastener={fastener}
              onClick={() => open(i)}
              aria-label={`${ui.viewOriginalPhoto} ${photo.caption}`}
            >
              <FastenerMark kind={fastener} />
              <span className="photo-image">
                <Photo image={photo} sizes={sizes} />
                <span className="photo-expand">
                  <Expand size={16} />
                </span>
              </span>
              <span className="photo-caption">
                {captions && (
                  <span>
                    <CopyText text={photo.caption} />
                  </span>
                )}
                <span className="latin photo-number">{String(i + 1).padStart(2, "0")}</span>
              </span>
            </button>
          );
        })}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={ui.photoViewer}
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
        <div
          className="lightbox-inner"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current =
              event.touches.length === 1
                ? { x: touch.clientX, y: touch.clientY }
                : null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || photos.length < 2) return;
            const touch = event.changedTouches[0];
            const x = touch.clientX - start.x;
            const y = touch.clientY - start.y;
            if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.5)
              move(x < 0 ? 1 : -1);
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          <button
            className="icon-button lightbox-close"
            onClick={close}
            aria-label={ui.closePhoto}
          >
            <X />
          </button>
          <div className="lightbox-frame">
            {active && <Photo image={selected} eager />}
          </div>
          <div className="lightbox-toolbar">
            <button
              className="icon-button"
              onClick={() => move(-1)}
              aria-label={ui.previousPhoto}
              disabled={photos.length < 2}
            >
              <ArrowRight />
            </button>
            <p>
              <CopyText text={selected.caption} />
              <small className="latin">
                {index + 1} / {photos.length}
              </small>
            </p>
            <button
              className="icon-button"
              onClick={() => move(1)}
              aria-label={ui.nextPhoto}
              disabled={photos.length < 2}
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
            {ui.viewOriginalPhoto}
          </a>
        </div>
      </dialog>
    </>
  );
}
