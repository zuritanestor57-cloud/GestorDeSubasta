import { formatCountdown } from '../../utils/format.ts';
import { AlertTriangleIcon } from '../icons.tsx';
import styles from './CriticalBanner.module.css';

// Visible solo cuando quedan <= 60s para el cierre de una subasta Activa
// (lo decide AuctionDetailPage). Ver TP 2.2: la regla anti-sniping extiende
// 2 minutos ante una puja válida en esta ventana.
export default function CriticalBanner({ remainingMs }: { remainingMs: number }) {
  return (
    <div className={styles.banner}>
      <span className={styles.icon}>
        <AlertTriangleIcon width={22} height={22} />
      </span>
      <span className={styles.text}>
        ¡ZONA CRÍTICA ANTI-SNIPING! Cualquier puja en este último minuto extenderá la subasta por 2 minutos
        adicionales para garantizar competencia justa.
      </span>
      <span className={styles.countdown}>{formatCountdown(remainingMs)}</span>
    </div>
  );
}
