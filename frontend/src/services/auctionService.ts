import { api } from './api.ts';
import { authService } from './authService.ts';
import type {
  AuctionDetailDto,
  AuctionFilterDto,
  BidDto,
  BidResultDto,
  CategoryDto,
  CreateAuctionDto,
  MessageResponse,
} from '../types/index.ts';

export const auctionService = {
  // GET /api/auctions  (axios omite los filtros undefined)
  async getAll(filters: AuctionFilterDto = {}): Promise<AuctionDetailDto[]> {
    const res = await api.get<AuctionDetailDto[]>('/api/auctions', { params: filters });
    return res.data;
  },

  // GET /api/auctions/{id}
  async getById(id: number): Promise<AuctionDetailDto> {
    const res = await api.get<AuctionDetailDto>(`/api/auctions/${id}`);
    return res.data;
  },

  // POST /api/auctions
  async create(data: CreateAuctionDto): Promise<AuctionDetailDto> {
    const res = await api.post<AuctionDetailDto>('/api/auctions', data);
    return res.data;
  },

  // DELETE /api/auctions/{id}?sellerUserId=  (solo si no tiene pujas)
  async cancel(id: number, sellerUserId: number = authService.requireUserId()): Promise<MessageResponse> {
    const res = await api.delete<MessageResponse>(`/api/auctions/${id}`, { params: { sellerUserId } });
    return res.data;
  },

  // GET /api/auctions/categories
  async getCategories(): Promise<CategoryDto[]> {
    const res = await api.get<CategoryDto[]>('/api/auctions/categories');
    return res.data;
  },

  // GET /api/auctions/{id}/bids  (de mayor a menor monto)
  async getBids(id: number): Promise<BidDto[]> {
    const res = await api.get<BidDto[]>(`/api/auctions/${id}/bids`);
    return res.data;
  },

  // POST /api/auctions/{id}/bids
  // 409 = conflicto de concurrencia: otra puja entró primero, conviene reintentar.
  async placeBid(id: number, amount: number, userId: number = authService.requireUserId()): Promise<BidResultDto> {
    const res = await api.post<BidResultDto>(`/api/auctions/${id}/bids`, { userId, amount });
    return res.data;
  },
};
