import { Link } from 'react-router-dom';
import type { UserAuctionSummaryDto } from '../../types/index.ts';
import { formatCurrency, formatDateShort } from '../../utils/format.ts';
import { ImageOffIcon, ShieldIcon, TrophyIcon } from '../icons.tsx';
import styles from './WonAuctionCard.module.css';

// UserAuctionSummaryDto no tiene finalPrice/adjudicationDate/sellerName: se
// usan currentBid y endDate (en una subasta Finalizada son lo mismo), y se
// omite el vendedor porque ese dato no viene en esta lista (decisión ya
// acordada: pedirlo aparte no compensa el costo de una petición por ítem).
export default function WonAuctionCard({ auction }: { auction: UserAuctionSummaryDto }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {auction.productImageUrl ? (
          <img src={auction.productImageUrl} alt={auction.productTitle} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <ImageOffIcon width={24} height={24} />
          </div>
        )}
        <span className={styles.badge}>
          <TrophyIcon width={12} height={12} />
          ¡ADJUDICADO!
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.title}>{auction.productTitle}</span>

        <div className={styles.priceBox}>
          <span className={styles.priceLabel}>Precio Final Pagado</span>
          <span className={styles.priceValue}>{formatCurrency(auction.currentBid)}</span>
          <span className={styles.date}>Adjudicada el {formatDateShort(auction.endDate)}</span>
        </div>

        <span className={styles.escrowRow}>
          <ShieldIcon width={13} height={13} />
          Pago custodiado por Escrow
        </span>

        <Link to={`/auctions/${auction.auctionId}`} className={styles.viewLink}>
          Ver Sala
        </Link>
      </div>
    </div>
  );
}
