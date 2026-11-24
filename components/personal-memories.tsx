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
  return <img className={`pressed-botanical ${className}`} src={stationery.botanical}
    width={260} height={390} alt="" aria-hidden="true" loading="lazy" decoding="async" />;
}

export function InkFigures({ caption = false }: { caption?: boolean }) {
  return (
    <figure className="ink-figures reveal">
      <img
        src={stationery.figures}
        width={1000}
        height={500}
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
