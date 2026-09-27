import type { BidDto } from '../../types/index.ts';
import { formatCurrency, formatTime, maskBidder } from '../../utils/format.ts';
import styles from './BidHistory.module.css';

interface Props {
  bids: BidDto[];
  currentUserId?: number;
}

// Lista cronológica (más reciente primero) con seudónimos, nunca el nombre
// real del postor (ver utils/format.ts#maskBidder).
export default function BidHistory({ bids, currentUserId }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTitles}>
          <h3>Historial de ofertas</h3>
          <span className={styles.subtitle}>Sincronizado en vivo vía SignalR</span>
        </div>
        <span className={styles.count}>{bids.length} ofertas</span>
      </div>

      {bids.length === 0 ? (
        <div className={styles.empty}>Todavía no hay pujas registradas.</div>
      ) : (
        <div className={styles.list}>
          {bids.map((bid, index) => {
            const isLeader = index === 0;
            const isYou = bid.userId === currentUserId;
            return (
              <div key={bid.id} className={`${styles.row} ${isLeader ? styles.rowLeader : ''}`}>
                <div className={styles.rowUser}>
                  <span className={styles.userName}>{maskBidder(bid.userId)}</span>
                  {isYou && <span className={`${styles.tag} ${styles.tagYou}`}>Tú</span>}
                  {isLeader && <span className={`${styles.tag} ${styles.tagLeader}`}>Líder</span>}
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.time}>{formatTime(bid.createdAt)}</span>
                  <span className={styles.amount}>{formatCurrency(bid.amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
