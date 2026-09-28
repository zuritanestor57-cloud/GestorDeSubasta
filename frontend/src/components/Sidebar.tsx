import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { walletService } from '../services/walletService.ts';
import type { WalletBalanceDto } from '../types/index.ts';
import { formatCurrency, getInitials } from '../utils/format.ts';
import { WALLET_UPDATED_EVENT } from '../utils/walletEvents.ts';
import { CompassIcon, GavelIcon, HammerIcon, LogOutIcon, PlusSquareIcon, ShieldIcon, WalletIcon } from './icons.tsx';
import styles from './Sidebar.module.css';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAuthenticated = user !== null;

  const [balance, setBalance] = useState<WalletBalanceDto | null>(null);
  const [walletLoading, setWalletLoading] = useState(isAuthenticated);
  const [walletError, setWalletError] = useState<string | null>(null);

  async function loadBalance() {
    if (!isAuthenticated) return;
    setWalletLoading(true);
    setWalletError(null);
    try {
      const data = await walletService.getBalance();
      setBalance(data);
    } catch (err) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setWalletError(message ?? 'No se pudo cargar el saldo');
    } finally {
      setWalletLoading(false);
    }
  }

  useEffect(() => {
    // Se difiere a un microtask por la misma razón que en HomePage
    // (loadBalance dispara un setState síncrono).
    queueMicrotask(loadBalance);

    // Se re-consulta cuando WalletPage acredita saldo, sin necesidad de
    // recargar la página ni de un estado global compartido.
    function handleWalletUpdated() {
      void loadBalance();
    }
    window.addEventListener(WALLET_UPDATED_EVENT, handleWalletUpdated);
    return () => window.removeEventListener(WALLET_UPDATED_EVENT, handleWalletUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    authService.logout();
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>
          <HammerIcon width={18} height={18} />
        </span>
        <span className={styles.logoText}>
          Subasta<span>Ya</span>
        </span>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" end className={navLinkClass}>
          <CompassIcon width={18} height={18} />
          Explorar subastas
        </NavLink>
        <NavLink to="/dashboard" className={navLinkClass}>
          <GavelIcon width={18} height={18} />
          {user?.role === 'Seller' || user?.role === 'BuyerAndSeller' ? 'Mis actividades' : 'Mis pujas'}
        </NavLink>
        <NavLink to="/wallet" className={navLinkClass}>
          <WalletIcon width={18} height={18} />
          Billetera
        </NavLink>
        {(user?.role === 'Seller' || user?.role === 'BuyerAndSeller') && (
          <NavLink to="/create-auction" className={navLinkClass}>
            <PlusSquareIcon width={18} height={18} />
            Publicar subasta
          </NavLink>
        )}
        {user?.role === 'Administrator' && (
          <NavLink to="/admin" className={navLinkClass}>
            <ShieldIcon width={18} height={18} />
            Administración
          </NavLink>
        )}
      </nav>

      {isAuthenticated && (
        <div className={styles.walletCard}>
          {walletLoading ? (
            <span className={styles.walletError}>Cargando saldo…</span>
          ) : walletError ? (
            <>
              <span className={styles.walletError}>No se pudo cargar el saldo</span>
              <button type="button" className={styles.walletRetry} onClick={() => void loadBalance()}>
                Reintentar
              </button>
            </>
          ) : (
            <>
              <div className={styles.walletRow}>
                <span className={styles.walletLabel}>Disponible</span>
                <span className={`${styles.walletValue} ${styles.walletAvailable}`}>
                  {formatCurrency(balance?.availableBalance ?? 0)}
                </span>
              </div>
              <div className={styles.walletRow}>
                <span className={styles.walletLabel}>Retenido</span>
                <span className={`${styles.walletValue} ${styles.walletHeld}`}>
                  {formatCurrency(balance?.heldBalance ?? 0)}
                </span>
              </div>
            </>
          )}
          <button type="button" className={styles.walletButton} onClick={() => navigate('/wallet')}>
            Cargar saldo
          </button>
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.footer}>
        {isAuthenticated ? (
          <div className={styles.userRow}>
            <span className={styles.avatar}>{getInitials(user.name)}</span>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <button type="button" className={styles.logoutButton} aria-label="Cerrar sesión" onClick={handleLogout}>
              <LogOutIcon width={16} height={16} />
            </button>
          </div>
        ) : (
          <button type="button" className={styles.loginButton} onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>
        )}
      </div>
    </aside>
  );
}
