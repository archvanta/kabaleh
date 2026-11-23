"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Box, MoveHorizontal, X } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { ui } from "@/lib/ui";
import { asset } from "@/lib/assets";
import { Photo } from "./photo-gallery";
import { Flourish } from "./scene";
import { HandmadeEnvelope, PressedBotanical } from "./personal-memories";
const Viewer = dynamic(
  () => import("./keepsake-viewer").then((m) => m.Bracelet3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="viewer-loading" role="status">
        در حال آمادهکردن نمایشگر…
      </div>
    ),
  },
);
const PinViewer = dynamic(
  () => import("./keepsake-viewer").then((m) => m.BagPin3DViewer),
  { ssr: false },
);
type Item = LetterContent["keepsakes"]["items"][number];
export function KeepsakeReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`keepsake-reveal ${className}`}>{children}</div>;
}
export function KeepsakeContent({ text }: { text: string }) {
  return <p className="keepsake-content">{text}</p>;
}
export function BraceletMemoryCard({
  item,
  onInspect,
}: {
  item: Item;
  onInspect: () => void;
}) {
  return (
    <article className="bracelet-memory-card reveal" data-order={item.order}>
      <span className="bracelet-number latin">0{item.order}</span>
      <button
        className="bracelet-inspect"
        onClick={onInspect}
        aria-label={`\u0646\u0645\u0627\u06CC\u0634 \u0633\u0647 \u0628\u0639\u062F\u06CC ${item.title}`}
      >
        <span className="bracelet-preview">
          <img
            src={asset(`/models/${item.id}.png`)}
            alt={`\u0646\u0645\u0627\u06CC \u062B\u0627\u0628\u062A \u0628\u0627\u0632\u0633\u0627\u0632\u06CC \u0633\u0647 \u0628\u0639\u062F\u06CC ${item.title}`}
            width={520}
            height={460}
            loading="lazy"
          />
        </span>
        <span className="inspect-label">
          <Box size={14} />
          {ui.inspect}
        </span>
      </button>
      <h3>{item.title}</h3>
      {item.date && <p>{item.date}</p>}
      <KeepsakeContent text={item.story} />
    </article>
  );
}
export function KeepsakeTimeline({
  data,
}: {
  data: LetterContent["keepsakes"];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Item | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [active]);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".bracelet-preview", {
        rotate: 5,
        y: 18,
        stagger: 0.14,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      const path = root.current?.querySelector<SVGPathElement>(
        ".keepsake-connecting-thread path",
      );
      if (path) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 65%",
              end: "bottom 70%",
              scrub: 0.7,
            },
          },
        );
      }
    }, root);
    return () => ctx.revert();
  }, []);
  const open = (item: Item) => {
    setActive(item);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setActive(null);
  };
  return (
    <section
      id="keepsakes"
      className="keepsakes-section story-section"
      ref={root}
    >
      <div className="scrapbook-heading reveal">
        <h2>{data.title}</h2>
        <p>{data.text}</p>
        <Flourish />
      </div>
      <KeepsakeReveal>
        <div
          className="bracelet-timeline"
          role="region"
          aria-label="چهار دستبند از قدیمیتر به جدیدتر"
          tabIndex={0}
        >
          <div className="bracelet-timeline-track">
            <svg
              className="keepsake-connecting-thread"
              viewBox="0 0 1000 130"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 65C70 12 112 115 185 76S248 8 235 48 287 112 357 70 410 19 485 74 538 126 516 91 588 15 651 63 700 115 759 71 838 4 818 46 930 103 1000 65"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
            {data.items
              .filter((i) => i.visible)
              .map((item) => (
                <BraceletMemoryCard
                  item={item}
                  onInspect={() => open(item)}
                  key={item.id}
                />
              ))}
          </div>
        </div>
        <p className="timeline-direction">
          <span>قدیمیتر</span>
          <MoveHorizontal size={17} />
          <span>جدیدتر</span>
        </p>
        <p className="model-accuracy-note">{ui.accuracy}</p>
      </KeepsakeReveal>
      <dialog
        ref={dialog}
        className="keepsake-dialog"
        aria-label="بررسی سه بعدی یادگاری"
        onClose={() => setActive(null)}
      >
        <button
          className="icon-button dialog-close"
          onClick={close}
          aria-label="بستن نمایش سه بعدی"
        >
          <X />
        </button>
        {active && (
          <>
            <span className="eyebrow">{active.order}</span>
            <h3>{active.title}</h3>
            <Viewer modelPath={active.modelPath} title={active.title} />
            <p className="model-accuracy-note">{active.caption}</p>
            <KeepsakeContent text={active.story} />
            {active.referenceImage && (
              <details className="reference-photo-note">
                <summary>دیدن عکس اصلی</summary>
                <Photo image={active.referenceImage} />
              </details>
            )}
          </>
        )}
      </dialog>
    </section>
  );
}
export function BraceletMemoryTimeline(props: {
  data: LetterContent["keepsakes"];
}) {
  return <KeepsakeTimeline {...props} />;
}
export function BagPinMemory({ data }: { data: LetterContent["bagPin"] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(false);
  if (!data.visible) return null;
  return (
    <section id="bag-pin" className="bag-pin-section story-section">
      <div className="artifact-copy reveal">
        <h2>{data.title}</h2>
        <Flourish />
        <p className="narrative-caption">{data.caption}</p>
      </div>
      <KeepsakeReveal className="pin-paper paper reveal">
        <span className="tape" />
        {data.referenceImage ? (
          <div className="pin-original-photo">
            <Photo image={data.referenceImage} />
            <p className="artifact-caption">عکس اصلی · بدون تغییر</p>
          </div>
        ) : (
          <div className="pin-caption-paper">
            <Flourish />
            <p>{data.caption}</p>
          </div>
        )}
        {data.modelPath && (
          <button
            className="text-button"
            onClick={() => {
              setActive(true);
              dialog.current?.showModal();
            }}
          >
            دیدن پین سه بعدی <Box size={16} />
          </button>
        )}
        <HandmadeEnvelope
          note={{ id: "pin-note", title: ui.noteTitle, text: data.text }}
          index={0}
        />
        <PressedBotanical />
      </KeepsakeReveal>
      <dialog
        ref={dialog}
        className="keepsake-dialog"
        aria-label="بررسی پین کیف"
        onClose={() => setActive(false)}
      >
        <button
          className="icon-button dialog-close"
          onClick={() => {
            dialog.current?.close();
            setActive(false);
          }}
          aria-label="بستن نمایش پین"
        >
          <X />
        </button>
        <h3>{data.title}</h3>
        {active && data.modelPath && (
          <PinViewer title={data.title} modelPath={data.modelPath} />
        )}
      </dialog>
    </section>
  );
}
