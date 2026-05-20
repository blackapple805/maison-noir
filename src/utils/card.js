// Card number utilities

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  const brand = detectBrand(digits)
  // Amex: 4-6-5 grouping; everything else: 4-4-4-4(-3)
  if (brand === 'amex') {
    return digits.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' ')
    )
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function detectBrand(digits) {
  const d = digits.replace(/\D/g, '')
  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard'
  if (/^3[47]/.test(d)) return 'amex'
  if (/^6(011|5|4[4-9]|22)/.test(d)) return 'discover'
  if (/^(36|30[0-5]|38|39)/.test(d)) return 'diners'
  return 'card'
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return digits.slice(0, 2) + ' / ' + digits.slice(2)
}

// Standard Luhn algorithm
export function luhnValid(num) {
  const digits = num.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function expiryValid(formatted) {
  const m = formatted.match(/^(\d{2})\s*\/\s*(\d{2})$/)
  if (!m) return false
  const month = parseInt(m[1], 10)
  const year = 2000 + parseInt(m[2], 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const exp = new Date(year, month, 0, 23, 59, 59) // last day of expiry month
  return exp >= now
}

export function cvvValid(cvv, brand) {
  const len = brand === 'amex' ? 4 : 3
  return new RegExp(`^\\d{${len}}$`).test(cvv)
}
