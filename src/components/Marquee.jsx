export default function Marquee({ items = [] }) {
  return (
    <div className="relative overflow-hidden border-y hairline py-3 bg-bg/60">
      <div className="flex gap-12 animate-marquee whitespace-nowrap editorial-label">
        {/* Real items */}
        {items.map((t, i) => (
          <span key={`a-${i}`} className="flex items-center gap-12">
            {t}
            <span className="text-accent" aria-hidden="true">✦</span>
          </span>
        ))}
        {/* Duplicate for seamless loop — hidden from screen readers */}
        {items.map((t, i) => (
          <span key={`b-${i}`} className="flex items-center gap-12" aria-hidden="true">
            {t}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
