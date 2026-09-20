export interface Category {
  id: number;
  name: string;
}

export interface Auction {
  id: number;
  status: string;
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
  categories: Category[];
  bidsCount: number;
}

export interface AuctionFilters {
  searchTerm?: string;
  categoryId?: number | string;
  status?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  orderBy?: string;
}
