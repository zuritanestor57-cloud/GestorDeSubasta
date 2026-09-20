import { useQuery } from '@tanstack/react-query';
import type { Auction, AuctionFilters, Category } from '../types';

export function useAuctions(filters: AuctionFilters) {
  return useQuery<Auction[]>({
    queryKey: ['auctions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.searchTerm?.trim()) {
        params.append('searchTerm', filters.searchTerm.trim());
      }
      if (filters.categoryId !== undefined && filters.categoryId !== '') {
        params.append('categoryId', filters.categoryId.toString());
      }
      if (filters.status !== undefined && filters.status !== '') {
        params.append('status', filters.status.toString());
      }
      if (filters.minPrice !== undefined && filters.minPrice !== '') {
        params.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.orderBy?.trim()) {
        params.append('orderBy', filters.orderBy.trim());
      }

      const queryString = params.toString();
      const url = queryString ? `/api/auctions?${queryString}` : '/api/auctions';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar las subastas');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auctions/categories');
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
