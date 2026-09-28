import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService.ts';
import type { AdminTransactionDto, AuditLogDto } from '../../types/index.ts';
import { formatCurrency } from '../../utils/format.ts';
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, LockIcon, TrendingUpIcon } from '../icons.tsx';
import tableStyles from './AdminTable.module.css';
import styles from './AuditSection.module.css';

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// El backend no clasifica los eventos en una taxonomía fija: son strings
// libres (mezcla de MAYUSCULA_CON_GUIONES e inglés PascalCase). Se agrupan
// acá por color, a partir de coincidencias de texto.
function getEventBadgeClass(event: string): string {
  const upper = event.toUpperCase();
  if (upper.includes('RECHAZADA') || upper.includes('SUSPENDED') || upper.includes('MODERATED') || upper.includes('CANCELADA')) {
    return tableStyles.badgeRed;
  }
  if (upper.includes('ANTISNIPING') || upper.includes('RETENIDOS')) {
    return tableStyles.badgeAmber;
  }
  if (upper.includes('DESIERTA')) {
    return tableStyles.badgeGray;
  }
  if (upper.includes('CREADA') || upper.includes('REGISTRADA') || upper.includes('ACREDITADO') || upper.includes('ENABLED') || upper.includes('GANADOR')) {
    return tableStyles.badgeGreen;
  }
  return tableStyles.badgeBlue;
}

type TxSign = 'credit' | 'debit';
const TX_META: Record<string, { label: string; badgeClass: string; icon: typeof ArrowDownIcon; sign: TxSign }> = {
  Deposit: { label: 'Depósito', badgeClass: tableStyles.badgeGreen, icon: ArrowDownIcon, sign: 'credit' },
  SaleProceeds: { label: 'Cobro por venta', badgeClass: tableStyles.badgeGreen, icon: ArrowDownIcon, sign: 'credit' },
  Refund: { label: 'Reembolso', badgeClass: tableStyles.badgeGreen, icon: ArrowDownIcon, sign: 'credit' },
  Release: { label: 'Liberación', badgeClass: tableStyles.badgeBlue, icon: TrendingUpIcon, sign: 'credit' },
  Hold: { label: 'Retención', badgeClass: tableStyles.badgeAmber, icon: LockIcon, sign: 'debit' },
  Payment: { label: 'Pago subasta', badgeClass: tableStyles.badgeRed, icon: ArrowUpIcon, sign: 'debit' },
  Withdrawal: { label: 'Retiro', badgeClass: tableStyles.badgeRed, icon: ArrowUpIcon, sign: 'debit' },
};

type SubTab = 'logs' | 'ledger';

export default function AuditSection() {
  const [subTab, setSubTab] = useState<SubTab>('logs');

  const [logs, setLogs] = useState<AuditLogDto[] | null>(null);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<AdminTransactionDto[] | null>(null);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  async function loadLogs() {
    setLogsLoading(true);
    try {
      setLogs(await adminService.getAuditLogs());
      setLogsError(null);
    } catch (err) {
      setLogsError(getErrorMessage(err, 'No se pudo cargar la auditoría.'));
    } finally {
      setLogsLoading(false);
    }
  }

  async function loadTransactions() {
    setTxLoading(true);
    try {
      setTransactions(await adminService.getTransactions());
      setTxError(null);
    } catch (err) {
      setTxError(getErrorMessage(err, 'No se pudo cargar el libro mayor.'));
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadLogs();
      void loadTransactions();
    });
  }, []);

  return (
    <div className={tableStyles.section}>
      <div className={styles.pillSwitch}>
        <button
          type="button"
          className={`${styles.pill} ${subTab === 'logs' ? styles.pillActive : ''}`}
          onClick={() => setSubTab('logs')}
        >
          Audit Logs (Eventos del Sistema)
        </button>
        <button
          type="button"
          className={`${styles.pill} ${subTab === 'ledger' ? styles.pillActive : ''}`}
          onClick={() => setSubTab('ledger')}
        >
          Libro Mayor (Ledger Global)
        </button>
      </div>

      {subTab === 'logs' &&
        (logsLoading ? (
          <div className={tableStyles.centerState}>
            <span className={tableStyles.spinner} />
            <span className={tableStyles.centerText}>Cargando eventos…</span>
          </div>
        ) : logsError || !logs ? (
          <div className={tableStyles.centerState}>
            <span className={tableStyles.centerText}>{logsError}</span>
            <button type="button" className={tableStyles.secondaryButton} onClick={() => void loadLogs()}>
              Reintentar
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className={tableStyles.empty}>No hay eventos registrados.</div>
        ) : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Evento</th>
                  <th>Detalle</th>
                  <th>Usuario</th>
                  <th>Admin / Motivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={tableStyles.mono} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ClockIcon width={13} height={13} />
                        {formatDateTime(log.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className={`${tableStyles.badge} ${getEventBadgeClass(log.event)}`}>{log.event}</span>
                    </td>
                    <td className={styles.details}>
                      {log.details}
                      {log.auctionId && (
                        <>
                          {' '}
                          <Link to={`/auctions/${log.auctionId}`}>Ver lote #{log.auctionId}</Link>
                        </>
                      )}
                    </td>
                    <td>{log.userName}</td>
                    <td>
                      {log.adminUserName && <div>{log.adminUserName}</div>}
                      {log.reason && <div className={styles.reasonText}>{log.reason}</div>}
                      {!log.adminUserName && !log.reason && <span className={tableStyles.mutedText}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {subTab === 'ledger' &&
        (txLoading ? (
          <div className={tableStyles.centerState}>
            <span className={tableStyles.spinner} />
            <span className={tableStyles.centerText}>Cargando libro mayor…</span>
          </div>
        ) : txError || !transactions ? (
          <div className={tableStyles.centerState}>
            <span className={tableStyles.centerText}>{txError}</span>
            <button type="button" className={tableStyles.secondaryButton} onClick={() => void loadTransactions()}>
              Reintentar
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className={tableStyles.empty}>No hay movimientos registrados.</div>
        ) : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const meta = TX_META[tx.type];
                  const Icon = meta?.icon ?? ArrowDownIcon;
                  return (
                    <tr key={tx.id}>
                      <td className={tableStyles.mono}>#{tx.id}</td>
                      <td>
                        {tx.userName}
                        <div className={tableStyles.mutedText}>ID {tx.userId}</div>
                      </td>
                      <td>
                        <span className={`${tableStyles.badge} ${meta?.badgeClass ?? tableStyles.badgeGray}`}>
                          <Icon width={12} height={12} />
                          {meta?.label ?? tx.type}
                        </span>
                      </td>
                      <td className={styles.details}>
                        {tx.auctionTitle ? (
                          <Link to={`/auctions/${tx.auctionId}`}>{tx.auctionTitle}</Link>
                        ) : (
                          <span className={tableStyles.mutedText}>Acreditación manual</span>
                        )}
                      </td>
                      <td className={tableStyles.mono}>{formatDateTime(tx.createdAt)}</td>
                      <td
                        className={tableStyles.amount}
                        style={{
                          textAlign: 'right',
                          color: meta?.sign === 'debit' ? 'var(--warning)' : 'var(--success)',
                        }}
                      >
                        {meta?.sign === 'debit' ? '- ' : '+ '}
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
