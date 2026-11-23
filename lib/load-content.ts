import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contentSchema, content as demonstrationContent } from "./content";
// Personal material is opt-in, local-only, gitignored, and never part of the default build.
export const content =
  process.env.MESHKAT_PERSONAL_PREVIEW === "1"
    ? contentSchema.parse(
        JSON.parse(
          readFileSync(resolve(process.cwd(), ".private/letter.json"), "utf8"),
        ),
      )
    : demonstrationContent;
