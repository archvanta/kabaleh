"use client";
import type { LetterContent } from "@/lib/content";
import { Flourish } from "./scene";
import { Photo } from "./photo-gallery";
import { HandmadeEnvelope, PressedBotanical } from "./personal-memories";
import { ui } from "@/lib/ui";

export function BagPinMemory({ data }: { data: LetterContent["bagPin"] }) {
  if (!data.visible) return null;
  return (
    <section id="bag-pin" className="bag-pin-section story-section">
      <div className="artifact-copy reveal">
        <h2>{data.title}</h2>
        <Flourish />
        <p className="narrative-caption">{data.caption}</p>
      </div>
      <div className="pin-paper paper reveal">
        <span className="tape" />
        {data.referenceImage ? (
          <div className="pin-original-photo"><Photo image={data.referenceImage} /></div>
        ) : (
          <div className="pin-caption-paper"><Flourish /><p>{data.caption}</p></div>
        )}
        <HandmadeEnvelope note={{ id: "pin-note", title: ui.noteTitle, text: data.text }} index={0} />
        <PressedBotanical />
      </div>
    </section>
  );
}
