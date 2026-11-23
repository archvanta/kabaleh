"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Plus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LetterContent } from "@/lib/content";
import { Photo } from "./photo-gallery";
import { Flourish } from "./scene";

gsap.registerPlugin(ScrollTrigger);
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
export function HandDrawnCharacters({
  data,
}: {
  data: LetterContent["redThreadScene"];
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const thread =
        root.current?.querySelector<SVGPathElement>(".characters-thread");
      if (thread) {
        const n = thread.getTotalLength();
        gsap.fromTo(
          thread,
          { strokeDasharray: n, strokeDashoffset: n },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 70%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          },
        );
      }
      gsap.from(".hand-person", {
        opacity: 0,
        y: 8,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section
      ref={root}
      id="red-thread"
      className="characters-section story-section"
    >
      <div className="scrapbook-heading reveal">
        <span className="eyebrow latin">THE RED THREAD</span>
        <h2>{data.title}</h2>
        <p>{data.text}</p>
      </div>
      <div className="characters-paper paper">
        <span className="tape" />
        <svg
          className="characters-art"
          viewBox="0 0 700 320"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="characters-thread"
            d="M 3 224 C 83 276 183 212 175 145 C 165 92 103 115 135 149 C 167 181 183 105 244 92 C 299 80 347 190 401 137 C 458 80 381 48 376 103 C 370 170 545 145 548 223 C 554 278 620 280 631 249 C 646 212 577 203 579 248 C 581 281 675 262 697 227"
            stroke="#9b4b4a"
            strokeWidth="2.7"
            strokeLinecap="round"
          />
          <g
            className="hand-person"
            stroke="#75573e"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M175 166c-10-6-10-23 0-28 12-5 23 9 17 20-2 5-7 9-17 8Z M172 140c5-10 18-5 18 2M179 167l-2 47 15 0-7-46M178 179l-12 19M187 178l13 16M179 215l-5 30M188 215l6 29M175 246l-7 1M194 245l6 2" />
            <path d="M175 151h1M184 151h1M178 158q3 2 5-1" />
          </g>
          <g
            className="hand-person"
            stroke="#75573e"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M527 188c-12-2-13-22-3-28 12-8 24 4 20 17-2 8-7 12-17 11ZM519 164c-9 6-9 24-8 32M538 162c10 5 9 20 9 31M526 189l-14 42 34-1-11-41M522 204l-14 15M539 204l14 11M522 233l-1 27M536 232l4 28M521 260l-6 1M540 260l6 1" />
            <path d="M525 172h1M534 172h1M527 179q4 3 6-1" />
          </g>
        </svg>
        <span className="characters-caption">
          طرحی مستقل، الهام‌گرفته از یادگاری اصلی
        </span>
        <PressedBotanical />
      </div>
      <p className="artifact-caption latin">
        AN ILLUSTRATION INSPIRED BY THE GIFT · NOT THE ORIGINAL
      </p>
    </section>
  );
}
function ArtifactPhoto({ data }: { data: LetterContent["belfiMemory"] }) {
  if (data.image) return <Photo image={data.image} />;
  return (
    <div className="artifact-pending" role="img" aria-label={data.pendingLabel}>
      <span className="artifact-outline" aria-hidden="true" />
      <span>{data.pendingLabel}</span>
      <small>عکس اصلی بدون تغییر در این قاب قرار می‌گیرد.</small>
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
        <span className="eyebrow latin">A KEEPSAKE, UNCHANGED</span>
        <h2>{data.title}</h2>
        <Flourish />
        <p>{data.text}</p>
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
              یادگاری دست‌ساز · عکس اصلی
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
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top 65%",
      once: true,
      onEnter: () => setRevealed(true),
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setRevealed(true);
    return () => trigger.kill();
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
          aria-label={revealed ? "بستن قاب بلفی" : "باز کردن قاب بلفی"}
        >
          <ArrowUpLeft size={17} />
          <span>{revealed ? "بستن قاب" : "نمایش قاب"}</span>
        </button>
        <span className="tape" />
      </div>
      <div className="artifact-copy reveal">
        <span className="eyebrow latin">OUR LITTLE BELFI</span>
        <h2>{data.title}</h2>
        <p>{data.text}</p>
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
        <span className="pocket-flap" />
        <span className="pocket-number latin">N° 0{index + 1}</span>
        <span className="pocket-title">{note.title}</span>
        <span className="pocket-action">
          باز کردن یادداشت <Plus size={14} />
        </span>
      </summary>
      <div className="pocket-note paper">
        <Flourish />
        <p>{note.text}</p>
        <small>برای بستن، پاکت را دوباره لمس کن.</small>
      </div>
    </details>
  );
}
