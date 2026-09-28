import { Link } from 'react-router-dom';
import type { AuctionStatus, UserBidSummaryDto } from '../../types/index.ts';
import { formatCurrency } from '../../utils/format.ts';
import StatusBadge from '../StatusBadge.tsx';
import { AlertTriangleIcon, ExternalLinkIcon, TrophyIcon, XCircleIcon } from '../icons.tsx';
import styles from './BidsTable.module.css';

const STANDING_META: Record<string, { className: string; icon: typeof AlertTriangleIcon }> = {
  Liderando: { className: styles.standingLeading, icon: AlertTriangleIcon },
  Superado: { className: styles.standingOutbid, icon: AlertTriangleIcon },
  Ganada: { className: styles.standingWon, icon: TrophyIcon },
  Perdida: { className: styles.standingLost, icon: XCircleIcon },
};

export default function BidsTable({ bids }: { bids: UserBidSummaryDto[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Producto / Lote</th>
            <th>Mi oferta más alta</th>
            <th>Oferta líder actual</th>
            <th>Mi estado</th>
            <th>Estado de la subasta</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => {
            // "Liderando" no tiene un ícono propio en el doc (solo punto
            // pulsante): reutilizamos el mismo componente y le apagamos el ícono.
            const standing = STANDING_META[bid.participationStatus];
            const StandingIcon = standing?.icon;
            return (
              <tr key={bid.auctionId}>
                <td>
                  <div className={styles.productCell}>
                    {bid.productImageUrl ? (
                      <img src={bid.productImageUrl} alt="" className={styles.thumb} />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                    <div className={styles.productTexts}>
                      <Link to={`/auctions/${bid.auctionId}`} className={styles.productTitle}>
                        {bid.productTitle}
                      </Link>
                      <span className={styles.lotNumber}>Lote #{bid.auctionId}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.amount}>{formatCurrency(bid.myHighestBid)}</td>
                <td className={styles.amount}>{formatCurrency(bid.currentHighestBid)}</td>
                <td>
                  <span className={`${styles.badge} ${standing?.className ?? styles.standingLost}`}>
                    {bid.participationStatus === 'Liderando' ? (
                      <span className={styles.dot} />
                    ) : (
                      StandingIcon && <StandingIcon width={11} height={11} />
                    )}
                    {bid.participationStatus}
                  </span>
                </td>
                <td>
                  {/* auctionStatus llega como el mismo texto del enum del backend
                     (Active/Published/Finished/...), por eso el cast es seguro. */}
                  <StatusBadge status={bid.auctionStatus as AuctionStatus} />
                </td>
                <td>
                  <Link to={`/auctions/${bid.auctionId}`} className={styles.goButton}>
                    Ir a la Sala
                    <ExternalLinkIcon width={13} height={13} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
