import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import Sidebar from '../components/Sidebar.tsx';
import AuctionCard from '../components/AuctionCard.tsx';
import CardSkeleton from '../components/CardSkeleton.tsx';
import { SearchIcon } from '../components/icons.tsx';
import { auctionService } from '../services/auctionService.ts';
import type { AuctionDetailDto, CategoryDto } from '../types/index.ts';
import { CATALOG_TABS, isVisibleInCatalog, matchesTab, toCatalogTab, type CatalogTab } from '../utils/auctionCatalog.ts';
import styles from './HomePage.module.css';

type SortOption = 'closing' | 'priceDesc' | 'priceAsc' | 'bids';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'closing', label: 'Cierre más próximo' },
  { value: 'priceDesc', label: 'Mayor precio' },
  { value: 'priceAsc', label: 'Menor precio' },
  { value: 'bids', label: 'Más pujas' },
];

// Orden por defecto: primero las que están en curso (por terminar antes),
// después las próximas a iniciar, al final las que ya cerraron.
function sortByClosing(a: AuctionDetailDto, b: AuctionDetailDto): number {
  const groupOrder: Record<CatalogTab, number> = { active: 0, upcoming: 1, finished: 2, all: 3 };
  const groupA = toCatalogTab(a.status) ?? 'all';
  const groupB = toCatalogTab(b.status) ?? 'all';
  if (groupA !== groupB) return groupOrder[groupA] - groupOrder[groupB];
  if (groupA === 'finished') {
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  }
  return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
}

function sortAuctions(list: AuctionDetailDto[], sort: SortOption): AuctionDetailDto[] {
  const copy = [...list];
  switch (sort) {
    case 'priceDesc':
      return copy.sort((a, b) => b.currentBid - a.currentBid);
    case 'priceAsc':
      return copy.sort((a, b) => a.currentBid - b.currentBid);
    case 'bids':
      return copy.sort((a, b) => b.bidsCount - a.bidsCount);
    default:
      return copy.sort(sortByClosing);
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function HomePage() {
  const [auctions, setAuctions] = useState<AuctionDetailDto[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [auctionsError, setAuctionsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesFailed, setCategoriesFailed] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CatalogTab>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('closing');
  const [now, setNow] = useState(() => Date.now());

  // Debounce del buscador: espera ~300ms sin tipeo antes de disparar la búsqueda.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Único reloj de la página: todas las tarjetas leen este mismo "now".
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadAuctions() {
    setAuctionsLoading(true);
    setAuctionsError(null);
    try {
      // El estado (pestaña) se filtra en el cliente: así los contadores de
      // las 4 pestañas se calculan sobre la misma lista, sin pedirla 4 veces.
      const data = await auctionService.getAll({
        searchTerm: debouncedSearch || undefined,
        categoryId: activeCategoryId ?? undefined,
      });
      setAuctions(data.filter((a) => isVisibleInCatalog(a.status)));
    } catch (err) {
      setAuctionsError(getErrorMessage(err, 'No se pudieron cargar las subastas.'));
    } finally {
      setAuctionsLoading(false);
    }
  }

  useEffect(() => {
    // Se difiere a un microtask: loadAuctions actualiza el estado apenas
    // arranca (loading=true), y el linter exige que un efecto no dispare
    // un setState de forma síncrona en su propio cuerpo.
    queueMicrotask(loadAuctions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategoryId]);

  useEffect(() => {
    auctionService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategoriesFailed(true));
  }, []);

  const tabCounts = useMemo(() => {
    const counts: Record<CatalogTab, number> = { all: auctions.length, active: 0, upcoming: 0, finished: 0 };
    for (const auction of auctions) {
      const tab = toCatalogTab(auction.status);
      if (tab) counts[tab] += 1;
    }
    return counts;
  }, [auctions]);

  const visibleAuctions = useMemo(() => {
    const filtered = auctions.filter((a) => matchesTab(a, activeTab));
    return sortAuctions(filtered, sort);
  }, [auctions, activeTab, sort]);

  function clearFilters() {
    setSearchInput('');
    setDebouncedSearch('');
    setActiveTab('all');
    setActiveCategoryId(null);
  }

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <SearchIcon width={18} height={18} />
          </span>
          <label htmlFor="auction-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
            Buscar subastas
          </label>
          <input
            id="auction-search"
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por producto o categoría…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className={styles.header}>
          <div>
            <h1>Explorar subastas</h1>
            <p className={styles.headerCount}>
              <b>{visibleAuctions.length}</b> subastas encontradas
            </p>
          </div>
          <div>
            <label htmlFor="auction-sort" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
              Ordenar por
            </label>
            <select
              id="auction-sort"
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.tabs}>
            {CATALOG_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.key !== 'all' && <span className={styles.tabDot} />}
                {tab.label}
                <span className={styles.tabCount}>{tabCounts[tab.key]}</span>
              </button>
            ))}
          </div>

          {!categoriesFailed && (
            <div className={styles.categoryChips}>
              <button
                type="button"
                className={`${styles.chip} ${activeCategoryId === null ? styles.chipActive : ''}`}
                onClick={() => setActiveCategoryId(null)}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.chip} ${activeCategoryId === category.id ? styles.chipActive : ''}`}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {auctionsLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : auctionsError ? (
          <div className={styles.errorState}>
            <p>{auctionsError}</p>
            <button type="button" className={styles.secondaryButton} onClick={() => void loadAuctions()}>
              Reintentar
            </button>
          </div>
        ) : visibleAuctions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay subastas que coincidan con los filtros.</p>
            <button type="button" className={styles.secondaryButton} onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {visibleAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} now={now} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
