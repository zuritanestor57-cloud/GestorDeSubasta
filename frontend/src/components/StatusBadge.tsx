import type { AuctionStatus } from '../types/index.ts';
import styles from './StatusBadge.module.css';

// En el catálogo público solo se renderiza para Active/Published/Finished/
// Deserted (Draft y Cancelled no se listan ahí, ver isVisibleInCatalog).
// Cancelled sí puede aparecer en "Mis Publicaciones" del dashboard, donde el
// propio vendedor ve sus subastas canceladas.
const LABELS: Partial<Record<AuctionStatus, string>> = {
  Active: 'Activa',
  Published: 'Próxima',
  Finished: 'Finalizada',
  Deserted: 'Desierta',
  Cancelled: 'Cancelada',
};

const CLASS_BY_STATUS: Partial<Record<AuctionStatus, string>> = {
  Active: styles.active,
  Published: styles.upcoming,
  Finished: styles.finished,
  Deserted: styles.finished,
  Cancelled: styles.finished,
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
