// src/pages/ProductDetail.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiCheck, FiTruck } from 'react-icons/fi'
import { FaStar, FaLeaf } from 'react-icons/fa'
import { MdBolt } from 'react-icons/md'
import { GiAfrica } from 'react-icons/gi'
import toast from 'react-hot-toast'
import { PRICES } from '../utils/products'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import useProducts from '../hooks/useProducts'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { getPrice, formatPrice } = useCurrency()
  const { products, loading } = useProducts()

  const [selSize, setSelSize] = useState('500g')
  const [qty, setQty]         = useState(1)
  const [added, setAdded]     = useState(false)

  if (loading) {
    return <div className={styles.notFound}><p>Chargement du produit...</p></div>
  }

  const product = products.find(p => p.slug === slug)

  if (!product) {
    return (
      <div className={styles.notFound}>
        <p>Produit introuvable.</p>
        <button onClick={() => navigate('/boutique')} className={styles.backBtn}>
          ← Retour à la boutique
        </button>
      </div>
    )
  }

  const handleAdd = () => {
    const stockKey = `${product.name.split(' ')[0]}-${selSize}`
    addItem(product, selSize, PRICES[selSize], qty, product.color, stockKey)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
    toast.success(`${product.name} (${selSize}) ajouté au panier !`)
  }

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate('/boutique')}>
        <FiArrowLeft size={14}/> Retour à la boutique
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroImgPlaceholder} style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {!product.imageUrl && (
            <>
              <div className={styles.heroEmoji}>🌾</div>
              <p className={styles.heroImgNote}>Photo du produit</p>
            </>
          )}
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroOverlay}/>
          <div className={styles.heroText}>
            <span
              className={styles.tag}
              style={{ background: product.color + '22', color: product.color }}
            >{product.tag}</span>
            <h1 className={styles.heroTitle}>{product.name}</h1>
            <p className={styles.heroSub}>100% Bio · Origine Sénégal · Précuit au sable filtré</p>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.mainCol}>
          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.secTitle}>Description</h2>
            <p className={styles.desc}>{product.longDesc}</p>
          </section>

          {/* Grid: ingredients + nutrition */}
          <div className={styles.twoCol}>
            <section className={styles.section}>
              <h2 className={styles.secTitle}>Ingrédients</h2>
              <div className={styles.ingredients}>
                {product.ingredients.map((ing, i) => (
                  <span key={i} className={styles.ing}>{ing}</span>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.secTitle}>Valeurs nutritionnelles</h2>
              <table className={styles.nutrTable}>
                <tbody>
                  {product.nutrition.map(([label, val], i) => (
                    <tr key={i} className={styles.nutrRow}>
                      <td className={styles.nutrLabel}>{label}</td>
                      <td className={styles.nutrVal}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          {/* Recipe */}
          <section className={styles.section}>
            <h2 className={styles.secTitle}>🍽️ Idée recette</h2>
            <div className={styles.recipeCard}>
              <h3 className={styles.recipeTitle}>{product.recipe.title}</h3>
              <p className={styles.recipeSteps}>{product.recipe.steps}</p>
            </div>
          </section>

          {/* Reviews */}
          <section className={styles.section}>
            <h2 className={styles.secTitle}>⭐ Avis clients</h2>
            <div className={styles.reviews}>
              {product.reviews.map((rev, i) => (
                <div key={i} className={styles.review}>
                  <div className={styles.revHeader}>
                    <div className={styles.revAvatar}>
                      {rev.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className={styles.revName}>{rev.name}</div>
                      <div className={styles.revCity}>📍 {rev.city}</div>
                    </div>
                    <div className={styles.revStars}>
                      {Array.from({ length: rev.stars }).map((_, si) => (
                        <FaStar key={si} size={12} color="var(--gold)"/>
                      ))}
                    </div>
                  </div>
                  <p className={styles.revText}>{rev.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Order sidebar */}
        <div className={styles.orderSide}>
          <div className={styles.orderCard}>
            <h3 className={styles.orderTitle}>Commander</h3>

            <div className={styles.fmtSection}>
              <div className={styles.fmtLabel}>Choisissez votre format :</div>
              <div className={styles.fmtBtns}>
                {Object.entries(PRICES).map(([size, price]) => (
                  <label
                    key={size}
                    className={`${styles.fmtBtn} ${selSize === size ? styles.fmtBtnOn : ''}`}
                    onClick={() => setSelSize(size)}
                    style={selSize === size ? {
                      borderColor: product.color,
                      background: product.color + '11',
                    } : {}}
                  >
                    <div className={styles.radio}>
                      <div
                        className={styles.radioDot}
                        style={selSize === size ? { background: product.color } : {}}
                      />
                    </div>
                    <div>
                      <div className={styles.fmtSize}>{size}</div>
                      <div className={styles.fmtPrice} style={{ color: product.color }}>
                        {getPrice(price)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.qtySection}>
              <div className={styles.qtyLabel}>Quantité :</div>
              <div className={styles.qtyCtrl}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalVal} style={{ color: product.color }}>
                {formatPrice(PRICES[selSize] * qty)}
              </span>
            </div>

            <button
              className={styles.addBtn}
              style={{ background: product.color, color: product.id === 2 ? '#1a1209' : '#fff' }}
              onClick={handleAdd}
            >
              {added
                ? <><FiCheck size={13}/> Ajouté !</>
                : <><FiPlus size={13}/> Ajouter au panier</>
              }
            </button>

            <button
              className={styles.buyNowBtn}
              onClick={() => { handleAdd(); navigate('/boutique') }}
            >
              Commander maintenant →
            </button>

            {/* Badges */}
            <div className={styles.badges}>
              <div className={styles.badge}><FaLeaf size={12} color="var(--gold)"/> 100% Bio certifié</div>
              <div className={styles.badge}><GiAfrica size={12} color="var(--gold)"/> Origine Sénégal</div>
              <div className={styles.badge}><MdBolt size={12} color="var(--gold)"/> Précuit, prêt vite</div>
              <div className={styles.badge}><FiTruck size={12} color="var(--gold)"/> Livraison disponible</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
