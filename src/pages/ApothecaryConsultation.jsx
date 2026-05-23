import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AmorphousBlob from '../components/AmorphousBlob'

const formats = [
  {
    n: '01',
    title: 'The first reading',
    duration: '60 minutes',
    fee: 'Complimentary',
    body: 'A standing introduction to the house. We map your current regimen, identify what is working and what is not, and recommend three to five formulations from our catalogue.',
    setting: 'In boutique · or by video',
  },
  {
    n: '02',
    title: 'The seasonal review',
    duration: '90 minutes',
    fee: '€180',
    body: 'For returning clients. We revisit your formulary at the turn of each season — autumn into winter, spring into summer — and adjust the regimen to the climate, the light, and the skin.',
    setting: 'In boutique · or by post',
  },
  {
    n: '03',
    title: 'The deep consultation',
    duration: 'Half day',
    fee: '€480',
    body: 'A full diagnostic. Two formulators, the laboratory, a skin reading under cold light, and a written protocol. Available only in Paris and Grasse.',
    setting: 'Paris · Grasse only',
  },
]

export default function ApothecaryConsultation() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="relative px-6 md:px-10 mb-32 overflow-hidden">
        <AmorphousBlob
          variant="melted"
          color="var(--accent-deep)"
          size="55vw"
          opacity={0.15}
          blur={110}
          duration={32}
          style={{ top: '0', left: '-15vw' }}
        />
        <div className="relative">
          <p className="editorial-label text-ox mb-6">— Apothecary Consultation</p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
            A reading <br />
            <span className="italic text-bone/70">of the skin.</span>
          </h1>
          <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
            A consultation is the beginning of a relationship — quiet, careful,
            unhurried. We do not prescribe. We compose. The session ends when
            your regimen is understood and a path forward is written.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="px-6 md:px-10 mb-32 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="md:col-span-6 aspect-[4/5] overflow-hidden bg-char order-2 md:order-1"
          >
            <img
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1600&q=85"
              alt=""
              className="w-full h-full object-cover grayscale-[15%]"
            />
          </motion.div>
          <div className="md:col-span-6 order-1 md:order-2">
            <p className="editorial-label text-ox mb-6">— Method</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter2 leading-[0.95] mb-8">
              What to expect.
            </h2>
            <div className="space-y-8 text-bone/80 leading-relaxed">
              <p>
                You will be received in the consultation room — a quiet space,
                cool light, a long oak table. We begin with what you have been
                using, and why. Bring bottles if you wish.
              </p>
              <p>
                We take notes by hand. We will ask about climate, water, sleep,
                and the seasons in which your skin shifts. Nothing is recorded
                without your consent.
              </p>
              <p>
                You leave with a written protocol — three to five formulations,
                an order of application, and a schedule. The protocol is yours
                regardless of whether you purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="px-6 md:px-10 mb-32">
        <div className="border-b hairline pb-6 mb-12 max-w-6xl mx-auto">
          <p className="editorial-label text-ox mb-3">— Three formats</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-none">
            Choose your reading.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-bone/10 max-w-6xl mx-auto">
          {formats.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.1 }}
              className="bg-bg p-8 md:p-10 flex flex-col"
            >
              <div className="editorial-label text-ox mb-6">N° {f.n}</div>
              <h3 className="font-display text-3xl md:text-4xl italic tracking-tight mb-4 text-bone/90 leading-tight">
                {f.title}
              </h3>
              <p className="text-bone/70 leading-relaxed mb-8 flex-grow">
                {f.body}
              </p>
              <div className="border-t hairline pt-6 space-y-3 editorial-label">
                <div className="flex justify-between">
                  <span className="text-bone/40">Duration</span>
                  <span className="text-bone/90 normal-case tracking-normal">{f.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone/40">Fee</span>
                  <span className="text-bone/90 normal-case tracking-normal">{f.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone/40">Setting</span>
                  <span className="text-bone/90 normal-case tracking-normal text-right">{f.setting}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto text-center border-t hairline pt-24">
        <p className="font-display italic text-2xl md:text-4xl text-bone/80 leading-tight mb-10 max-w-2xl mx-auto">
          "A consultation is a conversation.
          A regimen is a slow agreement between hands and skin."
        </p>
        <Link to="/concierge" className="editorial-label link-line hover:text-ox">
          Schedule a reading →
        </Link>
      </section>
    </div>
  )
}
