"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Plus } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { Photo } from "./photo-gallery";
import { Flourish } from "./scene";
import { asset } from "@/lib/assets";
import { ui } from "@/lib/ui";
import { stationery } from "@/lib/stationery";
export function PressedBotanical({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pressed-botanical ${className}`}
      viewBox="0 0 130 190"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M60 181C57 134 78 97 72 32M63 145C40 122 33 109 24 90M64 128C90 100 96 80 102 69M67 108C54 85 45 73 39 55"
        stroke="#85805d"
        strokeWidth="1.6"
      />
      <path
        d="M64 144C39 141 29 126 32 114C45 116 60 129 64 144ZM64 128C73 102 86 97 92 102C88 116 76 127 64 128ZM69 98C49 96 42 83 44 76C56 78 66 85 69 98Z"
        fill="#8c8a6555"
      />
      <g fill="#b79756">
        <ellipse
          cx="72"
          cy="31"
          rx="10"
          ry="17"
          transform="rotate(-15 72 31)"
        />
        <ellipse
          cx="68"
          cy="34"
          rx="10"
          ry="17"
          transform="rotate(-65 68 34)"
        />
        <ellipse cx="77" cy="34" rx="10" ry="17" transform="rotate(65 77 34)" />
      </g>
      <g fill="#9c635a">
        <ellipse cx="39" cy="54" rx="9" ry="13" transform="rotate(-35 39 54)" />
        <ellipse cx="35" cy="59" rx="9" ry="12" transform="rotate(-80 35 59)" />
        <ellipse cx="44" cy="59" rx="8" ry="12" transform="rotate(60 44 59)" />
      </g>
      <g fill="#b79b62">
        <circle cx="101" cy="64" r="7" />
        <circle cx="106" cy="72" r="6" />
        <circle cx="96" cy="74" r="6" />
        <circle cx="25" cy="88" r="7" />
        <circle cx="20" cy="94" r="5" />
      </g>
      <path d="m48 160 27 6-4 16-28-7Z" fill="#d1b98d88" />
    </svg>
  );
}
export function InkFigures({ caption = false }: { caption?: boolean }) {
  return (
    <figure className="ink-figures reveal">
      <img
        src={stationery.figures}
        width={1000}
        height={333}
        alt=""
        loading="lazy"
        decoding="async"
      />
      {caption && <figcaption>{ui.illustrationCaption}</figcaption>}
    </figure>
  );
}

export function HandDrawnCharacters({
  data,
  embedded = false,
}: {
  data: LetterContent["redThreadScene"];
  embedded?: boolean;
}) {
  return (
    <section
      id={embedded ? undefined : "red-thread"}
      className={
        embedded
          ? "characters-section characters-embedded"
          : "characters-section story-section"
      }
    >
      <div className="scrapbook-heading reveal">
        {data.title && <h2>{data.title}</h2>}
        <p>{data.text}</p>
      </div>
      <InkFigures caption />
    </section>
  );
}

function ArtifactPhoto({ data }: { data: LetterContent["belfiMemory"] }) {
  if (data.image)
    return (
      <a
        href={asset(data.image.src)}
        target="_blank"
        rel="noreferrer"
        aria-label={ui.viewOriginalPhoto}
      >
        <Photo image={data.image} />
      </a>
    );
  return (
    <div className="artifact-pending" role="img" aria-label={data.pendingLabel}>
      <span className="artifact-outline" aria-hidden="true" />
      <span>{data.pendingLabel}</span>
      <small>عکس اصلی بدون تغییر در این قاب قرار میگیرد</small>
    </div>
  );
}
export function OriginalLetterMemory({
  data,
}: {
  data: LetterContent["originalHandwrittenLetter"];
}) {
  return (
    <section
      id="original-letter"
      className="original-letter-section story-section"
    >
      <div className="artifact-copy reveal">
        <h2>{data.title}</h2>
        {data.caption && <p className="narrative-caption">{data.caption}</p>}
        <Flourish />
        <p>{data.text}</p>
        {data.hiddenNote && (
          <HandmadeEnvelope
            note={{
              id: "original-note",
              title: ui.noteTitle,
              text: data.hiddenNote,
            }}
            index={0}
          />
        )}
        <span className="preservation-label">
          عکس اصلی · بدون بازطراحی یا تغییر
        </span>
      </div>
      <div className="original-letter-mount reveal">
        <div className="artifact-photo">
          <span className="tape" />
          <ArtifactPhoto data={data} />
          <span className="artifact-label">{data.label}</span>
        </div>
        {data.relatedImages.map((image, i) => (
          <figure key={i} className="related-artifact artifact-photo">
            <Photo image={image} />
            <figcaption className="artifact-label">
              یادگاری دستساز · عکس اصلی
            </figcaption>
          </figure>
        ))}
        <PressedBotanical />
      </div>
    </section>
  );
}
export function BelfiMemory({ data }: { data: LetterContent["belfiMemory"] }) {
  const root = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -24% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="belfi" ref={root} className="belfi-section story-section">
      <div className={`belfi-mount ${revealed ? "is-revealed" : ""}`}>
        <div className="belfi-underlay" />
        <div className="belfi-photo artifact-photo">
          <ArtifactPhoto data={data} />
          <span className="artifact-label">
            {data.label} <span className="latin">BELFI</span>
          </span>
        </div>
        <div className="belfi-cover" aria-hidden="true">
          <span className="latin">A LITTLE KEEPSAKE</span>
          <Flourish />
          <span>یک گوشهٔ کوچک از آلبوم</span>
          <ArrowUpLeft size={20} />
        </div>
        <button
          className="belfi-toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
          aria-label={
            revealed
              ? "\u0628\u0633\u062A\u0646 \u0642\u0627\u0628 \u0628\u0644\u0641\u06CC"
              : "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0642\u0627\u0628 \u0628\u0644\u0641\u06CC"
          }
        >
          <ArrowUpLeft size={17} />
          <span>
            {revealed
              ? "\u0628\u0633\u062A\u0646 \u0642\u0627\u0628"
              : "\u0646\u0645\u0627\u06CC\u0634 \u0642\u0627\u0628"}
          </span>
        </button>
        <span className="tape" />
      </div>
      <div className="artifact-copy reveal">
        <h2>{data.title}</h2>
        {data.caption && <p className="narrative-caption">{data.caption}</p>}
        <p>{data.text}</p>
        {data.hiddenNote && (
          <HandmadeEnvelope
            note={{
              id: "belfi-note",
              title: ui.noteTitle,
              text: data.hiddenNote,
            }}
            index={0}
          />
        )}
        <PressedBotanical />
      </div>
    </section>
  );
}
export function HandmadeEnvelope({
  note,
  index,
}: {
  note: LetterContent["notes"][number];
  index: number;
}) {
  return (
    <details className="handmade-envelope reveal">
      <summary>
        <span className="pocket-art" aria-hidden="true" />
        <span className="pocket-number" aria-hidden="true">
          ❧
        </span>
        <span className="pocket-title">{note.title}</span>
        <span className="pocket-action">
          {ui.revealNote} <Plus size={14} />
        </span>
      </summary>
      <div className="pocket-note paper">
        <Flourish />
        <p>{note.text}</p>
        <small>{ui.noteCloseHint}</small>
      </div>
    </details>
  );
}
