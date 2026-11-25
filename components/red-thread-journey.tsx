"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Box = { x0: number; y0: number; x1: number; y1: number };
type Layout = { width: number; height: number; path: string; tiles: { top: number; height: number }[] };

// Words, headings and notes must never sit on top of the thread.
const TEXT =
  ".story-section :is(h2, p, li, blockquote, summary, .chapter-stamp, .text-button, footer, .kabaleh-signoff, .belfi-toggle, .pocket-title, .pocket-action)";
// Photos and paper objects may cover the thread, so it can tuck behind them.
const PAPER =
  ".story-section :is(.gallery-photo, .artifact-photo, .belfi-cover, .pin-paper, .opening-card, .gift-tag, .final-letter, .pocket-note, .hidden-note-paper, .memory-caption-note, .handmade-envelope summary, .full-letter-fold > summary)";
const TILE = 1400;

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxes(root: HTMLElement, selector: string, originX: number, originY: number) {
  const result: Box[] = [];
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    result.push({ x0: rect.left - originX, y0: rect.top - originY, x1: rect.right - originX, y1: rect.bottom - originY });
  });
  return result;
}

// The free lane between the page edge and whatever sits on that side of the page.
function lane(side: 1 | -1, y0: number, y1: number, width: number, hard: Box[], soft: Box[], edge: number) {
  const gap = (list: Box[]) => {
    let inner = side === 1 ? 0 : width;
    for (const box of list) {
      if (box.y1 < y0 || box.y0 > y1) continue;
      inner = side === 1 ? Math.max(inner, box.x1) : Math.min(inner, box.x0);
    }
    return side === 1 ? [inner + 10, width - edge] : [edge, inner - 10];
  };
  const both = gap([...hard, ...soft]);
  if (both[1] - both[0] >= 10) return both;
  const text = gap(hard);
  if (text[1] - text[0] >= 4) return text;
  return side === 1 ? [width - edge, width - edge] : [edge, edge];
}

function smooth(points: Point[]) {
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C ${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)}, ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)}, ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

function loop(points: Point[], cx: number, cy: number, r: number, direction: 1 | -1) {
  // A single soft knot: the thread circles once and carries on.
  for (let a = 0.35; a <= Math.PI * 2 + 0.2; a += Math.PI / 5) {
    points.push({ x: cx + Math.sin(a) * r * direction, y: cy - Math.cos(a) * r * 1.1 + r * 0.9 });
  }
}

function heart(points: Point[], cx: number, cy: number, size: number) {
  for (let t = Math.PI * 0.15; t <= Math.PI * 1.85; t += Math.PI / 9) {
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push({ x: cx + (x * size) / 16, y: cy - (y * size) / 16 });
  }
}

