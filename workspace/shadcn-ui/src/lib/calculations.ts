import { OutfitCard, ClothingItem } from '@/types';

// 아웃핏 카드 예상 수익 계산
// 수익 = (좋아요 × 10원) + (댓글 × 50원) + (상품 수 × 1000원)
export const calculateOutfitRevenue = (card: OutfitCard): number => {
  const likesRevenue = card.likes * 10;
  const commentsRevenue = card.comments * 50;
  const productsRevenue = card.products.length * 1000;
  return likesRevenue + commentsRevenue + productsRevenue;
};

// 리셀 추천가 계산
// 리셀가 = 구매가 × (100% - 감가율)
// 감가율 = 기본 50% - (착용 횟수 × 2%) - (경과 개월 × 1%)
export const calculateResalePrice = (item: ClothingItem): number => {
  const purchaseDate = new Date(item.purchaseDate);
  const today = new Date();
  const monthsElapsed = Math.floor(
    (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  let depreciationRate = 50; // 기본 50%
  depreciationRate -= item.wearCount * 2; // 착용 횟수당 2%
  depreciationRate -= monthsElapsed * 1; // 경과 개월당 1%

  // 감가율은 최소 10%, 최대 90%
  depreciationRate = Math.max(10, Math.min(90, depreciationRate));

  const resalePrice = item.purchasePrice * (1 - depreciationRate / 100);
  return Math.round(resalePrice);
};

// 활용률 계산
// 활용률 = (착용 횟수 / 경과 개월) × 10
// 예: 3개월 동안 6번 착용 = (6/3) × 10 = 20%
export const calculateUtilizationRate = (item: ClothingItem): number => {
  const purchaseDate = new Date(item.purchaseDate);
  const today = new Date();
  const monthsElapsed = Math.max(
    1,
    Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  const rate = (item.wearCount / monthsElapsed) * 10;
  return Math.min(100, Math.round(rate));
};

// 착용 포인트 계산 (착용 1회당 100포인트)
export const POINTS_PER_WEAR = 100;

export const calculatePoints = (wearCount: number): number => {
  return wearCount * POINTS_PER_WEAR;
};