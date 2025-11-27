import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStats, getClothingItems } from '@/lib/storage';
import { calculateResalePrice } from '@/lib/calculations';
import { UserStats, ClothingItem } from '@/types';
import { Star, TrendingUp, Award, Calendar } from 'lucide-react';

export default function MyPage() {
  const [stats, setStats] = useState<UserStats>({
    totalItems: 0,
    totalSpending: 0,
    totalPoints: 0,
    averageUtilization: 0,
  });
  const [topItems, setTopItems] = useState<ClothingItem[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<{ month: string; amount: number }[]>([]);
  const [totalResaleValue, setTotalResaleValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedStats = getUserStats();
    setStats(loadedStats);

    const items = getClothingItems();

    // 활용률 높은 순으로 정렬
    const sortedByUtilization = [...items].sort((a, b) => b.utilizationRate - a.utilizationRate);
    setTopItems(sortedByUtilization.slice(0, 5));

    // 월별 지출 계산
    const spendingByMonth: { [key: string]: number } = {};
    items.forEach(item => {
      const date = new Date(item.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + item.purchasePrice;
    });

    const monthlyData = Object.entries(spendingByMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    setMonthlySpending(monthlyData);

    // 총 리셀 가치 계산
    const totalResale = items.reduce((sum, item) => sum + calculateResalePrice(item), 0);
    setTotalResaleValue(totalResale);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${year}년 ${month}월`;
  };

  const getMaxSpending = () => {
    return Math.max(...monthlySpending.map(m => m.amount), 1);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          마이페이지
        </h1>
        <p className="text-gray-600 mt-2">나의 패션 활동 분석</p>
      </div>

      {/* 포인트 카드 */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6" />
            <span>총 적립 포인트</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold mb-2">{formatCurrency(stats.totalPoints)}P</div>
          <p className="text-sm opacity-90">입을수록 쌓이는 포인트!</p>
        </CardContent>
      </Card>

      {/* 옷장 가치 분석 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>옷장 가치 분석</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">총 구매가</p>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(stats.totalSpending)}원</p>
              <p className="text-xs text-blue-600 mt-1">내가 투자한 금액</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-green-700 mb-2">현재 리셀 가치</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(totalResaleValue)}원</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalSpending > 0 
                  ? `가치 보존율 ${((totalResaleValue / stats.totalSpending) * 100).toFixed(1)}%`
                  : '아이템을 등록해보세요'}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700">
              💡 <strong>Tip:</strong> 착용 횟수를 늘리면 포인트가 쌓이고, 적절한 관리로 리셀 가치를 높게 유지할 수 있어요!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 월별 지출 분석 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>월별 지출 분석</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySpending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 지출 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlySpending.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{formatMonth(data.month)}</span>
                    <span className="font-bold text-purple-600">{formatCurrency(data.amount)}원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${(data.amount / getMaxSpending()) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 활용률 높은 아이템 순위 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>활용률 TOP 5</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 등록된 아이템이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">👕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-xs text-gray-500 mt-1">착용 {item.wearCount}회</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-purple-600">{item.utilizationRate}%</div>
                    <p className="text-xs text-gray-600">활용률</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 요약 */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-700">📊 나의 패션 통계</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.totalItems}</p>
            <p className="text-sm text-gray-600 mt-1">총 아이템</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.averageUtilization.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">평균 활용률</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalItems > 0 ? Math.round(stats.totalSpending / stats.totalItems / 1000) : 0}K
            </p>
            <p className="text-sm text-gray-600 mt-1">평균 구매가</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {getClothingItems().reduce((sum, item) => sum + item.wearCount, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">총 착용 횟수</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}