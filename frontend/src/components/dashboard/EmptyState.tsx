import type { ComponentType, ReactNode, SVGProps } from 'react';
import styles from './EmptyState.module.css';

interface Props {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, message, actionLabel, onAction }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>
        <Icon width={32} height={32} />
      </span>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
