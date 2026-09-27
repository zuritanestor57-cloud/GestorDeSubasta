import type { AuctionDetailDto, AuctionStatus } from '../types/index.ts';

// Agrupación de estados que usa el catálogo (distinta del enum crudo del backend).
// Draft y Cancelled no son estados que el catálogo público deba listar.
export type CatalogTab = 'all' | 'active' | 'upcoming' | 'finished';

export const CATALOG_TABS: { key: CatalogTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Activas' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'finished', label: 'Finalizadas' },
];

export function isVisibleInCatalog(status: AuctionStatus): boolean {
  return status !== 'Draft' && status !== 'Cancelled';
}

// Published = todavía no arrancó (RF: "Próximas, programadas para iniciar a futuro").
// Finished/Deserted se agrupan como "Finalizadas": ambas ya cerraron.
export function toCatalogTab(status: AuctionStatus): CatalogTab | null {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Published':
      return 'upcoming';
    case 'Finished':
    case 'Deserted':
      return 'finished';
    default:
      return null;
  }
}

export function matchesTab(auction: AuctionDetailDto, tab: CatalogTab): boolean {
  const auctionTab = toCatalogTab(auction.status);
  if (auctionTab === null) return false;
  return tab === 'all' || auctionTab === tab;
}
