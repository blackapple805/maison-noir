export default function Footer() {
  return (
    <footer className="border-t hairline mt-32 pt-20 pb-10 px-6 md:px-10 grain">
      <div className="grid md:grid-cols-12 gap-12 mb-20">
        <div className="md:col-span-5">
          <h2 className="font-display text-5xl md:text-7xl tracking-tighter2 leading-[0.9] mb-6">
            Receive <br />
            <span className="italic text-bone/70">the dispatch.</span>
          </h2>
          <p className="text-bone/60 max-w-md mb-8 text-sm leading-relaxed">
            Quarterly editorial. Atelier studies, private previews,
            and the occasional invitation. Unsubscribe with one breath.
          </p>
          <form className="flex items-center border-b hairline pb-2 max-w-md">
            <input
              type="email"
              placeholder="your.address@elsewhere.com"
              className="flex-1 bg-transparent outline-none text-bone placeholder:text-bone/30 text-sm"
            />
            <button className="editorial-label text-bone hover:text-ox transition-colors">
              Subscribe →
            </button>
          </form>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">House</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li><a className="link-line" href="#">Atelier</a></li>
              <li><a className="link-line" href="#">Heritage</a></li>
              <li><a className="link-line" href="#">Journal</a></li>
              <li><a className="link-line" href="#">Boutiques</a></li>
            </ul>
          </div>
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">Services</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li><a className="link-line" href="#">Made to Measure</a></li>
              <li><a className="link-line" href="#">Apothecary Consultation</a></li>
              <li><a className="link-line" href="#">Refill & Recycling</a></li>
              <li><a className="link-line" href="#">Concierge</a></li>
            </ul>
          </div>
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li>+33 1 42 60 00 00</li>
              <li>concierge@maisonnoir.apothecary</li>
              <li className="text-bone/60 pt-2">
                12 Rue de l'Université <br />
                75007 Paris
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t hairline pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 editorial-label text-bone/40">
        <div className="font-display text-3xl tracking-tighter2 text-bone/90 normal-case">
          MAISON·NOIR
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a className="link-line" href="#">Terms</a>
          <a className="link-line" href="#">Privacy</a>
          <a className="link-line" href="#">Cookies</a>
          <a className="link-line" href="#">Modern Slavery Statement</a>
        </div>
        <div>© MMXXVI · All Rites Reserved</div>
      </div>
    </footer>
  )
}
