import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl px-4 py-3 text-sm select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-[#2F8CFF] hover:bg-[#2576db] text-white font-semibold shadow-md shadow-blue-600/20',
    secondary:
      'bg-[#1a1e2e] hover:bg-[#23283c] text-white border border-[#2c3349]',
    outline:
      'bg-[#131622] hover:bg-[#1a1f30] text-slate-200 border border-[#22283a]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
