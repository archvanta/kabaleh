import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const url = "https://raw.githubusercontent.com/archvanta/kabaleh/1bb5c662e23e39dc2d21c17c276a6268a1adb288/fonts/mahboubeh-mehravar.woff2";
const expectedHash = "891456d323435a274bae321e49be329330b8757fa30413e9a04a89ed7c4a3934";
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Website font request failed with status ${response.status}`);
}
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash("sha256").update(bytes).digest("hex") !== expectedHash) {
  throw new Error("Website font checksum did not match the original");
}
mkdirSync("public/fonts", { recursive: true });
writeFileSync("public/fonts/mahboubeh-mehravar.woff2", bytes);
console.log("Original website font verified and installed");
