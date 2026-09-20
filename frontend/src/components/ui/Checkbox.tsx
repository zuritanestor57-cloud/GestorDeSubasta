import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, checked, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label htmlFor={checkboxId} className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
        <div className="relative flex items-center justify-center">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 rounded-md border border-[#2c3349] bg-[#131622] peer-checked:bg-[#2F8CFF] peer-checked:border-[#2F8CFF] transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#2F8CFF]/50">
            <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>
        {label && <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
