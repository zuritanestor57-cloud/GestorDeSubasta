import type { HubConnectionStatus } from '../../services/auctionHub.ts';
import styles from './ConnectionBadge.module.css';

// "reconnecting" y "disconnected" comparten el mismo aviso: en ambos casos
// la página cae a polling de respaldo cada 3s (ver AuctionDetailPage).
export default function ConnectionBadge({ status }: { status: HubConnectionStatus }) {
  const isConnected = status === 'connected';
  return (
    <span className={`${styles.badge} ${isConnected ? styles.connected : styles.pending}`}>
      <span className={styles.dot} />
      {isConnected ? 'En vivo (WebSocket)' : 'Reconectando (Polling 3s)'}
    </span>
  );
}
