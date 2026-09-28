import { useMemo, useState, type ComponentType, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import type { TransactionDto, TransactionType } from '../../types/index.ts';
import { formatCurrency } from '../../utils/format.ts';
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, LockIcon, TrendingUpIcon } from '../icons.tsx';
import styles from './TransactionsTable.module.css';

const PAGE_SIZE = 10;

interface TypeMeta {
  label: string;
  badgeClass: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  sign: 'credit' | 'debit';
  describe: (auctionTitle: string | null) => string;
}

// El backend no distingue "depósito manual" de "cobro por venta" con un
// campo de dirección propio: acá se decide el signo (+/-) y la descripción
// según el tipo real (ver Aplicacion.Domain.Entities.TransactionType).
const TYPE_META: Record<TransactionType, TypeMeta> = {
  Deposit: {
    label: 'Depósito',
    badgeClass: styles.badgeGreen,
    icon: ArrowDownIcon,
    sign: 'credit',
    describe: () => 'Acreditación manual de saldo',
  },
  SaleProceeds: {
    label: 'Cobro por venta',
    badgeClass: styles.badgeGreen,
    icon: ArrowDownIcon,
    sign: 'credit',
    describe: (title) => (title ? `Cobro por venta — ${title}` : 'Cobro por venta'),
  },
  Hold: {
    label: 'Retención',
    badgeClass: styles.badgeAmber,
    icon: LockIcon,
    sign: 'debit',
    describe: (title) => (title ? `Retención por puja en ${title}` : 'Retención por puja'),
  },
  Release: {
    label: 'Liberación',
    badgeClass: styles.badgeBlue,
    icon: TrendingUpIcon,
    sign: 'credit',
    describe: (title) => (title ? `Liberación de garantía — ${title}` : 'Liberación de garantía'),
  },
  Payment: {
    label: 'Pago subasta',
    badgeClass: styles.badgeRed,
    icon: ArrowUpIcon,
    sign: 'debit',
    describe: (title) => (title ? `Pago por subasta ganada — ${title}` : 'Pago por subasta ganada'),
  },
  Withdrawal: {
    label: 'Retiro',
    badgeClass: styles.badgeRed,
    icon: ArrowUpIcon,
    sign: 'debit',
    describe: () => 'Retiro de fondos',
  },
  Refund: {
    label: 'Reembolso',
    badgeClass: styles.badgeGreen,
    icon: ArrowDownIcon,
    sign: 'credit',
    describe: () => 'Reembolso',
  },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionsTable({ transactions }: { transactions: TransactionDto[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [transactions, page],
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTitles}>
          <h3>Libro Mayor Contable (Ledger)</h3>
          <span className={styles.subtitle}>Historial auditable de movimientos de tu billetera</span>
        </div>
        <span className={styles.count}>{transactions.length} movimientos</span>
      </div>

      {transactions.length === 0 ? (
        <div className={styles.empty}>No hay movimientos registrados en el libro mayor contable.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((tx) => {
                  const meta = TYPE_META[tx.type];
                  const Icon = meta.icon;
                  const description = meta.describe(tx.auctionTitle);
                  return (
                    <tr key={tx.id}>
                      <td>
                        <span className={styles.dateCell}>
                          <ClockIcon width={13} height={13} />
                          {formatDateTime(tx.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${meta.badgeClass}`}>
                          <Icon width={12} height={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className={styles.description}>
                        {tx.auctionId ? <Link to={`/auctions/${tx.auctionId}`}>{description}</Link> : description}
                      </td>
                      <td className={`${styles.amount} ${meta.sign === 'credit' ? styles.amountCredit : styles.amountDebit}`}>
                        {meta.sign === 'credit' ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                aria-label="Página anterior"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon width={16} height={16} />
              </button>
              <span className={styles.pageLabel}>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageButton}
                aria-label="Página siguiente"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRightIcon width={16} height={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
