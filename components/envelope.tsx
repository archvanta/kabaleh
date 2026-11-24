"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/assets";
import { ui } from "@/lib/ui";

const closedArt = asset("/images/stationery/envelope-closed.webp");
const openArt = asset("/images/stationery/envelope-open.webp");
const motionArt = asset("/images/stationery/envelope-opening.webp");
const duration = 2100; // 100 rendered frames at 21 ms each, one playback.

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
  const [animation, setAnimation] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const timer = useRef(0);
  const completed = useRef(false);
  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    window.clearTimeout(timer.current);
    onOpened();
  }, [onOpened]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controller = new AbortController();
    const preload = window.setTimeout(() => {
      // Fetch bytes only; don't decode a hundred full-sized images on mobile.
      void fetch(motionArt, { signal: controller.signal, cache: "force-cache" }).catch(() => {});
    }, 600);
    return () => { window.clearTimeout(preload); controller.abort(); };
  }, []);

  useEffect(() => {
    setReady(false);
    setAnimation(null);
    if (!opening) return;
    completed.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const controller = new AbortController();
    let objectURL: string | null = null;
    // Bound loading time and recover to the letter if the asset is unavailable.
    timer.current = window.setTimeout(finish, 8000);
    void fetch(motionArt, { signal: controller.signal, cache: "force-cache" })
      .then(response => {
        if (!response.ok) throw new Error("Envelope asset unavailable");
        return response.blob();
      })
      .then(blob => {
        if (controller.signal.aborted) return;
        // A fresh URL restarts one-shot playback when the reader reopens it.
        objectURL = URL.createObjectURL(blob);
        setAnimation(objectURL);
      })
      .catch(() => { if (!controller.signal.aborted) finish(); });
    return () => {
      controller.abort();
      window.clearTimeout(timer.current);
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [opening, finish]);

  const loaded = () => {
    setReady(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(finish, duration);
  };

  return (
    <div className="envelope-stage" ref={ref}>
      <button type="button" className="envelope" data-opened={opened}
        aria-label={opened ? ui.backToBook : `${ui.openFor} ${recipient}`}
        aria-disabled={opening} onClick={onOpen} aria-expanded={opened} aria-controls="story">
        <span className="envelope-art" aria-hidden="true">
          <img className="envelope-still" src={opened ? openArt : closedArt}
            width={600} height={728} alt="" fetchPriority="high" decoding="async" />
          {opening && animation && (
            <img className="envelope-motion" src={animation} width={600} height={728}
              alt="" data-ready={ready} onLoad={loaded} onError={finish} />
          )}
        </span>
        <span className="envelope-inscription">{inscription}</span>
      </button>
      {opening && <button type="button" className="envelope-skip" onClick={finish}>رفتن به نامه</button>}
    </div>
  );
});
