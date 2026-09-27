import { api } from './api.ts';
import type {
  AdminTransactionDto,
  AuctionClosureResult,
  AuditLogDto,
  CategoryDto,
  MessageResponse,
  UserDto,
} from '../types/index.ts';

// Nota: el listado de categorías es público (auctionService.getCategories);
// aquí solo están las operaciones de gestión.
export const adminService = {
  // POST /api/admin/categories
  async createCategory(name: string): Promise<CategoryDto> {
    const res = await api.post<CategoryDto>('/api/admin/categories', { name });
    return res.data;
  },

  // PUT /api/admin/categories/{id}
  async updateCategory(id: number, name: string): Promise<CategoryDto> {
    const res = await api.put<CategoryDto>(`/api/admin/categories/${id}`, { name });
    return res.data;
  },

  // DELETE /api/admin/categories/{id}  (falla si tiene subastas vinculadas)
  async deleteCategory(id: number): Promise<MessageResponse> {
    const res = await api.delete<MessageResponse>(`/api/admin/categories/${id}`);
    return res.data;
  },

  // PUT /api/admin/users/{id}/status  (suspender o habilitar)
  async setUserStatus(id: number, isActive: boolean, reason?: string): Promise<UserDto> {
    const res = await api.put<UserDto>(`/api/admin/users/${id}/status`, { isActive, reason });
    return res.data;
  },

  // POST /api/admin/auctions/{id}/moderations  (cancela la subasta y libera garantías)
  async moderateAuction(id: number, reason: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>(`/api/admin/auctions/${id}/moderations`, { reason });
    return res.data;
  },

  // POST /api/admin/auction-closures  (dispara manualmente el cierre de subastas expiradas)
  async closeExpiredAuctions(): Promise<AuctionClosureResult> {
    const res = await api.post<AuctionClosureResult>('/api/admin/auction-closures');
    return res.data;
  },

  // GET /api/admin/audit-logs
  async getAuditLogs(): Promise<AuditLogDto[]> {
    const res = await api.get<AuditLogDto[]>('/api/admin/audit-logs');
    return res.data;
  },

  // GET /api/admin/transactions
  async getTransactions(): Promise<AdminTransactionDto[]> {
    const res = await api.get<AdminTransactionDto[]>('/api/admin/transactions');
    return res.data;
  },
};
