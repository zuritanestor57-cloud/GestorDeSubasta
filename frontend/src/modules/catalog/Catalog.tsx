import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  RotateCcw,
  SlidersHorizontal,
  PackageOpen,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';
import { useAuctions, useCategories } from './hooks/useAuctions';
import { CardAuction } from './components/CardAuction';
import { Button } from '../../components/ui/Button';
import type { AuctionFilters } from './types';

export const Catalog: React.FC = () => {
  const navigate = useNavigate();

  // TODO: Obtener rol real del usuario desde AuthContext/Backend
  const IS_SELLER = true; // Simulación de rol vendedor

  // Estados de filtros
  const [filters, setFilters] = useState<AuctionFilters>({
    searchTerm: '',
    categoryId: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    orderBy: 'newest',
  });

  // Temporizador para debounce de búsqueda en tiempo real
  const [searchInput, setSearchInput] = useState('');

  // Consultas TanStack Query
  const { data: auctions = [], isLoading, isError, error, refetch } = useAuctions(filters);
  const { data: categories = [] } = useCategories();

  // Manejador de búsqueda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, searchTerm: searchInput }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, searchTerm: '' }));
  };

  // Reset de todos los filtros
  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      searchTerm: '',
      categoryId: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      orderBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. TOPBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#111827]/90 backdrop-blur-md border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo Izquierda */}
          <Link to="/catalog" className="flex items-center gap-2.5 shrink-0 select-none group">
            <div className="w-10 h-10 rounded-xl bg-[#2F8CFF]/15 border border-[#2F8CFF]/30 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-[#2F8CFF]/25">
              <svg
                width="24"
                height="24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="28" y="52" width="11" height="44" rx="5.5" transform="rotate(-45 28 52)" fill="#2F8CFF" />
                <rect x="48" y="16" width="36" height="22" rx="7" transform="rotate(45 48 16)" fill="#2F8CFF" />
                <rect x="63" y="9" width="12" height="26" rx="4" transform="rotate(45 63 9)" fill="#54A2FF" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
              Gestor de Subastas
            </span>
          </Link>

          {/* Buscador Centrado */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg mx-2 sm:mx-6"
          >
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar subastas por producto o palabra clave..."
                className="w-full bg-[#0B0B12] border border-[#1F2937] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2F8CFF] focus:ring-1 focus:ring-[#2F8CFF] transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Botones de Acción, Notificaciones y Avatar Derecha */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {IS_SELLER && (
              <Button
                type="button"
                onClick={() => navigate('/auction/create')}
                className="hidden sm:flex items-center gap-2 py-2 px-3 shadow-lg shadow-[#2F8CFF]/20"
              >
                <Plus size={16} />
                <span className="text-xs font-semibold">Publicar Subasta</span>
              </Button>
            )}

            {/* Versión Móvil de Publicar Subasta */}
            {IS_SELLER && (
              <button
                type="button"
                onClick={() => navigate('/auction/create')}
                className="sm:hidden p-2.5 rounded-xl bg-[#2F8CFF] text-white shadow-lg shadow-[#2F8CFF]/20"
                aria-label="Publicar Subasta"
              >
                <Plus size={18} />
              </button>
            )}

            <button
              type="button"
              className="relative p-2.5 rounded-xl bg-[#0B0B12] border border-[#1F2937] text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2F8CFF]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#0B0B12] border border-[#1F2937] text-slate-200 hover:border-[#2F8CFF]/50 transition-all cursor-pointer"
              title="Cuenta"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2F8CFF] flex items-center justify-center text-white font-semibold text-xs">
                <UserIcon size={16} />
              </div>
              <span className="text-xs font-medium hidden md:inline text-slate-300">
                Mi Cuenta
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BARRA DE FILTROS */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#111827] border-b border-[#1F2937] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Título de Filtros y selectores */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-3">
              
              {/* Filtro: Categoría */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-400 mb-1">
                  Categoría
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                  className="bg-[#0B0B12] border border-[#1F2937] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#2F8CFF] cursor-pointer"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro: Estado */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-400 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="bg-[#0B0B12] border border-[#1F2937] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#2F8CFF] cursor-pointer"
                >
                  <option value="">Todos los estados</option>
                  <option value="1">En curso</option>
                  <option value="3">Finalizada</option>
                </select>
              </div>

              {/* Filtro: Rango de Precios (Mín / Máx) */}
              <div className="flex flex-col col-span-2 sm:col-span-2 lg:col-span-1">
                <label className="text-[11px] font-medium text-slate-400 mb-1">
                  Rango precio (USD)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                    }
                    className="w-20 sm:w-24 bg-[#0B0B12] border border-[#1F2937] rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2F8CFF]"
                  />
                  <span className="text-slate-500 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                    }
                    className="w-20 sm:w-24 bg-[#0B0B12] border border-[#1F2937] rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2F8CFF]"
                  />
                </div>
              </div>

            </div>

            {/* Ordenamiento y Reset */}
            <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1F2937]">
              
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#2F8CFF]" />
                <span className="text-xs text-slate-400 font-medium">Ordenar:</span>
                <select
                  value={filters.orderBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, orderBy: e.target.value }))
                  }
                  className="bg-[#0B0B12] border border-[#1F2937] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#2F8CFF] cursor-pointer"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price_desc">Mayor oferta</option>
                  <option value="ending_soonest">Menor tiempo</option>
                </select>
              </div>

              {/* Botón Reset si hay filtros aplicados */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl bg-[#0B0B12] border border-[#1F2937] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                title="Limpiar filtros"
              >
                <RotateCcw size={16} />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CONTENIDO PRINCIPAL / GRID RESPONSIVO */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Encabezado del catálogo */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Catálogo de Subastas
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Explora, puja y encuentra las mejores ofertas en tiempo real.
            </p>
          </div>
          {!isLoading && !isError && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-slate-400">
              {auctions.length} {auctions.length === 1 ? 'subasta encontrada' : 'subastas encontradas'}
            </span>
          )}
        </div>

        {/* ===================================================================== */}
        {/* ESTADO 1: LOADING (SKELETON CARDS) */}
        {/* ===================================================================== */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-[#111827] border border-[#1F2937] overflow-hidden flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="aspect-video w-full bg-[#1F2937]" />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-5 bg-[#1F2937] rounded w-3/4" />
                    <div className="h-4 bg-[#1F2937] rounded w-1/2" />
                    <div className="pt-3 border-t border-[#1F2937] flex justify-between">
                      <div className="h-4 bg-[#1F2937] rounded w-20" />
                      <div className="h-4 bg-[#1F2937] rounded w-20" />
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-0">
                  <div className="h-10 bg-[#1F2937] rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================== */}
        {/* ESTADO 2: ERROR */}
        {/* ===================================================================== */}
        {!isLoading && isError && (
          <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-[#111827] border border-red-500/20 rounded-2xl my-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No pudimos cargar las subastas
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              {error instanceof Error ? error.message : 'Ocurrió un problema de conexión con el servidor.'}
            </p>
            <div className="w-44">
              <Button variant="primary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ESTADO 3: EMPTY */}
        {/* ===================================================================== */}
        {!isLoading && !isError && auctions.length === 0 && (
          <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center bg-[#111827] border border-[#1F2937] rounded-2xl my-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0B0B12] border border-[#1F2937] flex items-center justify-center text-slate-500 mb-4">
              <PackageOpen size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No hay subastas disponibles
            </h2>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              No se encontraron subastas que coincidan con tus criterios de búsqueda o filtros activos.
            </p>
            <div className="w-48">
              <Button variant="outline" onClick={handleResetFilters}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ESTADO 4: GRID CON RESULTADOS */}
        {/* ===================================================================== */}
        {!isLoading && !isError && auctions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <CardAuction key={auction.id} auction={auction} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
};
