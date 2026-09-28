import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { userService } from '../../services/userService.ts';
import { adminService } from '../../services/adminService.ts';
import type { UserDto } from '../../types/index.ts';
import { formatCurrency, getInitials } from '../../utils/format.ts';
import { useToasts } from '../../hooks/useToasts.ts';
import ToastStack from '../ToastStack.tsx';
import ReasonModal from './ReasonModal.tsx';
import { AlertTriangleIcon, LockIcon, SearchIcon, UnlockIcon } from '../icons.tsx';
import styles from './AdminTable.module.css';

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

export default function UsersSection() {
  const { toasts, push, dismiss } = useToasts();

  const [users, setUsers] = useState<UserDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Suspender pide motivo (modal); reactivar es una sola confirmación simple.
  const [suspendingUser, setSuspendingUser] = useState<UserDto | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      setUsers(await userService.getAll());
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudieron cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        String(u.id).includes(term),
    );
  }, [users, search]);

  function applyStatusUpdate(updated: UserDto) {
    setUsers((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? prev);
  }

  async function handleReactivate(user: UserDto) {
    setTogglingId(user.id);
    try {
      const updated = await adminService.setUserStatus(user.id, true);
      applyStatusUpdate(updated);
      push('success', `${user.name} fue reactivado.`);
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo reactivar al usuario.'));
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSuspend(reason: string) {
    if (!suspendingUser) return;
    setTogglingId(suspendingUser.id);
    try {
      const updated = await adminService.setUserStatus(suspendingUser.id, false, reason);
      applyStatusUpdate(updated);
      push('success', `${suspendingUser.name} fue suspendido.`);
      setSuspendingUser(null);
    } catch (err) {
      push('error', getErrorMessage(err, 'No se pudo suspender al usuario.'));
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinner} />
        <span className={styles.centerText}>Cargando usuarios…</span>
      </div>
    );
  }

  if (loadError || !users) {
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

      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>
          <SearchIcon width={16} height={16} />
        </span>
        <input
          className={styles.searchInput}
          placeholder="Buscar por nombre, email, rol o ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No hay usuarios que coincidan.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Disponible</th>
                <th>Escrow</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isAdmin = user.role === 'Administrator';
                return (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.cellMain}>
                        <span className={styles.avatar}>{getInitials(user.name)}</span>
                        <div className={styles.cellTexts}>
                          <span className={styles.cellTitle}>{user.name}</span>
                          <span className={styles.cellSubtitle}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{ROLE_LABEL[user.role] ?? user.role}</td>
                    <td className={styles.amount}>{formatCurrency(user.availableBalance)}</td>
                    <td className={styles.amount}>{formatCurrency(user.heldBalance)}</td>
                    <td>
                      <div className={styles.cellTexts}>
                        <span className={`${styles.badge} ${user.isActive ? styles.badgeGreen : styles.badgeRed}`}>
                          {user.isActive ? 'Activo' : 'Suspendido'}
                        </span>
                        {!user.isActive && user.suspendedReason && (
                          <span className={styles.mutedText}>{user.suspendedReason}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className={styles.mutedText}>Inmutable (Admin)</span>
                      ) : user.isActive ? (
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          disabled={togglingId === user.id}
                          onClick={() => setSuspendingUser(user)}
                        >
                          <LockIcon width={13} height={13} />
                          Suspender
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.iconButton}
                          disabled={togglingId === user.id}
                          onClick={() => void handleReactivate(user)}
                        >
                          <UnlockIcon width={13} height={13} />
                          {togglingId === user.id ? 'Reactivando…' : 'Reactivar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {suspendingUser && (
        <ReasonModal
          title={`Suspender a ${suspendingUser.name}`}
          label="Motivo de la suspensión"
          confirmLabel="Suspender"
          submitting={togglingId === suspendingUser.id}
          danger
          onConfirm={handleSuspend}
          onClose={() => setSuspendingUser(null)}
        />
      )}
    </div>
  );
}
