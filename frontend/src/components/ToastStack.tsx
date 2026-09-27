import type { ToastItem } from '../hooks/useToasts.ts';
import styles from './ToastStack.module.css';

const VARIANT_CLASS: Record<ToastItem['variant'], string> = {
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
};

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

// Notificaciones flotantes fijas en la esquina superior derecha.
export default function ToastStack({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${VARIANT_CLASS[toast.variant]}`}>
          <span>{toast.message}</span>
          <button type="button" className={styles.close} aria-label="Cerrar" onClick={() => onDismiss(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
