"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { Scene } from "./scene";
import { Envelope } from "./envelope";
import { Story } from "./story";
import { MemoryScrapbook } from "./red-thread-journey";
import { ui } from "@/lib/ui";
import { BackgroundMusic, type MusicHandle } from "./background-music";
import { stationery } from "@/lib/stationery";
export function LetterExperience({ content }: { content: LetterContent }) {
  const music = useRef<MusicHandle>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const completeOpening = useCallback(() => {
    setOpened(true);
    setOpening(false);
  }, []);

  useEffect(() => {
    const book = story.current;
    if (!opened || !book) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer =
      !reduced && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("has-entered");
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -7% 0px", threshold: 0 },
          )
        : null;

    if (observer) {
      book
        .querySelectorAll(".reveal, .narrative-prose > p, .gallery-photo")
        .forEach((element) => {
          // Album rows are hidden until their native details element opens.
          if (element.closest(".complete-album")) return;
          element.classList.add("fade-on-scroll");
          observer.observe(element);
        });
    }

    const frame = requestAnimationFrame(() => {
      book.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
      book.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [opened]);

  const open = () => {
    music.current?.start();
    if (opening) return;
    if (opened) {
      story.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      return;
    }
    setOpening(true);
  };

  const replay = () => {
    setOpened(false);
    setOpening(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    envelope.current?.querySelector("button")?.focus({ preventScroll: true });
  };

  return (
    <div
      className={`experience${opened ? " book-open" : ""}${opening ? " opening-letter" : ""}`}
      style={
        {
          "--bears": `url("${stationery.bears}")`,
          "--purple-figures": `url("${stationery.purpleFigures}")`,
          "--deckled-paper": `url("${stationery.paper}")`,
          "--curled-paper": `url("${stationery.curled}")`,
          "--warm-paper": `url("${stationery.warm}")`,
          "--ink-paper": `url("${stationery.ink}")`,
          "--maple": `url("${stationery.maple}")`,
          "--bloom": `url("${stationery.bloom}")`,
          "--stamp": `url("${stationery.stamp}")`,
          "--ribbon": `url("${stationery.ribbon}")`,
          "--ginkgo": `url("${stationery.ginkgo}")`,
          "--graph-tape": `url("${stationery.tape}")`,
          "--wax": `url("${stationery.wax}")`,
          "--paper-grain": `url("${stationery.grain}")`,
          "--pocket-closed": `url("${stationery.pocketClosed}")`,
          "--pocket-open": `url("${stationery.pocketOpen}")`,
          "--flower-note": `url("${stationery.flowerNote}")`,
        } as React.CSSProperties
      }
    >
      <Scene petals={!opened} />
      <BackgroundMusic ref={music} />
      <a href={opened ? "#story" : "#open-letter"} className="skip-link">
        {ui.skipToLetter}
      </a>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-heading">
          <p className="eyebrow hero-reveal">
            <span />
            {ui.brandSubtitle}
            <span />
          </p>
          <h1 id="hero-title" className="hero-reveal">
            {content.envelope.title}
          </h1>
          <p className="hero-subtitle hero-reveal">
            {content.envelope.subtitle}
          </p>
        </div>
        <div id="open-letter">
          <Envelope
            ref={envelope}
            recipient={content.recipient}
            inscription={content.envelope.inscription ?? content.envelope.title}
            opening={opening}
            opened={opened}
            onOpen={open}
            onOpened={completeOpening}
          />
        </div>
        <span className="hero-side hero-side-left latin">{ui.brand}</span>
        <span className="hero-side hero-side-right latin">
          {content.edition}
        </span>
        <div className="hero-bottom hero-reveal">
          <span className="hero-dedication">{ui.fromSender}</span>
          <button
            className="hero-scroll"
            onClick={open}
            disabled={opening}
            aria-label={opened ? ui.continueMemories : ui.openEnvelope}
          >
            <span>
              {opening
                ? ui.opening
                : opened
                  ? ui.continueMemories
                  : content.envelope.button}
            </span>
            <ArrowDown size={18} />
          </button>
        </div>
      </section>
      <main
        id="story"
        ref={story}
        hidden={!opened}
        tabIndex={-1}
        aria-label="محتوای نامه"
      >
        {opened && (
          <MemoryScrapbook>
            <Story content={content} onReplay={replay} />
          </MemoryScrapbook>
        )}
      </main>
      <div className="sr-only" aria-live="polite">
        {opening ? ui.opening : opened ? ui.opened : ui.openEnvelope}
      </div>
      <noscript>
        <div className="noscript-note">
          برای باز شدن پاکت و نمایش نامه جاوااسکریپت مرورگر را فعال کنید
        </div>
      </noscript>
    </div>
  );
}
