// src/components/SearchBar.jsx
import { FiSearch, FiX } from 'react-icons/fi'
import styles from './SearchBar.module.css'

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <FiSearch className={styles.icon} size={14} />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          aria-label="Rechercher un produit"
        />
        {value && (
          <button
            onClick={onClear}
            className={styles.clearBtn}
            aria-label="Effacer la recherche"
            title="Effacer"
          >
            <FiX size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
