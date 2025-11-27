import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClosetByUser, ClosetItem } from '@/lib/database';
import { calculateResalePrice } from '@/lib/calculations';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Sparkles } from 'lucide-react';

export default function Resale() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [totalResaleValue, setTotalResaleValue] = useState(0);

  useEffect(() => {
    if (user) {
      const loadedItems = getClosetByUser(user.id);
      setItems(loadedItems);
      
      const total = loadedItems.reduce((sum, item) => {
        return sum + calculateResalePrice(item.purchasePrice, item.purchaseDate, item.wearCount);
      }, 0);
      setTotalResaleValue(total);
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getDepreciationRate = (purchasePrice: number, resalePrice: number) => {
    return Math.round(((purchasePrice - resalePrice) / purchasePrice) * 100);
  };

  const getDepreciationColor = (rate: number) => {
    if (rate <= 20) return 'from-green-500 to-emerald-500';
    if (rate <= 40) return 'from-blue-500 to-cyan-500';
    if (rate <= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            리셀 센터
          </h1>
          <p className="text-muted-foreground text-lg">아이템의 리셀 가치를 확인하고 관리하세요</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">총 리셀 가치</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">₩{formatCurrency(totalResaleValue)}</div>
              <p className="text-xs text-green-600 mt-1">현재 예상 판매가</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">등록 아이템</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{items.length}개</div>
              <p className="text-xs text-blue-600 mt-1">리셀 가능 아이템</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">평균 감가율</CardTitle>
              <TrendingDown className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {items.length > 0
                  ? Math.round(
                      items.reduce((sum, item) => {
                        const resalePrice = calculateResalePrice(item.purchasePrice, item.purchaseDate, item.wearCount);
                        return sum + getDepreciationRate(item.purchasePrice, resalePrice);
                      }, 0) / items.length
                    )
                  : 0}%
              </div>
              <p className="text-xs text-purple-600 mt-1">전체 평균</p>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                <Package className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-2xl font-bold mb-2 text-gray-800">아직 등록된 아이템이 없습니다</p>
              <p className="text-muted-foreground text-lg">옷장에서 아이템을 등록해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              아이템별 리셀 가치
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const resalePrice = calculateResalePrice(item.purchasePrice, item.purchaseDate, item.wearCount);
                const depreciationRate = getDepreciationRate(item.purchasePrice, resalePrice);
                const profit = resalePrice - item.purchasePrice;

                return (
                  <Card key={item.id} className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all group">
                    <div className="relative h-48 bg-gradient-to-br from-pink-200 to-purple-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-purple-600 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className={`bg-gradient-to-r ${getDepreciationColor(depreciationRate)} text-white font-bold px-3 py-1 shadow-lg`}>
                          -{depreciationRate}%
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                      <CardTitle>
                        <div className="text-lg font-bold text-gray-900">{item.name}</div>
                        <div className="text-sm font-normal text-gray-600 mt-1">{item.brand}</div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-700 mb-1">구매가</p>
                          <p className="font-bold text-blue-900 text-sm">₩{formatCurrency(item.purchasePrice)}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700 mb-1">리셀가</p>
                          <p className="font-bold text-green-900 text-sm">₩{formatCurrency(resalePrice)}</p>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border-2 ${
                        profit >= 0 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {profit >= 0 ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {profit >= 0 ? '이익' : '손실'}
                            </span>
                          </div>
                          <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}₩{formatCurrency(Math.abs(profit))}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">감가율</span>
                          <span className="font-bold text-purple-600">{depreciationRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getDepreciationColor(depreciationRate)} h-3 rounded-full transition-all shadow-sm`}
                            style={{ width: `${Math.min(depreciationRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>착용:</span>
                          <span className="font-semibold text-gray-900">{item.wearCount}회</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>활용률:</span>
                          <span className="font-semibold text-gray-900">{item.utilizationRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}