"use client";
import { CopyText } from "./copy-text";
import { ArrowUp, Plus } from "lucide-react";
import type { LetterContent, NarrativeSection } from "@/lib/content";
import { ui } from "@/lib/ui";
import { Flourish } from "./scene";
import { PhotoGallery } from "./photo-gallery";
import {
  BelfiMemory,
  HandDrawnCharacters,
  HandmadeEnvelope,
  OriginalLetterMemory,
  PressedBotanical,
} from "./personal-memories";
import { BraceletMemoryTimeline, BagPinMemory } from "./keepsakes";
export function Paragraphs({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`narrative-prose ${className}`}>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} dir="auto">
            {paragraph.split(/(:\){1,3})/g).map((piece, i) =>
              /^:\){1,3}$/.test(piece) ? (
                <bdi dir="ltr" key={i}>
                  {piece}
                </bdi>
              ) : (
                piece
              ),
            )}
          </p>
        ))}
    </div>
  );
}
function HiddenNote({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <details className="memory-hidden-note paper">
      <summary>
        {ui.openHiddenNote}
        <Plus size={17} />
      </summary>
      <div>
        <Flourish />
        <Paragraphs text={text} />
      </div>
    </details>
  );
}
function MemoryPage({ section }: { section: NarrativeSection }) {
  return (
    <section
      id={section.id}
      className={`story-section narrative-memory ${section.order % 2 ? "memory-reversed" : ""}`}
      data-review={section.reviewStatus}
    >
      <div className="narrative-memory-heading reveal">
        <h2>
          <CopyText text={section.title} />
        </h2>
        {section.caption && (
          <p className="narrative-caption">
            <CopyText text={section.caption} />
          </p>
        )}
        <Flourish />
      </div>
      <div
        className={`narrative-gallery reveal photos-${section.images.length}`}
      >
        <PhotoGallery
          photos={section.images}
          swipeable={section.images.length > 1}
        />
      </div>
      <div className="narrative-memory-copy reveal">
        <Paragraphs text={section.body} />
        <HiddenNote text={section.hiddenNote} />
      </div>
    </section>
  );
}
function PaperPage({ section }: { section: NarrativeSection }) {
  return (
    <section
      id={section.id}
      className={`story-section narrative-paper-section narrative-${section.variant}`}
    >
      <article className="paper narrative-paper reveal">
        <Flourish />
        <h2>
          <CopyText text={section.title} />
        </h2>
        <Paragraphs text={section.body} />
        {section.highlight && <blockquote>{section.highlight}</blockquote>}
        {section.threadText && (
          <div className="thread-interlude">
            <Paragraphs text={section.threadText} />
          </div>
        )}
        {section.variant === "autumn" && <PressedBotanical />}
      </article>
    </section>
  );
}
export function NarrativeStory({
  content,
  onReplay,
}: {
  content: LetterContent;
  onReplay: () => void;
}) {
  return (
    <>
      {content.narrative
        .filter((section) => section.visible)
        .map((section) => {
          if (section.variant === "memory")
            return <MemoryPage section={section} key={section.id} />;
          if (section.variant === "belfi")
            return <BelfiMemory key={section.id} data={content.belfiMemory} />;
          if (section.variant === "original")
            return (
              <div key={section.id}>
                <OriginalLetterMemory
                  data={content.originalHandwrittenLetter}
                />
                <div className="original-thread-interlude">
                  <HandDrawnCharacters embedded data={content.redThreadScene} />
                </div>
              </div>
            );
          if (section.variant === "keepsakes")
            return (
              <BraceletMemoryTimeline
                key={section.id}
                data={content.keepsakes}
              />
            );
          if (section.variant === "pin")
            return <BagPinMemory key={section.id} data={content.bagPin} />;
          if (section.variant === "pocket")
            return (
              <section
                key={section.id}
                id={section.id}
                className="story-section handmade-story-section"
              >
                <div className="scrapbook-heading reveal">
                  <h2>
                    <CopyText text={section.title} />
                  </h2>
                  <Flourish />
                </div>
                <div className="handmade-story-layout">
                  <div className="narrative-gallery reveal photos-1">
                    <PhotoGallery photos={section.images} />
                  </div>
                  <HandmadeEnvelope
                    note={{
                      id: "handmade-letter-note",
                      title: ui.revealNote,
                      text: section.body,
                    }}
                    index={0}
                  />
                </div>
              </section>
            );
          if (section.variant === "letter")
            return (
              <section
                key={section.id}
                id="letter"
                className="story-section narrative-letter-section"
              >
                <div className="thread-before-letter reveal">
                  <Paragraphs text={section.threadText || ""} />
                  <Flourish />
                </div>
                <article className="final-letter paper reveal">
                  <Flourish />
                  <h2>
                    <CopyText text={section.title} />
                  </h2>
                  <Paragraphs
                    className="letter-paragraphs"
                    text={section.body}
                  />
                  <div className="letter-signature">
                    <strong>{content.sender}</strong>
                    <span className="signature-line" />
                  </div>
                  <span className="letter-wax" aria-hidden="true">
                    A
                  </span>
                </article>
              </section>
            );
          if (section.variant === "closing")
            return (
              <section
                key={section.id}
                id="closing"
                className="story-section closing-section narrative-closing"
              >
                <Flourish />
                <h2 className="reveal">
                  <CopyText text={section.title} />
                </h2>
                <Paragraphs text={section.body} />
                <span className="closing-monogram" aria-hidden="true">
                  M<span>✦</span>A
                </span>
                <button className="text-button" onClick={onReplay}>
                  {ui.revisitMemories}
                  <ArrowUp size={16} />
                </button>
                <details className="complete-album">
                  <summary>
                    {ui.allPhotos}
                    <Plus size={17} />
                  </summary>
                  <PhotoGallery photos={content.gallery} />
                </details>
                <footer>
                  <span>{ui.footer}</span>
                  <span>{ui.brandSubtitle}</span>
                </footer>
              </section>
            );
          return <PaperPage key={section.id} section={section} />;
        })}
    </>
  );
}
