import { test, expect } from "@playwright/test";

test("envelope, entire story, paper notes, gallery, navigation and replay", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("مشکات");
  await expect(page.locator("#story")).toBeHidden();
  await expect
    .poll(async () =>
      page
        .locator(".envelope-stage")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBe(1);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-envelope.png`,
  });
  const open = page.getByRole("button", {
    name: "باز کردن نامه برای مشکات",
    exact: true,
  });
  if (testInfo.project.name === "mobile") await open.tap();
  else await open.click();
  await expect(page.locator("#story")).toBeVisible();
  await expect(page.locator(".envelope")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(page.locator("#story .story-section")).toHaveCount(13);
  await expect(page.locator(".red-thread-journey path")).toHaveAttribute(
    "d",
    /^M /,
  );
  const thread = page.locator(".red-thread-journey path");
  const start = await thread.evaluate((el) =>
    parseFloat(getComputedStyle(el).strokeDashoffset),
  );
  for (const section of await page.locator("#story .story-section").all()) {
    await section.scrollIntoViewIfNeeded();
    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await expect
    .poll(async () =>
      thread.evaluate((el) =>
        parseFloat(getComputedStyle(el).strokeDashoffset),
      ),
    )
    .toBeLessThan(start);
  const note = page.locator("#details .handmade-envelope").first();
  await note.scrollIntoViewIfNeeded();
  await note.locator("summary").click();
  await expect(note).toHaveAttribute("open", "");
  await expect(note.locator(".pocket-note")).toBeVisible();
  await note.locator("summary").click();
  await expect(note).not.toHaveAttribute("open", "");
  const firstPhoto = page.locator(".gallery-photo").first();
  await firstPhoto.scrollIntoViewIfNeeded();
  await firstPhoto.click();
  const lightbox = page.getByRole("dialog", { name: "نمایش بزرگ تصاویر" });
  await expect(lightbox).toBeVisible();
  const originalSrc = await lightbox.locator("img").getAttribute("src");
  await page.getByRole("button", { name: "تصویر بعدی", exact: true }).click();
  await expect(lightbox.locator("img")).not.toHaveAttribute(
    "src",
    originalSrc!,
  );
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.locator("img")).toHaveAttribute("src", originalSrc!);
  await page.keyboard.press("Escape");
  await expect(lightbox).not.toBeVisible();
  await expect(firstPhoto).toBeFocused();
  await page.getByRole("button", { name: "فهرست نامه" }).click();
  await page.getByRole("link", { name: /قاب بلفی/ }).click();
  await expect(page.locator("#belfi")).toBeInViewport();
  await expect(page.locator(".belfi-mount")).toHaveClass(/is-revealed/);
  await page
    .getByRole("button", { name: "بستن قاب بلفی", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "باز کردن قاب بلفی", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.locator("#letter").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-letter.png`,
  });
  await page.getByRole("button", { name: /یک بار دیگر/ }).click();
  await expect(page.locator("#story")).toBeHidden();
  await open.click();
  await expect(page.locator("#story")).toBeVisible();
  await expect
    .poll(async () =>
      page
        .locator("#story img")
        .evaluateAll(
          (imgs) =>
            imgs.filter(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth === 0,
            ).length,
        ),
    )
    .toBe(0);
  expect(errors).toEqual([]);
});

test("reduced motion, keyboard access and narrow layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const button = page.getByRole("button", {
    name: "باز کردن نامه برای مشکات",
    exact: true,
  });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#story")).toBeVisible();
  await expect
    .poll(async () =>
      page
        .locator(".red-thread-journey path")
        .evaluate((el) => getComputedStyle(el).strokeDasharray),
    )
    .toBe("none");
  await page.locator("#details").scrollIntoViewIfNeeded();
  const summary = page.locator(".handmade-envelope summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".handmade-envelope").first()).toHaveAttribute(
    "open",
    "",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("read-only content and private assets are not served by the public preview", async ({
  request,
}) => {
  const response = await request.get("/api/content/");
  expect(response.status()).toBe(200);
  const content = await response.json();
  expect(content.sections.length).toBe(13);
  expect(JSON.stringify(content)).not.toContain("/images/originals/");
  expect(
    (
      await request.post("/api/content/", { data: { recipient: "changed" } })
    ).status(),
  ).toBe(405);
  expect(
    (
      await request.get(
        "/images/originals/12_belfi_plush/photo_2026-11-22_13-03-56.jpg",
      )
    ).status(),
  ).toBe(404);
});

test("four independent 3D objects rotate and close; no WebGL is loaded into the story", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "باز کردن نامه برای مشکات", exact: true })
    .click();
  await expect(page.locator("#keepsakes")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(
    await page
      .locator(".bracelet-memory-card")
      .evaluateAll((cards) => cards.map((c) => c.getAttribute("data-order"))),
  ).toEqual(["1", "2", "3", "4"]);
  for (let i = 0; i < 4; i++) {
    await page.locator(".bracelet-inspect").nth(i).click();
    const viewer = page.locator(".object-viewer");
    await expect(viewer).toHaveAttribute("data-phase", "ready", {
      timeout: 20000,
    });
    const canvas = viewer.locator("canvas");
    const before = await canvas.screenshot();
    await page
      .getByRole("button", { name: "چرخش به راست", exact: true })
      .click();
    const after = await canvas.screenshot();
    expect(Buffer.compare(before, after)).not.toBe(0);
    await canvas.focus();
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("button", { name: "نزدیک‌تر", exact: true }).click();
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-bracelet-${i + 1}.png`,
    });
    await page
      .getByRole("button", { name: "بستن نمایش سه‌بعدی", exact: true })
      .click();
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("no-WebGL fallback remains usable", async ({ page }) => {
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
  await page
    .getByRole("button", { name: "باز کردن نامه برای مشکات", exact: true })
    .click();
  await page.locator(".bracelet-inspect").first().click();
  await expect(page.locator(".object-viewer")).toHaveAttribute(
    "data-phase",
    "fallback",
  );
  await expect(
    page.getByText("نمایش سه‌بعدی در این مرورگر در دسترس نیست."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "بستن نمایش سه‌بعدی", exact: true })
    .click();
  await expect(page.locator(".bracelet-inspect").first()).toBeFocused();
});
