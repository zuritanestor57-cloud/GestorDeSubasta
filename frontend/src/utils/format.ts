// Formato de montos, fechas y contadores compartido entre pantallas.

export function formatCurrency(amount: number): string {
  return `$ ${amount.toLocaleString('es-AR')}`;
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

// Da formato "Xd HH:MM:SS" si falta más de un día, o "HH:MM:SS" si falta menos.
export function formatCountdown(msRemaining: number): string {
  const clamped = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hms = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  return days > 0 ? `${days}d ${hms}` : hms;
}

// 1 punto por: largo >= 3, largo >= 6, letras+números, símbolos. Máximo 4.
// Vive acá (no en PasswordStrengthMeter.tsx) para que ese archivo solo
// exporte el componente, como pide react-refresh/only-export-components.
export function computePasswordScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 3) score++;
  if (password.length >= 6) score++;
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

// Iniciales para el avatar del sidebar (hasta 2 letras).
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

// Hora exacta "HH:MM:SS", para el historial de pujas.
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// El historial de pujas es público: nunca se muestra el nombre real del
// postor, solo un seudónimo derivado de su id. Se usa tanto en el
// escaparate del login como en la sala de subasta en vivo.
export function maskBidder(userId: number): string {
  const suffix = String(userId).padStart(2, '0').slice(-2);
  return `Usuario ***${suffix}`;
}
