// A photograph keeps the same attachment in its memory, preview and complete album.
export function photoFastener(source: string): "pin" | "clip" | "tape" {
  const value = Array.from(source).reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return (["pin", "clip", "tape"] as const)[value % 3];
}
