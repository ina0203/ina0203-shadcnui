// Database operations using localStorage
import { User } from './auth';

// Outfit Card
export interface OutfitCard {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  comments: Comment[];
  instagramUrl?: string;
  estimatedRevenue: number;
  productIds: string[];
  createdAt: string;
}

// Product
export interface Product {
  id: string;
  sellerId: string;
  sellerUsername: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  createdAt: string;
}

// Order
export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    zipCode: string;
  };
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Comment
export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

// Closet Item (existing type, enhanced)
export interface ClosetItem {
  id: string;
  userId: string;
  productId?: string;
  name: string;
  brand: string;
  purchasePrice: number;
  purchaseDate: string;
  imageUrl: string;
  wearCount: number;
  autoRegistered: boolean;
  createdAt: string;
}

// Wear Record
export interface WearRecord {
  id: string;
  closetItemId: string;
  userId: string;
  wornAt: string;
  pointsEarned: number;
  createdAt: string;
}

// Keys
const OUTFITS_KEY = 'stylebank_outfits';
const PRODUCTS_KEY = 'stylebank_products';
const ORDERS_KEY = 'stylebank_orders';
const CLOSET_KEY = 'stylebank_closet';
const WEAR_RECORDS_KEY = 'stylebank_wear_records';
const LIKES_KEY = 'stylebank_likes';

// Helper functions
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ===== OUTFIT CARDS =====
export const getAllOutfits = (): OutfitCard[] => {
  const outfits = localStorage.getItem(OUTFITS_KEY);
  return outfits ? JSON.parse(outfits) : [];
};

export const getOutfitById = (id: string): OutfitCard | null => {
  const outfits = getAllOutfits();
  return outfits.find(o => o.id === id) || null;
};

export const getOutfitsByCreator = (creatorId: string): OutfitCard[] => {
  const outfits = getAllOutfits();
  return outfits.filter(o => o.creatorId === creatorId);
};

export const createOutfit = (outfit: Omit<OutfitCard, 'id' | 'likes' | 'comments' | 'createdAt'>): OutfitCard => {
  const outfits = getAllOutfits();
  const newOutfit: OutfitCard = {
    ...outfit,
    id: generateId('outfit'),
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  outfits.push(newOutfit);
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  return newOutfit;
};

export const updateOutfit = (id: string, updates: Partial<OutfitCard>): OutfitCard | null => {
  const outfits = getAllOutfits();
  const index = outfits.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  outfits[index] = { ...outfits[index], ...updates };
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  return outfits[index];
};

export const deleteOutfit = (id: string): boolean => {
  const outfits = getAllOutfits();
  const filtered = outfits.filter(o => o.id !== id);
  if (filtered.length === outfits.length) return false;
  
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(filtered));
  return true;
};

export const toggleLike = (outfitId: string, userId: string): { liked: boolean; likes: number } => {
  const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
  const key = `${outfitId}_${userId}`;
  const isLiked = likes[key] || false;
  
  likes[key] = !isLiked;
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  
  const outfits = getAllOutfits();
  const outfit = outfits.find(o => o.id === outfitId);
  if (outfit) {
    outfit.likes += isLiked ? -1 : 1;
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
    return { liked: !isLiked, likes: outfit.likes };
  }
  
  return { liked: !isLiked, likes: 0 };
};

export const addComment = (outfitId: string, userId: string, username: string, content: string): Comment | null => {
  const outfits = getAllOutfits();
  const outfit = outfits.find(o => o.id === outfitId);
  if (!outfit) return null;
  
  const comment: Comment = {
    id: generateId('comment'),
    userId,
    username,
    content,
    createdAt: new Date().toISOString()
  };
  
  outfit.comments.push(comment);
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  return comment;
};

// ===== PRODUCTS =====
export const getAllProducts = (): Product[] => {
  const products = localStorage.getItem(PRODUCTS_KEY);
  return products ? JSON.parse(products) : [];
};

export const getProductById = (id: string): Product | null => {
  const products = getAllProducts();
  return products.find(p => p.id === id) || null;
};

export const getProductsBySeller = (sellerId: string): Product[] => {
  const products = getAllProducts();
  return products.filter(p => p.sellerId === sellerId);
};

export const createProduct = (product: Omit<Product, 'id' | 'createdAt'>): Product => {
  const products = getAllProducts();
  const newProduct: Product = {
    ...product,
    id: generateId('product'),
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getAllProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getAllProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return true;
};

// ===== ORDERS =====
export const getAllOrders = (): Order[] => {
  const orders = localStorage.getItem(ORDERS_KEY);
  return orders ? JSON.parse(orders) : [];
};

export const getOrdersByUser = (userId: string): Order[] => {
  const orders = getAllOrders();
  return orders.filter(o => o.userId === userId);
};

export const getOrdersBySeller = (sellerId: string): Order[] => {
  const orders = getAllOrders();
  return orders.filter(o => o.sellerId === sellerId);
};

export const createOrder = (order: Omit<Order, 'id' | 'createdAt'>): Order => {
  const orders = getAllOrders();
  const newOrder: Order = {
    ...order,
    id: generateId('order'),
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  
  // Update product stock
  order.items.forEach(item => {
    const product = getProductById(item.productId);
    if (product) {
      updateProduct(product.id, { stock: product.stock - item.quantity });
    }
  });
  
  return newOrder;
};

export const updateOrderStatus = (id: string, status: Order['status']): Order | null => {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  orders[index].status = status;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return orders[index];
};

// ===== CLOSET =====
export const getClosetByUser = (userId: string): ClosetItem[] => {
  const closet = localStorage.getItem(CLOSET_KEY);
  const items: ClosetItem[] = closet ? JSON.parse(closet) : [];
  return items.filter(i => i.userId === userId);
};

export const addToCloset = (item: Omit<ClosetItem, 'id' | 'wearCount' | 'createdAt'>): ClosetItem => {
  const closet = localStorage.getItem(CLOSET_KEY);
  const items: ClosetItem[] = closet ? JSON.parse(closet) : [];
  
  const newItem: ClosetItem = {
    ...item,
    id: generateId('closet'),
    wearCount: 0,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  localStorage.setItem(CLOSET_KEY, JSON.stringify(items));
  return newItem;
};

export const addWearRecord = (closetItemId: string, userId: string): WearRecord | null => {
  const closet = localStorage.getItem(CLOSET_KEY);
  const items: ClosetItem[] = closet ? JSON.parse(closet) : [];
  const item = items.find(i => i.id === closetItemId);
  
  if (!item) return null;
  
  // Increment wear count
  item.wearCount += 1;
  localStorage.setItem(CLOSET_KEY, JSON.stringify(items));
  
  // Create wear record
  const records = localStorage.getItem(WEAR_RECORDS_KEY);
  const wearRecords: WearRecord[] = records ? JSON.parse(records) : [];
  
  const newRecord: WearRecord = {
    id: generateId('wear'),
    closetItemId,
    userId,
    wornAt: new Date().toISOString(),
    pointsEarned: 10,
    createdAt: new Date().toISOString()
  };
  
  wearRecords.push(newRecord);
  localStorage.setItem(WEAR_RECORDS_KEY, JSON.stringify(wearRecords));
  
  return newRecord;
};