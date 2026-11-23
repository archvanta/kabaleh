import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contentSchema, content as publishedContent } from "./content";
// The default build contains the now-approved public content and photographs.
// A retained local override remains available for editing and testing.
export const content =
  process.env.MESHKAT_PERSONAL_PREVIEW === "1"
    ? contentSchema.parse(
        JSON.parse(
          readFileSync(resolve(process.cwd(), ".private/letter.json"), "utf8"),
        ),
      )
    : publishedContent;
