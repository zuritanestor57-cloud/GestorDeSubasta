import { formatCurrency } from '../../utils/format.ts';
import styles from './WithdrawBox.module.css';

// El backend no tiene endpoint de retiro (fuera de alcance de esta entrega):
// el botón queda siempre inactivo, no solo cuando el saldo es $0.
export default function WithdrawBox({ availableBalance }: { availableBalance: number }) {
  return (
    <div className={styles.card}>
      <h3>Retiros</h3>
      <p className={styles.explanation}>
        Simulación académica: las transferencias bancarias reales están desactivadas en esta entrega.
      </p>
      <div className={styles.availableBox}>
        <div className={styles.availableLabel}>Saldo retirable</div>
        <div className={styles.availableAmount}>{formatCurrency(availableBalance)}</div>
      </div>
      <button type="button" className={styles.button} disabled>
        {availableBalance === 0 ? 'Sin saldo disponible para retirar' : 'Solicitar Retiro (Simulación)'}
      </button>
    </div>
  );
}
