import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import LoadingScreen from './components/LoadingScreen'
import AmbientField from './components/AmbientField'
import { QuickViewProvider } from './components/QuickView'
import { SearchProvider } from './components/SearchOverlay'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Atelier from './pages/Atelier'
import Lookbook from './pages/Lookbook'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <SearchProvider>
      <QuickViewProvider>
        <AmbientField />
        <LoadingScreen />
        <ScrollToTop />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/atelier" element={<Atelier />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation/:number" element={<Confirmation />} />
            <Route path="/journal" element={<Lookbook />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </QuickViewProvider>
    </SearchProvider>
  )
}
