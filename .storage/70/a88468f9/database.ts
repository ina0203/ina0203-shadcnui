// localStorage를 사용한 간단한 데이터베이스
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'creator' | 'seller' | 'admin';
  totalPoints: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  createdAt: string;
}

export interface OutfitCard {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  imageUrl: string;
  instagramUrl?: string;
  products: Product[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  expectedRevenue: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface ClosetItem {
  id: string;
  userId: string;
  name: string;
  brand: string;
  purchasePrice: number;
  purchaseDate: string;
  imageUrl: string;
  wearCount: number;
  utilizationRate: number;
  autoRegistered: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  outfitId: string;
  products: Product[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Users
export const getUsers = (): User[] => getFromStorage<User>('users');
export const saveUsers = (users: User[]): void => saveToStorage('users', users);
export const getUserById = (id: string): User | undefined => getUsers().find(u => u.id === id);

// Outfit Cards
export const getOutfitCards = (): OutfitCard[] => getFromStorage<OutfitCard>('outfitCards');
export const saveOutfitCards = (cards: OutfitCard[]): void => saveToStorage('outfitCards', cards);
export const getOutfitCardById = (id: string): OutfitCard | undefined => getOutfitCards().find(c => c.id === id);

export const createOutfitCard = (card: Omit<OutfitCard, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>): OutfitCard => {
  const newCard: OutfitCard = {
    ...card,
    id: uuidv4(),
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  const cards = getOutfitCards();
  cards.push(newCard);
  saveOutfitCards(cards);
  return newCard;
};

export const toggleLike = (outfitId: string, userId: string): void => {
  const cards = getOutfitCards();
  const card = cards.find(c => c.id === outfitId);
  if (card) {
    const likedIndex = card.likedBy.indexOf(userId);
    if (likedIndex > -1) {
      card.likedBy.splice(likedIndex, 1);
      card.likes--;
    } else {
      card.likedBy.push(userId);
      card.likes++;
    }
    saveOutfitCards(cards);
  }
};

export const addComment = (outfitId: string, userId: string, username: string, content: string, avatarUrl?: string): void => {
  const cards = getOutfitCards();
  const card = cards.find(c => c.id === outfitId);
  if (card) {
    const newComment: Comment = {
      id: uuidv4(),
      userId,
      username,
      avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    };
    card.comments.push(newComment);
    saveOutfitCards(cards);
  }
};

export const deleteComment = (outfitId: string, commentId: string): void => {
  const cards = getOutfitCards();
  const card = cards.find(c => c.id === outfitId);
  if (card) {
    card.comments = card.comments.filter(c => c.id !== commentId);
    saveOutfitCards(cards);
  }
};

// Closet Items
export const getClosetItems = (): ClosetItem[] => getFromStorage<ClosetItem>('closetItems');
export const saveClosetItems = (items: ClosetItem[]): void => saveToStorage('closetItems', items);
export const getClosetByUser = (userId: string): ClosetItem[] => getClosetItems().filter(item => item.userId === userId);

export const addToCloset = (item: Omit<ClosetItem, 'id' | 'wearCount' | 'utilizationRate' | 'createdAt'>): void => {
  const items = getClosetItems();
  const newItem: ClosetItem = {
    ...item,
    id: uuidv4(),
    wearCount: 0,
    utilizationRate: 0,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveClosetItems(items);
};

export const addWearRecord = (itemId: string, userId: string): void => {
  const items = getClosetItems();
  const item = items.find(i => i.id === itemId && i.userId === userId);
  if (item) {
    item.wearCount++;
    const daysSincePurchase = Math.max(1, Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)));
    item.utilizationRate = Math.min(100, Math.round((item.wearCount / daysSincePurchase) * 100));
    saveClosetItems(items);
  }
};

// Orders
export const getOrders = (): Order[] => getFromStorage<Order>('orders');
export const saveOrders = (orders: Order[]): void => saveToStorage('orders', orders);
export const getOrdersByUser = (userId: string): Order[] => getOrders().filter(order => order.userId === userId);

export const createOrder = (order: Omit<Order, 'id' | 'createdAt'>): void => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  if (getOutfitCards().length === 0) {
    const sampleCards: OutfitCard[] = [
      {
        id: uuidv4(),
        creatorId: 'creator-1',
        title: '데일리 캐주얼 룩',
        description: '편안하면서도 스타일리시한 일상 코디',
        imageUrl: '/assets/example-outfit-1.jpg',
        instagramUrl: 'https://instagram.com/p/example1',
        products: [
          {
            id: uuidv4(),
            name: '베이지 오버사이즈 블레이저',
            brand: 'ZARA',
            price: 89000,
            imageUrl: '/assets/example-outfit-1_variant_1.jpg',
            affiliateLink: 'https://example.com/blazer',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: '화이트 베이직 티셔츠',
            brand: 'UNIQLO',
            price: 19900,
            imageUrl: '/assets/example-outfit-1_variant_2.jpg',
            affiliateLink: 'https://example.com/tshirt',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: '라이트 블루 데님 진',
            brand: 'Levi\'s',
            price: 129000,
            imageUrl: '/assets/example-outfit-1_variant_3.jpg',
            affiliateLink: 'https://example.com/jeans',
            createdAt: new Date().toISOString(),
          },
        ],
        likes: 42,
        likedBy: [],
        comments: [
          {
            id: uuidv4(),
            userId: 'user-1',
            username: 'FashionLover',
            content: '너무 예쁜 코디네요! 블레이저 어디서 구매하셨나요?',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: uuidv4(),
            userId: 'user-2',
            username: 'StyleQueen',
            content: '데일리로 입기 딱 좋을 것 같아요 👍',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        expectedRevenue: 23700,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    saveOutfitCards(sampleCards);
  }
};