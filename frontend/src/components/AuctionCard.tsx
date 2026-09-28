import { Link, useNavigate } from 'react-router-dom';
import type { AuctionDetailDto } from '../types/index.ts';
import { formatCountdown, formatCurrency, formatDateShort } from '../utils/format.ts';
import StatusBadge from './StatusBadge.tsx';
import { ClockIcon, ImageOffIcon } from './icons.tsx';
import styles from './AuctionCard.module.css';

interface Props {
  auction: AuctionDetailDto;
  // Momento actual compartido por toda la página, para que las tarjetas no
  // tengan cada una su propio setInterval.
  now: number;
}

export default function AuctionCard({ auction, now }: Props) {
  const navigate = useNavigate();
  const endTime = new Date(auction.endDate).getTime();
  // Una subasta Activa cuyo tiempo ya venció se muestra como finalizada acá
  // mismo, sin esperar a que el backend la cierre.
  const isEnded = auction.status !== 'Published' && (auction.status !== 'Active' || endTime <= now);
  const remainingMs = endTime - now;
  const category = auction.categories[0]?.name ?? 'Sin categoría';
  const detailPath = `/auctions/${auction.id}`;

  function goToDetail() {
    navigate(detailPath);
  }

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={detailPath} className={styles.imageLink}>
          {auction.productImageUrl ? (
            <img src={auction.productImageUrl} alt={auction.productTitle} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <ImageOffIcon width={28} height={28} />
              <span>Foto del producto</span>
            </div>
          )}
        </Link>
      </div>

      <div className={styles.body}>
        <span className={styles.category}>{category}</span>
        <Link to={detailPath} className={styles.titleLink}>
          <h3 className={styles.title}>{auction.productTitle}</h3>
        </Link>
        <StatusBadge status={isEnded ? 'Finished' : auction.status} />

        <div className={styles.priceRow}>
          <span>
            <span className={styles.priceLabel}>{isEnded ? 'Precio final' : 'Precio actual'}</span>
            <br />
            <span className={styles.priceValue}>{formatCurrency(auction.currentBid)}</span>
          </span>
          <span className={styles.bidsCount}>{auction.bidsCount} pujas</span>
        </div>

        <div className={styles.timeBox}>
          <span className={styles.timeLeft}>
            <ClockIcon width={14} height={14} />
            {isEnded ? 'Cerró el' : 'Cierra en'}
          </span>
          <span className={`${styles.timeValue} ${isEnded ? styles.timeFinished : styles.timeActive}`}>
            {isEnded ? formatDateShort(auction.endDate) : formatCountdown(remainingMs)}
          </span>
        </div>

        <button
          type="button"
          className={`${styles.action} ${isEnded ? styles.secondary : styles.primary}`}
          onClick={goToDetail}
        >
          {isEnded ? 'Ver resultado' : 'Pujar ahora'}
        </button>
      </div>
    </article>
  );
}
