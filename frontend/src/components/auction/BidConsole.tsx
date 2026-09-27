import { useState, type FormEvent } from 'react';
import { formatCurrency } from '../../utils/format.ts';
import { ArrowRightIcon, TrendingUpIcon } from '../icons.tsx';
import styles from './BidConsole.module.css';

export type BidConsoleState = 'guest' | 'seller' | 'not-active' | 'biddable';

interface Props {
  state: BidConsoleState;
  notActiveMessage?: string;
  suggestedAmount: number;
  placing: boolean;
  onSubmit: (amount: number) => void;
  onLoginRedirect: () => void;
}

// La consola solo se muestra completa cuando `state === 'biddable'`; los
// demás casos (visitante, vendedor, subasta no activa) muestran un mensaje
// fijo en su lugar (ver AuctionDetailPage, que calcula `state`).
export default function BidConsole({ state, notActiveMessage, suggestedAmount, placing, onSubmit, onLoginRedirect }: Props) {
  const [amountInput, setAmountInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (state === 'guest') {
    return (
      <div className={styles.wrap}>
        <button type="button" className={styles.loginButton} onClick={onLoginRedirect}>
          Iniciar sesión o Crear cuenta
        </button>
      </div>
    );
  }

  if (state === 'seller') {
    return <div className={styles.infoBox}>No podés pujar en tu propia subasta.</div>;
  }

  if (state === 'not-active') {
    return <div className={styles.infoBox}>{notActiveMessage}</div>;
  }

  function handleQuickBid() {
    setAmountInput(String(suggestedAmount));
    setLocalError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(amountInput);
    if (!amountInput.trim() || Number.isNaN(amount)) {
      setLocalError('Ingresá un monto válido.');
      return;
    }
    if (amount < suggestedAmount) {
      setLocalError(`El monto mínimo a ofertar es ${formatCurrency(suggestedAmount)}.`);
      return;
    }
    setLocalError(null);
    onSubmit(amount);
    setAmountInput('');
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <button type="button" className={styles.quickButton} onClick={handleQuickBid} disabled={placing}>
        <TrendingUpIcon width={16} height={16} />
        Pujar sugerido: {formatCurrency(suggestedAmount)}
      </button>

      <div>
        <div className={styles.inputRow}>
          <span className={styles.prefix}>$</span>
          <input
            type="number"
            inputMode="decimal"
            className={`${styles.input} ${localError ? styles.inputError : ''}`}
            placeholder={String(suggestedAmount)}
            value={amountInput}
            disabled={placing}
            onChange={(e) => {
              setAmountInput(e.target.value);
              setLocalError(null);
            }}
          />
        </div>
        {localError && <span className={styles.helperError}>{localError}</span>}
      </div>

      <button type="submit" className={styles.submitButton} disabled={placing}>
        {placing ? (
          <>
            <span className={styles.spinner} />
            Enviando puja…
          </>
        ) : (
          <>
            Pujar Ahora
            <ArrowRightIcon width={16} height={16} />
          </>
        )}
      </button>
    </form>
  );
}
