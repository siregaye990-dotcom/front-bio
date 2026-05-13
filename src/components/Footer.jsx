// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_NUMBER } from '../utils/products'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoCircle}>BIO<br /><em>SÉN</em></div>
            <span className={styles.logoName}>BIO <em>SÉN</em></span>
          </div>
          <p className={styles.tagline}>L'essence du Sénégal, naturellement</p>
          <p className={styles.desc}>
            Céréales ancestrales sénégalaises — Arraw, Thiéré, Thiakry —
            précuites au sable filtré, certifiées 100% biologiques.
          </p>
          {/* Réseaux sociaux */}
          <div className={styles.socials}>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noreferrer"
              className={`${styles.social} ${styles.wa}`}
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={16} />
            </a>
            <a
              href="https://instagram.com/biosen_senegal"
              target="_blank" rel="noreferrer"
              className={`${styles.social} ${styles.ig}`}
              aria-label="Instagram"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="https://facebook.com/biosen.senegal"
              target="_blank" rel="noreferrer"
              className={`${styles.social} ${styles.fb}`}
              aria-label="Facebook"
            >
              <FaFacebook size={16} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Navigation</h4>
          <nav className={styles.links}>
            <Link to="/">Accueil</Link>
            <Link to="/boutique">Boutique</Link>
            <Link to="/boutique/arraw-de-mil">Arraw de Mil</Link>
            <Link to="/boutique/thiere-de-mil">Thiéré de Mil</Link>
            <Link to="/boutique/thiakry-de-mil">Thiakry de Mil</Link>
            <Link to="/suivi">Suivi commande</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <div className={styles.contacts}>
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g,'')}`}
              className={styles.contactItem}
            >
              <MdPhone size={15} className={styles.contactIcon} />
              <span>{CONTACT_PHONE}</span>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={styles.contactItem}
            >
              <MdEmail size={15} className={styles.contactIcon} />
              <span>{CONTACT_EMAIL}</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noreferrer"
              className={styles.contactItem}
            >
              <FaWhatsapp size={15} className={styles.contactIcon} />
              <span>Commander via WhatsApp</span>
            </a>
            <div className={styles.contactItem}>
              <MdLocationOn size={15} className={styles.contactIcon} />
              <span>Dakar, Sénégal</span>
            </div>
          </div>
          {/* WA CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%20!%20Je%20voudrais%20commander.`}
            target="_blank" rel="noreferrer"
            className={styles.waCta}
          >
            <FaWhatsapp size={14} /> Commander via WhatsApp
          </a>
        </div>

        {/* Infos légales */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Informations</h4>
          <nav className={styles.links}>
            <Link to="/suivi">Suivre ma commande</Link>
            <button className={styles.soonLink} onClick={() => alert('Politique de livraison - Bientôt disponible')}>Politique de livraison</button>
            <button className={styles.soonLink} onClick={() => alert('Mentions légales - Bientôt disponible')}>Mentions légales</button>
            <button className={styles.soonLink} onClick={() => alert('Politique de confidentialité - Bientôt disponible')}>Politique de confidentialité</button>
            <button className={styles.soonLink} onClick={() => alert('FAQ - Bientôt disponible')}>FAQ</button>
          </nav>
          <div className={styles.badges}>
            <span className={styles.badge}>🌱 100% Bio</span>
            <span className={styles.badge}>🇸🇳 Origine Sénégal</span>
            <span className={styles.badge}>🔒 Paiement sécurisé</span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© {year} Bio Sén — Tous droits réservés</span>
          <div className={styles.payments}>
            <span>🟠 Orange Money</span>
            <span>🔵 Wave</span>
            <span>💳 Carte</span>
            <span>💵 Cash</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
