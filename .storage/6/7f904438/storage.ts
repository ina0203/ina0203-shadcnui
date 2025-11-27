import { OutfitCard, ClothingItem, UserStats } from '@/types';

const OUTFIT_CARDS_KEY = 'outfitCards';
const CLOTHING_ITEMS_KEY = 'clothingItems';
const USER_STATS_KEY = 'userStats';

// Outfit Cards
export const getOutfitCards = (): OutfitCard[] => {
  const data = localStorage.getItem(OUTFIT_CARDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOutfitCard = (card: OutfitCard): void => {
  const cards = getOutfitCards();
  cards.push(card);
  localStorage.setItem(OUTFIT_CARDS_KEY, JSON.stringify(cards));
};

export const updateOutfitCard = (id: string, updatedCard: OutfitCard): void => {
  const cards = getOutfitCards();
  const index = cards.findIndex(c => c.id === id);
  if (index !== -1) {
    cards[index] = updatedCard;
    localStorage.setItem(OUTFIT_CARDS_KEY, JSON.stringify(cards));
  }
};

export const deleteOutfitCard = (id: string): void => {
  const cards = getOutfitCards().filter(c => c.id !== id);
  localStorage.setItem(OUTFIT_CARDS_KEY, JSON.stringify(cards));
};

// Clothing Items
export const getClothingItems = (): ClothingItem[] => {
  const data = localStorage.getItem(CLOTHING_ITEMS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveClothingItem = (item: ClothingItem): void => {
  const items = getClothingItems();
  items.push(item);
  localStorage.setItem(CLOTHING_ITEMS_KEY, JSON.stringify(items));
  updateUserStats();
};

export const updateClothingItem = (id: string, updatedItem: ClothingItem): void => {
  const items = getClothingItems();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = updatedItem;
    localStorage.setItem(CLOTHING_ITEMS_KEY, JSON.stringify(items));
    updateUserStats();
  }
};

export const deleteClothingItem = (id: string): void => {
  const items = getClothingItems().filter(i => i.id !== id);
  localStorage.setItem(CLOTHING_ITEMS_KEY, JSON.stringify(items));
  updateUserStats();
};

// User Stats
export const getUserStats = (): UserStats => {
  const data = localStorage.getItem(USER_STATS_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    totalItems: 0,
    totalSpending: 0,
    totalPoints: 0,
    averageUtilization: 0,
  };
};

export const updateUserStats = (): void => {
  const items = getClothingItems();
  const totalItems = items.length;
  const totalSpending = items.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const averageUtilization = totalItems > 0
    ? items.reduce((sum, item) => sum + item.utilizationRate, 0) / totalItems
    : 0;

  const stats: UserStats = {
    totalItems,
    totalSpending,
    totalPoints,
    averageUtilization,
  };

  localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
};