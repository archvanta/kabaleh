import { writeFileSync, mkdirSync } from "node:fs";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createBracelet, type BraceletDesign } from "../lib/bracelet-models";
// GLTFExporter uses the browser FileReader API for binary buffers, without textures here.
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  async readAsArrayBuffer(blob: Blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob: Blob) {
    this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
    this.onloadend?.();
  }
}
Object.assign(globalThis, { FileReader: NodeFileReader });
async function main() {
  mkdirSync("public/models", { recursive: true });
  for (const design of [
    "black-detail",
    "brown-strands",
    "silver-cord",
    "tiger-eye",
  ] as BraceletDesign[]) {
    const model = createBracelet(design);
    const binary = await new GLTFExporter().parseAsync(model, { binary: true });
    if (!(binary instanceof ArrayBuffer))
      throw new Error("Expected binary GLB");
    writeFileSync(`public/models/${design}.glb`, Buffer.from(binary));
    model.traverse((node) => {
      if ("geometry" in node)
        (node.geometry as { dispose: () => void }).dispose();
    });
    console.log(`${design}: ${binary.byteLength} bytes`);
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
