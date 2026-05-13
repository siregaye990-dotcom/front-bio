// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { FiLogOut, FiDownload, FiRefreshCw } from 'react-icons/fi'
import {
  MdShoppingBag, MdTrendingUp, MdVisibility,
  MdWarning, MdInventory, MdReceipt
} from 'react-icons/md'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { useAuth } from '../../context/AuthContext'
import { ordersApi, productsApi, stockApi, visitsApi } from '../../lib/supabase'
import { PRODUCTS, STATUS_MAP, STOCK_KEYS } from '../../utils/products'
import styles from './AdminDashboard.module.css'

// Fallback seed data when Supabase not configured
const SEED_ORDERS = () => {
  const t = new Date().toISOString()
  return [
    { id:'1', order_number:'#1001', client_name:'Fatou Diallo',  phone:'+221 77 123 45 67', address:'Dakar, Médina',  items:'Thiéré de Mil 500g ×2', total:1600, payment_method:'Wave',         status:'delivered', created_at:t, note:'' },
    { id:'2', order_number:'#1002', client_name:'Moussa Sow',    phone:'+221 76 234 56 78', address:'Dakar, Plateau', items:'Arraw de Mil 1kg ×1',    total:1600, payment_method:'Orange Money',  status:'shipped',   created_at:t, note:'' },
    { id:'3', order_number:'#1003', client_name:'Aminata Ba',    phone:'+221 78 345 67 89', address:'Thiès',          items:'Thiakry de Mil 500g ×3', total:2400, payment_method:'Cash',          status:'confirmed', created_at:t, note:'Livrer avant 18h' },
    { id:'4', order_number:'#1004', client_name:'Ibrahim Ndiaye',phone:'+221 77 456 78 90', address:'Dakar, Yoff',   items:'Thiéré 1kg ×1, Arraw 500g ×2', total:3200, payment_method:'Wave',   status:'pending',   created_at:t, note:'' },
  ]
}

