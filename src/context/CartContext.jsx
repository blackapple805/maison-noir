import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const initial = { items: [], open: false }

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.product.id}-${action.size}`
      const existing = state.items.find((i) => i.key === key)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, qty: i.qty + 1 } : i
          ),
          open: true,
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          { key, product: action.product, size: action.size, qty: 1 },
        ],
        open: true,
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) }
    case 'QTY':
      return {
        ...state,
        items: state.items
          .map((i) => (i.key === action.key ? { ...i, qty: Math.max(0, action.qty) } : i))
          .filter((i) => i.qty > 0),
      }
    case 'OPEN':
      return { ...state, open: true }
    case 'CLOSE':
      return { ...state, open: false }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial)

  // Lock scroll when cart open — restore prior value on cleanup
  useEffect(() => {
    if (!state.open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [state.open])

  const total = state.items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const count = state.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ ...state, dispatch, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
