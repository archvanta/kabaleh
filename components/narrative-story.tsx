"use client";
import { CopyText } from "./copy-text";
import { ArrowUp, Plus } from "lucide-react";
import type { LetterContent, NarrativeSection } from "@/lib/content";
import { ui } from "@/lib/ui";
import { stationery } from "@/lib/stationery";
import { compositions, fallbackComposition } from "@/lib/compositions";
import { Flourish } from "./scene";
import { PhotoGallery } from "./photo-gallery";
import {
  BelfiMemory,
  HandDrawnCharacters,
  HandmadeEnvelope,
  InkFigures,
  OriginalLetterMemory,
} from "./personal-memories";
import { BagPinMemory } from "./keepsakes";
export function Paragraphs({
  text,
  className = "",
  limit = 240,
}: {
  text: string;
  className?: string;
  limit?: number;
}) {
  // Group adjacent original sentences without changing any words or their order.
  const sentences = text.split(/\n\s*\n/).filter(Boolean);
  const paragraphs: string[] = [];
  let group: string[] = [];
  for (const sentence of sentences) {
    if (group.length && (group.join(" ").length + sentence.length > limit || group.length >= 3)) {
      paragraphs.push(group.join(" "));
      group = [];
    }
    group.push(sentence);
  }
  if (group.length) paragraphs.push(group.join(" "));
  return (
    <div className={`narrative-prose ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} dir="auto"><CopyText text={paragraph} /></p>
      ))}
    </div>
  );
}

function HiddenNote({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <details className="memory-hidden-note">
      <summary>
        <span className="note-fold" aria-hidden="true" />
        <span>{ui.openHiddenNote}</span>
        <Plus size={16} />
      </summary>
      <div className="hidden-note-paper">
        <Paragraphs text={text} />
      </div>
    </details>
  );
}

const persianNumber = (value: number) => value.toLocaleString("fa-IR");

function MemoryPage({ section }: { section: NarrativeSection }) {
  const composition = compositions[section.id] ?? fallbackComposition;
  const number = Number(section.id.replace(/\D/g, "")) || section.order;
  const caption = section.caption || section.images[0]?.caption;
  const layout = composition.layout;
  return (
    <section
      id={section.id}
      className={`story-section memory-page layout-${layout}`}
      data-review={section.reviewStatus}
    >
      <div className="memory-heading reveal">
        <span className="chapter-stamp" aria-hidden="true">{persianNumber(number)}</span>
        <h2>
          <span className="highlighted">
            <CopyText text={section.title} />
          </span>
        </h2>
      </div>
      <div className={`memory-stage reveal photos-${section.images.length}`}>
        {layout === "botanical" && <span className="stage-decor decor-botanical" aria-hidden="true" />}
        {layout === "rose" && <span className="stage-decor decor-rose" aria-hidden="true" />}
        {layout === "postcard" && <span className="stage-decor decor-stamp" aria-hidden="true" />}
        <PhotoGallery
          photos={section.images}
          fasteners={composition.fasteners}
          captions={false}
          className={`stage-${layout}`}
          sizes={
            layout === "contact" || layout === "filmstrip"
              ? "(max-width: 760px) 46vw, 280px"
              : "(max-width: 760px) 86vw, 520px"
          }
        />
        {caption && (
          <p className="memory-caption-note">
            <CopyText text={caption} />
          </p>
        )}
      </div>
      <div className="memory-copy reveal">
        <Paragraphs text={section.body} limit={200} />
        <HiddenNote text={section.hiddenNote} />
      </div>
    </section>
  );
}

function OpeningPage({ section, preview }: { section: NarrativeSection; preview?: LetterContent["gallery"] }) {
  const parts = section.body.split(/\n\s*\n/);
  const greeting = section.variant === "greeting";
  return (
    <section
      id={section.id}
      className={`story-section opening-page narrative-${section.variant}`}
    >
      <article className="opening-card reveal">
        {greeting && <span className="card-ribbon" aria-hidden="true" />}
        <h2>
          <CopyText text={section.title} />
        </h2>
        <Paragraphs text={parts[0]} className="lead-prose" />
        {preview && (
          <div className="opening-photo-preview">
            <PhotoGallery photos={preview} fasteners={["tape"]} />
          </div>
        )}
        <details className="opening-note">
          <summary>
            <span>{greeting ? "چند خط برای شروع این دفتر" : "بقیه این نامه"}</span>
            <Plus size={16} />
          </summary>
          <div className="opening-note-body">
            <Paragraphs text={parts.slice(1).join("\n\n")} />
            {section.threadText && <Paragraphs text={section.threadText} />}
          </div>
        </details>
        {section.highlight && <blockquote><CopyText text={section.highlight} /></blockquote>}
      </article>
      {section.id === "introduction" && <InkFigures />}
    </section>
  );
}

function GiftPage({ section }: { section: NarrativeSection }) {
  return (
    <section id={section.id} className="story-section gift-page">
      <article className="gift-tag reveal">
        <span className="gift-string" aria-hidden="true" />
        <h2>
          <CopyText text={section.title} />
        </h2>
        <Paragraphs text={section.body} limit={160} />
      </article>
    </section>
  );
}

function WishesPage({ section }: { section: NarrativeSection }) {
  const wishes = section.body.split(/\n\s*\n/).filter(Boolean);
  return (
    <section id={section.id} className="story-section wishes-page">
      <div className="wishes-heading reveal">
        <h2>
          <CopyText text={section.title} />
        </h2>
      </div>
      <details className="folded-wishes reveal">
        <summary>
          <span>آرزوهایم برای تو</span>
          <Plus size={16} />
        </summary>
        <div className="unfolded-wishes">
          <ul className="narrative-prose wish-list">
            {wishes.map((wish, index) => (
              <li key={index}><CopyText text={wish} /></li>
            ))}
          </ul>
        </div>
      </details>
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
              <OriginalLetterMemory
                key={section.id}
                data={content.originalHandwrittenLetter}
              >
                <div className="original-thread-interlude">
                  <HandDrawnCharacters embedded data={content.redThreadScene} />
                  <details className="opening-note preserved-keepsake-copy">
                    <summary><span>یادداشت یادگاری ها</span> <Plus size={16}/></summary>
                    <div className="opening-note-body">
                      <Paragraphs text={content.narrative.find(item=>item.variant==="keepsakes")?.body || ""} />
                    </div>
                  </details>
                </div>
              </OriginalLetterMemory>
            );
          if (section.variant === "keepsakes") return null;
          if (section.variant === "pin")
            return <BagPinMemory key={section.id} data={content.bagPin} />;
          if (section.variant === "pocket")
            return (
              <section
                key={section.id}
                id={section.id}
                className="story-section handmade-story-section"
              >
                <div className="object-heading reveal">
                  <h2>
                    <CopyText text={section.title} />
                  </h2>
                </div>
                <div className="handmade-story-layout">
                  <div className="handmade-photo reveal">
                    <PhotoGallery photos={section.images} fasteners={["clip"]} />
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
          if (section.variant === "gift")
            return <GiftPage key={section.id} section={section} />;
          if (section.variant === "wishes")
            return <WishesPage key={section.id} section={section} />;
          if (section.variant === "letter")
            return (
              <section
                key={section.id}
                id="letter"
                className="story-section narrative-letter-section"
              >
                <div className="thread-before-letter reveal">
                  <Paragraphs text={section.threadText || ""} />
                </div>
                <details className="full-letter-fold">
                  <summary>
                    <span className="letter-envelope" aria-hidden="true">
                      <span className="letter-envelope-seal" />
                    </span>
                    <span className="letter-summary-copy">
                      <span className="letter-summary-title">نامه ام برای تو</span>
                      <span className="letter-summary-action">باز کردن و خواندن کامل نامه</span>
                    </span>
                    <Plus size={20} />
                  </summary>
                  <article className="final-letter">
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
                    <span className="letter-wax" aria-hidden="true" />
                    <button className="text-button fold-letter-close" type="button" onClick={event=>{
                      const fold=event.currentTarget.closest("details");
                      if(!fold)return;
                      fold.open=false;
                      const summary=fold.querySelector("summary");
                      summary?.scrollIntoView({block:"center",behavior:"instant"});
                      summary?.focus({preventScroll:true});
                    }}>تا کردن نامه</button>
                  </article>
                </details>
              </section>
            );
          if (section.variant === "closing")
            return (
              <section
                key={section.id}
                id="closing"
                className="story-section closing-section narrative-closing"
              >
                <div className="closing-copy reveal">
                  <h2>
                    <CopyText text={section.title} />
                  </h2>
                  <Paragraphs text={section.body} />
                </div>
                <InkFigures />
                <details className="complete-album">
                  <summary>
                    <span>{ui.allPhotos}</span>
                    <span className="latin album-count">{content.gallery.length}</span>
                    <Plus size={16} />
                  </summary>
                  <PhotoGallery photos={content.gallery} captions={false} fasteners={content.gallery.map(() => "none" as const)}
                    sizes="(max-width: 760px) 30vw, 200px" className="album-sheet" />
                </details>
                <button className="text-button replay-button" onClick={onReplay}>
                  {ui.revisitMemories}
                  <ArrowUp size={16} />
                </button>
                <div className="kabaleh-signoff" aria-hidden="true">
                  <img src={stationery.bears} width={270} height={178} alt="" loading="lazy" />
                  <span className="latin">Kabaleh</span>
                </div>
                <footer>
                  <span>{ui.footer}</span>
                  <span>{ui.brandSubtitle}</span>
                </footer>
              </section>
            );
          return (
            <OpeningPage
              key={section.id}
              section={section}
              preview={section.variant === "greeting" ? content.gallery.slice(0, 1) : undefined}
            />
          );
        })}
    </>
  );
}
