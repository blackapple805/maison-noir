import { createContext, useContext, useState } from 'react'

const OrderContext = createContext(null)

const ORDERS_KEY = 'mn-orders'
const LAST_ORDER_KEY = 'mn-last-order'

// MN-YY-XXXXX format
function generateOrderNumber() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `MN-${yy}-${rand}`
}

export function OrderProvider({ children }) {
  const [lastOrder, setLastOrder] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(LAST_ORDER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const placeOrder = ({ items, shipping, payment, totals }) => {
    const order = {
      number: generateOrderNumber(),
      placedAt: new Date().toISOString(),
      items: items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        category: i.product.category,
        colorway: i.product.colorway,
        image: i.product.image,
        price: i.product.price,
        size: i.size,
        qty: i.qty,
        lineTotal: i.product.price * i.qty,
      })),
      shipping,
      // Store only safe payment metadata — never full card numbers
      payment: {
        method: payment.method,
        brand: payment.brand,
        last4: payment.last4,
        name: payment.name,
      },
      totals,
      estimatedDelivery: estimateDeliveryWindow(),
    }

    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
      const allRaw = localStorage.getItem(ORDERS_KEY)
      const all = allRaw ? JSON.parse(allRaw) : []
      all.unshift(order)
      localStorage.setItem(ORDERS_KEY, JSON.stringify(all.slice(0, 20))) // keep last 20
    } catch {
      // ignore quota errors
    }

    setLastOrder(order)
    return order
  }

  return (
    <OrderContext.Provider value={{ lastOrder, placeOrder }}>
      {children}
    </OrderContext.Provider>
  )
}

function estimateDeliveryWindow() {
  const start = new Date()
  start.setDate(start.getDate() + 3)
  const end = new Date()
  end.setDate(end.getDate() + 5)
  const fmt = (d) => d.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })
  return { start: fmt(start), end: fmt(end) }
}

export const useOrder = () => useContext(OrderContext)
