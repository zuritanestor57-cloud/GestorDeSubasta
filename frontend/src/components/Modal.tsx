import type { ReactNode } from 'react';
import { XCircleIcon } from './icons.tsx';
import styles from './Modal.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Modal simple y genérico: click en el fondo o en la cruz cierra. El
// contenido (formulario, botones) lo arma quien lo usa.
export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button type="button" className={styles.closeButton} aria-label="Cerrar" onClick={onClose}>
            <XCircleIcon width={16} height={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
