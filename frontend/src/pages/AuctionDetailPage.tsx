import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { auctionService } from '../services/auctionService.ts';
import { walletService } from '../services/walletService.ts';
import { joinAuctionRoom, type AuctionHubHandlers, type HubConnectionStatus } from '../services/auctionHub.ts';
import type { AuctionDetailDto, BidDto, WalletBalanceDto } from '../types/index.ts';
import { formatCountdown, formatCurrency, formatDateShort, getInitials, maskBidder } from '../utils/format.ts';
import { useToasts } from '../hooks/useToasts.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import ToastStack from '../components/ToastStack.tsx';
import ConnectionBadge from '../components/auction/ConnectionBadge.tsx';
import SellerCard from '../components/auction/SellerCard.tsx';
import CriticalBanner from '../components/auction/CriticalBanner.tsx';
import BidHistory from '../components/auction/BidHistory.tsx';
import BidConsole, { type BidConsoleState } from '../components/auction/BidConsole.tsx';
import { AlertTriangleIcon, ArrowLeftIcon, HammerIcon, ImageOffIcon, WalletIcon } from '../components/icons.tsx';
import styles from './AuctionDetailPage.module.css';

const POLLING_INTERVAL_MS = 3000;
const CRITICAL_ZONE_MS = 60 * 1000;

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

