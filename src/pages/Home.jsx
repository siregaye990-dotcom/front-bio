// src/pages/Home.jsx — with real images + visit tracking
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShoppingCart } from 'react-icons/fi'
import { FaLeaf, FaTruck, FaStar, FaWhatsapp } from 'react-icons/fa'
import { GiWheat, GiMortar } from 'react-icons/gi'
import { MdBolt } from 'react-icons/md'
import LOGO_B64    from '../assets/logo_b64'
import SACHETS_B64 from '../assets/sachets_b64'
import { WHATSAPP_NUMBER, PRICES } from '../utils/products'
import { visitsApi } from '../lib/supabase'
import useProducts from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import styles from './Home.module.css'

const VALS = [
  { icon:<FaLeaf/>,  title:'100% Bio',      i:0, text:'Cultivées sans pesticides. Certifiées biologiques du champ à votre table.' },
  { icon:<GiWheat/>, title:'Tradition',     i:1, text:'Recettes ancestrales. Cuisson au sable filtré transmise de génération en génération.' },
  { icon:<MdBolt/>,  title:'Précuit',       i:2, text:'Préparation rapide sans sacrifier l\'authenticité du goût.' },
  { icon:<FaTruck/>, title:'Local & Livré', i:3, text:'Cultivé au Sénégal, livré partout. Chaque achat soutient les agriculteurs locaux.' },
]
const REVS = [
  { initials:'FD', name:'Fatou Diallo',    city:'Dakar, Médina',  stars:5, text:'Le meilleur Thiéré ! La qualité est au rendez-vous, les grains sont parfaits. Ma famille adore !' },
  { initials:'AN', name:'Aissatou Ndiaye', city:'Thiès',          stars:5, text:'Exactement le goût de mon enfance ! Le Thiakry de Bio Sén est authentique et délicieux.' },
  { initials:'MS', name:'Moussa Sow',      city:'Dakar, Plateau', stars:5, text:'Commandé plusieurs fois. Qualité constante. Parfait pour le thiéré du vendredi.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { products } = useProducts()
  const { addItem } = useCart()
  const [nlPhone, setNlPhone] = useState('')
  useEffect(() => { visitsApi.track().catch(()=>{}) }, [])
  const goShop = () => navigate('/boutique')
  
  const handleAddToCart = (e, p) => {
    e.stopPropagation()
    const size = '500g'
    const stockKey = `${p.name.split(' ')[0]}-${size}`
    addItem(p, size, PRICES[size], 1, p.color, stockKey)
    toast.success(`${p.name} ajouté au panier !`)
  }

  const handleNL = () => {
    if (!nlPhone.trim()) return
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour Bio Sén ! Je souhaite recevoir vos promotions. Mon numéro : '+nlPhone)}`, '_blank')
    setNlPhone('')
  }
  return (
    <div className={styles.page}>
      {/* HERO — UNIFIÉ & PREMIUM */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}><FaLeaf size={10}/> 100% BIO · ORIGINE SÉNÉGAL</div>
          <h1 className={styles.heroH1}>Vos Céréales Ancestrales,<br/><em>Prêtes en un Clin d'Œil</em></h1>
          <p className={styles.heroP}>Arraw, Thiéré, Thiakry — céréales ancestrales sénégalaises précuites au sable filtré. Certifiées 100% biologiques, sans additifs, livrées chez vous.</p>
          <button className={styles.heroBtnPrimary} onClick={goShop}>Commander maintenant <FiArrowRight size={13}/></button>
          
          <div className={styles.heroImageWrapper}>
            <img src={LOGO_B64} alt="Bio Sén" className={styles.heroLogoOverlay}/>
            <img src={SACHETS_B64} alt="Gamme Bio Sén" className={styles.heroMainImageCentered}/>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className={styles.section}><div className={styles.inner}>
        <div className={styles.sLabel}>Nos produits phares</div>
        <h2 className={styles.sTitle}>Trois <em>trésors</em> du terroir</h2>
        <div className={styles.divider}/>

        {/* Product cards - Efficient presentation without repeated images */}
        <div className={styles.prodCardsGrid}>
          {products.map((p,i) => (
            <div key={p.id} className={styles.prodCard} onClick={()=>navigate('/boutique/'+p.slug)}>
              <div className={styles.pcHeader}>
                <span className={styles.pcIcon}>{i===0?<FaLeaf/>:i===1?<FaStar/>:<GiMortar/>}</span>
                <span className={styles.pcTag} style={{background:p.color,color:p.id===2?'#1a1209':'#fff'}}>{p.badge}</span>
              </div>
              <h3 className={styles.pcName}>{p.name}</h3>
              <p className={styles.pcDesc}>{p.shortDesc}</p>
              <div className={styles.pcFooter}>
                <div className={styles.pcPrice} style={{color:p.color}}>800 FCFA <span>/ 500g</span></div>
                <div className={styles.pcActions}>
                  <button className={styles.pcCartBtn} onClick={(e) => handleAddToCart(e, p)}>
                    <FiShoppingCart size={15}/>
                  </button>
                  <button className={styles.pcBtn}><FiArrowRight size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className={styles.vGrid}>
          {VALS.map((v,i) => (
            <div key={i} className={`${styles.vCard} ${styles['v'+i]}`}>
              <div className={styles.vIcon}>{v.icon}</div>
              <h3 className={styles.vTitle}>{v.title}</h3>
              <p className={styles.vText}>{v.text}</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* REVIEWS */}
      <section className={styles.revSection}><div className={styles.revInner}>
        <div className={styles.revLabel}>Ils nous font confiance</div>
        <h2 className={styles.revTitle}>Ce que disent <em>nos clients</em></h2>
        <div className={styles.revDivider}/>
        <div className={styles.revGrid}>
          {REVS.map((r,i) => (
            <div key={i} className={styles.revCard}>
              <div className={styles.revStars}>{'★'.repeat(r.stars)}</div>
              <p className={styles.revText}>"{r.text}"</p>
              <div className={styles.revAuthor}>
                <div className={styles.revAvatar}>{r.initials}</div>
                <div><div className={styles.revName}>{r.name}</div><div className={styles.revCity}>📍 {r.city}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div></section>

      {/* NEWSLETTER */}
      <section className={styles.nl}><div className={styles.nlInner}>
        <div className={styles.nlTitle}>🌾 Restez informé</div>
        <p className={styles.nlSub}>Recevez nos promotions et recettes exclusives directement par WhatsApp</p>
        <div className={styles.nlForm}>
          <input className={styles.nlInp} type="tel" placeholder="Votre numéro WhatsApp..." value={nlPhone} onChange={e=>setNlPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleNL()}/>
          <button className={styles.nlBtn} onClick={handleNL}><FaWhatsapp size={14}/> S'inscrire</button>
        </div>
        <p className={styles.nlNote}>🔒 Données confidentielles · Désinscription à tout moment</p>
      </div></section>
    </div>
  )
}
