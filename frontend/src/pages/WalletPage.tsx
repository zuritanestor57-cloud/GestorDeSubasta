import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { walletService } from '../services/walletService.ts';
import type { TransactionDto, WalletBalanceDto } from '../types/index.ts';
import { getInitials } from '../utils/format.ts';
import { notifyWalletUpdated } from '../utils/walletEvents.ts';
import { useToasts } from '../hooks/useToasts.ts';
import ToastStack from '../components/ToastStack.tsx';
import BalanceCards from '../components/wallet/BalanceCards.tsx';
import DepositForm from '../components/wallet/DepositForm.tsx';
import WithdrawBox from '../components/wallet/WithdrawBox.tsx';
import TransactionsTable from '../components/wallet/TransactionsTable.tsx';
import { AlertTriangleIcon, ArrowLeftIcon, ShieldIcon, WalletIcon } from '../components/icons.tsx';
import styles from './WalletPage.module.css';

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

// La sesión ya está garantizada por ProtectedRoute (ver App.tsx): acá
// currentUser siempre existe.
export default function WalletPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;
  const { toasts, push, dismiss } = useToasts();

  const [balance, setBalance] = useState<WalletBalanceDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [depositing, setDepositing] = useState(false);

  async function loadWallet() {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudo consultar el libro mayor de la billetera.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(loadWallet);
  }, []);

  async function handleDeposit(amount: number) {
    setDepositing(true);
    try {
      const updatedBalance = await walletService.deposit(amount);
      setBalance(updatedBalance);
      // El nuevo movimiento todavía no está en `transactions`: se agrega
      // localmente en vez de volver a pedir todo el historial.
      setTransactions((prev) => [
        {
          id: -Date.now(), // provisorio hasta la próxima recarga real del ledger
          walletId: updatedBalance.walletId,
          type: 'Deposit',
          amount,
          createdAt: new Date().toISOString(),
          auctionId: null,
          auctionTitle: null,
        },
        ...prev,
      ]);
      push('success', `Se acreditaron ${amount.toLocaleString('es-AR')} a tu billetera.`);
      notifyWalletUpdated();
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo acreditar el depósito.'));
    } finally {
      setDepositing(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinnerLarge} />
        <span className={styles.centerText}>Consultando libro mayor de la billetera…</span>
      </div>
    );
  }

  if (loadError || !balance) {
    return (
      <div className={styles.centerState}>
        <AlertTriangleIcon width={36} height={36} />
        <span className={styles.centerText}>{loadError ?? 'No se pudo cargar tu billetera.'}</span>
        <button type="button" className={styles.secondaryButton} onClick={() => void loadWallet()}>
          Reintentar
        </button>
      </div>
    );
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
              <WalletIcon width={15} height={15} />
            </span>
            <span className={styles.logoText}>
              Subasta<span>Ya</span> Billetera
            </span>
          </div>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userTexts}>
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.userVerified}>Usuario verificado</span>
          </div>
          <span className={styles.avatar}>{getInitials(currentUser.name)}</span>
        </div>
      </div>

      <div className={styles.headerCard}>
        <span className={styles.escrowBadge}>
          <ShieldIcon width={14} height={14} />
          Sistema Escrow de Custodia Activo
        </span>
        <h1 className={styles.title}>Billetera Virtual &amp; Gestión de Fondos</h1>
        <p className={styles.subtitle}>
          Consultá tus saldos, acreditá fondos simulados y revisá el historial contable de tus movimientos.
        </p>
      </div>

      <BalanceCards balance={balance} />

      <div className={styles.fundsGrid}>
        <DepositForm onDeposit={handleDeposit} depositing={depositing} />
        <WithdrawBox availableBalance={balance.availableBalance} />
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  );
}
