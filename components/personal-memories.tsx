"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Plus } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { FastenerMark, Photo } from "./photo-gallery";
import { Flourish } from "./scene";
import { asset } from "@/lib/assets";
import { ui } from "@/lib/ui";
import { stationery } from "@/lib/stationery";
import { CopyText } from "./copy-text";
export function PressedBotanical({ className = "" }: { className?: string }) {
  return <img className={`pressed-botanical ${className}`} src={stationery.botanical}
    width={260} height={342} alt="" aria-hidden="true" loading="lazy" decoding="async" />;
}

// The two figures stand on the red thread; their feet mark where the path runs.
export function InkFigures({ caption = false }: { caption?: boolean }) {
  return (
    <figure className="ink-figures reveal">
      <img
        className="thread-figures"
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
      <div className="characters-copy reveal">
        {data.title && <h2>{data.title}</h2>}
        <p><CopyText text={data.text} /></p>
      </div>
      <InkFigures caption />
    </section>
  );
}

function ArtifactPhoto({ data, sizes }: { data: LetterContent["belfiMemory"]; sizes?: string }) {
  if (data.image)
    return (
      <a
        href={asset(data.image.src)}
        target="_blank"
        rel="noreferrer"
        aria-label={`${ui.viewOriginalPhoto} ${data.image.alt}`}
      >
        <Photo image={data.image} sizes={sizes} />
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
  children,
}: {
  data: LetterContent["originalHandwrittenLetter"];
  children?: React.ReactNode;
}) {
  return (
    <section
      id="original-letter"
      className="original-letter-section story-section"
    >
      <div className="object-heading reveal">
        <h2><CopyText text={data.title} /></h2>
        {data.caption && <p className="narrative-caption"><CopyText text={data.caption} /></p>}
      </div>
      <div className="original-letter-mount reveal">
        <span className="mount-botanical" aria-hidden="true" />
        <div className="artifact-photo keepsake-hero" data-fastener="corners">
          <FastenerMark kind="corners" />
          <ArtifactPhoto data={data} sizes="(max-width: 760px) 78vw, 440px" />
          <span className="artifact-label">{data.label}</span>
        </div>
        {data.relatedImages.map((image, i) => (
          <figure key={i} className="related-artifact artifact-photo" data-fastener="tape">
            <FastenerMark kind="tape" />
            <Photo image={image} />
            <figcaption className="artifact-label">
              یادگاری دستساز · عکس اصلی
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="artifact-copy reveal">
        <Paragraphs text={data.text} />
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
      {children}
    </section>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="narrative-prose">
      {text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
        <p key={index}><CopyText text={paragraph} /></p>
      ))}
    </div>
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
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="belfi" ref={root} className="belfi-section story-section">
      <div className="object-heading reveal">
        <h2><CopyText text={data.title} /></h2>
      </div>
      <div className={`belfi-mount ${revealed ? "is-revealed" : ""}`}>
        <div className="belfi-photo artifact-photo" data-fastener="tape">
          <FastenerMark kind="tape" />
          <ArtifactPhoto data={data} sizes="(max-width: 760px) 76vw, 420px" />
          <span className="artifact-label">
            {data.label} <span className="latin">BELFI</span>
          </span>
        </div>
        <div className="belfi-cover" aria-hidden="true">
          <span className="latin">A LITTLE KEEPSAKE</span>
          <Flourish />
          <span>یک گوشهٔ کوچک از آلبوم</span>
        </div>
        <button
          className="belfi-toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
          aria-label={revealed ? ui.closeBelfi : ui.openBelfi}
        >
          <ArrowUpLeft size={16} />
          <span>{revealed ? ui.closeFrame : ui.showFrame}</span>
        </button>
      </div>
      {data.caption && <p className="memory-caption-note"><CopyText text={data.caption} /></p>}
      <div className="artifact-copy reveal">
        <Paragraphs text={data.text} />
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
    <details className="handmade-envelope reveal" data-index={index}>
      <summary>
        <span className="pocket-art" aria-hidden="true" />
        <span className="pocket-title">{note.title}</span>
        <span className="pocket-action">
          {ui.revealNote} <Plus size={14} />
        </span>
      </summary>
      <div className="pocket-note">
        <Paragraphs text={note.text} />
        <small>{ui.noteCloseHint}</small>
      </div>
    </details>
  );
}
