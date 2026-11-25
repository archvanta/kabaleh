import type { Fastener } from "./photo-fasteners";

// Each memory gets a page layout that suits its own photos and story.
// Fasteners are listed per photo so a pin, clip or tape sits where it reads naturally.
export type Composition = {
  layout:
    | "pair"
    | "hero"
    | "notebook"
    | "keepsake"
    | "mat"
    | "filmstrip"
    | "botanical"
    | "contact"
    | "wide"
    | "postcard"
    | "stack"
    | "rose";
  fasteners: Fastener[];
};

export const compositions: Record<string, Composition> = {
  "memory-01": { layout: "pair", fasteners: ["tape", "pin"] },
  "memory-02": { layout: "hero", fasteners: ["corners"] },
  "memory-03": { layout: "notebook", fasteners: ["clip"] },
  "memory-04": { layout: "keepsake", fasteners: ["pin"] },
  "memory-05": { layout: "mat", fasteners: ["corners"] },
  "memory-06": { layout: "filmstrip", fasteners: ["none", "none"] },
  "memory-07": { layout: "botanical", fasteners: ["tape"] },
  "memory-08": { layout: "contact", fasteners: ["none", "none", "none", "none"] },
  "memory-09": { layout: "wide", fasteners: ["tape"] },
  "memory-10": { layout: "postcard", fasteners: ["none"] },
  "memory-11": { layout: "stack", fasteners: ["clip", "tape"] },
  "memory-13": { layout: "rose", fasteners: ["pin"] },
};

export const fallbackComposition: Composition = { layout: "hero", fasteners: ["tape"] };
