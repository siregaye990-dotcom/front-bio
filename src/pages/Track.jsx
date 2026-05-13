// src/pages/Track.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import {
  MdReceipt, MdCheckCircle, MdLocalShipping, MdHome, MdCancel
} from 'react-icons/md'
import { ordersApi } from '../lib/supabase'
import { STATUS_MAP, WHATSAPP_NUMBER } from '../utils/products'
import styles from './Track.module.css'

const STEPS = [
  { key: 'pending',   label: 'Reçue',      Icon: MdReceipt       },
  { key: 'confirmed', label: 'Confirmée',   Icon: MdCheckCircle   },
  { key: 'shipped',   label: 'En route',    Icon: MdLocalShipping },
  { key: 'delivered', label: 'Livrée',      Icon: MdHome          },
]

const STATUS_MSGS = {
  pending:   'Votre commande est reçue et sera confirmée sous peu.',
  confirmed: 'Commande confirmée ! Préparation en cours.',
  shipped:   'Votre commande est en route vers vous ! 🚚',
  delivered: 'Commande livrée. Merci pour votre confiance ! 🎉',
  cancelled: 'Cette commande a été annulée.',
}

export default function Track() {
  const [params] = useSearchParams()
  const [query,  setQuery]  = useState(params.get('id') || '')
  const [order,  setOrder]  = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | found | not_found | error

  useEffect(() => {
    if (params.get('id')) handleSearch(params.get('id'))
    // eslint-disable-next-line
  }, [])

  const handleSearch = async (q = query) => {
    const raw = q.trim().toUpperCase()
    if (!raw) return
    setStatus('loading')
    setOrder(null)
    try {
      const id = raw.startsWith('#') ? raw : '#' + raw
      // Try Supabase first, fallback to localStorage
      let found = null
      try {
        found = await ordersApi.getById(id)
      } catch {
        const local = JSON.parse(localStorage.getItem('biosen_orders_fallback') || '[]')
        found = local.find(o =>
          o.order_number?.toUpperCase() === id ||
          o.order_number?.toUpperCase() === raw
        ) || null
      }
      if (found) { setOrder(found); setStatus('found') }
      else setStatus('not_found')
    } catch {
      setStatus('error')
    }
  }

  const getStepState = (stepKey, currentStatus) => {
    if (currentStatus === 'cancelled') return 'inactive'
    const stepIdx    = STEPS.findIndex(s => s.key === stepKey)
    const currentIdx = STEPS.findIndex(s => s.key === currentStatus)
    if (stepIdx < currentIdx)  return 'done'
    if (stepIdx === currentIdx) return 'current'
    return 'inactive'
  }

  const progressPct = () => {
    if (!order) return 0
    const idx = STEPS.findIndex(s => s.key === order.status)
    if (idx < 0) return 0
    return Math.round((idx / (STEPS.length - 1)) * 100)
  }

  return (
    <div className={styles.page}>
      {/* Search */}
      <div className={styles.searchBox}>
        <h1 className={styles.title}>
          <FiSearch size={24} className={styles.titleIcon}/> Suivre ma commande
        </h1>
        <p className={styles.sub}>
          Entrez votre numéro de commande (ex : <strong>#1001</strong>) pour suivre votre livraison en temps réel.
        </p>
        <div className={styles.searchForm}>
          <input
            className={styles.searchInp}
            type="text"
            placeholder="Numéro de commande (#1001)…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            className={styles.searchBtn}
            onClick={() => handleSearch()}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Recherche…' : <><FiSearch size={13}/> Rechercher</>}
          </button>
        </div>
      </div>

      {/* States */}
      {status === 'not_found' && (
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>🔍</span>
          <div className={styles.notFoundTitle}>Commande introuvable</div>
          <p className={styles.notFoundMsg}>
            Vérifiez le numéro (ex : #1001) ou{' '}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%2C%20je%20cherche%20ma%20commande`}
              target="_blank" rel="noreferrer"
              className={styles.notFoundLink}
            >contactez-nous</a>
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>⚠️</span>
          <div className={styles.notFoundTitle}>Erreur de connexion</div>
          <p className={styles.notFoundMsg}>Vérifiez votre connexion internet et réessayez.</p>
        </div>
      )}

      {/* Result */}
      {status === 'found' && order && (
        <div className={styles.result}>
          {/* Header */}
          <div className={styles.resultHeader}>
            <div>
              <div className={styles.orderId}>{order.order_number}</div>
              <div className={styles.orderDate}>
                📅 {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
                  : order.date || '—'}
              </div>
            </div>
            <span
              className={styles.statusBadge}
              style={{
                background: STATUS_MAP[order.status]?.bg  || '#f0f0f0',
                color:      STATUS_MAP[order.status]?.color || '#555',
              }}
            >
              <span
                className={styles.statusDot}
                style={{ background: STATUS_MAP[order.status]?.dot || '#999' }}
              />
              {STATUS_MAP[order.status]?.label || order.status}
            </span>
          </div>

          {/* Client info */}
          <div className={styles.clientInfo}>
            <div className={styles.infoLabel}>Informations de livraison</div>
            <div className={styles.infoRow}><span>👤</span><span>{order.client_name || order.name}</span></div>
            <div className={styles.infoRow}><span>📍</span><span>{order.address || order.addr}</span></div>
            <div className={styles.infoRow}><span>💳</span><span>{order.payment_method || order.pay}</span></div>
          </div>

          {/* Timeline */}
          {order.status === 'cancelled' ? (
            <div className={styles.cancelledBanner}>
              <MdCancel size={18}/> Cette commande a été annulée.
            </div>
          ) : (
            <div className={styles.timeline}>
              {/* Progress bar */}
              <div className={styles.timelineTrack}>
                <div className={styles.timelineFill} style={{ width: progressPct() + '%' }}/>
              </div>
              {STEPS.map(({ key, label, Icon }) => {
                const state = getStepState(key, order.status)
                return (
                  <div key={key} className={`${styles.step} ${styles[`step_${state}`]}`}>
                    <div className={`${styles.stepDot} ${styles[`dot_${state}`]}`}>
                      <Icon size={14}/>
                    </div>
                    <div className={styles.stepLabel}>{label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Status message */}
          <div className={`${styles.statusMsg} ${order.status === 'cancelled' ? styles.statusMsgCancelled : ''}`}>
            ℹ️ {STATUS_MSGS[order.status] || 'Statut en cours de mise à jour.'}
          </div>

          {/* Order items */}
          <div className={styles.itemsBox}>
            <div className={styles.itemsTitle}>🛒 Produits commandés</div>
            {(order.items || '').split(', ').map((item, i) => {
              const parts = item.split(' ×')
              return (
                <div key={i} className={styles.itemRow}>
                  <span>{parts[0]}</span>
                  <span className={styles.itemQty}>×{parts[1] || 1}</span>
                </div>
              )
            })}
            <div className={styles.itemTotal}>
              <span>Total payé</span>
              <span className={styles.itemTotalVal}>
                {(order.total || 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            {(order.note || order.note) && (
              <div className={styles.itemNote}>
                💬 {order.note}
              </div>
            )}
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour Bio Sén ! Je veux des informations sur ma commande ' + order.order_number)}`}
            target="_blank" rel="noreferrer"
            className={styles.waCta}
          >
            <FaWhatsapp size={16}/> Contacter Bio Sén sur WhatsApp
          </a>
        </div>
      )}

      {/* Help section */}
      <div className={styles.help}>
        <h3 className={styles.helpTitle}>Besoin d'aide ?</h3>
        <div className={styles.helpGrid}>
          <a href={`tel:${'+221770686034'}`} className={styles.helpCard}>
            <span className={styles.helpIcon}>📞</span>
            <div className={styles.helpLabel}>Téléphone</div>
            <div className={styles.helpVal}>+221 77 068 60 34</div>
          </a>
          <a href={`mailto:siregaye990@gmail.com`} className={styles.helpCard}>
            <span className={styles.helpIcon}>✉️</span>
            <div className={styles.helpLabel}>Email</div>
            <div className={styles.helpVal}>siregaye990@gmail.com</div>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%20!`}
            target="_blank" rel="noreferrer"
            className={`${styles.helpCard} ${styles.helpWa}`}
          >
            <span className={styles.helpIcon}><FaWhatsapp size={20}/></span>
            <div className={styles.helpLabel}>WhatsApp</div>
            <div className={styles.helpVal}>Réponse rapide</div>
          </a>
        </div>
      </div>
    </div>
  )
}
