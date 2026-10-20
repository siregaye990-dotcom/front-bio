// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiSearch } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { count } = useCart()
  const { isAdmin } = useAuth()
  const { currency, setCurrency, CURRENCIES } = useCurrency()
  const location  = useLocation()
  const navigate  = useNavigate()
  const isActive  = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <img src="/sweetbio-logo.png" alt="SweetBio" className={styles.logoImg}/>
      </Link>
      <div className={styles.tabs}>
        <Link to="/"         className={`${styles.tab} ${isActive('/')        && !isActive('/boutique') && !isActive('/suivi') && !isActive('/admin') ? styles.active : ''}`}>Accueil</Link>
        <Link to="/boutique" className={`${styles.tab} ${isActive('/boutique') ? styles.active : ''}`}>Boutique</Link>
        <Link to="/suivi"    className={`${styles.tab} ${isActive('/suivi')    ? styles.active : ''}`}>Suivi</Link>
        {isAdmin && <Link to="/admin" className={`${styles.tab} ${isActive('/admin') ? styles.active : ''}`}>Admin</Link>}
      </div>
      <div className={styles.actions}>
        <div className={styles.currencyWrap}>
          <select
            aria-label="Sélection de devise"
            className={styles.currencySelect}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {Object.values(CURRENCIES).map((item) => (
              <option key={item.code} value={item.code}>{item.flag} {item.code}</option>
            ))}
          </select>
        </div>
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
