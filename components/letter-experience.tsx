"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowLeft, Menu, X } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { Scene, Flourish } from "./scene";
import { Envelope } from "./envelope";
import { Story } from "./story";
import { MemoryScrapbook } from "./red-thread-journey";
import { ui } from "@/lib/ui";
gsap.registerPlugin(ScrollTrigger);
export function LetterExperience({ content }: { content: LetterContent }) {
  const root = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [progress, setProgress] = useState(0);
  const visible = content.narrative
    .filter((s) => s.visible)
    .map((s) => ({ id: s.id, title: s.title }));
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(".hero-reveal", {
          y: 18,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out",
        });
        gsap.from(".envelope-stage", {
          y: 35,
          rotation: -2,
          opacity: 0,
          duration: 1.6,
          delay: 0.25,
          ease: "power3.out",
        });
      }, root);
      return () => ctx.revert();
    });
    return () => {
      mm.revert();
      timeline.current?.kill();
    };
  }, []);
  useEffect(() => {
    if (!opened || !story.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 32, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            },
          );
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 12 },
            {
              y: -12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            },
          );
        });
      }
      ScrollTrigger.create({
        trigger: story.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(Math.round(self.progress * 100)),
      });
      ScrollTrigger.create({
        trigger: story.current?.querySelector("#letter"),
        start: "top 80%",
        end: "bottom 20%",
        toggleClass: { targets: root.current!, className: "reading-final" },
      });
    }, story);
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      story.current?.scrollIntoView({
        behavior: reduce ? "instant" : "smooth",
        block: "start",
      });
      story.current?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [opened]);
  const open = () => {
    if (opening) return;
    if (opened) {
      story.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setOpening(true);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const q = gsap.utils.selector(envelope);
    timeline.current = gsap
      .timeline({
        onComplete: () => {
          setOpened(true);
          setOpening(false);
        },
      })
      .to(q(".wax-seal"), { scale: 1.08, duration: reduce ? 0 : 0.18 })
      .to(q(".wax-seal"), {
        scale: 0.75,
        opacity: 0,
        y: 24,
        rotation: 12,
        duration: reduce ? 0 : 0.38,
        ease: "power2.in",
      })
      .set(q(".envelope-flap"), { zIndex: 1 })
      .to(q(".envelope-flap"), {
        rotationX: 180,
        duration: reduce ? 0 : 0.85,
        ease: "power2.inOut",
      })
      .to(
        q(".letter-insert"),
        {
          yPercent: -65,
          rotation: -2,
          duration: reduce ? 0 : 1,
          ease: "power3.inOut",
        },
        reduce ? ">" : "-=.2",
      )
      .set(q(".letter-insert"), { zIndex: 8 })
      .to(q(".letter-insert"), {
        yPercent: -85,
        scale: 1.12,
        rotation: 0,
        duration: reduce ? 0 : 0.65,
        ease: "power2.out",
      })
      .to(q(".letter-wing"), {
        rotationX: 0,
        duration: reduce ? 0 : 0.65,
        ease: "power2.inOut",
      })
      .to(
        q(".insert-lines"),
        { scaleX: 1, duration: reduce ? 0 : 0.3, stagger: 0.12 },
        ">",
      );
  };
  const replay = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpened(false);
    setOpening(false);
    setProgress(0);
    timeline.current?.kill();
    const q = gsap.utils.selector(envelope);
    gsap.set(q(".wax-seal"), { clearProps: "all" });
    gsap.set(q(".envelope-flap"), { clearProps: "all" });
    gsap.set(q(".letter-insert"), { clearProps: "all" });
    gsap.set(q(".insert-lines"), { clearProps: "all" });
    gsap.set(q(".letter-wing"), { clearProps: "all" });
    envelope.current?.querySelector("button")?.focus({ preventScroll: true });
  };
  return (
    <div ref={root} className={`experience ${opened ? "is-open" : ""}`}>
      <Scene />
      <a href={opened ? "#story" : "#open-letter"} className="skip-link">
        {ui.skipToLetter}
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="مشکات ابتدای نامه">
          <svg
            className="brand-flower"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="currentColor" strokeWidth="1">
              <ellipse cx="20" cy="13" rx="5" ry="11" />
              <ellipse cx="20" cy="27" rx="5" ry="11" />
              <ellipse cx="13" cy="20" rx="11" ry="5" />
              <ellipse cx="27" cy="20" rx="11" ry="5" />
              <circle cx="20" cy="20" r="3" fill="currentColor" />
            </g>
          </svg>
          <span className="latin">
            {ui.brand}
            <small>{ui.brandSubtitle}</small>
          </span>
        </a>
        <span className="header-center">{content.envelope.title}</span>
        <div className="header-actions">
          <span className="edition-dot" />
          <button
            className="header-button"
            onClick={() => (opened ? menu.current?.showModal() : open())}
          >
            {opened ? ui.contents : ui.openEnvelope}
            {opened ? <Menu size={16} /> : <ArrowLeft size={15} />}
          </button>
        </div>
        {opened && (
          <div
            className="reading-progress"
            role="progressbar"
            aria-label="پیشرفت خواندن نامه"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>
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
            sender={content.sender}
            opening={opening}
            opened={opened}
            onOpen={open}
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
              {opened ? ui.continueMemories : content.envelope.button}
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
      <dialog className="paper-dialog" ref={menu} aria-label={ui.contents}>
        <button
          className="icon-button dialog-close"
          onClick={() => menu.current?.close()}
          aria-label="بستن فهرست"
        >
          <X />
        </button>
        <h2>{ui.contents}</h2>
        <Flourish />
        <nav>
          {visible.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => menu.current?.close()}
            >
              <span className="latin">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
              <ArrowLeft size={17} />
            </a>
          ))}
        </nav>
      </dialog>
      <noscript>
        <div className="noscript-note">
          برای باز شدن پاکت و نمایش نامه جاوااسکریپت مرورگر را فعال کنید
        </div>
      </noscript>
    </div>
  );
}