function measure(book: HTMLElement, content: HTMLElement): Layout | null {
  const width = book.clientWidth;
  const height = Math.round(content.getBoundingClientRect().height);
  if (!width || !height) return null;
  const origin = book.getBoundingClientRect();
  const hard = boxes(content, TEXT, origin.left, origin.top);
  const soft = boxes(content, PAPER, origin.left, origin.top);
  const figures = boxes(content, ".ink-figures img", origin.left, origin.top);
  const narrow = width < 640;
  const edge = narrow ? 6 : 14;
  const rand = random(11);

  // Quiet bands between sections, where the thread may cross the page.
  const busy = [...hard, ...soft].map((b) => [b.y0 - 14, b.y1 + 14]).sort((a, b) => a[0] - b[0]);
  const quiet: [number, number][] = [];
  let cursor = 0;
  for (const [y0, y1] of busy) {
    if (y0 > cursor + 34) quiet.push([cursor, y0]);
    cursor = Math.max(cursor, y1);
  }
  const sections = [...content.querySelectorAll<HTMLElement>(".story-section")].map(
    (section) => section.getBoundingClientRect().top - origin.top,
  );
  type Event = { y: number; kind: "cross" | "figures"; room: number; box?: Box };
  const events: Event[] = [];
  sections.slice(1).forEach((boundary) => {
    const band = quiet.find(([y0, y1]) => boundary >= y0 - 160 && boundary <= y1 + 160);
    if (!band) return;
    const y = (band[0] + band[1]) / 2;
    if (events.some((event) => Math.abs(event.y - y) < 60)) return;
    events.push({ y, kind: "cross", room: band[1] - band[0] });
  });
  for (const box of figures) {
    const feet = box.y0 + (box.y1 - box.y0) * 0.975;
    for (let i = events.length - 1; i >= 0; i--) if (Math.abs(events[i].y - feet) < 120) events.splice(i, 1);
    events.push({ y: feet, kind: "figures", room: 0, box });
  }
  events.sort((a, b) => a.y - b.y);

  const points: Point[] = [];
  let side: 1 | -1 = 1;
  let y = 0;
  const place = (at: number) => {
    const [a, b] = lane(side, at - 50, at + 50, width, hard, soft, edge);
    const middle = (a + b) / 2;
    const swing = Math.min((b - a) / 2, narrow ? 5 : 34);
    return { x: middle + (rand() - 0.5) * 2 * swing, y: at };
  };
  const walk = (to: number) => {
    const step = narrow ? 120 : 150;
    while (y + step < to) {
      y += step * (0.8 + rand() * 0.4);
      if (y < to - 20) points.push(place(y));
    }
    y = to;
  };
  points.push(place(0));
  let crossings = 0;
  for (const event of events) {
    const top = event.y - (event.kind === "figures" ? 70 : Math.min(60, event.room / 2));
    walk(Math.max(y, top));
    const from = place(event.y - 26);
    points.push(from);
    const next = (side * -1) as 1 | -1;
    if (event.kind === "figures" && event.box) {
      // The thread becomes the ground the two figures stand on.
      const { x0, x1 } = event.box;
      const a = side === 1 ? x1 : x0;
      const b = side === 1 ? x0 : x1;
      points.push({ x: a + (b - a) * 0.08, y: event.y + 2 });
      points.push({ x: a + (b - a) * 0.5, y: event.y + 5 });
      points.push({ x: a + (b - a) * 0.92, y: event.y + 2 });
    } else {
      const landing = (() => {
        side = next;
        const spot = place(event.y + 26);
        side = (next * -1) as 1 | -1;
        return spot;
      })();
      const mid = { x: (from.x + landing.x) / 2, y: event.y + (rand() - 0.5) * 12 };
      const flourish = crossings % 4;
      if (flourish === 1 && event.room > 70) loop(points, mid.x, mid.y - (narrow ? 10 : 16), narrow ? 10 : 17, side === 1 ? -1 : 1);
      else if (flourish === 3 && event.room > 90) heart(points, mid.x, mid.y - 8, narrow ? 10 : 15);
      else points.push(mid);
      crossings++;
    }
    side = next;
    points.push(place(event.y + 30));
    y = event.y + 30;
  }
  walk(height - 4);
  points.push(place(height));

  const tiles = [];
  for (let top = 0; top < height; top += TILE) tiles.push({ top, height: Math.min(TILE, height - top) });
  return { width, height, path: smooth(points), tiles };
}

export function RedThreadJourney() {
  const layer = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const book = layer.current?.parentElement;
    const content = book?.querySelector<HTMLElement>(".scrapbook-content");
    if (!book || !content) return;
    let frame = 0;
    let last = "";
    const update = () => {
      const next = measure(book, content);
      if (!next) return;
      const key = `${next.width}:${next.height}:${next.path.length}:${next.path.slice(-40)}`;
      if (key === last) return;
      last = key;
      setLayout(next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    observer.observe(book);
    // Opening a note or the letter moves everything below it.
    content.addEventListener("toggle", schedule, true);
    void document.fonts?.ready.then(schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      content.removeEventListener("toggle", schedule, true);
    };
  }, []);

  return (
    <div className="red-thread-journey" ref={layer} aria-hidden="true">
      {layout?.tiles.map(({ top, height }) => (
        <svg
          key={top}
          className="ink-segment"
          style={{ top, height, width: layout.width }}
          viewBox={`0 ${top} ${layout.width} ${height}`}
          width={layout.width}
          height={height}
        >
          <path className="ink-path" d={layout.path} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path className="ink-fiber" d={layout.path} fill="none" strokeLinecap="round" transform="translate(0.7 0.5)" />
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
