// src/components/Checkout.jsx
import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { ordersApi, stockApi } from '../lib/supabase'
import { WHATSAPP_NUMBER } from '../utils/products'
import styles from './Checkout.module.css'

const PAY_OPTIONS = [
  { id: 'Orange Money', icon: '🟠', label: 'Orange Money' },
  { id: 'Wave',         icon: '🔵', label: 'Wave'         },
  { id: 'Carte',        icon: '💳', label: 'Carte'        },
  { id: 'Cash',         icon: '💵', label: 'Cash'         },
]

let orderCounter = 1005

function generateOrderId() {
  return '#' + String(orderCounter++).padStart(4, '0')
}

export default function Checkout({ onClose }) {
  const { items, shipping, total, promo, clear } = useCart()
  const { formatPrice } = useCurrency()
  const [form, setForm]   = useState({ name: '', phone: '', addr: '', addr2: '', note: '' })
  const [payMode, setPay] = useState('Orange Money')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null) // { orderId, waUrl }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.addr) {
      toast.error('Remplissez les champs obligatoires (*)')
      return
    }
    setLoading(true)
    try {
      const orderId  = generateOrderId()
      const fullAddr = form.addr + (form.addr2 ? ', ' + form.addr2 : '')
      const itemsStr = items.map(i => `${i.name} ${i.size} ×${i.qty}`).join(', ')

      const orderPayload = {
        order_number:   orderId,
        client_name:    form.name,
        phone:          form.phone,
        address:        fullAddr,
        items:          itemsStr,
        total:          total,
        payment_method: payMode,
        status:         'pending',
        note:           form.note,
        promo_code:     promo?.code || null,
      }

      // Try Supabase — fall back to localStorage if not configured
      try {
        await ordersApi.create(orderPayload)
        // Deduct stock
        const stockDeductions = items.map(i => ({ product_key: i.stockKey, qty: i.qty }))
        await stockApi.deduct(stockDeductions)
      } catch {
        // Supabase not configured — save locally as fallback
        const saved = JSON.parse(localStorage.getItem('biosen_orders_fallback') || '[]')
        saved.unshift({ ...orderPayload, created_at: new Date().toISOString() })
        localStorage.setItem('biosen_orders_fallback', JSON.stringify(saved))
      }

      // Build WhatsApp message
      const waText = encodeURIComponent(
        `🌾 *Nouvelle commande Bio Sén*\n\n` +
        `📦 *N° :* ${orderId}\n` +
        `👤 *Client :* ${form.name}\n` +
        `📱 *Tél :* ${form.phone}\n` +
        `📍 *Adresse :* ${fullAddr}\n` +
        `🛒 *Produits :* ${itemsStr}\n` +
        `💰 *Total :* ${formatPrice(total)}\n` +
        `💳 *Paiement :* ${payMode}` +
        (form.note ? `\n📝 *Note :* ${form.note}` : '') +
        `\n\n✅ Merci de traiter cette commande !`
      )

      clear()
      setSuccess({ orderId, waUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}` })
      toast.success('Commande confirmée !')
    } catch (err) {
      toast.error('Erreur lors de la commande. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        {!success ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Finaliser la commande</h2>
              <p className={styles.sub}>Informations de livraison</p>
              <button className={styles.closeBtn} onClick={onClose}><FiX size={16}/></button>
            </div>

            {/* Order recap */}
            <div className={styles.recap}>
              <div className={styles.recapTitle}>Récapitulatif</div>
              {items.map(i => (
                <div key={i.key} className={styles.recapRow}>
                  <span>{i.name} {i.size} ×{i.qty}</span>
                  <span>{formatPrice(i.total)}</span>
                </div>
              ))}
              {shipping > 0 && (
                <div className={styles.recapRow}><span>Livraison</span><span>{formatPrice(shipping)}</span></div>
              )}
              <div className={styles.recapTotal}>
                <span>Total à payer</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fg}>
                <label>👤 Prénom & Nom *</label>
                <input placeholder="Fatou Diallo" value={form.name} onChange={set('name')}/>
              </div>
              <div className={styles.fg}>
                <label>📱 WhatsApp *</label>
                <input type="tel" placeholder="+221 77 000 00 00" value={form.phone} onChange={set('phone')}/>
              </div>
            </div>
            <div className={styles.fg}>
              <label>📍 Quartier / Ville *</label>
              <input placeholder="Dakar, Médina, Thiès..." value={form.addr} onChange={set('addr')}/>
            </div>
            <div className={styles.fg}>
              <label>🗺️ Adresse précise</label>
              <input placeholder="Rue, bâtiment, point de repère..." value={form.addr2} onChange={set('addr2')}/>
            </div>

            <div className={styles.fg}>
              <label>💳 Mode de paiement *</label>
              <div className={styles.payOpts}>
                {PAY_OPTIONS.map(p => (
                  <div
                    key={p.id}
                    className={`${styles.payOpt} ${payMode === p.id ? styles.payOptActive : ''}`}
                    onClick={() => setPay(p.id)}
                  >
                    <span className={styles.payIcon}>{p.icon}</span>
                    <span className={styles.payLabel}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.fg}>
              <label>💬 Note (optionnel)</label>
              <textarea placeholder="Instructions spéciales..." value={form.note} onChange={set('note')}/>
            </div>

            <button className={styles.confirmBtn} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enregistrement…' : <><FiCheck size={13}/> Confirmer la commande</>}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>Annuler</button>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Commande confirmée !</h2>
            <div className={styles.successOid}>{success.orderId}</div>
            <p className={styles.successMsg}>
              Votre commande a été enregistrée avec succès.<br/>
              Cliquez ci-dessous pour envoyer la confirmation WhatsApp.
            </p>
            <a
              href={success.waUrl}
              target="_blank" rel="noreferrer"
              className={styles.waBtn}
            >
              <FaWhatsapp size={16}/> Envoyer confirmation WhatsApp
            </a>
            <button className={styles.trackBtn} onClick={() => { onClose(); window.location.href = '/suivi?id=' + success.orderId }}>
              🔍 Suivre ma commande
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  )
}
