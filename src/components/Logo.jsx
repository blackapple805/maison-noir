// Abstract sigil for MAISON·NOIR
// Geometric raven/blade hybrid — two folded planes meeting at a sharp vertex
// Uses currentColor so it inherits theme color (dark mode: bone, light: ink)
export default function Logo({ size = 28, withWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Maison Noir"
      >
        {/* Outer diamond frame — hairline */}
        <path
          d="M20 1 L39 20 L20 39 L1 20 Z"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.35"
        />

        {/* Folded plane — upper wing */}
        <path
          d="M20 4 L36 20 L20 20 L4 20 Z"
          fill="currentColor"
          fillOpacity="0.95"
        />

        {/* Folded plane — lower blade */}
        <path
          d="M20 20 L28 36 L20 28 L12 36 Z"
          fill="currentColor"
        />

        {/* Accent vertex — oxblood dot */}
        <circle cx="20" cy="20" r="1.6" fill="#9C1B2A" />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base md:text-lg tracking-tighter2 -mb-0.5">
            MAISON·NOIR
          </span>
          <span className="font-mono text-[8px] tracking-editorial uppercase opacity-50">
            Apothecary · MMXXVI
          </span>
        </div>
      )}
    </div>
  )
}
