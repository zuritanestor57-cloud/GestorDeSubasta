import styles from './CardSkeleton.module.css';

// Tarjeta placeholder mientras se cargan las subastas. Misma silueta que AuctionCard.
export default function CardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.pulse}`}>
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.line} style={{ width: '40%', height: 10 }} />
        <div className={styles.line} style={{ width: '85%', height: 14 }} />
        <div className={styles.line} style={{ width: '60%', height: 14 }} />
        <div className={styles.line} style={{ width: '100%', height: 36 }} />
        <div className={styles.line} style={{ width: '100%', height: 44 }} />
      </div>
    </div>
  );
}
