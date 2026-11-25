export type Fastener = "pin" | "clip" | "tape" | "corners" | "none";

// A photograph keeps the same attachment wherever no layout chooses one for it.
export function photoFastener(source: string): "pin" | "clip" | "tape" {
  const value = Array.from(source).reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return (["pin", "clip", "tape"] as const)[value % 3];
}
