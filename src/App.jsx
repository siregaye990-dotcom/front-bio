// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider }       from './context/CartContext'
import { AuthProvider }       from './context/AuthContext'
import { ClientAuthProvider } from './context/ClientAuthContext'
import Navbar                 from './components/Navbar'
import Footer                 from './components/Footer'
import WAFloat                from './components/WAFloat'
import Home                   from './pages/Home'
import Shop                   from './pages/Shop'
import ProductDetail          from './pages/ProductDetail'
import Track                  from './pages/Track'
import AdminRoute             from './pages/admin/AdminRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClientAuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />

              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/"                    element={<Home />} />
                  <Route path="/boutique"            element={<Shop />} />
                  <Route path="/boutique/:slug"      element={<ProductDetail />} />
                  <Route path="/suivi"               element={<Track />} />
                  <Route path="/admin"               element={<AdminRoute />} />
                  <Route path="/admin/*"             element={<AdminRoute />} />
                  <Route path="*"                    element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
              <WAFloat />
            </div>

            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '13px',
                  background: '#0d2410',
                  color: '#fff',
                  borderLeft: '3px solid #e8b84b',
                  borderRadius: '7px',
                },
                success: { iconTheme: { primary: '#1a6b35', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#c82a2a', secondary: '#fff' } },
                duration: 2800,
              }}
            />
          </CartProvider>
        </ClientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      fontFamily: "'Jost', sans-serif", color: 'var(--muted)',
    }}>
      <span style={{ fontSize: 64 }}>🌾</span>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: 'var(--text)' }}>
        Page introuvable
      </h1>
      <p>Cette page n'existe pas.</p>
      <a href="/" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
        ← Retour à l'accueil
      </a>
    </div>
  )
}
