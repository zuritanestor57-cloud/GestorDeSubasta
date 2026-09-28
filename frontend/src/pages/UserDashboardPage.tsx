import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { userService } from '../services/userService.ts';
import { auctionService } from '../services/auctionService.ts';
import { walletService } from '../services/walletService.ts';
import type { UserAuctionSummaryDto, UserBidSummaryDto, WalletBalanceDto } from '../types/index.ts';
import { getInitials } from '../utils/format.ts';
import { useToasts } from '../hooks/useToasts.ts';
import ToastStack from '../components/ToastStack.tsx';
import BidsTable from '../components/dashboard/BidsTable.tsx';
import PublicationCard from '../components/dashboard/PublicationCard.tsx';
import WonAuctionCard from '../components/dashboard/WonAuctionCard.tsx';
import EmptyState from '../components/dashboard/EmptyState.tsx';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  PackageIcon,
  PlusSquareIcon,
  RefreshIcon,
  ShieldIcon,
  ShoppingBagIcon,
  TrophyIcon,
  WalletIcon,
} from '../components/icons.tsx';
import styles from './UserDashboardPage.module.css';

type Tab = 'bids' | 'publications' | 'won';

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

const ROLE_LABEL: Record<string, string> = {
  Buyer: 'Comprador',
  Seller: 'Vendedor',
  BuyerAndSeller: 'Comprador / Vendedor',
  Administrator: 'Administrador',
};

