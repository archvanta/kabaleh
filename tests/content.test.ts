import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { content, contentSchema } from "../lib/content";
import approved from "../content/approved-copy.json";
import manifest from "../content/photo-manifest.json";
import ui from "../content/ui.json";
const order = [
  "birthday-greeting",
  "introduction",
  "azar",
  ...Array.from(
    { length: 11 },
    (_, i) => `memory-${String(i + 1).padStart(2, "0")}`,
  ),
  "belfi",
  "memory-13",
  "original-letter",
  "keepsakes",
  "bag-pin",
  "handmade-envelope",
  "birthdayGiftNote",
  "birthday-wishes",
  "letter",
  "closing",
];
test("approved birthday-first narrative keeps all 24 sections in the exact order", () => {
  assert.deepEqual(
    content.narrative.map((s) => s.id),
    order,
  );
  assert.equal(
    content.narrative[0].body,
    approved.greeting.birthdayGreetingBody,
  );
  assert.equal(content.narrative.at(-2)?.body, approved.letter.body);
  assert.equal(content.gallery.length, 21);
  assert.equal(/\[.*نمونه/.test(JSON.stringify(content)), false);
});
test("all fourteen memory groups preserve the approved copy and original source association", () => {
  for (const memory of approved.memories) {
    const section = content.narrative.find(
      (s) => s.sourceGroup === memory.source,
    );
    assert.ok(section, `Missing ${memory.source}`);
    assert.equal(section.body, memory.body);
    assert.equal(section.caption, memory.caption);
    assert.equal(section.hiddenNote, memory.hiddenNote ?? null);
  }
  assert.equal(
    content.narrative.find((s) => s.id === "memory-05")?.reviewStatus,
    "needs_confirmation",
  );
});
test("all 21 original photographs match the supplied archive SHA-256 checksums byte for byte", () => {
  assert.equal(new Set(manifest.photos.map((p) => p.sha256)).size, 21);
  for (const photo of manifest.photos) {
    const path = `public/images/originals/${photo.path}`;
    assert.ok(existsSync(path));
    assert.equal(
      createHash("sha256").update(readFileSync(path)).digest("hex"),
      photo.sha256,
    );
  }
  for (const photo of content.gallery)
    assert.ok(existsSync(`public${photo.src}`));
});
test("visible approved Persian copy has no half spaces or disallowed punctuation", () => {
  const copy = [
    ...Object.values(ui),
    ...content.narrative.flatMap((s) => [
      s.title,
      s.body,
      s.caption,
      s.hiddenNote || "",
      s.threadText || "",
    ]),
    ...content.gallery.map((p) => p.alt),
  ];
  for (const text of copy)
    assert.equal(
      /[\u200c،؛,.]/.test(text),
      false,
      `Unexpected punctuation: ${text.slice(0, 80)}`,
    );
});
test("the surprise stays in its approved words without revealing images or new metadata", () => {
  const gift = content.narrative.find((s) => s.id === "birthdayGiftNote")!;
  assert.deepEqual(gift.images, []);
  assert.equal(gift.title, approved.gift.title);
  assert.equal(gift.body, approved.gift.body);
  assert.equal(content.birthday, null);
});
test("schema rejects remote image trackers and ambiguous narrative or bracelet ordering", () => {
  const remote = structuredClone(content);
  remote.gallery[0].src = "https://example.com/tracker.jpg";
  assert.equal(contentSchema.safeParse(remote).success, false);
  const duplicate = structuredClone(content);
  duplicate.narrative[1].id = duplicate.narrative[0].id;
  assert.equal(contentSchema.safeParse(duplicate).success, false);
  const reversed = structuredClone(content);
  reversed.keepsakes.items.reverse();
  assert.equal(contentSchema.safeParse(reversed).success, false);
  assert.deepEqual(
    content.keepsakes.items.map((i) => i.id),
    ["black-detail", "brown-strands", "silver-cord", "tiger-eye"],
  );
  for (const item of content.keepsakes.items)
    assert.ok(existsSync(`public${item.modelPath}`));
});
