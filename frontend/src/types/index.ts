// Tipos que reflejan los DTOs del backend (Aplicacion/DTOs).
// Las fechas llegan como string ISO 8601.

export type UserRole = 'Buyer' | 'Seller' | 'BuyerAndSeller' | 'Administrator';

// El backend no usa JsonStringEnumConverter: al ENVIAR un rol va como número.
export const UserRoleValue = {
  Buyer: 0,
  Seller: 1,
  BuyerAndSeller: 2,
  Administrator: 3,
} as const;
export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];

export type AuctionStatus = 'Draft' | 'Published' | 'Active' | 'Cancelled' | 'Finished' | 'Deserted';

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Payment' | 'Refund' | 'Hold' | 'Release';

// ---------- Usuarios ----------
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  walletId: number;
  totalBalance: number;
  heldBalance: number;
  availableBalance: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRoleValue;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  password?: string;
  role?: UserRoleValue;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResultDto {
  success: boolean;
  message: string;
  user: UserDto | null;
}

export interface UserBidSummaryDto {
  auctionId: number;
  productTitle: string;
  productImageUrl: string;
  myHighestBid: number;
  currentHighestBid: number;
  isLeading: boolean;
  auctionStatus: string;
  participationStatus: string; // "Liderando" | "Superado" | "Ganada" | "Perdida"
  endDate: string;
}

export interface UserAuctionSummaryDto {
  auctionId: number;
  productTitle: string;
  productImageUrl: string;
  basePrice: number;
  currentBid: number;
  totalBidsCount: number;
  status: string;
  startDate: string;
  endDate: string;
}

export interface UserDashboardDto {
  userInfo: UserDto;
  activeAuctionsCreatedCount: number;
  totalAuctionsCreatedCount: number;
  activeBidsCount: number;
  wonAuctionsCount: number;
  myCreatedAuctions: UserAuctionSummaryDto[];
  myBids: UserBidSummaryDto[];
  myWonAuctions: UserAuctionSummaryDto[];
}

// ---------- Subastas ----------
export interface CategoryDto {
  id: number;
  name: string;
}

export interface CreateAuctionDto {
  userId: number;
  title: string;
  description: string;
  imageUrl: string;
  categoryIds: number[];
  basePrice: number;
  minimumIncrement: number;
  startDate: string;
  endDate: string;
}

export interface AuctionDetailDto {
  id: number;
  status: AuctionStatus;
  basePrice: number;
  currentBid: number;
  minimumIncrement: number;
  startDate: string;
  endDate: string;
  version: number;
  userId: number;
  sellerName: string;
  productTitle: string;
  productDescription: string;
  productImageUrl: string;
  categories: CategoryDto[];
  bidsCount: number;
}

export interface AuctionFilterDto {
  searchTerm?: string;
  categoryId?: number;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  orderBy?: string;
}

export interface CreateBidDto {
  userId: number;
  amount: number;
}

export interface BidDto {
  id: number;
  userId: number;
  bidderName: string;
  amount: number;
  createdAt: string;
}

export interface BidResultDto {
  bidId: number;
  auctionId: number;
  userId: number;
  bidderName: string;
  amount: number;
  createdAt: string;
  newEndDate: string;
  antiSnipingTriggered: boolean;
  message: string;
}

// ---------- Billetera ----------
export interface WalletBalanceDto {
  walletId: number;
  userId: number;
  userName: string;
  totalBalance: number;
  heldBalance: number;
  availableBalance: number;
  version: number;
}

export interface DepositDto {
  userId: number;
  amount: number;
}

export interface TransactionDto {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  createdAt: string;
}

// ---------- Administración ----------
export interface CreateCategoryDto {
  name: string;
}

export interface ToggleUserStatusDto {
  isActive: boolean;
  reason?: string;
}

export interface ModerateAuctionDto {
  reason: string;
}

export interface AuditLogDto {
  id: number;
  event: string;
  details: string;
  createdAt: string;
  userId: number;
  userName: string;
}

export interface AdminTransactionDto {
  id: number;
  walletId: number;
  userId: number;
  userName: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuctionClosureResult extends MessageResponse {
  processedCount: number;
}

// ---------- Sala en vivo (SignalR) ----------
export interface BidPlacedMessageDto {
  auctionId: number;
  bidId: number;
  userId: number;
  bidderName: string;
  amount: number;
  createdAt: string;
  minimumNextBid: number;
}

export interface TimeExtendedMessageDto {
  auctionId: number;
  newEndDate: string;
}

export interface AuctionStartedMessageDto {
  auctionId: number;
  startedAt: string;
}

export interface AuctionEndedMessageDto {
  auctionId: number;
  endedAt: string;
}
