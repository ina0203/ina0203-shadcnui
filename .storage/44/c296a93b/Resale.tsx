import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClothingItems } from '@/lib/storage';
import { calculateResalePrice } from '@/lib/calculations';
import { ClothingItem } from '@/types';
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';

export default function Resale() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [sortedItems, setSortedItems] = useState<Array<ClothingItem & { resalePrice: number; depreciation: number }>>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const loadedItems = getClothingItems();
    setItems(loadedItems);

    // 리셀 가격 계산 및 정렬
    const itemsWithResale = loadedItems.map(item => {
      const resalePrice = calculateResalePrice(item);
      const depreciation = ((item.purchasePrice - resalePrice) / item.purchasePrice) * 100;
      return { ...item, resalePrice, depreciation };
    });

    // 리셀 가격이 높은 순으로 정렬
    itemsWithResale.sort((a, b) => b.resalePrice - a.resalePrice);
    setSortedItems(itemsWithResale);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getTotalResaleValue = () => {
    return sortedItems.reduce((sum, item) => sum + item.resalePrice, 0);
  };

  const getTotalPurchaseValue = () => {
    return items.reduce((sum, item) => sum + item.purchasePrice, 0);
  };

  const getAverageDepreciation = () => {
    if (sortedItems.length === 0) return 0;
    return sortedItems.reduce((sum, item) => sum + item.depreciation, 0) / sortedItems.length;
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          리셀 센터
        </h1>
        <p className="text-gray-600 mt-2">내 옷장의 리셀 가치를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 구매가</CardTitle>
            <DollarSign className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(getTotalPurchaseValue())}원</div>
            <p className="text-xs opacity-80 mt-1">원래 투자 금액</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 리셀 가치</CardTitle>
            <TrendingUp className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(getTotalResaleValue())}원</div>
            <p className="text-xs opacity-80 mt-1">현재 예상 판매가</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 감가율</CardTitle>
            <TrendingDown className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getAverageDepreciation().toFixed(1)}%</div>
            <p className="text-xs opacity-80 mt-1">가치 하락률</p>
          </CardContent>
        </Card>
      </div>

      {/* 리셀 가능 아이템 목록 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>리셀 추천가 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">등록된 아이템이 없습니다</p>
              <p className="text-sm mt-2">옷장에서 아이템을 등록해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-purple-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              착용 {item.wearCount}회
                            </span>
                            <span className="text-gray-600">
                              구매일: {new Date(item.purchaseDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={
                              item.depreciation < 30
                                ? 'border-green-500 text-green-700 bg-green-50'
                                : item.depreciation < 60
                                ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                                : 'border-red-500 text-red-700 bg-red-50'
                            }
                          >
                            -{item.depreciation.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">구매가</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.purchasePrice)}원
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 mb-1">리셀 추천가</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.resalePrice)}원
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          💡 <strong>가격 산정 기준:</strong> 기본 감가율 50% - 착용 횟수({item.wearCount}회 × 2%) - 경과 개월({Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}개월 × 1%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 리셀 팁 */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-700">💡 리셀 팁</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>• 착용 횟수가 적을수록 높은 가격에 판매할 수 있어요</p>
          <p>• 구매 후 시간이 적게 지날수록 가치가 높아요</p>
          <p>• 깨끗한 상태와 정확한 설명으로 신뢰도를 높이세요</p>
          <p>• 시즌에 맞는 아이템은 더 빠르게 판매돼요</p>
        </CardContent>
      </Card>
    </div>
  );
}