// Walks the whole experience at every review viewport and saves screenshots.
// Usage: node scripts/visual-tour.mjs <baseUrl> <label> [viewport ...] [--reduced] [--zoom=2]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const [baseUrl = "http://127.0.0.1:3100/kabaleh/", label = "tour", ...sizes] = args;
const reduced = flags.includes("--reduced");
const zoom = Number(flags.find((f) => f.startsWith("--zoom="))?.split("=")[1] ?? 1);
const viewports = (sizes.length ? sizes : ["320x740", "375x812", "390x844", "430x932", "844x390", "1440x900"]).map((s) => {
  const [width, height] = s.split("x").map(Number);
  return { width, height };
});

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
});
const problems = [];

for (const viewport of viewports) {
  const name = `${viewport.width}x${viewport.height}${zoom !== 1 ? `@${zoom * 100}` : ""}`;
  const dir = `test-results/${label}/${name}`;
  mkdirSync(dir, { recursive: true });
  const mobile = viewport.width < 768 || viewport.height < 500;
  const context = await browser.newContext({
    // 200% zoom is emulated as half the CSS viewport at double density.
    viewport: { width: Math.round(viewport.width / zoom), height: Math.round(viewport.height / zoom) },
    deviceScaleFactor: zoom !== 1 ? zoom : mobile ? 2 : 1,
    isMobile: mobile && zoom === 1,
    hasTouch: mobile,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`${name} pageerror ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${name} ${r.status()} ${r.url()}`);
  });
  await page.goto(baseUrl);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/00-envelope.png` });
  await page.locator(".envelope").click();
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${dir}/01-opening-a.png` });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${dir}/01-opening-b.png` });
  await page.locator("#story").waitFor({ state: "visible", timeout: 12000 });
  await page.waitForTimeout(900);
  const ids = await page.$$eval("#story .story-section", (els) => els.map((e) => e.id));
  let index = 2;
  for (const id of ids) {
    const section = page.locator(`#${id}`);
    const height = await section.evaluate((el) => el.getBoundingClientRect().height);
    const steps = Math.max(1, Math.ceil(height / (viewport.height / zoom * 0.85)));
    for (let step = 0; step < Math.min(steps, 4); step++) {
      await section.evaluate((el, s) => {
        const top = el.getBoundingClientRect().top + scrollY;
        scrollTo({ top: top + s * innerHeight * 0.85 - 8, behavior: "instant" });
      }, step);
      await page.waitForTimeout(350);
      await page.screenshot({ path: `${dir}/${String(index).padStart(2, "0")}-${id}${steps > 1 ? `-${step + 1}` : ""}.png` });
      index++;
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) problems.push(`${name} horizontal overflow ${overflow}px at #${id}`);
  }
  await context.close();
}
await browser.close();
console.log(problems.length ? problems.join("\n") : "no problems detected");
