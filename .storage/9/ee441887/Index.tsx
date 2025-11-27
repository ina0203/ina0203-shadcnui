import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserStats, getClothingItems } from '@/lib/storage';
import { UserStats, ClothingItem } from '@/types';
import { TrendingUp, Wallet, Star, Package, Plus, Image as ImageIcon } from 'lucide-react';

export default function Index() {
  const [stats, setStats] = useState<UserStats>({
    totalItems: 0,
    totalSpending: 0,
    totalPoints: 0,
    averageUtilization: 0,
  });
  const [recentWears, setRecentWears] = useState<Array<{ item: ClothingItem; date: string }>>([]);

  useEffect(() => {
    const loadedStats = getUserStats();
    setStats(loadedStats);

    // 최근 착용 기록 가져오기
    const items = getClothingItems();
    const allWears: Array<{ item: ClothingItem; date: string }> = [];
    
    items.forEach(item => {
      item.wearRecords.forEach(record => {
        allWears.push({ item, date: record.date });
      });
    });

    // 날짜순 정렬 후 최근 5개만
    allWears.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentWears(allWears.slice(0, 5));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          대시보드
        </h1>
        <p className="text-gray-600 mt-2">나의 패션 활동을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 아이템</CardTitle>
            <Package className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems}개</div>
            <p className="text-xs opacity-80 mt-1">내 옷장의 아이템</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 지출액</CardTitle>
            <Wallet className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalSpending)}원</div>
            <p className="text-xs opacity-80 mt-1">누적 구매 금액</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 활용률</CardTitle>
            <TrendingUp className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageUtilization.toFixed(1)}%</div>
            <p className="text-xs opacity-80 mt-1">옷장 활용도</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">적립 포인트</CardTitle>
            <Star className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalPoints)}P</div>
            <p className="text-xs opacity-80 mt-1">입을수록 적립</p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/outfit-bank">
              <Button className="w-full h-24 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span>코디 카드 만들기</span>
                </div>
              </Button>
            </Link>
            <Link to="/closet">
              <Button className="w-full h-24 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-6 h-6" />
                  <span>옷 아이템 등록</span>
                </div>
              </Button>
            </Link>
            <Link to="/resale">
              <Button className="w-full h-24 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>리셀 가격 확인</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 최근 착용 기록 */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>최근 착용 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWears.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 착용 기록이 없습니다</p>
              <p className="text-sm mt-2">옷장에서 착용 기록을 추가해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWears.map((wear, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {wear.item.imageUrl ? (
                      <img src={wear.item.imageUrl} alt={wear.item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{wear.item.name}</h3>
                    <p className="text-sm text-gray-600">{wear.item.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(wear.date).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-xs text-green-600 font-medium">+100P</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}