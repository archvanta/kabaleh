// Cuts artwork/envelope-layers.png into the three envelope parts used by the
// layered opening: the body (inside wall + front pocket), the flap and the letter.
// Runs in Chromium so no native image toolchain is needed.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("artwork/envelope-layers.png").toString("base64");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
});
const page = await browser.newPage();
const parts = await page.evaluate(async (data) => {
  const img = new Image();
  img.src = `data:image/png;base64,${data}`;
  await img.decode();
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data: px } = ctx.getImageData(0, 0, img.width, img.height);
  // Panels sit in thirds of the sheet; find each one's opaque bounds.
  const panels = [
    ["envelope-body", 0, 730],
    ["envelope-flap", 730, 1460],
    ["envelope-letter", 1460, img.width],
  ];
  const out = [];
  for (const [name, x0, x1] of panels) {
    let minX = x1, minY = img.height, maxX = x0, maxY = 0;
    for (let y = 0; y < img.height; y++)
      for (let x = x0; x < x1; x++) {
        if (px[(y * img.width + x) * 4 + 3] < 200) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const crop = new OffscreenCanvas(w, h);
    crop.getContext("2d").drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
    const blob = await crop.convertToBlob({ type: "image/webp", quality: 0.86 });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    out.push({ name, w, h, x: minX, y: minY, webp: btoa(binary) });
  }
  return out;
}, source);
for (const part of parts) {
  writeFileSync(`public/images/stationery/${part.name}.webp`, Buffer.from(part.webp, "base64"));
  console.log(part.name, `${part.w}x${part.h}`, `at ${part.x},${part.y}`);
}
await browser.close();
