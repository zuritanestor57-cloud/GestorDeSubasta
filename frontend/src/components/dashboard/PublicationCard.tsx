import { Link } from 'react-router-dom';
import type { AuctionStatus, UserAuctionSummaryDto } from '../../types/index.ts';
import { formatCurrency } from '../../utils/format.ts';
import StatusBadge from '../StatusBadge.tsx';
import { XCircleIcon } from '../icons.tsx';
import styles from './PublicationCard.module.css';

interface Props {
  publication: UserAuctionSummaryDto;
  cancelling: boolean;
  onCancel: (auctionId: number) => void;
}

// canCancel no viene del backend: se deriva con la misma regla que ya exige
// AuctionsController al cancelar (RF-17) — Próxima o Activa, y sin pujas.
function canCancel(publication: UserAuctionSummaryDto): boolean {
  return (publication.status === 'Published' || publication.status === 'Active') && publication.totalBidsCount === 0;
}

export default function PublicationCard({ publication, cancelling, onCancel }: Props) {
  const showCancelAction = publication.status === 'Published' || publication.status === 'Active';
  const allowCancel = canCancel(publication);

  function handleCancelClick() {
    const confirmed = window.confirm(
      `¿Cancelar la subasta "${publication.productTitle}"? Esta acción no se puede deshacer.`,
    );
    if (confirmed) onCancel(publication.auctionId);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {publication.productImageUrl ? (
          <img src={publication.productImageUrl} alt="" className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        <div className={styles.headerTexts}>
          <span className={styles.lotNumber}>Lote #{publication.auctionId}</span>
          <span className={styles.title}>{publication.productTitle}</span>
          {/* status llega como el mismo texto del enum del backend
             (Active/Published/Finished/...), por eso el cast es seguro. */}
          <StatusBadge status={publication.status as AuctionStatus} />
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Mayor oferta lograda</span>
          <span className={styles.metricValue}>{formatCurrency(publication.currentBid)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Pujas recibidas</span>
          <span className={styles.metricValue}>{publication.totalBidsCount}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link to={`/auctions/${publication.auctionId}`} className={styles.viewButton}>
          Ver Sala
        </Link>
        {showCancelAction &&
          (allowCancel ? (
            <button type="button" className={styles.cancelButton} disabled={cancelling} onClick={handleCancelClick}>
              {cancelling ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <XCircleIcon width={13} height={13} />
                  Cancelar Subasta
                </>
              )}
            </button>
          ) : (
            <span className={styles.cancelHint}>Ya tiene pujas: no se puede cancelar</span>
          ))}
      </div>
    </div>
  );
}
