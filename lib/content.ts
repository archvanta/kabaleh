import { z } from "zod";
import raw from "@/content/letter.json";

// Only local, repository-owned assets. No remote trackers or arbitrary URLs.
const image = z.object({
  src: z.string().regex(/^\/images\/[a-zA-Z0-9/_\-.]+$/),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});
const sectionIds = [
  "introduction",
  "memories",
  "chapters",
  "red-thread",
  "original-letter",
  "belfi",
  "keepsakes",
  "bag-pin",
  "gallery",
  "details",
  "comparison",
  "letter",
  "closing",
] as const;
const artifact = z.object({
  title: z.string(),
  text: z.string(),
  label: z.string(),
  image: image.nullable(),
  relatedImages: z.array(image).default([]),
  pendingLabel: z.string(),
});
const modelPath = z.string().regex(/^\/models\/[a-zA-Z0-9/_\-.]+\.glb$/);
const keepsakeItem = z.object({
  id: z.string(),
  type: z.literal("bracelet"),
  title: z.string(),
  order: z.number().int().min(1).max(4),
  modelPath,
  referenceImage: image.nullable(),
  story: z.string(),
  date: z.string().nullable(),
  caption: z.string(),
  visible: z.boolean(),
  animate: z.boolean(),
});
export const contentSchema = z.object({
  recipient: z.string().min(1),
  sender: z.string().min(1),
  birthday: z.string().nullable(),
  edition: z.string().min(1),
  intro: z.object({ eyebrow: z.string(), title: z.string(), text: z.string() }),
  sections: z
    .array(z.object({ id: z.enum(sectionIds), visible: z.boolean() }))
    .refine(
      (items) => new Set(items.map((i) => i.id)).size === items.length,
      "Duplicate section IDs",
    ),
  memories: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      date: z.string().optional(),
      image,
    }),
  ),
  chapters: z.array(
    z.object({
      id: z.string(),
      number: z.string(),
      title: z.string(),
      text: z.string(),
      images: z.array(image),
    }),
  ),
  gallery: z.array(image.extend({ id: z.string(), caption: z.string() })),
  notes: z.array(
    z.object({ id: z.string(), title: z.string(), text: z.string() }),
  ),
  redThreadScene: z.object({ title: z.string(), text: z.string() }),
  originalHandwrittenLetter: artifact,
  belfiMemory: artifact,
  keepsakes: z.object({
    title: z.string(),
    text: z.string(),
    items: z
      .array(keepsakeItem)
      .length(4)
      .refine(
        (items) => items.every((item, i) => item.order === i + 1),
        "Bracelets must stay in chronological order",
      ),
  }),
  bagPin: z.object({
    title: z.string(),
    text: z.string(),
    caption: z.string(),
    referenceImage: image.nullable(),
    modelPath: modelPath.nullable(),
    visible: z.boolean(),
  }),
  comparison: z.object({
    title: z.string(),
    text: z.string(),
    before: image,
    after: image,
  }),
  finalLetter: z.object({ title: z.string(), paragraphs: z.array(z.string()) }),
  closing: z.object({ title: z.string(), text: z.string() }),
});
export type LetterContent = z.infer<typeof contentSchema>;
export type LetterImage = z.infer<typeof image>;
export const content = contentSchema.parse(raw);
