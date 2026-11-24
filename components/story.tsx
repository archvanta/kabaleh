"use client";
import { NarrativeStory } from "./narrative-story";
import { ArrowLeft, ArrowUp } from "lucide-react";
import type { LetterContent } from "@/lib/content";
import { Flourish } from "./scene";
import { Photo, PhotoGallery } from "./photo-gallery";
import {
  BelfiMemory,
  HandDrawnCharacters,
  HandmadeEnvelope,
  OriginalLetterMemory,
} from "./personal-memories";
import { BagPinMemory } from "./keepsakes";
export const sectionTitles: Record<string, string> = {
  introduction: "\u0622\u063A\u0627\u0632 \u0646\u0627\u0645\u0647",
  memories:
    "\u0642\u0627\u0628\u0647\u0627\u06CC \u062E\u0627\u0637\u0631\u0647",
  chapters: "\u0641\u0635\u0644\u0647\u0627\u06CC \u0642\u0635\u0647",
  "red-thread": "\u0646\u062E \u0633\u0631\u062E",
  "original-letter":
    "\u06CC\u0627\u062F\u06AF\u0627\u0631\u06CC \u062F\u0633\u062A\u0633\u0627\u0632",
  belfi: "\u0642\u0627\u0628 \u0628\u0644\u0641\u06CC",
  keepsakes: "\u0686\u0647\u0627\u0631 \u062F\u0633\u062A\u0628\u0646\u062F",
  "bag-pin": "\u067E\u06CC\u0646 \u06A9\u0648\u0686\u06A9 \u06A9\u06CC\u0641",
  gallery: "\u0622\u0644\u0628\u0648\u0645 \u06A9\u0648\u0686\u06A9",
  details: "\u062C\u0632\u0626\u06CC\u0627\u062A \u06A9\u0648\u0686\u06A9",
  comparison: "\u0622\u0646 \u0631\u0648\u0632 \u0627\u0645\u0631\u0648\u0632",
  letter: "\u0646\u0627\u0645\u0647\u0654 \u067E\u0627\u06CC\u0627\u0646\u06CC",
  closing: "\u0635\u0641\u062D\u0647\u0654 \u0628\u0639\u062F",
};
function Heading({
  number,
  en,
  title,
  text,
}: {
  number: string;
  en: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading reveal">
      <span className="eyebrow">
        <span className="section-no">{number}</span>
        <span className="latin">{en}</span>
      </span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      <Flourish />
    </div>
  );
}
export function Story({
  content,
  onReplay,
}: {
  content: LetterContent;
  onReplay: () => void;
}) {
  if (content.narrative.length)
    return <NarrativeStory content={content} onReplay={onReplay} />;
  const sections: Record<string, React.ReactNode> = {
    introduction: (
      <section id="introduction" className="intro-section story-section">
        <div className="intro-paper paper reveal">
          <span className="paper-corner" />
          <span className="latin paper-kicker">THE FIRST PAGE</span>
          <Flourish />
          <p className="eyebrow">{content.intro.eyebrow}</p>
          <h2>{content.intro.title}</h2>
          <p className="intro-copy">{content.intro.text}</p>
          <span className="paper-signature">
            برای {content.recipient} از {content.sender}
          </span>
          <div className="page-number">— ۰۱ —</div>
        </div>
        <span className="margin-note latin">
          A STORY, WAITING TO BE WRITTEN.
        </span>
      </section>
    ),
    memories: (
      <section id="memories" className="memories-section story-section">
        <Heading
          number="۰۲"
          en="COLLECTED MOMENTS"
          title="بعضی لحظهها قاب میشوند"
          text="تصویرهای نمایشی جایی برای خاطرههای واقعی ما"
        />
        <div className="memories-grid">
          {content.memories.map((memory, i) => (
            <article className="memory-card reveal" key={memory.id}>
              <div className="polaroid" data-parallax>
                <Photo image={memory.image} />
                <span className="photo-handwriting">{memory.title}</span>
                <span className="tape" />
              </div>
              <div className="memory-copy">
                <span className="eyebrow">
                  {memory.date || `\u06F0${i + 1}`}
                </span>
                <h3>{memory.title}</h3>
                <p>{memory.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
    chapters: (
      <section id="chapters" className="chapters-section story-section">
        <Heading number="۰۳" en="BETWEEN THE PAGES" title="قصه صفحه به صفحه" />
        {content.chapters.map((chapter) => (
          <article className="chapter" key={chapter.id}>
            <div className="chapter-copy reveal">
              <span className="chapter-number">{chapter.number}</span>
              <p className="eyebrow">فصل {chapter.number}</p>
              <h3>{chapter.title}</h3>
              <p>{chapter.text}</p>
              <span className="chapter-line" />
            </div>
            <div
              className={`chapter-images ${chapter.images.length === 1 ? "single" : ""}`}
            >
              {chapter.images.map((image, i) => (
                <figure
                  className="chapter-photo reveal"
                  key={`${chapter.id}-${i}`}
                >
                  <Photo image={image} />
                  <figcaption>تصویر نمایشی · {i + 1}</figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </section>
    ),
    gallery: (
      <section id="gallery" className="gallery-section story-section">
        <Heading
          number="۰۴"
          en="A LITTLE ALBUM"
          title="لای این صفحهها چند قاب"
          text="هر عکس را لمس کن کمی نزدیکتر ببین"
        />
        <PhotoGallery photos={content.gallery} />
        <div className="gallery-footnote latin">
          LITTLE FRAGMENTS, CAREFULLY KEPT.
        </div>
      </section>
    ),
    "red-thread": <HandDrawnCharacters data={content.redThreadScene} />,
    "original-letter": (
      <OriginalLetterMemory data={content.originalHandwrittenLetter} />
    ),
    belfi: <BelfiMemory data={content.belfiMemory} />,
    keepsakes: null,
    "bag-pin": <BagPinMemory data={content.bagPin} />,
    details: (
      <section id="details" className="notes-section story-section">
        <Heading
          number="۰۵"
          en="THE LITTLE THINGS"
          title="کوچک اما ماندنی"
          text="سه کاغذ کوچک سه جای خالی برای نوشتههای بعدی"
        />
        <div className="notes-grid">
          {content.notes.map((note, i) => (
            <HandmadeEnvelope note={note} index={i} key={note.id} />
          ))}
        </div>
      </section>
    ),
    comparison: (
      <section id="comparison" className="comparison-section story-section">
        <Heading number="۰۶" en="THEN & NOW" title={content.comparison.title} />
        <div className="comparison-pair">
          <figure className="comparison-frame reveal" data-parallax>
            <span className="tape" />
            <Photo image={content.comparison.before} />
            <figcaption>
              <span>آن روز</span>
              <span className="latin">THEN</span>
            </figcaption>
          </figure>
          <span className="comparison-connector" aria-hidden="true">
            <Flourish />
            <ArrowLeft size={20} />
          </span>
          <figure className="comparison-frame reveal" data-parallax>
            <span className="tape" />
            <Photo image={content.comparison.after} />
            <figcaption>
              <span>امروز</span>
              <span className="latin">NOW</span>
            </figcaption>
          </figure>
        </div>
        <p className="comparison-copy reveal">{content.comparison.text}</p>
      </section>
    ),
    letter: (
      <section id="letter" className="final-letter-section story-section">
        <div className="final-letter paper reveal">
          <span className="latin paper-kicker">SOME WORDS, JUST FOR YOU</span>
          <Flourish />
          <p className="eyebrow">۰۷ · آخرین صفحهٔ این نامه</p>
          <h2>{content.finalLetter.title}</h2>
          <div className="letter-salutation">{content.recipient}</div>
          <div className="letter-paragraphs">
            {content.finalLetter.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="letter-signature">
            <span>از طرف</span>
            <strong>{content.sender}</strong>
            <span className="signature-line" />
          </div>
          <span className="letter-wax" aria-hidden="true">
            M
          </span>
          <div className="page-number">— ۰۷ —</div>
        </div>
      </section>
    ),
    closing: (
      <section id="closing" className="closing-section story-section">
        <Flourish />
        <span className="eyebrow latin reveal">
          THE END OF THE LETTER. THE START OF MORE.
        </span>
        <h2 className="reveal">{content.closing.title}</h2>
        <p className="reveal">{content.closing.text}</p>
        <span className="closing-monogram" aria-hidden="true">
          M<span>✦</span>A
        </span>
        <button className="text-button" onClick={onReplay}>
          یک بار دیگر از اول <ArrowUp size={16} />
        </button>
        <footer>
          <span>
            برای {content.recipient} از {content.sender}
          </span>
          <span className="latin">MADE WITH CARE · MESHKAT</span>
          <span>نسخهٔ نمایشی · محتوا قابل جایگزینی است</span>
        </footer>
      </section>
    ),
  };
  return (
    <>
      {content.sections
        .filter((section) => section.visible)
        .map((section) => (
          <div key={section.id}>{sections[section.id]}</div>
        ))}
    </>
  );
}
