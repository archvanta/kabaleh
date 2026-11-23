"use client";

import { useEffect, useRef, useState } from "react";

type InkSegment = {
  top: number;
  height: number;
  width: number;
  path: string;
  documentTop: number;
};

function threadPath(
  width: number,
  height: number,
  right: boolean,
  cross: boolean,
) {
  const narrow = width < 760;
  const edge = narrow ? 10 : 27;
  const inward = narrow ? 13 : 30;
  const x = right ? width - edge : edge;
  const direction = right ? -1 : 1;
  const bend = height * 0.37;
  const curl = Math.min(66, height * 0.16);
  const p = (distance: number) => x + direction * distance;

  const wave = [
    `M ${x} 0`,
    `C ${x} ${bend * 0.45}, ${p(inward * 0.55)} ${bend * 0.72}, ${p(inward * 0.38)} ${bend}`,
    `C ${p(inward * 0.2)} ${bend + curl * 0.45}, ${p(inward * 1.28)} ${bend + curl * 0.5}, ${p(inward)} ${bend + curl * 0.14}`,
    `C ${p(inward * 0.74)} ${bend - curl * 0.35}, ${p(-edge * 0.44)} ${bend - curl * 0.05}, ${p(1)} ${bend + curl * 0.55}`,
  ];
  if (cross) {
    const next = right ? edge : width - edge;
    const curveHeight = Math.min(narrow ? 44 : 76, height * 0.15);
    wave.push(
      `C ${p(inward * 0.3)} ${height * 0.72}, ${x} ${height - curveHeight}, ${x} ${height - curveHeight * 0.74}`,
      `C ${x} ${height + 3}, ${next} ${height - curveHeight}, ${next} ${height}`,
    );
  } else {
    wave.push(
      `C ${p(inward * 0.54)} ${height * 0.74}, ${x} ${height * 0.88}, ${x} ${height}`,
    );
  }
  return wave.join(" ");
}

function measureThread(book: HTMLElement, content: HTMLElement) {
  const width = book.clientWidth;
  if (!width) return [];
  const origin = content.getBoundingClientRect().top;
  const absoluteOrigin = Math.round(origin + window.scrollY);
  const starts = [
    ...content.querySelectorAll<HTMLElement>(".story-section"),
  ].map((section) =>
    Math.max(0, Math.round(section.getBoundingClientRect().top - origin)),
  );
  const end = Math.round(content.getBoundingClientRect().height);
  const segments: InkSegment[] = [];

  starts.forEach((top, index) => {
    const span = (starts[index + 1] ?? end) - top;
    // Long letters use small independent tiles, so no single painted SVG spans the entire book.
    const count = Math.max(1, Math.ceil(span / 900));
    for (let i = 0; i < count; i++) {
      const start = Math.round((span * i) / count);
      const height = Math.round((span * (i + 1)) / count) - start;
      if (height <= 0) continue;
      segments.push({
        top: top + start,
        documentTop: absoluteOrigin + top + start,
        height,
        width,
        path: threadPath(
          width,
          height,
          index % 2 === 0,
          i === count - 1 && index < starts.length - 1,
        ),
      });
    }
  });
  return segments;
}

export function RedThreadJourney() {
  const layer = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState<InkSegment[]>([]);

  useEffect(() => {
    const book = layer.current?.parentElement;
    const content = book?.querySelector<HTMLElement>(".scrapbook-content");
    if (!book || !content) return;

    let frame = 0;
    let lastGeometry = "";
    const update = () => {
      const next = measureThread(book, content);
      const key = next
        .map(
          ({ top, height, width, documentTop }) =>
            `${top}:${height}:${width}:${documentTop}`,
        )
        .join("|");
      if (key !== lastGeometry) {
        lastGeometry = key;
        setSegments(next);
      }
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    });
    observer.observe(content);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      CSS.supports("animation-timeline", "scroll(root block)") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("ink-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    layer.current
      ?.querySelectorAll("svg")
      .forEach((segment) => observer.observe(segment));
    return () => observer.disconnect();
  }, [segments]);

  return (
    <div className="red-thread-journey" ref={layer} aria-hidden="true">
      {segments.map(({ top, height, width, path, documentTop }) => (
        <svg
          key={top}
          className="ink-segment"
          viewBox={`0 0 ${width} ${height}`}
          style={
            {
              top,
              height,
              "--ink-start": `calc(${documentTop}px - 62svh)`,
              "--ink-end": `calc(${documentTop + height}px - 62svh)`,
            } as React.CSSProperties
          }
          preserveAspectRatio="none"
        >
          <path
            className="ink-path"
            d={path}
            pathLength={1}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
    </div>
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
