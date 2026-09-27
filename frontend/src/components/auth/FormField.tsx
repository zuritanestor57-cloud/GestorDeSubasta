import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './FormField.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  icon: ReactNode;
  rightSlot?: ReactNode;
  error?: boolean;
  helperText?: string;
}

// Input de una línea con ícono a la izquierda, usado en login y registro
// (correo, nombre, contraseña). El slot derecho es para el botón de mostrar/ocultar.
export default function FormField({ id, label, icon, rightSlot, error, helperText, className, ...inputProps }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>{icon}</span>
        <input
          id={id}
          className={`${styles.input} ${error ? styles.inputError : ''} ${rightSlot ? styles.hasRightSlot : ''} ${className ?? ''}`}
          {...inputProps}
        />
        {rightSlot && <span className={styles.rightSlot}>{rightSlot}</span>}
      </div>
      {helperText && <span className={styles.helperError}>{helperText}</span>}
    </div>
  );
}
