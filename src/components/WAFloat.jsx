// src/components/WAFloat.jsx
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../utils/products'
import styles from './WAFloat.module.css'

export default function WAFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Bio%20S%C3%A9n%20!%20Je%20voudrais%20commander.`}
      target="_blank"
      rel="noreferrer"
      className={styles.float}
      aria-label="Commander via WhatsApp"
    >
      <span className={styles.tooltip}>Commander via WhatsApp</span>
      <FaWhatsapp size={28} color="#fff"/>
    </a>
  )
}
