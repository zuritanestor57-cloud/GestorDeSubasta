import { api } from './api.ts';
import { authService } from './authService.ts';
import type { TransactionDto, WalletBalanceDto } from '../types/index.ts';

export const walletService = {
  // GET /api/wallet/balance/{userId}  (total, retenido en escrow y disponible)
  async getBalance(userId: number = authService.requireUserId()): Promise<WalletBalanceDto> {
    const res = await api.get<WalletBalanceDto>(`/api/wallet/balance/${userId}`);
    return res.data;
  },

  // POST /api/wallet/deposit
  async deposit(amount: number, userId: number = authService.requireUserId()): Promise<WalletBalanceDto> {
    const res = await api.post<WalletBalanceDto>('/api/wallet/deposit', { userId, amount });
    return res.data;
  },

  // GET /api/wallet/transactions/{userId}
  async getTransactions(userId: number = authService.requireUserId()): Promise<TransactionDto[]> {
    const res = await api.get<TransactionDto[]>(`/api/wallet/transactions/${userId}`);
    return res.data;
  },
};
