import { useState, type FormEvent } from 'react';
import styles from './DepositForm.module.css';

const QUICK_AMOUNTS = [25_000, 50_000, 100_000, 250_000];

interface Props {
  onDeposit: (amount: number) => Promise<void>;
  depositing: boolean;
}

// Formulario de carga simulada (RF-30). El monto mínimo es > 0, igual que
// valida el backend en WalletService.DepositAsync.
export default function DepositForm({ onDeposit, depositing }: Props) {
  const [amountInput, setAmountInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function setQuickAmount(value: number) {
    setAmountInput(String(value));
    setLocalError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(amountInput);
    if (!amountInput.trim() || Number.isNaN(amount) || amount <= 0) {
      setLocalError('El monto a depositar debe ser un valor estrictamente positivo.');
      return;
    }
    setLocalError(null);
    await onDeposit(amount);
    setAmountInput('');
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Acreditar Saldo Simulado</h3>
        <span className={styles.badge}>Acreditación Inmediata</span>
      </div>

      <div className={styles.quickRow}>
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.quickButton}
            disabled={depositing}
            onClick={() => setQuickAmount(value)}
          >
            +$ {value.toLocaleString('es-AR')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <span className={styles.prefix}>$</span>
          <input
            type="number"
            inputMode="decimal"
            className={`${styles.input} ${localError ? styles.inputError : ''}`}
            placeholder="0"
            value={amountInput}
            disabled={depositing}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setLocalError(null);
            }}
          />
        </div>
        {localError && <span className={styles.helperError}>{localError}</span>}

        <div style={{ marginTop: 14 }}>
          <button type="submit" className={styles.submitButton} disabled={depositing}>
            {depositing ? (
              <>
                <span className={styles.spinner} />
                Acreditando Fondos…
              </>
            ) : (
              'Acreditar Fondos'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
