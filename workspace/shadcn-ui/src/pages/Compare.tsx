import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Users, ShoppingBag, Zap, Award } from 'lucide-react';

interface CompareProduct {
  id: string;
  name: string;
  seller: string;
  price: number;
  rating: number;
  reviews: number;
  sales: number;
  imageUrl: string;
}

export default function Compare() {
  const [products] = useState<CompareProduct[]>([
    {
      id: '1',
      name: '베이직 화이트 티셔츠',
      seller: 'TrendyShop',
      price: 19900,
      rating: 4.8,
      reviews: 342,
      sales: 1240,
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=tshirt1',
    },
    {
      id: '2',
      name: '프리미엄 화이트 티',
      seller: 'LuxuryStyle',
      price: 45000,
      rating: 4.9,
      reviews: 156,
      sales: 680,
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=tshirt2',
    },
    {
      id: '3',
      name: '오버핏 화이트 티셔츠',
      seller: 'StreetWear',
      price: 28000,
      rating: 4.7,
      reviews: 523,
      sales: 1890,
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=tshirt3',
    },
  ]);

  const maxPrice = Math.max(...products.map(p => p.price));
  const maxRating = 5;
  const maxReviews = Math.max(...products.map(p => p.reviews));
  const maxSales = Math.max(...products.map(p => p.sales));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getBestBadge = (product: CompareProduct, metric: 'price' | 'rating' | 'reviews' | 'sales') => {
    let isBest = false;
    switch (metric) {
      case 'price':
        isBest = product.price === Math.min(...products.map(p => p.price));
        break;
      case 'rating':
        isBest = product.rating === Math.max(...products.map(p => p.rating));
        break;
      case 'reviews':
        isBest = product.reviews === maxReviews;
        break;
      case 'sales':
        isBest = product.sales === maxSales;
        break;
    }
    return isBest ? (
      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none ml-2">
        <Award className="w-3 h-3 mr-1" />
        BEST
      </Badge>
    ) : null;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            HOT 아이템 비교
          </h1>
          <p className="text-muted-foreground text-lg">인기 상품을 한눈에 비교하고 최적의 선택을 하세요</p>
        </div>

        {/* Comparison Category */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              비교 카테고리: 화이트 티셔츠
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Products Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`border-none shadow-xl hover:shadow-2xl transition-all ${
                index === 1 ? 'md:scale-105 ring-4 ring-purple-200' : ''
              }`}
            >
              {index === 1 && (
                <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-32 h-32 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-contain" />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.seller}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">가격</span>
                    {getBestBadge(product, 'price')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">₩{formatCurrency(product.price)}</span>
                  </div>
                  <Progress value={(product.price / maxPrice) * 100} className="h-2" />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">평점</span>
                    {getBestBadge(product, 'rating')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-xl font-bold">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">/ 5.0</span>
                  </div>
                  <Progress value={(product.rating / maxRating) * 100} className="h-2" />
                </div>

                {/* Reviews */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">리뷰 수</span>
                    {getBestBadge(product, 'reviews')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-xl font-bold">{product.reviews}</span>
                    <span className="text-sm text-muted-foreground">개</span>
                  </div>
                  <Progress value={(product.reviews / maxReviews) * 100} className="h-2" />
                </div>

                {/* Sales */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">판매량</span>
                    {getBestBadge(product, 'sales')}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="text-xl font-bold">{product.sales}</span>
                    <span className="text-sm text-muted-foreground">개</span>
                  </div>
                  <Progress value={(product.sales / maxSales) * 100} className="h-2" />
                </div>

                {/* Action Button */}
                <Button
                  className={`w-full ${
                    index === 1
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  } shadow-lg`}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  구매하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Summary */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              비교 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2">💰 가성비 최고</p>
                <p className="text-lg font-bold text-green-600">{products[0].name}</p>
                <p className="text-sm text-muted-foreground">가장 저렴한 가격으로 좋은 품질</p>
              </div>
              <div className="p-4 rounded-xl bg-white border-2 border-yellow-200">
                <p className="text-sm text-gray-600 mb-2">⭐ 평점 최고</p>
                <p className="text-lg font-bold text-yellow-600">{products[1].name}</p>
                <p className="text-sm text-muted-foreground">사용자 만족도가 가장 높음</p>
              </div>
              <div className="p-4 rounded-xl bg-white border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">💬 리뷰 최다</p>
                <p className="text-lg font-bold text-blue-600">{products[2].name}</p>
                <p className="text-sm text-muted-foreground">가장 많은 사용자 후기</p>
              </div>
              <div className="p-4 rounded-xl bg-white border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">🔥 판매 1위</p>
                <p className="text-lg font-bold text-purple-600">{products[2].name}</p>
                <p className="text-sm text-muted-foreground">가장 많이 팔린 인기 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}