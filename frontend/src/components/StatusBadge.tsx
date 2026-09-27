import type { AuctionStatus } from '../types/index.ts';
import styles from './StatusBadge.module.css';

// Solo se renderiza para subastas visibles en el catálogo (ver isVisibleInCatalog):
// Draft y Cancelled nunca llegan hasta acá.
const LABELS: Partial<Record<AuctionStatus, string>> = {
  Active: 'Activa',
  Published: 'Próxima',
  Finished: 'Finalizada',
  Deserted: 'Desierta',
};

const CLASS_BY_STATUS: Partial<Record<AuctionStatus, string>> = {
  Active: styles.active,
  Published: styles.upcoming,
  Finished: styles.finished,
  Deserted: styles.finished,
};

export default function StatusBadge({ status }: { status: AuctionStatus }) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <span className={`${styles.badge} ${CLASS_BY_STATUS[status]}`}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
