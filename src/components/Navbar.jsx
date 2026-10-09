// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiUser, FiLogOut } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CurrencySelector from './CurrencySelector'
import LOGO_B64 from '../assets/logo_b64'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { count } = useCart()
  const { isAdmin } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const isActive  = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  const isDev = process.env.NODE_ENV !== 'production'
  const showAdmin = isAdmin || location.pathname.startsWith('/admin') || isDev

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <img src={LOGO_B64} alt="SweetBio" className={styles.logoImg}/>
        <span className={styles.brand}>SWEET<em>BIO</em></span>
      </Link>
      <div className={styles.tabs}>
        <Link to="/"         className={`${styles.tab} ${isActive('/')        && !isActive('/boutique') && !isActive('/suivi') && !isActive('/admin') ? styles.active : ''}`}>Accueil</Link>
        <Link to="/boutique" className={`${styles.tab} ${isActive('/boutique') ? styles.active : ''}`}>Boutique</Link>
        <Link to="/suivi"    className={`${styles.tab} ${isActive('/suivi')    ? styles.active : ''}`}>Suivi</Link>
        {showAdmin && <Link to="/admin"    className={`${styles.tab} ${isActive('/admin')    ? styles.active : ''}`}>Admin</Link>}
      </div>
      <div className={styles.actions}>
        <button className={styles.trackPill} onClick={() => navigate('/suivi')}>
          <FiSearch size={12}/> Suivre ma commande
        </button>

        <button className={styles.cartPill} onClick={() => navigate('/boutique')}>
          <FiShoppingCart size={14}/>
          {count > 0 && <span className={styles.cartCount}>{count}</span>}
        </button>
      </div>
    </nav>
  )
}
