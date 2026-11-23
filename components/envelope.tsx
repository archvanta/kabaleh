"use client";

import { forwardRef, useEffect, useRef } from "react";
import { asset } from "@/lib/assets";
import { ui } from "@/lib/ui";

const frames = Array.from({ length: 8 }, (_, index) =>
  asset(`/images/stationery/envelope-${index + 1}.webp`),
);
const cues = [0, 0.13, 0.25, 0.39, 0.53, 0.65, 0.77, 0.89];
const blend = 0.065;
const duration = 2080;

type Props = {
  recipient: string;
  inscription: string;
  opening: boolean;
  opened: boolean;
  onOpen: () => void;
  onOpened: () => void;
};

export const Envelope = forwardRef<HTMLDivElement, Props>(function Envelope(
  { recipient, inscription, opening, opened, onOpen, onOpened },
  ref,
) {
  const art = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const preload = window.setTimeout(() => {
      for (const src of frames.slice(1)) {
        const image = new Image();
        image.src = src;
      }
    }, 500);
    return () => window.clearTimeout(preload);
  }, []);

  useEffect(() => {
    if (!opening) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpened();
      return;
    }
    let cancelled = false;
    let readinessTimer = 0;
    const animations: Animation[] = [];
    const layers = [...(art.current?.querySelectorAll("img") ?? [])];
    const decode = Promise.all(layers.map((layer) => layer.decode())).then(
      () => true,
      () => false,
    );
    const deadline = new Promise<boolean>((resolve) => {
      readinessTimer = window.setTimeout(() => resolve(false), 1400);
    });

    void Promise.race([decode, deadline]).then(async (ready) => {
      window.clearTimeout(readinessTimer);
      if (cancelled) return;
      if (ready && layers.length === frames.length) {
        layers.forEach((layer, index) => {
          const start = cues[index];
          const end = cues[index + 1] ?? 1;
          const keyframes: Keyframe[] =
            index === 0
              ? [{ opacity: 1, offset: 0 }]
              : [
                  { opacity: 0, offset: start },
                  { opacity: 1, offset: start + blend },
                ];
          keyframes.push({ opacity: 1, offset: end });
          if (index !== layers.length - 1) {
            keyframes.push({ opacity: 0, offset: end + blend });
          }
          animations.push(layer.animate(keyframes, { duration, fill: "both" }));
        });
        await Promise.allSettled(
          animations.map((animation) => animation.finished),
        );
      }
      if (!cancelled) onOpened();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(readinessTimer);
      animations.forEach((animation) => animation.cancel());
    };
  }, [opening, onOpened]);

  return (
    <div className="envelope-stage" ref={ref}>
      <button
        type="button"
        className="envelope"
        data-opened={opened}
        aria-label={opened ? ui.backToBook : `${ui.openFor} ${recipient}`}
        aria-disabled={opening}
        onClick={onOpen}
        aria-expanded={opened}
        aria-controls="story"
      >
        <span ref={art} className="envelope-art" aria-hidden="true">
          {frames.map((src, index) => {
            if (
              index !== 0 &&
              !opening &&
              !(opened && index === frames.length - 1)
            )
              return null;
            return (
              <img
                key={src}
                className="envelope-frame"
                data-frame={index}
                src={src}
                width={365}
                height={443}
                alt=""
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            );
          })}
        </span>
        <span className="envelope-inscription">{inscription}</span>
      </button>
    </div>
  );
});