// Combina una puja nueva (de SignalR o de la respuesta del propio submit) con
// el historial existente, sin duplicar si ya estaba (dos fuentes pueden
// avisar la misma puja: la respuesta HTTP y el eco del hub).
function mergeBid(prev: BidDto[], incoming: BidDto): BidDto[] {
  if (prev.some((b) => b.id === incoming.id)) return prev;
  return [incoming, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const { toasts, push, dismiss } = useToasts();

  const [auction, setAuction] = useState<AuctionDetailDto | null>(null);
  const [bids, setBids] = useState<BidDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const [walletBalance, setWalletBalance] = useState<WalletBalanceDto | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<HubConnectionStatus>('disconnected');
  const [now, setNow] = useState(() => Date.now());
  const [placingBid, setPlacingBid] = useState(false);

  async function loadAuction() {
    try {
      const [detail, bidList] = await Promise.all([
        auctionService.getById(auctionId),
        auctionService.getBids(auctionId),
      ]);
      setAuction(detail);
      setBids([...bidList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudo cargar la subasta.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadWallet() {
    if (!currentUser) return;
    try {
      setWalletBalance(await walletService.getBalance());
    } catch {
      // El saldo del top bar es informativo: si falla, no bloquea la sala.
    }
  }

  // Carga inicial (y recarga completa si cambia el id de la subasta).
  useEffect(() => {
    queueMicrotask(() => {
      if (!auctionId || Number.isNaN(auctionId)) {
        setLoadError('Subasta inválida.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      setImageError(false);
      void loadAuction();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  useEffect(() => {
    queueMicrotask(loadWallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Reloj propio de la página, para el temporizador y la zona crítica.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Conexión a la sala en vivo. Los eventos actualizan el estado directamente
  // (sin volver a pedir todo a la API), salvo onStarted/onEnded que sí
  // recargan porque cambian el estado completo de la subasta.
  useEffect(() => {
    if (!auctionId || Number.isNaN(auctionId)) return;
    let cleanup: (() => Promise<void>) | null = null;
    let cancelled = false;

    const handlers: AuctionHubHandlers = {
      onBid: (msg) => {
        setBids((prev) =>
          mergeBid(prev, { id: msg.bidId, userId: msg.userId, bidderName: msg.bidderName, amount: msg.amount, createdAt: msg.createdAt }),
        );
        setAuction((prev) => (prev ? { ...prev, currentBid: msg.amount } : prev));
      },
      onTimeExtended: (msg) => {
        setAuction((prev) => (prev ? { ...prev, endDate: msg.newEndDate } : prev));
        push('warning', '¡Tiempo extendido por 2 minutos debido a una puja de último momento! (Anti-Sniping)');
      },
      onStarted: () => void loadAuction(),
      onEnded: () => void loadAuction(),
      onConnectionStateChange: setConnectionStatus,
    };

    joinAuctionRoom(auctionId, handlers)
      .then((stop) => {
        if (cancelled) {
          void stop();
          return;
        }
        cleanup = stop;
      })
      .catch(() => setConnectionStatus('disconnected'));

    return () => {
      cancelled = true;
      if (cleanup) void cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  // Short-polling de respaldo (alternativa mínima que también acepta el TP)
  // mientras el WebSocket no está conectado.
  useEffect(() => {
    if (connectionStatus === 'connected' || !auctionId || Number.isNaN(auctionId)) return;
    const interval = setInterval(() => void loadAuction(), POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus, auctionId]);

  async function handlePlaceBid(amount: number) {
    if (!auction || !currentUser) return;
    setPlacingBid(true);
    try {
      const result = await auctionService.placeBid(auction.id, amount, currentUser.id);
      setBids((prev) =>
        mergeBid(prev, {
          id: result.bidId,
          userId: result.userId,
          bidderName: result.bidderName,
          amount: result.amount,
          createdAt: result.createdAt,
        }),
      );
      setAuction((prev) => (prev ? { ...prev, currentBid: result.amount, endDate: result.newEndDate } : prev));
      push('success', result.message || 'Puja registrada con éxito.');
      void loadWallet();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        push('error', 'Alguien ofertó primero o el estado cambió. Por favor, reintentá con la nueva oferta mínima.');
        void loadAuction();
      } else {
        push('error', getErrorMessage(err, 'No se pudo registrar la puja.'));
      }
    } finally {
      setPlacingBid(false);
    }
  }

  function goToLogin() {
    navigate('/login', { state: { from: location.pathname } });
  }

  if (loading) {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinnerLarge} />
        <span className={styles.centerText}>Conectando a la sala de subasta en vivo…</span>
      </div>
    );
  }

  if (loadError || !auction) {
    return (
      <div className={styles.centerState}>
        <AlertTriangleIcon width={36} height={36} />
        <span className={styles.centerText}>{loadError ?? 'No se encontró la subasta.'}</span>
        <button type="button" className={styles.secondaryButton} onClick={() => navigate('/')}>
          Volver a subastas activas
        </button>
      </div>
    );
  }

  const endMs = new Date(auction.endDate).getTime();
  // Si el tiempo ya venció, se trata como finalizada acá mismo aunque el
  // worker del backend todavía no haya corrido (igual que en el catálogo).
  const isLocallyEnded = auction.status === 'Active' && endMs <= now;
  const remainingMs = Math.max(0, endMs - now);
  const isCritical = auction.status === 'Active' && !isLocallyEnded && remainingMs <= CRITICAL_ZONE_MS;

  const category = auction.categories[0]?.name ?? 'Sin categoría';
  const suggestedAmount = auction.currentBid + auction.minimumIncrement;
  const leaderBid = bids[0];
  const isSeller = currentUser?.id === auction.userId;
  const isLeading = Boolean(currentUser && leaderBid?.userId === currentUser.id);
  const hasParticipated = Boolean(currentUser && bids.some((b) => b.userId === currentUser.id));

  let bidConsoleState: BidConsoleState;
  let notActiveMessage: string | undefined;
  if (!currentUser) {
    bidConsoleState = 'guest';
  } else if (isSeller) {
    bidConsoleState = 'seller';
  } else if (auction.status !== 'Active' || isLocallyEnded) {
    bidConsoleState = 'not-active';
    notActiveMessage = auction.status === 'Published' ? 'La subasta todavía no comenzó.' : 'Esta subasta ya finalizó.';
  } else {
    bidConsoleState = 'biddable';
  }

  return (
    <div className={styles.page}>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button type="button" className={styles.backButton} aria-label="Volver" onClick={() => navigate(-1)}>
            <ArrowLeftIcon width={18} height={18} />
          </button>
          <span className={styles.divider} />
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>
              <HammerIcon width={15} height={15} />
            </span>
            <span className={styles.logoText}>
              Subasta<span>Ya</span>
            </span>
          </div>
        </div>

        <ConnectionBadge status={connectionStatus} />

        <div className={styles.topBarRight}>
          {currentUser ? (
            <>
              {walletBalance && (
                <div className={styles.walletChip}>
                  <WalletIcon width={16} height={16} />
                  <div className={styles.walletTexts}>
                    <span className={styles.walletLabel}>Saldo disponible</span>
                    <span className={styles.walletAmount}>{formatCurrency(walletBalance.availableBalance)}</span>
                  </div>
                </div>
              )}
              <span className={styles.avatar}>{getInitials(currentUser.name)}</span>
            </>
          ) : (
            <button type="button" className={styles.loginCta} onClick={goToLogin}>
              Ingresar
            </button>
          )}
        </div>
      </div>

      {isCritical && <CriticalBanner remainingMs={remainingMs} />}

      <div className={styles.content}>
        <div className={styles.leftCol}>
          <div className={styles.imageWrap}>
            {auction.productImageUrl && !imageError ? (
              <img
                src={auction.productImageUrl}
                alt={auction.productTitle}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <ImageOffIcon width={32} height={32} />
                <span>{auction.productTitle}</span>
              </div>
            )}
            <span className={styles.imageBadgeLeft}>
              <StatusBadge status={isLocallyEnded ? 'Finished' : auction.status} />
            </span>
            <span className={styles.imageBadgeRight}>Lote #{auction.id}</span>
          </div>

          <div className={styles.productInfo}>
            <div className={styles.metaRow}>
              <span>{category}</span>
              <span>·</span>
              <span>Inicia el {formatDateShort(auction.startDate)}</span>
            </div>
            <h1 className={styles.productTitle}>{auction.productTitle}</h1>
            <SellerCard sellerName={auction.sellerName} />
            <p className={styles.description}>{auction.productDescription}</p>
            <div className={styles.custodyBox}>
              <b>Pago en garantía (Escrow):</b> tu oferta queda retenida en tu billetera virtual hasta que la entrega
              se confirma. El vendedor no cobra hasta ese momento.
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.timerBlock}>
              <div className={styles.timerLabel}>{isLocallyEnded ? 'Subasta cerrada' : 'Tiempo restante'}</div>
              <div className={`${styles.timerValue} ${isCritical ? styles.timerCritical : ''}`}>
                {isLocallyEnded ? '00:00:00' : formatCountdown(remainingMs)}
              </div>
            </div>

            <div className={styles.bidBlock}>
              <div>
                <div className={styles.bidLabel}>Oferta más alta actual</div>
                <div className={styles.bidAmount}>{formatCurrency(auction.currentBid)}</div>
                {leaderBid && <div className={styles.bidLeaderName}>Lidera: {maskBidder(leaderBid.userId)}</div>}
              </div>
              <div className={styles.increment}>
                Incremento mínimo
                <br />
                {formatCurrency(auction.minimumIncrement)}
              </div>
            </div>

            {currentUser && !isSeller && (
              <span
                className={`${styles.userStatePill} ${
                  isLeading ? styles.stateLeading : hasParticipated ? styles.stateOutbid : styles.stateNone
                }`}
              >
                {isLeading ? 'LIDERANDO' : hasParticipated ? 'SUPERADO' : 'SIN PARTICIPAR'}
              </span>
            )}

            <BidConsole
              state={bidConsoleState}
              notActiveMessage={notActiveMessage}
              suggestedAmount={suggestedAmount}
              placing={placingBid}
              onSubmit={handlePlaceBid}
              onLoginRedirect={goToLogin}
            />
          </div>

          <BidHistory bids={bids} currentUserId={currentUser?.id} />
        </div>
      </div>
    </div>
  );
}
