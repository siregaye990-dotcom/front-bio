// src/components/Checkout.jsx
import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { ordersApi, stockApi } from '../lib/supabase'
import { WHATSAPP_NUMBER } from '../utils/products'
import styles from './Checkout.module.css'

let orderCounter = 1005

function generateOrderId() {
  return '#' + String(orderCounter++).padStart(4, '0')
}

export default function Checkout({ onClose }) {
  const { items, total, promo, clear } = useCart()
  const { formatPrice, currency } = useCurrency()
  const [form, setForm]   = useState({ name: '', phone: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error('Remplissez les champs obligatoires (*)')
      return
    }
    setLoading(true)
    try {
      const orderId  = generateOrderId()
      const fullAddr = 'Vente directe / Boutique'
      const itemsStr = items.map(i => `${i.name} ${i.size} ×${i.qty}`).join(', ')

      const orderPayload = {
        order_number:   orderId,
        client_name:    form.name,
        phone:          form.phone,
        address:        fullAddr,
        items:          itemsStr,
        total:          total,
        payment_method: 'À convenir',
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
        const saved = JSON.parse(localStorage.getItem('sweetbio_orders_fallback') || '[]')
        saved.unshift({ ...orderPayload, created_at: new Date().toISOString() })
        localStorage.setItem('sweetbio_orders_fallback', JSON.stringify(saved))
      }

      // Build WhatsApp message
      const waText = encodeURIComponent(
        `🌾 *Nouvelle commande SweetBio*\n\n` +
        `📦 *N° :* ${orderId}\n` +
        `👤 *Client :* ${form.name}\n` +
        `📱 *Tél :* ${form.phone}\n` +
        `🛒 *Produits :* ${itemsStr}\n` +
        `💰 *Total :* ${formatPrice(total)}\n` +
        `💳 *Paiement :* À convenir` +
        (form.note ? `\n📝 *Note :* ${form.note}` : '') +
        `\n\n✅ Merci de traiter cette commande !`
      )

      clear()
      setSuccess({
        orderId,
        waUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`,
        customer: { ...form, address: fullAddr },
        items: items.map(item => ({ ...item })),
        total,
        currency,
        createdAt: new Date().toISOString(),
      })
      toast.success('Commande confirmée !')
    } catch (err) {
      toast.error('Erreur lors de la commande. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    try {
      const doc = new jsPDF()
      const date = new Date(success.createdAt).toLocaleString('fr-FR')
      let y = 20

      doc.setFontSize(20)
      doc.setTextColor(26, 107, 53)
      doc.text('SweetBio', 14, y)
      y += 10
      doc.setFontSize(14)
      doc.setTextColor(35, 35, 35)
      doc.text('Reçu de commande', 14, y)
      y += 9
      doc.setFontSize(10)
      doc.text(`Commande : ${success.orderId}`, 14, y)
      y += 6
      doc.text(`Date : ${date}`, 14, y)
      y += 10
      doc.setFontSize(11)
      doc.text(`Acheteur : ${success.customer.name}`, 14, y)
      y += 7
      doc.text(`Téléphone : ${success.customer.phone}`, 14, y)
      if (success.customer.note) {
        y += 7
        doc.text(`Note : ${success.customer.note}`, 14, y, { maxWidth: 180 })
      }
      y += 10
      doc.setFontSize(11)
      doc.text('Articles', 14, y)
      y += 7
      doc.setFontSize(10)
      success.items.forEach(item => {
        const line = `${item.name} ${item.size} x${item.qty} — ${formatPrice(item.total, success.currency)}`
        const wrapped = doc.splitTextToSize(line, 180)
        if (y + wrapped.length * 6 > 275) {
          doc.addPage()
          y = 20
        }
        doc.text(wrapped, 14, y)
        y += wrapped.length * 6
      })
      y += 4
      doc.setFontSize(12)
      doc.text(`Total : ${formatPrice(success.total, success.currency)}`, 14, y)
      y += 8
      doc.setFontSize(10)
      doc.text('Paiement : à convenir', 14, y)
      doc.save(`recu_sweetbio_${success.orderId.replace('#', '')}.pdf`)
    } catch {
      toast.error('Impossible de générer le reçu. Réessayez.')
    }
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        {!success ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Finaliser la commande</h2>
              <p className={styles.sub}>Informations de contact</p>
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
              Téléchargez votre reçu ou envoyez la confirmation WhatsApp.
            </p>
            <button className={styles.downloadBtn} onClick={downloadReceipt}>
              Télécharger mon reçu PDF
            </button>
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
