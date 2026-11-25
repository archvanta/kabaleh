"use client";
import type { LetterContent } from "@/lib/content";
import { Photo } from "./photo-gallery";
import { HandmadeEnvelope } from "./personal-memories";
import { CopyText } from "./copy-text";
import { ui } from "@/lib/ui";

export function BagPinMemory({ data }: { data: LetterContent["bagPin"] }) {
  if (!data.visible) return null;
  return (
    <section id="bag-pin" className="bag-pin-section story-section">
      <div className="object-heading reveal">
        <h2><CopyText text={data.title} /></h2>
      </div>
      <div className="pin-board reveal">
        <div className="pin-paper">
          <span className="pin-badge" aria-hidden="true" />
          {data.referenceImage ? (
            <div className="pin-original-photo"><Photo image={data.referenceImage} /></div>
          ) : (
            <p className="pin-caption"><CopyText text={data.caption} /></p>
          )}
        </div>
        <HandmadeEnvelope note={{ id: "pin-note", title: ui.noteTitle, text: data.text }} index={1} />
      </div>
    </section>
  );
}
