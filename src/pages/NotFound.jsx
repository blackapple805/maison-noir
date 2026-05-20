import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center grain">
      <div className="editorial-label text-accent mb-6">— Error 404 · Folio missing</div>
      <h1 className="font-display text-7xl md:text-9xl tracking-tighter2 leading-none mb-6">
        Unfound.
      </h1>
      <p className="font-display italic text-2xl text-fg-muted mb-12 max-w-md">
        The page you sought is not held within this archive.
      </p>
      <Link to="/" className="editorial-label link-line hover:text-accent">
        Return to the atelier →
      </Link>
    </div>
  )
}
