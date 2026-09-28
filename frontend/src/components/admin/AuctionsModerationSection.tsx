import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService.ts';
import { auctionService } from '../../services/auctionService.ts';
import type { AuctionDetailDto } from '../../types/index.ts';
import { formatCurrency, formatDateShort } from '../../utils/format.ts';
import { useToasts } from '../../hooks/useToasts.ts';
import ToastStack from '../ToastStack.tsx';
import StatusBadge from '../StatusBadge.tsx';
import ReasonModal from './ReasonModal.tsx';
import { AlertTriangleIcon, ExternalLinkIcon, ImageOffIcon, RefreshIcon, SearchIcon, XCircleIcon } from '../icons.tsx';
import styles from './AdminTable.module.css';

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AuctionsModerationSection() {
  const { toasts, push, dismiss } = useToasts();

  const [auctions, setAuctions] = useState<AuctionDetailDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [closingExpired, setClosingExpired] = useState(false);

  const [moderatingAuction, setModeratingAuction] = useState<AuctionDetailDto | null>(null);
  const [moderating, setModerating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      // Sin filtro: trae TODAS las subastas, incluidas Cancelled/Draft (el
      // catálogo público las oculta, acá el admin necesita verlas todas).
      setAuctions(await auctionService.getAll());
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudieron cargar las subastas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const filtered = useMemo(() => {
    if (!auctions) return [];
    const term = search.trim().toLowerCase();
    if (!term) return auctions;
    return auctions.filter(
      (a) =>
        a.productTitle.toLowerCase().includes(term) ||
        a.sellerName.toLowerCase().includes(term) ||
        a.categories.some((c) => c.name.toLowerCase().includes(term)) ||
        String(a.id).includes(term),
    );
  }, [auctions, search]);

  async function handleCloseExpired() {
    setClosingExpired(true);
    try {
      const result = await adminService.closeExpiredAuctions();
      push('success', result.message);
      void load();
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo ejecutar el cierre de subastas vencidas.'));
    } finally {
      setClosingExpired(false);
    }
  }

  async function handleModerate(reason: string) {
    if (!moderatingAuction) return;
    setModerating(true);
    try {
      await adminService.moderateAuction(moderatingAuction.id, reason);
      setAuctions((prev) =>
        prev ? prev.map((a) => (a.id === moderatingAuction.id ? { ...a, status: 'Cancelled' } : a)) : prev,
      );
      push('success', 'La subasta fue moderada y cancelada.');
      setModeratingAuction(null);
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo moderar la subasta.'));
    } finally {
      setModerating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinner} />
        <span className={styles.centerText}>Cargando subastas…</span>
      </div>
    );
  }

  if (loadError || !auctions) {
    return (
      <div className={styles.centerState}>
        <AlertTriangleIcon width={28} height={28} />
        <span className={styles.centerText}>{loadError}</span>
        <button type="button" className={styles.secondaryButton} onClick={() => void load()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className={styles.banner}>
        <span className={styles.bannerText}>
          Procesa manualmente las subastas cuyo tiempo venció y el worker todavía no cerró.
        </span>
        <button type="button" className={styles.actionButton} disabled={closingExpired} onClick={() => void handleCloseExpired()}>
          <RefreshIcon width={14} height={14} />
          {closingExpired ? 'Procesando…' : 'Cerrar Subastas Vencidas'}
        </button>
      </div>

      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>
          <SearchIcon width={16} height={16} />
        </span>
        <input
          className={styles.searchInput}
          placeholder="Buscar por lote, título, categoría o vendedor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No hay subastas que coincidan.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lote</th>
                <th>Vendedor</th>
                <th>Oferta actual</th>
                <th>Estado</th>
                <th>Cierre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((auction) => {
                const canModerate = auction.status !== 'Cancelled' && auction.status !== 'Finished';
                return (
                  <tr key={auction.id}>
                    <td>
                      <div className={styles.cellMain}>
                        {auction.productImageUrl ? (
                          <img src={auction.productImageUrl} alt="" className={styles.thumb} />
                        ) : (
                          <div className={styles.thumbPlaceholder}>
                            <ImageOffIcon width={16} height={16} />
                          </div>
                        )}
                        <div className={styles.cellTexts}>
                          <span className={styles.cellTitle}>{auction.productTitle}</span>
                          <span className={styles.cellSubtitle}>
                            #{auction.id} · {auction.categories[0]?.name ?? 'Sin categoría'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{auction.sellerName}</td>
                    <td>
                      <span className={styles.amount}>{formatCurrency(auction.currentBid)}</span>
                      <div className={styles.mutedText}>{auction.bidsCount} pujas</div>
                    </td>
                    <td>
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className={styles.mono}>{formatDateShort(auction.endDate)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link to={`/auctions/${auction.id}`} className={styles.iconButton}>
                          <ExternalLinkIcon width={13} height={13} />
                          Sala
                        </Link>
                        {canModerate && (
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => setModeratingAuction(auction)}
                          >
                            <XCircleIcon width={13} height={13} />
                            Moderar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {moderatingAuction && (
        <ReasonModal
          title={`Moderar "${moderatingAuction.productTitle}"`}
          label="Motivo de la moderación"
          confirmLabel="Cancelar subasta"
          submitting={moderating}
          danger
          onConfirm={handleModerate}
          onClose={() => setModeratingAuction(null)}
        />
      )}
    </div>
  );
}
