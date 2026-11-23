"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowLeft, Menu, X } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { Scene, Flourish } from "./scene";
import { Envelope } from "./envelope";
import { Story, sectionTitles } from "./story";
import { MemoryScrapbook } from "./red-thread-journey";

gsap.registerPlugin(ScrollTrigger);
export function LetterExperience({ content }: { content: LetterContent }) {
  const root = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const info = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [progress, setProgress] = useState(0);
  const visible = content.sections.filter((s) => s.visible);
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
        رفتن به نامه
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="مشکات، ابتدای نامه">
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
            MESHKAT<small>A LETTER FOR YOU</small>
          </span>
        </a>
        <span className="header-center">یک نامه، فقط برای تو</span>
        <div className="header-actions">
          <span className="edition-dot" />
          <button
            className="header-button"
            onClick={() =>
              opened ? menu.current?.showModal() : info.current?.showModal()
            }
          >
            {opened ? "فهرست نامه" : "دربارهٔ نامه"}
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
            به وقتِ یک روزِ خاص
            <span />
          </p>
          <h1 id="hero-title" className="hero-reveal">
            برای تو، <span>{content.recipient}</span>
          </h1>
          <p className="hero-subtitle hero-reveal">
            یک دنیای کوچک، در پاکتی برای تو.
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
        <span className="hero-side hero-side-left latin">
          A LITTLE WORLD, SEALED FOR YOU.
        </span>
        <span className="hero-side hero-side-right latin">
          {content.edition}
        </span>
        <div className="hero-bottom hero-reveal">
          <span className="hero-dedication">
            از {content.sender}، برای {content.recipient}
            <small className="latin">A PERSONAL BIRTHDAY LETTER</small>
          </span>
          <button
            className="hero-scroll"
            onClick={open}
            disabled={opening}
            aria-label={
              opened ? "ادامهٔ خواندن نامه" : "باز کردن و خواندن نامه"
            }
          >
            <span>{opened ? "ادامهٔ نامه" : "قصه از اینجا شروع می‌شود"}</span>
            <ArrowDown size={18} />
          </button>
          <span className="demo-label">
            <span />
            نسخهٔ نمایشی<small>متن‌ها و تصاویر قابل جایگزینی‌اند</small>
          </span>
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
        {opening
          ? "در حال باز کردن پاکت"
          : opened
            ? "نامه باز شد. برای ادامه به پایین بروید."
            : "نامه آمادهٔ باز کردن است."}
      </div>
      <dialog className="paper-dialog" ref={menu} aria-label="فهرست نامه">
        <button
          className="icon-button dialog-close"
          onClick={() => menu.current?.close()}
          aria-label="بستن فهرست"
        >
          <X />
        </button>
        <span className="latin eyebrow">INSIDE THE LETTER</span>
        <h2>صفحه به صفحه</h2>
        <Flourish />
        <nav>
          {visible.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => menu.current?.close()}
            >
              <span className="latin">0{i + 1}</span>
              {sectionTitles[s.id]}
              <ArrowLeft size={17} />
            </a>
          ))}
        </nav>
      </dialog>
      <dialog
        className="paper-dialog info-dialog"
        ref={info}
        aria-label="دربارهٔ نامه"
      >
        <button
          className="icon-button dialog-close"
          onClick={() => info.current?.close()}
          aria-label="بستن توضیحات"
        >
          <X />
        </button>
        <Flourish />
        <h2>نامه‌ای برای {content.recipient}</h2>
        <p>
          این نسخه، ساختار و طراحی نامه را نمایش می‌دهد. همهٔ نوشته‌ها و عکس‌های
          داخل آن نمونه هستند و بعداً با محتوای واقعی جایگزین می‌شوند.
        </p>
        <p>
          برای شروع، پاکت را لمس کن. با باز شدن نامه، صفحه‌های بعدی را ورق بزن.
        </p>
        <button
          className="text-button"
          onClick={() => {
            info.current?.close();
            open();
          }}
        >
          نامه را باز کن <ArrowLeft size={16} />
        </button>
      </dialog>
      <noscript>
        <div className="noscript-note">
          برای باز شدن پاکت و نمایش نامه، جاوااسکریپت مرورگر را فعال کنید.
        </div>
      </noscript>
    </div>
  );
}
