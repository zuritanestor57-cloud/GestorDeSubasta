import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

// Cola simple de notificaciones flotantes. Cada pantalla que las necesita
// arma su propia instancia con este hook y las renderiza con <ToastStack />;
// no es un estado global compartido entre pantallas.
export function useToasts(autoDismissMs = 5000) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message }]);
      if (autoDismissMs > 0) {
        setTimeout(() => dismiss(id), autoDismissMs);
      }
    },
    [autoDismissMs, dismiss],
  );

  return { toasts, push, dismiss };
}
