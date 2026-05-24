import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'
import { OrderProvider } from './context/OrderContext'
import { ConsentProvider } from './context/ConsentContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Provider order matters slightly: ConsentProvider goes above the
// providers whose initialization may eventually need to consult consent
// (analytics, marketing pixels, etc.). Today nothing reads from it
// outside the Cookies page, but the ordering future-proofs that.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConsentProvider>
        <ThemeProvider>
          <BrowserRouter>
            <OrderProvider>
              <CartProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </CartProvider>
            </OrderProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ConsentProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
