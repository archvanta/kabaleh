"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";
import { asset } from "@/lib/assets";

export type MusicHandle = { start: () => void };
const preference = "kabaleh-music-muted";

export const BackgroundMusic = forwardRef<MusicHandle>(function BackgroundMusic(_, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const muted = useRef(false);
  const resume = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    try { muted.current = localStorage.getItem(preference) === "true"; } catch {}
    const visibility = () => {
      const player = audio.current;
      if (!player) return;
      if (document.hidden) {
        resume.current = !player.paused;
        player.pause();
      } else if (resume.current && !muted.current) {
        resume.current = false;
        void player.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); audio.current?.pause(); };
  }, []);

  const start = () => {
    const player = audio.current;
    if (!player || muted.current) return;
    player.volume = 0.24;
    void player.play().catch(() => setPlaying(false));
  };
  useImperativeHandle(ref, () => ({ start }));

  const toggle = () => {
    const player = audio.current;
    if (!player) return;
    muted.current = !player.paused;
    try { localStorage.setItem(preference, String(muted.current)); } catch {}
    if (muted.current) { resume.current = false; player.pause(); }
    else start();
  };

  return <>
    <audio ref={audio} src={asset("/audio/quiet-pages.mp3")} preload="none" loop
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} />
    <button type="button" className="music-control" onClick={toggle}
      aria-label={playing ? "قطع موسیقی" : "پخش موسیقی"} aria-pressed={playing} title={playing ? "قطع موسیقی" : "پخش موسیقی"}>
      {playing ? <Music2 size={19}/> : <VolumeX size={19}/>}
    </button>
  </>;
});
