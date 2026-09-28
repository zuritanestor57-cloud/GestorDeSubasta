import type { WalletBalanceDto } from '../../types/index.ts';
import { formatCurrency } from '../../utils/format.ts';
import { ShieldIcon, TrendingUpIcon, WalletIcon } from '../icons.tsx';
import styles from './BalanceCards.module.css';

// Saldo Disponible = Saldo Total - Saldo Retenido (TP, Módulo 4).
export default function BalanceCards({ balance }: { balance: WalletBalanceDto }) {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={`${styles.iconWrap} ${styles.iconBlue}`}>
          <WalletIcon width={18} height={18} />
        </span>
        <span className={`${styles.amount} ${styles.amountBlue}`}>{formatCurrency(balance.totalBalance)}</span>
        <span className={styles.caption}>Fondos globales depositados en la cuenta</span>
      </div>

      <div className={styles.card}>
        <span className={`${styles.iconWrap} ${styles.iconAmber}`}>
          <ShieldIcon width={18} height={18} />
        </span>
        <span className={`${styles.amount} ${styles.amountAmber}`}>{formatCurrency(balance.heldBalance)}</span>
        <span className={styles.caption}>Comprometido en pujas líderes activas</span>
      </div>

      <div className={styles.card}>
        <span className={`${styles.iconWrap} ${styles.iconGreen}`}>
          <TrendingUpIcon width={18} height={18} />
        </span>
        <span className={`${styles.amount} ${styles.amountGreen}`}>{formatCurrency(balance.availableBalance)}</span>
        <span className={styles.caption}>Saldo Disponible para nuevas pujas</span>
        <span className={styles.formula}>Disponible = Total − Retenido</span>
      </div>
    </div>
  );
}
