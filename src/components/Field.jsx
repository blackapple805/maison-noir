import { forwardRef } from 'react'

const Field = forwardRef(function Field(
  { label, error, hint, right, className = '', ...props },
  ref
) {
  return (
    <label className={`block ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="editorial-label">
          {label}
          {props.required && <span className="text-accent ml-1">*</span>}
        </span>
        {right && <span className="editorial-label">{right}</span>}
      </div>
      <input
        ref={ref}
        {...props}
        className={`w-full bg-transparent border-b py-3 text-fg outline-none transition-colors placeholder:text-fg-faint ${
          error
            ? 'border-accent'
            : 'border-fg/15 focus:border-fg'
        }`}
      />
      {error ? (
        <p className="editorial-label text-accent mt-2">— {error}</p>
      ) : hint ? (
        <p className="editorial-label text-fg-dim mt-2">{hint}</p>
      ) : null}
    </label>
  )
})

export default Field
