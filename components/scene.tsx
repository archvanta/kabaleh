import { asset } from "@/lib/assets";
export function Scene({ petals = true }: { petals?: boolean }) {
  return (
    <div className="scene" aria-hidden="true">
      <div
        className="scene-photo"
        style={{ backgroundImage: `url("${asset("/images/tabletop.webp")}")` }}
      />
      <div className="scene-light" />
      {petals && (
        <div className="petals">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`flourish ${className}`}
      viewBox="0 0 160 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 22c25-18 47 15 72-2 25 17 47-16 72 2M31 20c13-15 28-13 39-2M90 18c11-11 26-13 39 2M80 20C66 9 74 2 80 8c6-6 14 1 0 12Z"
        stroke="currentColor"
        strokeWidth=".8"
      />
      <circle cx="80" cy="27" r="1.5" fill="currentColor" />
    </svg>
  );
}
