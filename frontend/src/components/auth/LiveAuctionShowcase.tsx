import { useEffect, useState } from 'react';
import { auctionService } from '../../services/auctionService.ts';
import type { AuctionDetailDto, BidDto } from '../../types/index.ts';
import { formatCountdown, formatCurrency } from '../../utils/format.ts';
import { getShowcaseTag, maskBidder, SHOWCASE_TAG_LABEL, type ShowcaseTag } from '../../utils/showcase.ts';
import { ClockIcon, ImageOffIcon } from '../icons.tsx';
import styles from './LiveAuctionShowcase.module.css';

const TAG_CLASS: Record<ShowcaseTag, string> = {
  closing: styles.tagClosing,
  disputed: styles.tagDisputed,
  upcoming: styles.tagUpcoming,
  featured: styles.tagFeatured,
};

// Cuántas subastas entran a rotar en el carrusel, como máximo.
const MAX_ITEMS = 6;

// Escaparate del panel izquierdo de LoginPage: subastas reales, Activas y
// Próximas (Published). Es decorativo y no crítico para el login: si la
// carga falla, el componente simplemente no se muestra.
export default function LiveAuctionShowcase() {
  const [auctions, setAuctions] = useState<AuctionDetailDto[] | null>(null);
  const [bidsByAuction, setBidsByAuction] = useState<Record<number, BidDto[]>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const all = await auctionService.getAll();
        const eligible = all
          .filter((a) => a.status === 'Active' || a.status === 'Published')
          .sort((a, b) => {
            if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
            const dateA = a.status === 'Active' ? a.endDate : a.startDate;
            const dateB = b.status === 'Active' ? b.endDate : b.startDate;
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          })
          .slice(0, MAX_ITEMS);

        if (cancelled) return;
        setAuctions(eligible);

        // Las Published tienen las pujas bloqueadas por definición: solo
        // pedimos historial de pujas para las Activas que ya tienen alguna.
        const withBids = eligible.filter((a) => a.status === 'Active' && a.bidsCount > 0);
        const entries = await Promise.all(
          withBids.map(async (a) => [a.id, await auctionService.getBids(a.id)] as const),
        );
        if (cancelled) return;
        setBidsByAuction(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setAuctions([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rota cada 4,5s entre las subastas cargadas.
  useEffect(() => {
    if (!auctions || auctions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % auctions.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [auctions]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!auctions || auctions.length === 0) return null;

  const auction = auctions[activeIndex];
  const isUpcoming = auction.status === 'Published';
  const tag = getShowcaseTag(auction, now);
  const targetDate = isUpcoming ? auction.startDate : auction.endDate;
  const remainingMs = new Date(targetDate).getTime() - now;
  const category = auction.categories[0]?.name ?? 'Sin categoría';
  const topBids = (bidsByAuction[auction.id] ?? []).slice(0, 3);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {auction.productImageUrl ? (
          <img src={auction.productImageUrl} alt={auction.productTitle} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <ImageOffIcon width={22} height={22} />
            <span>Foto del producto</span>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.lotInfo}>
          <span className={styles.lotNumber}>Lote #{auction.id}</span>
          <span className={styles.category}>{category}</span>
        </div>
        <span className={`${styles.tag} ${TAG_CLASS[tag]}`}>{SHOWCASE_TAG_LABEL[tag]}</span>
      </div>

      <div className={styles.centerRow}>
        <div>
          <div className={styles.colLabel}>{isUpcoming ? 'Precio base' : 'Puja más alta actual'}</div>
          <div className={styles.bidAmount}>{formatCurrency(auction.currentBid)}</div>
          {!isUpcoming && auction.bidsCount >= 2 && (
            <div className={styles.disputeRow}>
              <span className={styles.dot} />
              Disputa en curso
            </div>
          )}
        </div>
        <div className={styles.timeCol}>
          <div className={styles.colLabel}>{isUpcoming ? 'Empieza en' : 'Tiempo restante'}</div>
          <span className={styles.timePill}>
            <ClockIcon width={14} height={14} />
            {formatCountdown(remainingMs)}
          </span>
        </div>
      </div>

      {topBids.length > 0 ? (
        <div className={styles.bidsRow}>
          {topBids.map((bid, index) => (
            <div key={bid.id} className={styles.bidMini}>
              <span className={`${styles.bidUser} ${index === 0 ? styles.bidUserLeader : ''}`}>
                {index === 0 && <span className={styles.dot} />}
                {maskBidder(bid.userId)}
              </span>
              <span className={styles.bidAmountMini}>{formatCurrency(bid.amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noBids}>
          {isUpcoming ? 'Todavía no empezó: las pujas están bloqueadas.' : 'Todavía no hay pujas.'}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.counter}>
          {activeIndex + 1} de {auctions.length} subastas activas
        </span>
        <div className={styles.dots}>
          {auctions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver Lote #${item.id}`}
              className={`${styles.navDot} ${index === activeIndex ? styles.navDotActive : ''}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
