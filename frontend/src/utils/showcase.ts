import type { AuctionDetailDto } from '../types/index.ts';

// Etiquetas del escaparate de LoginPage. A diferencia del estado real del
// backend, acá se combinan estado + urgencia + cantidad de pujas para dar
// una señal visual más llamativa (decorativo, no es el badge del catálogo).
export type ShowcaseTag = 'closing' | 'disputed' | 'upcoming' | 'featured';

export const SHOWCASE_TAG_LABEL: Record<ShowcaseTag, string> = {
  closing: 'Cierra pronto',
  disputed: '¡En disputa!',
  upcoming: 'Próxima',
  featured: 'Destacada',
};

const CLOSING_SOON_MS = 5 * 60 * 1000;

export function getShowcaseTag(auction: AuctionDetailDto, now: number): ShowcaseTag {
  if (auction.status === 'Published') return 'upcoming';
  const remaining = new Date(auction.endDate).getTime() - now;
  if (remaining <= CLOSING_SOON_MS) return 'closing';
  if (auction.bidsCount >= 2) return 'disputed';
  return 'featured';
}

// Reexportado acá para no romper los imports existentes: la implementación
// vive en format.ts porque también la usa AuctionDetailPage.
export { maskBidder } from './format.ts';
