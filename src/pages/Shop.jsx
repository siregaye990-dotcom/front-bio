// src/pages/Shop.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiCheck, FiLock, FiShield, FiInfo } from 'react-icons/fi'
import { FaLeaf, FaStar, FaWhatsapp } from 'react-icons/fa'
import { GiMortar } from 'react-icons/gi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { PRICES, WHATSAPP_NUMBER } from '../utils/products'
import useProducts from '../hooks/useProducts'
import SearchBar from '../components/SearchBar'
import ProductSkeleton from '../components/ProductSkeleton'
import Checkout from '../components/Checkout'
import styles from './Shop.module.css'

const TAG_ICONS = [<FaLeaf size={8}/>, <FaStar size={8}/>, <GiMortar size={8}/>]

export default function Shop() {
  const { items, subtotal, shipping, total, addItem, updateQty, removeItem, clear } = useCart()
  const { getPrice } = useCurrency()
  const [selSize, setSelSize] = useState({ 1: '500g', 2: '500g', 3: '500g' })
  const [qty, setQty]         = useState({ 1: 1, 2: 1, 3: 1 })
  const [added, setAdded]     = useState({})
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tous')
  const [sortMode, setSortMode] = useState('default')
  const navigate = useNavigate()
  const { products, loading } = useProducts()

  const categories = ['Tous', ...new Set(products.map(p => p.tag.split('·')[0].trim()))]

  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(p =>
      filterCategory === 'Tous' || p.tag.split('·')[0].trim() === filterCategory
    )

  const productsToDisplay = sortMode === 'default'
    ? filteredProducts
    : [...filteredProducts].sort((a, b) => {
      if (sortMode === 'az') return a.name.localeCompare(b.name, 'fr')
      if (sortMode === 'za') return b.name.localeCompare(a.name, 'fr')
      if (sortMode === 'badge') return a.badge.localeCompare(b.badge, 'fr')
      return a.id - b.id
    })

  const handleAdd = (product) => {
    const size = selSize[product.id]
    const price = PRICES[size]
    const stockKey = `${product.name.split(' ')[0]}-${size}`
    addItem(product, size, price, qty[product.id], product.color, stockKey)
    setQty(q => ({ ...q, [product.id]: 1 }))
    setAdded(a => ({ ...a, [product.id]: true }))
    setTimeout(() => setAdded(a => ({ ...a, [product.id]: false })), 1400)
    toast.success(`${product.name} (${size}) ajouté au panier !`)
  }

  const getColorClass = (id) => {
    if (id === 1) return styles.green
    if (id === 2) return styles.gold
    return styles.earth
  }

  return (
    <div className={`${styles.page} container mx-auto px-4`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Boutique en ligne</div>
        <h1 className={styles.title}>Commander</h1>
        <p className={styles.subtitle}>Livraison disponible · Paiement sécurisé · Stock limité</p>
      </div>

      <div className={styles.layout}>
        {/* Products */}
        <div className={styles.products}>
          {/* Search Bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterPills}>
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`${styles.filterPill} ${filterCategory === category ? styles.filterPillActive : ''}`}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className={styles.sortRow}>
              <label className={styles.sortLabel} htmlFor="sortMode">Trier :</label>
              <select
                id="sortMode"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="default">Par défaut</option>
                <option value="az">Nom A → Z</option>
                <option value="za">Nom Z → A</option>
                <option value="badge">Badge</option>
              </select>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />

          {/* Loading Skeletons */}
          {loading && (
            <div className={styles.grid}>
              {[...Array(3)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Products List */}
          {!loading && productsToDisplay.length > 0 ? productsToDisplay.map((product, idx) => (
            <div key={product.id} className={styles.card}>
              {/* Image */}
              <div
                className={`${styles.cardImg} ${styles[`bg${idx}`]}`}
                style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className={styles.imgPlaceholder}>
                  {TAG_ICONS[idx]}
                  <span className={styles.imgLabel}>{product.name}</span>
                </div>
                <span className={`${styles.badge} ${styles[`badge${idx}`]}`}>{product.badge}</span>
                <button className={styles.detailLink} onClick={() => navigate(`/boutique/${product.slug}`)}>
                  <FiInfo size={9}/> Fiche détaillée
                </button>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <div>
                  <div className={`${styles.tag} ${styles[`tag${idx}`]}`}>
                    {TAG_ICONS[idx]} {product.tag}
                  </div>
                  <h2 className={styles.prodName}>{product.name}</h2>
                  <p className={styles.prodDesc}>{product.shortDesc}</p>

                  {/* Format selector */}
                  <div className={styles.fmtLabel}>Choisissez votre format :</div>
                  <div className={styles.fmtBtns}>
                    {Object.entries(PRICES).map(([size, price]) => (
                      <label
                        key={size}
                        className={`${styles.fmtBtn} ${selSize[product.id] === size ? styles.fmtBtnActive : ''} ${selSize[product.id] === size ? styles[`fmtActive${idx}`] : ''}`}
                        onClick={() => setSelSize(s => ({ ...s, [product.id]: size }))}
                      >
                        <div className={styles.radio}>
                          <div className={`${styles.radioDot} ${selSize[product.id] === size ? styles[`dot${idx}`] : ''}`}/>
                        </div>
                        <span className={styles.fmtSize}>{size}</span>
                        <span className={`${styles.fmtPrice} ${getColorClass(product.id)}`}>
                          {getPrice(price)}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className={styles.stockRow}>
                    <span className={styles.inStock}>● En stock</span>
                  </div>
                </div>

                {/* Add to cart */}
                <div className={styles.addRow}>
                  <div className={styles.qtyCtrl}>
                    <button className={styles.qtyBtn} onClick={() => setQty(q => ({ ...q, [product.id]: Math.max(1, q[product.id]-1) }))}>−</button>
                    <span className={styles.qtyVal}>{qty[product.id]}</span>
                    <button className={styles.qtyBtn} onClick={() => setQty(q => ({ ...q, [product.id]: Math.min(99, q[product.id]+1) }))}>+</button>
                  </div>
                  <button
                    className={`${styles.addBtn} ${styles[`addBtn${idx}`]} ${added[product.id] ? styles.addBtnAdded : ''}`}
                    onClick={() => handleAdd(product)}
                  >
                    {added[product.id]
                      ? <><FiCheck size={10}/> Ajouté !</>
                      : <><FiPlus size={10}/> Ajouter au panier</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )) : !loading && (
            <div className={styles.emptyShop}>
              {searchQuery ? `Aucun produit ne correspond à "${searchQuery}"` : 'Aucun produit disponible'}
            </div>
          )}
        </div>

        {/* Cart sidebar */}
        <div className={styles.cartSide}>
          <div className={styles.cartHeader}>
            <span className={styles.cartTitle}>🛒 Panier</span>
            <button className={styles.clearBtn} onClick={clear}>Vider</button>
          </div>

          <div className={styles.cartItems}>
            {items.length === 0
              ? <p className={styles.cartEmpty}>Votre panier est vide</p>
              : items.map((item, i) => (
                <div key={item.key} className={styles.cartItem}>
                  <div className={styles.itemDot} style={{ background: item.color }}/>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemSize}>{item.size}</div>
                  </div>
                  <div className={styles.itemQty}>
                    <button className={styles.iqBtn} onClick={() => updateQty(i, -1)}>−</button>
                    <span className={styles.iqVal}>{item.qty}</span>
                    <button className={styles.iqBtn} onClick={() => updateQty(i, 1)}>+</button>
                  </div>
                  <div className={styles.itemPrice}>{item.total.toLocaleString('fr-FR')} F</div>
                  <button className={styles.removeBtn} onClick={() => removeItem(i)}>✕</button>
                </div>
              ))
            }
          </div>

          {/* Totals */}
          <div className={styles.totals}>
            <div className={styles.totRow}><span>Sous-total</span><span>{subtotal.toLocaleString('fr-FR')} FCFA</span></div>
            <div className={styles.totRow}><span>Livraison</span><span>{items.length === 0 ? '—' : shipping === 0 ? 'Gratuite ✓' : `${shipping.toLocaleString('fr-FR')} FCFA`}</span></div>
            <div className={`${styles.totRow} ${styles.totGrand}`}><span>Total</span><span className={styles.totVal}>{total.toLocaleString('fr-FR')} FCFA</span></div>
          </div>

          <button className={styles.checkoutBtn} onClick={() => { if (!items.length) { toast.error('Votre panier est vide !'); return; } setCheckoutOpen(true) }}>
            <FiLock size={11}/> Commander maintenant
          </button>
          <div className={styles.secureNote}>
            <FiShield size={11} color="var(--green)"/> Orange Money · Wave · Carte
          </div>

          {/* WA alternative */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%2C%20je%20voudrais%20commander%20!`}
            target="_blank" rel="noreferrer"
            className={styles.waAlt}
          >
            <FaWhatsapp size={13}/> Commander via WhatsApp
          </a>
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutOpen && <Checkout onClose={() => setCheckoutOpen(false)} />}
    </div>
  )
}
