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

export interface Seller {
  id: string;
  username: string;
  avatarUrl?: string;
  bio: string;
  productCount: number;
  averagePrice: number;
  rating: number;
  followers: number;
  totalSales: number;
  createdAt: string;
}

export interface Creator {
  id: string;
  username: string;
  avatarUrl?: string;
  bio: string;
  outfitCount: number;
  totalLikes: number;
  totalRevenue: number;
  followers: number;
  followedBy: string[];
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

export const addPointsToUser = (userId: string, points: number): void => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.totalPoints += points;
    saveUsers(users);
  }
};

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

export const toggleLike = (outfitId: string, userId: string): boolean => {
  const cards = getOutfitCards();
  const card = cards.find(c => c.id === outfitId);
  if (card) {
    const likedIndex = card.likedBy.indexOf(userId);
    let isLiked = false;
    
    if (likedIndex > -1) {
      // Unlike: remove like and deduct points from creator
      card.likedBy.splice(likedIndex, 1);
      card.likes--;
      addPointsToUser(card.creatorId, -10);
    } else {
      // Like: add like and award points to creator
      card.likedBy.push(userId);
      card.likes++;
      addPointsToUser(card.creatorId, 10);
      isLiked = true;
    }
    
    saveOutfitCards(cards);
    return isLiked;
  }
  return false;
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

// Sellers
export const getSellers = (): Seller[] => getFromStorage<Seller>('sellers');
export const saveSellers = (sellers: Seller[]): void => saveToStorage('sellers', sellers);

// Creators
export const getCreators = (): Creator[] => getFromStorage<Creator>('creators');
export const saveCreators = (creators: Creator[]): void => saveToStorage('creators', creators);

export const toggleFollowCreator = (creatorId: string, userId: string): void => {
  const creators = getCreators();
  const creator = creators.find(c => c.id === creatorId);
  if (creator) {
    const followedIndex = creator.followedBy.indexOf(userId);
    if (followedIndex > -1) {
      creator.followedBy.splice(followedIndex, 1);
      creator.followers--;
    } else {
      creator.followedBy.push(userId);
      creator.followers++;
    }
    saveCreators(creators);
  }
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  // Initialize Outfit Cards
  if (getOutfitCards().length === 0) {
    const sampleCards: OutfitCard[] = [
      {
        id: uuidv4(),
        creatorId: 'creator-1',
        title: '데일리 캐주얼 룩',
        description: '편안하면서도 스타일리시한 일상 코디',
        imageUrl: '/assets/example-outfit-1_variant_4.jpg',
        instagramUrl: 'https://instagram.com/p/example1',
        products: [
          {
            id: uuidv4(),
            name: '베이지 오버사이즈 블레이저',
            brand: 'ZARA',
            price: 89000,
            imageUrl: '/assets/example-outfit-1_variant_5.jpg',
            affiliateLink: 'https://example.com/blazer',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: '화이트 베이직 티셔츠',
            brand: 'UNIQLO',
            price: 19900,
            imageUrl: '/assets/example-outfit-1_variant_6.jpg',
            affiliateLink: 'https://example.com/tshirt',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            name: '라이트 블루 데님 진',
            brand: "Levi's",
            price: 129000,
            imageUrl: '/assets/example-outfit-1_variant_7.jpg',
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

  // Initialize Closet Items with sample data
  if (getClosetItems().length === 0) {
    const sampleClosetItems: ClosetItem[] = [
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '블랙 레더 재킷',
        brand: 'ZARA',
        purchasePrice: 159000,
        purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        wearCount: 15,
        utilizationRate: 17,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '화이트 셔츠',
        brand: 'UNIQLO',
        purchasePrice: 29900,
        purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        wearCount: 28,
        utilizationRate: 47,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '블루 데님 진',
        brand: "Levi's",
        purchasePrice: 129000,
        purchaseDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        wearCount: 45,
        utilizationRate: 38,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '그레이 니트 스웨터',
        brand: 'H&M',
        purchasePrice: 49900,
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
        wearCount: 12,
        utilizationRate: 40,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '베이지 트렌치 코트',
        brand: 'MANGO',
        purchasePrice: 189000,
        purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        wearCount: 8,
        utilizationRate: 18,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: 'demo-user-1',
        name: '블랙 슬랙스',
        brand: 'COS',
        purchasePrice: 89000,
        purchaseDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        wearCount: 22,
        utilizationRate: 29,
        autoRegistered: false,
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    saveClosetItems(sampleClosetItems);
  }

  // Initialize Sellers
  if (getSellers().length === 0) {
    const sampleSellers: Seller[] = [
      {
        id: 'seller-1',
        username: 'TrendyShop',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TrendyShop',
        bio: '최신 트렌드 패션 아이템을 합리적인 가격에 제공합니다',
        productCount: 156,
        averagePrice: 45000,
        rating: 4.8,
        followers: 2340,
        totalSales: 8920000,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'seller-2',
        username: 'LuxuryStyle',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuxuryStyle',
        bio: '프리미엄 브랜드 정품만을 취급합니다',
        productCount: 89,
        averagePrice: 180000,
        rating: 4.9,
        followers: 5670,
        totalSales: 15600000,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'seller-3',
        username: 'StreetWear',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StreetWear',
        bio: '힙한 스트릿 패션의 모든 것',
        productCount: 234,
        averagePrice: 65000,
        rating: 4.7,
        followers: 3890,
        totalSales: 12300000,
        createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'seller-4',
        username: 'MinimalChic',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinimalChic',
        bio: '미니멀한 감성의 베이직 아이템',
        productCount: 112,
        averagePrice: 38000,
        rating: 4.6,
        followers: 1890,
        totalSales: 4200000,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    saveSellers(sampleSellers);
  }

  // Initialize Creators
  if (getCreators().length === 0) {
    const sampleCreators: Creator[] = [
      {
        id: 'creator-1',
        username: 'StyleIcon',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StyleIcon',
        bio: '일상 속 스타일링 팁을 공유합니다 ✨',
        outfitCount: 48,
        totalLikes: 12450,
        totalRevenue: 3200000,
        followers: 8900,
        followedBy: [],
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'creator-2',
        username: 'FashionGuru',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FashionGuru',
        bio: '트렌디한 OOTD와 패션 인사이트',
        outfitCount: 67,
        totalLikes: 18900,
        totalRevenue: 4800000,
        followers: 15600,
        followedBy: [],
        createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'creator-3',
        username: 'UrbanVibes',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UrbanVibes',
        bio: '도시적인 감성의 스트릿 패션',
        outfitCount: 35,
        totalLikes: 9200,
        totalRevenue: 2100000,
        followers: 6700,
        followedBy: [],
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'creator-4',
        username: 'ChicDaily',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChicDaily',
        bio: '심플하지만 세련된 데일리룩',
        outfitCount: 52,
        totalLikes: 14300,
        totalRevenue: 3600000,
        followers: 11200,
        followedBy: [],
        createdAt: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    saveCreators(sampleCreators);
  }
};