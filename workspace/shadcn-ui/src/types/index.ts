export interface Product {
  id: string;
  name: string;
  price: number;
  url: string;
}

export interface OutfitCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  products: Product[];
  likes: number;
  comments: number;
  estimatedRevenue: number;
  createdAt: string;
}

export interface WearRecord {
  id: string;
  date: string;
  imageUrl: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  purchasePrice: number;
  purchaseDate: string;
  wearRecords: WearRecord[];
  wearCount: number;
  points: number;
  utilizationRate: number;
}

export interface UserStats {
  totalItems: number;
  totalSpending: number;
  totalPoints: number;
  averageUtilization: number;
}