"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/assets";
import { ui } from "@/lib/ui";
import { stationery } from "@/lib/stationery";

const body = asset("/images/stationery/envelope-body.webp");
const flap = asset("/images/stationery/envelope-flap.webp");
const letter = asset("/images/stationery/envelope-letter.webp");

// One camera, one set of parts: the seal is pressed, the flap swings open on its
// hinge, the letter slides out and the page takes over. Timers drive the sequence,
// so a slow or failed image never keeps the reader waiting.
const timeline = [
  ["press", 0],
  ["lift", 260],
  ["rise", 1040],
  ["enter", 1900],
] as const;
const duration = 2450;

type Phase = "closed" | (typeof timeline)[number][0] | "open";
type Props = {
  recipient: string;
  inscription: string;
  opening: boolean;
  opened: boolean;
  onOpen: () => void;
  onOpened: () => void;
};

export const Envelope = forwardRef<HTMLDivElement, Props>(function Envelope(
  { recipient, inscription, opening, opened, onOpen, onOpened }, ref,
) {
  const [phase, setPhase] = useState<Phase>("closed");
  const done = useRef(onOpened);
  done.current = onOpened;
  const finish = () => done.current();

  useEffect(() => {
    if (!opening) {
      setPhase(opened ? "open" : "closed");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("open");
      done.current();
      return;
    }
    const timers = timeline.map(([next, at]) => window.setTimeout(() => setPhase(next), at));
    timers.push(window.setTimeout(() => done.current(), duration));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [opening, opened]);

  return (
    <div className="envelope-stage" ref={ref} data-phase={phase}>
      <button type="button" className="envelope" data-opened={opened}
        aria-label={opened ? ui.backToBook : `${ui.openFor} ${recipient}`}
        aria-disabled={opening} onClick={onOpen} aria-expanded={opened} aria-controls="story">
        <span className="envelope-art">
          <span className="env-shadow" aria-hidden="true" />
          <span className="env-body">
            <img className="env-back" src={body} width={638} height={403} alt="" fetchPriority="high" />
            <span className="env-well" aria-hidden="true">
              <img className="env-letter" src={letter} width={541} height={685} alt="" />
            </span>
            <img className="env-front" src={body} width={638} height={403} alt="" />
            <img className="env-sprig" src={stationery.maple} width={330} height={330} alt="" />
            <img className="env-figures" src={stationery.figures} width={1000} height={500} alt="" />
            <span className="envelope-inscription">{inscription}</span>
            <span className="env-flap" aria-hidden="true">
              <img className="env-flap-face" src={flap} width={662} height={249} alt="" />
              <span className="env-flap-inside" />
              <span className="env-seal">
                <img src={stationery.wax} width={139} height={150} alt="" />
              </span>
            </span>
          </span>
        </span>
      </button>
      {opening && <button type="button" className="envelope-skip" onClick={finish}>رفتن به نامه</button>}
    </div>
  );
});
