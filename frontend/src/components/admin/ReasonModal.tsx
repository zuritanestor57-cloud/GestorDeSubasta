import { useState } from 'react';
import Modal from '../Modal.tsx';
import styles from './AdminTable.module.css';

interface Props {
  title: string;
  label: string;
  confirmLabel: string;
  submitting: boolean;
  danger?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

// Modal genérico para las 2 acciones administrativas que exigen motivo:
// moderar una subasta y suspender un usuario.
export default function ReasonModal({ title, label, confirmLabel, submitting, danger, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (!reason.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }
    onConfirm(reason.trim());
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="reason-modal-input">
          {label}
        </label>
        <textarea
          id="reason-modal-input"
          className={styles.formTextarea}
          rows={3}
          value={reason}
          disabled={submitting}
          onChange={(e) => {
            setReason(e.target.value);
            setError(null);
          }}
        />
        {error && <span className={styles.formError}>{error}</span>}
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={submitting}>
          Cancelar
        </button>
        <button
          type="button"
          className={danger ? styles.dangerButton : styles.actionButton}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? 'Enviando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
