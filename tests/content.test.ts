import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { content, contentSchema } from "../lib/content";

test("demonstration content validates and every image exists locally", () => {
  assert.equal(content.recipient, "مشکات");
  assert.equal(content.sections.length, 13);
  const data = JSON.stringify(content);
  assert.ok(
    !data.includes("/images/originals/"),
    "Public data must not reference private originals",
  );
  const paths = [...data.matchAll(/"src":"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(paths.length >= 10);
  for (const path of paths)
    assert.ok(existsSync(`public${path}`), `Missing ${path}`);
  assert.equal(content.originalHandwrittenLetter.image, null);
  assert.equal(content.belfiMemory.image, null);
});
test("rejects remote images and ambiguous section ordering", () => {
  const remote = structuredClone(content);
  remote.gallery[0].src = "https://example.com/tracker.jpg";
  assert.equal(contentSchema.safeParse(remote).success, false);
  const duplicate = structuredClone(content);
  duplicate.sections.push(duplicate.sections[0]);
  assert.equal(contentSchema.safeParse(duplicate).success, false);
});
test("supports arbitrary section ordering, visibility and photo proportions", () => {
  const modified = structuredClone(content);
  modified.sections.reverse();
  modified.sections[0].visible = false;
  modified.gallery[0].width = 800;
  modified.gallery[0].height = 1500;
  const parsed = contentSchema.parse(modified);
  assert.equal(parsed.sections[0].id, "closing");
  assert.equal(parsed.sections[0].visible, false);
  assert.equal(parsed.gallery[0].height, 1500);
});
test("four distinct standalone GLBs and the exact bracelet order are preserved", () => {
  const expected = [
    "black-detail",
    "brown-strands",
    "silver-cord",
    "tiger-eye",
  ];
  assert.deepEqual(
    content.keepsakes.items.map((i) => i.id),
    expected,
  );
  const wrong = structuredClone(content);
  wrong.keepsakes.items.reverse();
  assert.equal(contentSchema.safeParse(wrong).success, false);
  for (const item of content.keepsakes.items) {
    assert.ok(existsSync(`public${item.modelPath}`));
  }
});
