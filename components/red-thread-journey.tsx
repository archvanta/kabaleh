"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
/** A single measured path follows the book's real height, including arbitrary content edits. */
export function RedThreadJourney() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    const book = svg.current?.parentElement;
    if (!book || !path.current || !svg.current) return;
    let ctx: gsap.Context | undefined;
    let frame = 0;
    const draw = () => {
      ctx?.revert();
      const w = book.clientWidth,
        h = book.scrollHeight;
      if (!w || !h) return;
      const narrow = w < 760,
        edge = narrow ? 8 : 25,
        loop = narrow ? 13 : 34;
      const sections = Array.from(
        book.querySelectorAll<HTMLElement>(".story-section"),
      );
      svg.current!.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.current!.style.height = `${h}px`;
      let right = true;
      let d = `M ${w - edge} 60`;
      sections.forEach((el, i) => {
        const y = el.offsetTop,
          bottom = y + el.offsetHeight - 22,
          mid = y + el.offsetHeight * 0.52;
        const x = right ? w - edge : edge,
          inside = right ? x - loop : x + loop;
        d += ` C ${inside} ${y + 70}, ${inside} ${mid - 90}, ${x} ${mid - 35}`;
        d += ` C ${right ? x + edge * 0.5 : x - edge * 0.5} ${mid + 20}, ${right ? inside - loop : inside + loop} ${mid + 25}, ${inside} ${mid - 8}`;
        d += ` C ${right ? x + edge * 0.5 : x - edge * 0.5} ${mid - 40}, ${x} ${mid + 80}, ${x} ${bottom - 30}`;
        if (i < sections.length - 1) {
          const nextX = right ? edge : w - edge;
          d += ` C ${x} ${bottom + 35}, ${nextX} ${bottom - 35}, ${nextX} ${bottom + 28}`;
        } else
          d += ` C ${x} ${bottom}, ${w * 0.55} ${bottom + 8}, ${w * 0.5} ${bottom + 8}`;
        right = !right;
      });
      path.current!.setAttribute("d", d);
      const length = path.current!.getTotalLength();
      ctx = gsap.context(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(path.current, {
            strokeDasharray: "none",
            strokeDashoffset: 0,
          });
          return;
        }
        gsap.fromTo(
          path.current,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: book,
              start: "top 80%",
              end: "bottom 85%",
              scrub: 0.65,
            },
          },
        );
      }, book);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    observer.observe(book);
    draw();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      ctx?.revert();
    };
  }, []);
  return (
    <svg
      ref={svg}
      className="red-thread-journey"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        ref={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function MemoryScrapbook({ children }: { children: React.ReactNode }) {
  return (
    <div className="memory-scrapbook">
      <RedThreadJourney />
      <div className="scrapbook-content">{children}</div>
    </div>
  );
}
