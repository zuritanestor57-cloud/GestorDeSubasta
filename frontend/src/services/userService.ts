import { api } from './api.ts';
import { authService } from './authService.ts';
import type {
  UpdateUserDto,
  UserAuctionSummaryDto,
  UserBidSummaryDto,
  UserDashboardDto,
  UserDto,
} from '../types/index.ts';

// Todas las funciones "my*" operan sobre el usuario en sesión (authService).
export const userService = {
  // GET /api/users
  async getAll(): Promise<UserDto[]> {
    const res = await api.get<UserDto[]>('/api/users');
    return res.data;
  },

  // GET /api/users/{id}
  async getById(id: number): Promise<UserDto> {
    const res = await api.get<UserDto>(`/api/users/${id}`);
    return res.data;
  },

  // GET /api/users/{id}  (perfil del usuario en sesión)
  getMyProfile(): Promise<UserDto> {
    return userService.getById(authService.requireUserId());
  },

  // PUT /api/users/{id}
  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
    const res = await api.put<UserDto>(`/api/users/${id}`, data);
    return res.data;
  },

  // PUT /api/users/{id}  (actualiza el usuario en sesión y refresca la copia local)
  async updateMyProfile(data: UpdateUserDto): Promise<UserDto> {
    const updated = await userService.update(authService.requireUserId(), data);
    authService.setCurrentUser(updated);
    return updated;
  },

  // GET /api/users/{id}/dashboard
  async getDashboard(id: number = authService.requireUserId()): Promise<UserDashboardDto> {
    const res = await api.get<UserDashboardDto>(`/api/users/${id}/dashboard`);
    return res.data;
  },

  // GET /api/users/{id}/auctions  (subastas creadas)
  async getMyAuctions(id: number = authService.requireUserId()): Promise<UserAuctionSummaryDto[]> {
    const res = await api.get<UserAuctionSummaryDto[]>(`/api/users/${id}/auctions`);
    return res.data;
  },

  // GET /api/users/{id}/bids  (subastas en las que participa o participó)
  async getMyBids(id: number = authService.requireUserId()): Promise<UserBidSummaryDto[]> {
    const res = await api.get<UserBidSummaryDto[]>(`/api/users/${id}/bids`);
    return res.data;
  },

  // GET /api/users/{id}/won-auctions
  async getMyWonAuctions(id: number = authService.requireUserId()): Promise<UserAuctionSummaryDto[]> {
    const res = await api.get<UserAuctionSummaryDto[]>(`/api/users/${id}/won-auctions`);
    return res.data;
  },
};
