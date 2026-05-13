// src/components/ProductSkeleton.jsx
import styles from './ProductSkeleton.module.css'

export default function ProductSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.imageBox}></div>
      <div className={styles.content}>
        <div className={styles.badge}></div>
        <div className={styles.title}></div>
        <div className={styles.description}></div>
        <div className={styles.options}>
          <div className={styles.option}></div>
          <div className={styles.option}></div>
        </div>
        <div className={styles.button}></div>
      </div>
    </div>
  )
}
