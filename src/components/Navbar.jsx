// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiUser, FiLogOut } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useClientAuth } from '../context/ClientAuthContext'
import CurrencySelector from './CurrencySelector'
import ClientAuthModal from './ClientAuthModal'
import LOGO_B64 from '../assets/logo_b64'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { count } = useCart()
  const { isAdmin } = useAuth()
  const { user: clientUser, signOut } = useClientAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const isActive  = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  const isDev = process.env.NODE_ENV !== 'production'
  const showAdmin = isAdmin || location.pathname.startsWith('/admin') || isDev

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <img src={LOGO_B64} alt="Bio Sén" className={styles.logoImg}/>
        <span className={styles.brand}>BIO <em>SÉN</em></span>
      </Link>
      <div className={styles.tabs}>
        <Link to="/"         className={`${styles.tab} ${isActive('/')        && !isActive('/boutique') && !isActive('/suivi') && !isActive('/admin') ? styles.active : ''}`}>Accueil</Link>
        <Link to="/boutique" className={`${styles.tab} ${isActive('/boutique') ? styles.active : ''}`}>Boutique</Link>
        <Link to="/suivi"    className={`${styles.tab} ${isActive('/suivi')    ? styles.active : ''}`}>Suivi</Link>
        {showAdmin && <Link to="/admin"    className={`${styles.tab} ${isActive('/admin')    ? styles.active : ''}`}>Admin</Link>}
      </div>
      <div className={styles.actions}>
        <CurrencySelector />
        <button className={styles.trackPill} onClick={() => navigate('/suivi')}>
          <FiSearch size={12}/> Suivre ma commande
        </button>
        
        {clientUser ? (
          <div className={styles.userMenu}>
            <button className={styles.userBtn} title={clientUser.email}>
              <FiUser size={14}/> {clientUser.email?.split('@')[0]}
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Déconnexion">
              <FiLogOut size={14}/>
            </button>
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
            <FiUser size={14}/> Connexion
          </button>
        )}

        <button className={styles.cartPill} onClick={() => navigate('/boutique')}>
          <FiShoppingCart size={14}/>
          {count > 0 && <span className={styles.cartCount}>{count}</span>}
        </button>
      </div>

      <ClientAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  )
}