const SEED_STOCK = STOCK_KEYS.map((k,i) => ({
  product_key: k.key, product_name: k.label,
  quantity: [50,30,45,25,40,20][i] ?? 30, alert_threshold: 10
}))

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [orders,   setOrders]   = useState([])
  const [stock,    setStock]    = useState([])
  const [visits,   setVisits]   = useState([])
  const [products, setProducts] = useState([])
  const [productEdit, setProductEdit] = useState(null)
  const [productMessage, setProductMessage] = useState('')
  const [productError, setProductError] = useState('')
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [stockEdit, setStockEdit] = useState({}) // { key: newQty }
  const [receipt, setReceipt] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Try Supabase
      const [o, s, v, p] = await Promise.all([
        ordersApi.getAll(),
        stockApi.getAll(),
        visitsApi.getLast7Days(),
        productsApi.getAll(),
      ])
      setOrders(o || [])
      setStock(s || [])
      setVisits(v || [])
      setProducts(p || [])
    } catch {
      // Fallback to localStorage with seed data
      const localOrders = JSON.parse(localStorage.getItem('biosen_orders') || '[]')
      if (localOrders.length === 0) {
        // Initialize with seed orders
        const seedOrders = SEED_ORDERS()
        localStorage.setItem('biosen_orders', JSON.stringify(seedOrders))
        setOrders(seedOrders)
      } else {
        setOrders(localOrders)
      }

      const localStock = JSON.parse(localStorage.getItem('biosen_stock') || '[]')
      if (localStock.length === 0) {
        localStorage.setItem('biosen_stock', JSON.stringify(SEED_STOCK))
        setStock(SEED_STOCK)
      } else {
        setStock(localStock)
      }

      // Mock 7-day visits
      const localVisits = JSON.parse(localStorage.getItem('biosen_visits') || '[]')
      if (localVisits.length === 0) {
        const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
        const seedVisits = days.map((d,i) => ({ date: d, count: [28,42,35,61,55,48,72][i] }))
        localStorage.setItem('biosen_visits', JSON.stringify(seedVisits))
        setVisits(seedVisits)
      } else {
        setVisits(localVisits.slice(-7).reverse())
      }

      const localProducts = JSON.parse(localStorage.getItem('biosen_products') || '[]')
      if (localProducts.length === 0) {
        localStorage.setItem('biosen_products', JSON.stringify(PRODUCTS))
        setProducts(PRODUCTS)
      } else {
        setProducts(localProducts)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // KPIs
  const totalOrders  = orders.length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
  const totalVisits  = visits.reduce((s, v) => s + (v.count || 0), 0)
  const criticalStock = stock.filter(s => (s.quantity ?? 0) <= (s.alert_threshold ?? 10)).length

  // Filtered orders
  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const handleStatusChange = async (order) => {
    const cur = order.status
    if (cur === 'delivered' || cur === 'cancelled') {
      toast('Statut final atteint')
      return
    }

    const nextStatus = cur === 'pending'
      ? 'confirmed'
      : cur === 'confirmed'
        ? 'shipped'
        : cur === 'shipped'
          ? 'delivered'
          : cur

    if (!nextStatus || nextStatus === cur) return

    try {
      await ordersApi.updateStatus(order.id, nextStatus)
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o))
      toast.success(`Commande ${STATUS_MAP[nextStatus]?.label.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleCancel = async (order) => {
    if (!window.confirm(`Annuler la commande ${order.order_number} ?`)) return

    try {
      await ordersApi.cancel(order.id)
    } catch {
      const localOrders = JSON.parse(localStorage.getItem('biosen_orders') || '[]')
      const updated = localOrders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o)
      localStorage.setItem('biosen_orders', JSON.stringify(updated))
    }

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
    toast.success('Commande annulée')
  }

  const handleStockUpdate = async (key) => {
    const qty = parseInt(stockEdit[key])
    if (isNaN(qty) || qty < 0) { toast.error('Valeur invalide'); return }
    try {
      await stockApi.update(key, qty)
    } catch {
      /* no-op */
    }
    setStock(prev => prev.map(s => s.product_key === key ? { ...s, quantity: qty } : s))
    setStockEdit(e => { const n={...e}; delete n[key]; return n })
    toast.success('Stock mis à jour ✓')
  }

  const exportCSV = () => {
    const rows = [['N°','Client','Téléphone','Adresse','Produits','Total FCFA','Paiement','Date','Statut']]
    orders.forEach(o => rows.push([
      o.order_number, o.client_name, o.phone||'', o.address||'',
      o.items, o.total,
      o.payment_method||'',
      o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '',
      STATUS_MAP[o.status]?.label || o.status
    ]))
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `commandes_biosen_${new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')}.csv`
    a.click()
    toast.success('📊 CSV téléchargé !')
  }

  const handleProductSelect = (product) => {
    setProductError('')
    setProductMessage('')
    setProductEdit({ ...product })
  }

  const handleProductUpdate = (field, value) => {
    setProductEdit(prev => ({ ...prev, [field]: value }))
  }

  const handleProductImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setProductEdit(prev => ({ ...prev, imageUrl: e.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const saveProduct = async () => {
    if (!productEdit) return
    setProductError('')
    setProductMessage('')
    try {
      const updated = await productsApi.update(productEdit.id, productEdit)
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
      setProductEdit(updated)
      setProductMessage('Produit enregistré avec succès')
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error)
      setProductError('Impossible de sauvegarder le produit')
    }
  }

  const exportPDF = () => {
    const pending = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(26, 107, 53)
    doc.text('Bio Sén — Feuille de livraison', 14, 22)
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text(`Générée le ${new Date().toLocaleDateString('fr-FR')} · ${pending.length} commande(s)`, 14, 30)
    let y = 42
    pending.forEach((o, i) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFontSize(11); doc.setTextColor(26, 107, 53)
      doc.text(`${o.order_number} — ${o.client_name}`, 14, y)
      doc.setFontSize(10); doc.setTextColor(80)
      doc.text(`📍 ${o.address || '—'}   📱 ${o.phone || '—'}`, 14, y+6)
      doc.text(`🛒 ${o.items}`, 14, y+12)
      doc.setTextColor(26, 107, 53)
      doc.text(`${(o.total||0).toLocaleString('fr-FR')} FCFA — ${o.payment_method||'—'}`, 14, y+18)
      doc.setTextColor(150)
      doc.line(14, y+22, 196, y+22)
      y += 28
    })
    doc.save(`livraisons_biosen_${new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')}.pdf`)
    toast.success('🖨️ PDF téléchargé !')
  }

  const openReceipt = (order) => setReceipt(order)

  const printReceipt = () => {
    if (!receipt) return
    const doc = new jsPDF()
    doc.setFontSize(20); doc.setTextColor(26, 107, 53)
    doc.text('Bio Sén', 14, 20)
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text("L'essence du Sénégal, naturellement", 14, 28)
    doc.setFontSize(16); doc.setTextColor(30)
    doc.text(`Reçu de commande ${receipt.order_number}`, 14, 44)
    doc.setFontSize(10); doc.setTextColor(80)
    const date = receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('fr-FR') : ''
    doc.text(`Date : ${date}`, 14, 52)
    doc.text(`Client : ${receipt.client_name}`, 14, 60)
    doc.text(`Téléphone : ${receipt.phone||'—'}`, 14, 68)
    doc.text(`Adresse : ${receipt.address||'—'}`, 14, 76)
    if (receipt.note) doc.text(`Note : ${receipt.note}`, 14, 84)
    doc.setFontSize(11); doc.setTextColor(30)
    doc.text('Produits commandés :', 14, 96)
    doc.setFontSize(10); doc.setTextColor(80)
    let y = 104
    ;(receipt.items||'').split(', ').forEach(item => { doc.text(`• ${item}`, 20, y); y += 8 })
    doc.setFontSize(12); doc.setTextColor(26, 107, 53)
    doc.text(`Total payé : ${(receipt.total||0).toLocaleString('fr-FR')} FCFA`, 14, y + 6)
    doc.text(`Paiement : ${receipt.payment_method||'—'}`, 14, y + 14)
    doc.setFontSize(9); doc.setTextColor(150)
    doc.text("Bio Sén — L'essence du Sénégal, naturellement", 14, 275)
    doc.text('siregaye990@gmail.com  ·  +221 77 068 60 34', 14, 281)
    doc.save(`recu_${receipt.order_number}.pdf`)
    toast.success('🧾 Reçu PDF généré !')
  }

  if (loading) {
    return <div className={styles.loading}><div className={styles.spinner}/>Chargement du dashboard…</div>
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Dashboard <em>Admin</em></h1>
          <p className={styles.headerSub}>Bio Sén · Gestion complète</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={loadData} title="Rafraîchir">
            <FiRefreshCw size={14}/>
          </button>
          <button className={styles.logoutBtn} onClick={signOut}>
            <FiLogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {[
          { icon: <MdShoppingBag size={18}/>, label: 'Commandes', val: totalOrders,  sub: `${pendingCount} en attente`, col: 'gold' },
          { icon: <MdTrendingUp size={18}/>,  label: 'Chiffre d\'affaires', val: totalRevenue.toLocaleString('fr-FR') + ' F', sub: 'FCFA total', col: 'green' },
          { icon: <MdVisibility size={18}/>,  label: 'Visites (7j)', val: totalVisits, sub: '+12% vs sem. passée', col: 'blue' },
          { icon: <MdWarning size={18}/>,     label: 'Stock critique', val: criticalStock, sub: 'articles sous le seuil', col: criticalStock > 0 ? 'red' : 'green' },
        ].map((k, i) => (
          <div key={i} className={styles.kpi}>
            <div className={`${styles.kpiIcon} ${styles['kpiIcon_' + k.col]}`}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={`${styles.kpiVal} ${styles['kpiVal_' + k.col]}`}>{k.val}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Visits chart */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}><MdVisibility size={18}/> Visites — 7 derniers jours</h2>
        </div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={visits} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a6545' }} tickFormatter={d => typeof d === 'string' && d.length === 10 ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' }) : d}/>
              <YAxis tick={{ fontSize: 11, fill: '#7a6545' }}/>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
                formatter={(v) => [v + ' visites', '']}
              />
              <Bar dataKey="count" fill="#1a6b35" radius={[4,4,0,0]} opacity={.75}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}><MdInventory size={18}/> Gestion des stocks</h2>
        </div>
        <div className={styles.stockGrid}>
          {stock.map(s => {
            const info = STOCK_KEYS.find(k => k.key === s.product_key)
            const max  = info?.max || 100
            const qty  = s.quantity ?? 0
            const pct  = Math.round((qty / max) * 100)
            const col  = qty <= 0 ? '#c82a2a' : qty <= (s.alert_threshold || 10) ? '#c8982a' : '#1a6b35'
            return (
              <div key={s.product_key} className={styles.stockCard}>
                <div className={styles.stockName}>{info?.label || s.product_name}</div>
                <div className={styles.stockQty} style={{ color: col }}>{qty}</div>
                <div className={styles.stockSub}>unités restantes</div>
                <div className={styles.stockBar}>
                  <div className={styles.stockFill} style={{ width: pct + '%', background: col }}/>
                </div>
                <div className={styles.stockEdit}>
                  <input
                    type="number"
                    min="0"
                    className={styles.stockInput}
                    value={stockEdit[s.product_key] ?? qty}
                    onChange={e => setStockEdit(prev => ({ ...prev, [s.product_key]: e.target.value }))}
                  />
                  <button
                    className={styles.stockBtn}
                    onClick={() => handleStockUpdate(s.product_key)}
                    disabled={stockEdit[s.product_key] === undefined}
                  >Màj</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Product management */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}><MdVisibility size={18}/> Gestion des produits</h2>
        </div>
        <div className={styles.productGrid}>
          <div className={styles.productList}>
            {products.map(product => (
              <button
                key={product.id}
                type="button"
                className={`${styles.productCard} ${productEdit?.id === product.id ? styles.productCardActive : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <div className={styles.productThumb} style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : {}}>
                  {!product.imageUrl && <span>Photo</span>}
                </div>
                <div className={styles.productInfo}>
                  <strong>{product.name}</strong>
                  <span>{product.shortDesc}</span>
                </div>
              </button>
            ))}
          </div>
          <div className={styles.productEditor}>
            {productEdit ? (
              <div className={styles.productForm}>
                <div className={styles.productFormHead}>
                  <div>
                    <h3>{productEdit.name}</h3>
                    <p>{productEdit.slug}</p>
                  </div>
                </div>
                {productMessage && <div className={styles.productSuccess}>{productMessage}</div>}
                {productError && <div className={styles.productError}>{productError}</div>}

                <div className={styles.formRow}>
                  <label>Nom du produit</label>
                  <input
                    value={productEdit.name || ''}
                    onChange={e => handleProductUpdate('name', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Slug URL</label>
                  <input
                    value={productEdit.slug || ''}
                    onChange={e => handleProductUpdate('slug', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Label court</label>
                  <input
                    value={productEdit.shortDesc || ''}
                    onChange={e => handleProductUpdate('shortDesc', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Description longue</label>
                  <textarea
                    rows="3"
                    value={productEdit.longDesc || ''}
                    onChange={e => handleProductUpdate('longDesc', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Tag</label>
                  <input
                    value={productEdit.tag || ''}
                    onChange={e => handleProductUpdate('tag', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Badge</label>
                  <input
                    value={productEdit.badge || ''}
                    onChange={e => handleProductUpdate('badge', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Couleur</label>
                  <input
                    value={productEdit.color || ''}
                    onChange={e => handleProductUpdate('color', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>URL photo ou Base64</label>
                  <input
                    value={productEdit.imageUrl || ''}
                    onChange={e => handleProductUpdate('imageUrl', e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Upload image</label>
                  <input type="file" accept="image/*" onChange={handleProductImage} />
                </div>
                {productEdit.imageUrl && (
                  <div className={styles.formRow}>
                    <label>Aperçu image</label>
                    <div className={styles.imagePreview} style={{ backgroundImage: `url(${productEdit.imageUrl})` }} />
                  </div>
                )}
                <button className={styles.saveBtn} type="button" onClick={saveProduct}>Enregistrer le produit</button>
              </div>
            ) : (
              <div className={styles.productEmpty}>Sélectionnez un produit pour le modifier.</div>
            )}
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}><MdShoppingBag size={18}/> Commandes</h2>
          <div className={styles.panelActions}>
            <div className={styles.filterBtns}>
              {['all','pending','confirmed','shipped','delivered'].map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterBtnOn : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Toutes' : STATUS_MAP[f]?.label || f}
                </button>
              ))}
            </div>
            <div className={styles.exportBtns}>
              <button className={styles.exportBtn} onClick={exportCSV}>
                <FiDownload size={12}/> CSV
              </button>
              <button className={`${styles.exportBtn} ${styles.exportPdf}`} onClick={exportPDF}>
                <FiDownload size={12}/> PDF
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N°</th><th>Client</th><th>Téléphone</th>
                <th>Produits</th><th>Total</th><th>Paiement</th>
                <th>Date</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={9} className={styles.empty}>Aucune commande</td></tr>
              )}
              {displayed.map(order => {
                const sm = STATUS_MAP[order.status]
                const date = order.created_at
                  ? new Date(order.created_at).toLocaleDateString('fr-FR')
                  : order.date || '—'
                return (
                  <tr key={order.id || order.order_number}>
                    <td><span className={styles.orderId}>{order.order_number}</span></td>
                    <td>
                      <div className={styles.clientName}>{order.client_name || order.name}</div>
                      <div className={styles.clientAddr}>{order.address || order.addr}</div>
                    </td>
                    <td className={styles.phone}>{order.phone}</td>
                    <td className={styles.items}>{order.items}</td>
                    <td className={styles.total}>{(order.total||0).toLocaleString('fr-FR')} F</td>
                    <td className={styles.payment}>{order.payment_method || order.pay}</td>
                    <td className={styles.date}>{date}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: sm?.bg, color: sm?.color }}
                      >
                        <span className={styles.statusDot} style={{ background: sm?.dot }}/>
                        {sm?.label || order.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={`${styles.actionBtn} ${styles.confirmBtn}`}
                          onClick={() => handleStatusChange(order)}
                          title={order.status === 'pending' ? 'Confirmer la commande' : order.status === 'confirmed' ? 'Marquer comme expédiée' : 'Marquer comme livrée'}
                          disabled={order.status==='delivered'||order.status==='cancelled'}
                        >
                          {order.status === 'pending' ? 'Confirmer' : order.status === 'confirmed' ? 'Expédier' : order.status === 'shipped' ? 'Livrer' : '—'}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => handleCancel(order)}
                          title="Annuler la commande"
                          disabled={order.status==='cancelled'||order.status==='delivered'}
                        >Annuler</button>
                        <button
                          className={`${styles.actionBtn} ${styles.receiptBtn}`}
                          onClick={() => openReceipt(order)}
                          title="Générer reçu PDF"
                        ><MdReceipt size={13}/> Reçu</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className={styles.receiptOverlay} onClick={e => e.target===e.currentTarget && setReceipt(null)}>
          <div className={styles.receiptModal}>
            <div className={styles.rcptHeader}>
              <div>
                <div className={styles.rcptBrand}>BIO <em>SÉN</em></div>
                <div className={styles.rcptBrandSub}>L'essence du Sénégal, naturellement</div>
              </div>
            </div>
            <div className={styles.rcptBody}>
              <div className={styles.rcptTitle}>Reçu de commande</div>
              <div className={styles.rcptId}>{receipt.order_number} · {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('fr-FR') : ''}</div>
              <div className={styles.rcptSec}>
                <div className={styles.rcptSecTitle}>Client</div>
                {[['Nom', receipt.client_name||receipt.name], ['Téléphone', receipt.phone], ['Adresse', receipt.address||receipt.addr], receipt.note && ['Note', receipt.note]].filter(Boolean).map(([l,v]) => (
                  <div key={l} className={styles.rcptRow}><span className={styles.rcptLabel}>{l}</span><span className={styles.rcptVal}>{v}</span></div>
                ))}
              </div>
              <div className={styles.rcptSec}>
                <div className={styles.rcptSecTitle}>Produits</div>
                {(receipt.items||'').split(', ').map((item,i) => (
                  <div key={i} className={styles.rcptItem}>{item}</div>
                ))}
              </div>
              <div className={styles.rcptTotal}>
                <div className={styles.rcptRow}><span>Paiement</span><span>{receipt.payment_method||receipt.pay}</span></div>
                <div className={styles.rcptGrand}><span>Total payé</span><span className={styles.rcptGrandVal}>{(receipt.total||0).toLocaleString('fr-FR')} FCFA</span></div>
              </div>
              <p className={styles.rcptNote}>Bio Sén — siregaye990@gmail.com · +221 77 068 60 34</p>
              <button className={styles.rcptPrintBtn} onClick={printReceipt}><FiDownload size={12}/> Télécharger PDF</button>
              <button className={styles.rcptCloseBtn} onClick={() => setReceipt(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
