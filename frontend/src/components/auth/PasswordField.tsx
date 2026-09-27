import { LockIcon, EyeIcon, EyeOffIcon } from '../icons.tsx';
import FormField from './FormField.tsx';
import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string;
  label: string;
  visible: boolean;
  onToggleVisible: () => void;
  error?: boolean;
  helperText?: string;
}

// Campo de contraseña con ícono de candado y botón de mostrar/ocultar.
// `visible` se controla desde afuera para que login/registro (o contraseña +
// confirmación) puedan compartir el mismo estado de mostrar/ocultar.
export default function PasswordField({ visible, onToggleVisible, ...props }: Props) {
  return (
    <FormField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<LockIcon width={18} height={18} />}
      rightSlot={
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }}
        >
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      }
    />
  );
}
