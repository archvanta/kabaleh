import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import copy from "../content/approved-copy.json";
import ui from "../content/ui.json";
import manifest from "../content/photo-manifest.json";

test("the complete approved narrative opens with the birthday greeting and remains usable through the final letter", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    copy.envelope.envelopeTitle,
  );
  const opener = page.locator(".envelope");
  if (testInfo.project.name === "mobile") await opener.tap();
  else await opener.click();
  await expect(page.locator("#story")).toBeVisible();
  await expect(page.locator("#story .story-section")).toHaveCount(24);
  await expect(page.locator(".story-section").first().locator("h2")).toHaveText(
    copy.greeting.birthdayGreetingTitle,
  );
  const path = page.locator(".red-thread-journey path");
  await expect(path).toHaveAttribute("d", /^M /);
  for (const id of [
    "birthday-greeting",
    "introduction",
    "azar",
    "memory-01",
    "memory-05",
    "memory-07",
    "memory-10",
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
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const note = page.locator("#memory-01 .memory-hidden-note");
  await note.scrollIntoViewIfNeeded();
  await note.locator("summary").click();
  await expect(note).toHaveAttribute("open", "");
  await expect(note).toContainText(copy.memories[0].hiddenNote!);
  await page
    .locator("#handmade-envelope .handmade-envelope")
    .scrollIntoViewIfNeeded();
  await page.locator("#handmade-envelope summary").click();
  await expect(page.locator("#handmade-envelope .pocket-note")).toContainText(
    copy.handmadeEnvelope.body.split("\n\n")[0],
  );
  await expect(page.locator("header, .reading-progress")).toHaveCount(0);
  await page.locator("#letter h2").scrollIntoViewIfNeeded();
  await expect(page.locator("#letter")).toBeInViewport();
  await page.waitForTimeout(1100);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-approved-letter.png`,
  });
  expect(
    (await page.locator("#story").innerText()).match(/[\u200c،؛,.]/g),
  ).toBeNull();
  await page
    .getByRole("button", { name: ui.revisitMemories, exact: true })
    .click();
  await expect(page.locator("#story")).toBeHidden();
  expect(errors).toEqual([]);
});

test("the original album preserves all groups and returns focus after full-view inspection", async ({
  page,
  request,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".envelope").click();
  await page.locator(".complete-album summary").scrollIntoViewIfNeeded();
  await page.locator(".complete-album summary").click();
  const album = page.locator(".complete-album .gallery-photo");
  await expect(album).toHaveCount(21);
  await album.first().click();
  const dialog = page.getByRole("dialog", {
    name: ui.photoViewer,
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute(
    "src",
    /01_first_photo_elevator/,
  );
  await page.getByRole("button", { name: ui.nextPhoto, exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("img")).toHaveAttribute("src", /13-02-37/);
  await page.keyboard.press("Escape");
  await expect(album.first()).toBeFocused();
  await page.locator("#belfi").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-approved-belfi.png`,
  });
  for (const photo of manifest.photos) {
    const response = await request.get(`/images/originals/${photo.path}`);
    expect(response.status()).toBe(200);
    expect(
      createHash("sha256")
        .update(await response.body())
        .digest("hex"),
    ).toBe(photo.sha256);
  }
  const data = await (await request.get("/api/content/")).json();
  expect(data.narrative).toHaveLength(24);
  expect(data.gallery).toHaveLength(21);
  expect(
    (
      await request.post("/api/content/", { data: { recipient: "changed" } })
    ).status(),
  ).toBe(405);
});

test("320px keyboard and reduced-motion reading keeps original text and the surprise intact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".envelope").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#birthday-greeting")).toBeVisible();
  await expect(page.locator(".red-thread-journey path")).toHaveCSS(
    "stroke-dasharray",
    "none",
  );
  for (const id of [
    "azar",
    "memory-08",
    "belfi",
    "keepsakes",
    "birthdayGiftNote",
    "letter",
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator("#birthdayGiftNote img")).toHaveCount(0);
  await expect(page.locator("#birthdayGiftNote")).toContainText(
    copy.gift.body.split("\n\n")[0],
  );
  await expect(page.locator("#letter .letter-paragraphs p")).toHaveCount(
    copy.letter.body.split("\n\n").length,
  );
});

test("the preserved 3D inspection renders and rotates an independent bracelet", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".envelope").click();
  await expect(page.locator(".bracelet-memory-card")).toHaveCount(4);
  expect(
    await page
      .locator(".bracelet-memory-card")
      .evaluateAll((cards) => cards.map((c) => c.getAttribute("data-order"))),
  ).toEqual(["1", "2", "3", "4"]);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.locator(".bracelet-inspect").last().click();
  await expect(page.locator(".object-viewer")).toHaveAttribute(
    "data-phase",
    "ready",
    { timeout: 25000 },
  );
  const canvas = page.locator(".object-viewer canvas");
  const before = await canvas.screenshot();
  await page.getByRole("button", { name: "چرخش به راست", exact: true }).click();
  expect(Buffer.compare(before, await canvas.screenshot())).not.toBe(0);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-approved-keepsake.png`,
  });
  await page
    .getByRole("button", { name: "بستن نمایش سه بعدی", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("a browser without WebGL can return to the story", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2" || type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".envelope").click();
  await page.locator(".bracelet-inspect").first().click();
  await expect(page.locator(".object-viewer")).toHaveAttribute(
    "data-phase",
    "fallback",
  );
  await page
    .getByRole("button", { name: "بستن نمایش سه بعدی", exact: true })
    .click();
  await expect(page.locator(".bracelet-inspect").first()).toBeFocused();
});
