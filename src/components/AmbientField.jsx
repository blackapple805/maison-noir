import AmorphousBlob from './AmorphousBlob'

/**
 * AmbientField — page-level atmospheric layer.
 * Renders fixed behind all content. Three slow-drifting blobs in
 * accent/deep tones. Opacities are intentionally minimal: this is
 * meant to be felt, not seen.
 *
 * Sits below z-0 so all interactive content stays on top.
 */
export default function AmbientField() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <AmorphousBlob
        variant="draped"
        color="var(--accent-deep)"
        size="70vw"
        opacity={0.07}
        blur={120}
        duration={28}
        style={{ top: '-15vw', left: '-10vw' }}
      />
      <AmorphousBlob
        variant="melted"
        color="var(--accent)"
        size="55vw"
        opacity={0.05}
        blur={140}
        duration={36}
        style={{ top: '40vh', right: '-15vw' }}
      />
      <AmorphousBlob
        variant="droplet"
        color="var(--bg-elev-3)"
        size="60vw"
        opacity={0.18}
        blur={100}
        duration={32}
        style={{ bottom: '-20vw', left: '20vw' }}
      />
    </div>
  )
}
