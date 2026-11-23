"use client";
import { forwardRef } from "react";
import { ArrowDown } from "lucide-react";
import { Flourish } from "./scene";
type Props = {
  recipient: string;
  sender: string;
  opening: boolean;
  opened: boolean;
  onOpen: () => void;
};
export const Envelope = forwardRef<HTMLDivElement, Props>(function Envelope(
  { recipient, sender, opening, opened, onOpen },
  ref,
) {
  return (
    <div className="envelope-stage" ref={ref}>
      <div className="envelope-shadow" />
      <button
        type="button"
        className="envelope"
        aria-label={opened ? "مشاهدهٔ نامه" : `باز کردن نامه برای ${recipient}`}
        disabled={opening}
        onClick={onOpen}
        aria-expanded={opened}
        aria-controls="story"
      >
        <span className="envelope-back" />
        <span className="letter-insert">
          <Flourish />
          <span className="insert-to">برای {recipient}</span>
          <span className="insert-lines" />
          <span className="insert-lines short" />
          <span className="letter-wing" />
        </span>
        <span className="envelope-flap" />
        <span className="envelope-fold left" />
        <span className="envelope-fold right" />
        <span className="envelope-front">
          <span className="envelope-address">
            به: {recipient}
            <small>از طرف {sender}</small>
          </span>
          <span className="envelope-postmark" aria-hidden="true">
            M<br />
            <span>WITH CARE</span>
          </span>
        </span>
        <span className="wax-seal">
          <span className="seal-ring">
            <span className="seal-letter">M</span>
            <span className="seal-sprig">❧</span>
          </span>
        </span>
      </button>
      <span className="envelope-instruction">
        {opening
          ? "نامه دارد باز می‌شود…"
          : opened
            ? "نامه باز شده است"
            : "آرام لمسش کن؛ این نامه برای توست"}
        <ArrowDown size={15} />
      </span>
    </div>
  );
});
