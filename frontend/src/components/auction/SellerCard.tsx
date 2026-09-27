import { getInitials } from '../../utils/format.ts';
import { ShieldIcon } from '../icons.tsx';
import styles from './SellerCard.module.css';

export default function SellerCard({ sellerName }: { sellerName: string }) {
  return (
    <div className={styles.card}>
      <span className={styles.avatar}>{getInitials(sellerName)}</span>
      <div className={styles.info}>
        <div className={styles.name}>{sellerName}</div>
        <span className={styles.escrowBadge}>
          <ShieldIcon width={13} height={13} />
          Garantía Escrow Activa
        </span>
      </div>
    </div>
  );
}