// La sesión ya está garantizada por ProtectedRoute (ver App.tsx): acá
// currentUser siempre existe.
export default function UserDashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;
  const canSell = currentUser.role === 'Seller' || currentUser.role === 'BuyerAndSeller';
  const { toasts, push, dismiss } = useToasts();

  // Vendedores entran directo a "Mis Publicaciones"; compradores puros no
  // tienen esa pestaña, así que arrancan en "Mis Compras / Pujas".
  const [activeTab, setActiveTab] = useState<Tab>(canSell ? 'publications' : 'bids');

  const [bids, setBids] = useState<UserBidSummaryDto[] | null>(null);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [bidsError, setBidsError] = useState<string | null>(null);

  const [publications, setPublications] = useState<UserAuctionSummaryDto[] | null>(null);
  const [publicationsLoading, setPublicationsLoading] = useState(canSell);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);

  const [won, setWon] = useState<UserAuctionSummaryDto[] | null>(null);
  const [wonLoading, setWonLoading] = useState(true);
  const [wonError, setWonError] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState<WalletBalanceDto | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());

  async function loadBids() {
    setBidsLoading(true);
    try {
      setBids(await userService.getMyBids());
      setBidsError(null);
    } catch (err) {
      setBidsError(getErrorMessage(err, 'No se pudieron cargar tus pujas.'));
    } finally {
      setBidsLoading(false);
    }
  }

  async function loadPublications() {
    setPublicationsLoading(true);
    try {
      setPublications(await userService.getMyAuctions());
      setPublicationsError(null);
    } catch (err) {
      setPublicationsError(getErrorMessage(err, 'No se pudieron cargar tus publicaciones.'));
    } finally {
      setPublicationsLoading(false);
    }
  }

  async function loadWon() {
    setWonLoading(true);
    try {
      setWon(await userService.getMyWonAuctions());
      setWonError(null);
    } catch (err) {
      setWonError(getErrorMessage(err, 'No se pudieron cargar tus subastas ganadas.'));
    } finally {
      setWonLoading(false);
    }
  }

  async function loadWallet() {
    try {
      setWalletBalance(await walletService.getBalance());
    } catch {
      // El saldo del top bar es informativo: si falla, no bloquea el panel.
    }
  }

  function loadAll() {
    void loadBids();
    // Un comprador puro nunca tiene publicaciones: ni la pestaña ni el pedido.
    if (canSell) void loadPublications();
    void loadWon();
    void loadWallet();
  }

  useEffect(() => {
    queueMicrotask(loadAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(auctionId: number) {
    setCancellingIds((prev) => new Set(prev).add(auctionId));
    try {
      await auctionService.cancel(auctionId);
      setPublications((prev) =>
        prev ? prev.map((p) => (p.auctionId === auctionId ? { ...p, status: 'Cancelled' } : p)) : prev,
      );
      push('success', 'La subasta ha sido cancelada exitosamente.');
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo cancelar la subasta.'));
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(auctionId);
        return next;
      });
    }
  }

  return (
    <div className={styles.page}>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button type="button" className={styles.backButton} aria-label="Volver" onClick={() => navigate('/')}>
            <ArrowLeftIcon width={18} height={18} />
          </button>
          <span className={styles.divider} />
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>
              <ShieldIcon width={15} height={15} />
            </span>
            <span className={styles.logoText}>
              Subasta<span>Ya</span> Panel
            </span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          {walletBalance && (
            <Link to="/wallet" className={styles.walletChip}>
              <WalletIcon width={16} height={16} />
              <div className={styles.walletTexts}>
                <span className={styles.walletLabel}>Disponible</span>
                <span className={styles.walletAmount}>
                  $ {walletBalance.availableBalance.toLocaleString('es-AR')}
                </span>
              </div>
            </Link>
          )}
          <span className={styles.roleText}>{ROLE_LABEL[currentUser.role] ?? currentUser.role}</span>
          <span className={styles.avatar}>{getInitials(currentUser.name)}</span>
        </div>
      </div>

      <div className={styles.headerCard}>
        <div className={styles.headerTexts}>
          <span className={styles.panelBadge}>
            <ShieldIcon width={14} height={14} />
            Centro de Operaciones Personal
          </span>
          <h1 className={styles.title}>Mis Actividades &amp; Subastas</h1>
          <p className={styles.subtitle}>
            {canSell
              ? 'Seguí tus publicaciones, tus pujas y los lotes que ya ganaste.'
              : 'Seguí tus pujas y los lotes que ya ganaste.'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshButton} onClick={loadAll}>
            <RefreshIcon width={15} height={15} />
            Actualizar
          </button>
          {canSell && (
            <Link to="/create-auction" className={styles.newAuctionButton}>
              <PlusSquareIcon width={15} height={15} />
              Nueva Subasta
            </Link>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {canSell && (
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'publications' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            <PackageIcon width={16} height={16} />
            Mis Publicaciones
            <span className={styles.tabCount}>{publications?.length ?? 0}</span>
          </button>
        )}
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'bids' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('bids')}
        >
          <ShoppingBagIcon width={16} height={16} />
          Mis Compras / Pujas
          <span className={styles.tabCount}>{bids?.length ?? 0}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'won' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('won')}
        >
          <TrophyIcon width={16} height={16} />
          Subastas Ganadas
          <span className={styles.tabCount}>{won?.length ?? 0}</span>
        </button>
      </div>

      <div className={styles.panel}>
        {activeTab === 'bids' &&
          (bidsLoading ? (
            <div className={styles.centerState}>
              <span className={styles.spinner} />
              <span className={styles.centerText}>Cargando tus pujas…</span>
            </div>
          ) : bidsError ? (
            <div className={styles.centerState}>
              <AlertTriangleIcon width={28} height={28} className={styles.errorText} />
              <span className={styles.centerText}>{bidsError}</span>
              <button type="button" className={styles.secondaryButton} onClick={() => void loadBids()}>
                Reintentar
              </button>
            </div>
          ) : !bids || bids.length === 0 ? (
            <EmptyState
              icon={ShoppingBagIcon}
              message="Todavía no pujaste en ninguna subasta."
              actionLabel="Explorar subastas"
              onAction={() => navigate('/')}
            />
          ) : (
            <BidsTable bids={bids} />
          ))}

        {activeTab === 'publications' &&
          (publicationsLoading ? (
            <div className={styles.centerState}>
              <span className={styles.spinner} />
              <span className={styles.centerText}>Cargando tus publicaciones…</span>
            </div>
          ) : publicationsError ? (
            <div className={styles.centerState}>
              <AlertTriangleIcon width={28} height={28} className={styles.errorText} />
              <span className={styles.centerText}>{publicationsError}</span>
              <button type="button" className={styles.secondaryButton} onClick={() => void loadPublications()}>
                Reintentar
              </button>
            </div>
          ) : !publications || publications.length === 0 ? (
            <EmptyState
              icon={PackageIcon}
              message={
                canSell ? 'Todavía no publicaste ninguna subasta.' : 'Necesitás una cuenta de vendedor para publicar.'
              }
              actionLabel={canSell ? 'Publicar subasta' : undefined}
              onAction={canSell ? () => navigate('/create-auction') : undefined}
            />
          ) : (
            <div className={styles.cardsGrid}>
              {publications.map((pub) => (
                <PublicationCard
                  key={pub.auctionId}
                  publication={pub}
                  cancelling={cancellingIds.has(pub.auctionId)}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ))}

        {activeTab === 'won' &&
          (wonLoading ? (
            <div className={styles.centerState}>
              <span className={styles.spinner} />
              <span className={styles.centerText}>Cargando tus subastas ganadas…</span>
            </div>
          ) : wonError ? (
            <div className={styles.centerState}>
              <AlertTriangleIcon width={28} height={28} className={styles.errorText} />
              <span className={styles.centerText}>{wonError}</span>
              <button type="button" className={styles.secondaryButton} onClick={() => void loadWon()}>
                Reintentar
              </button>
            </div>
          ) : !won || won.length === 0 ? (
            <EmptyState
              icon={TrophyIcon}
              message="Todavía no ganaste ninguna subasta."
              actionLabel="Explorar subastas"
              onAction={() => navigate('/')}
            />
          ) : (
            <div className={styles.cardsGrid}>
              {won.map((item) => (
                <WonAuctionCard key={item.auctionId} auction={item} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
