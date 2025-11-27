import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClosetByUser, getOrdersByUser, ClosetItem } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Shirt, ShoppingBag, Crown, Star, Award } from 'lucide-react';

export default function MyPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    totalOrders: 0,
    totalSpent: 0,
    topItems: [] as ClosetItem[],
    monthlySpending: [] as { month: string; amount: number }[],
  });

  useEffect(() => {
    if (user) {
      const items = getClosetByUser(user.id);
      const orders = getOrdersByUser(user.id);

      const totalValue = items.reduce((sum, item) => sum + item.purchasePrice, 0);
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Top 5 most worn items
      const topItems = [...items]
        .sort((a, b) => b.utilizationRate - a.utilizationRate)
        .slice(0, 5);

      // Monthly spending (last 6 months)
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          return orderMonth === monthKey;
        });

        const amount = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        return {
          month: date.toLocaleDateString('ko-KR', { month: 'short' }),
          amount,
        };
      }).reverse();

      setStats({
        totalItems: items.length,
        totalValue,
        totalOrders: orders.length,
        totalSpent,
        topItems,
        monthlySpending: monthlyData,
      });
    }
  }, [user]);

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator': return 'from-pink-500 to-purple-600';
      case 'seller': return 'from-blue-500 to-cyan-600';
      case 'admin': return 'from-red-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'creator': return '크리에이터';
      case 'seller': return '셀러';
      case 'admin': return '관리자';
      default: return '일반 회원';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="border-none shadow-2xl overflow-hidden">
          <div className={`h-32 bg-gradient-to-r ${getRoleColor(user.role)}`}></div>
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
              <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(user.role)} text-white text-4xl font-bold`}>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                  <Badge className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white border-none px-3 py-1`}>
                    <Crown className="w-3 h-3 mr-1" />
                    {getRoleName(user.role)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-lg">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">총 포인트</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(user.totalPoints)}P</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">옷장 아이템</CardTitle>
              <Shirt className="h-5 w-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-900">{stats.totalItems}개</div>
              <p className="text-xs text-pink-600 mt-1">총 가치: ₩{formatCurrency(stats.totalValue)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">총 주문</CardTitle>
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalOrders}건</div>
              <p className="text-xs text-blue-600 mt-1">총 지출: ₩{formatCurrency(stats.totalSpent)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">평균 활용률</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.totalItems > 0
                  ? Math.round(
                      stats.topItems.reduce((sum, item) => sum + item.utilizationRate, 0) / 
                      Math.min(stats.topItems.length, 5)
                    )
                  : 0}%
              </div>
              <p className="text-xs text-purple-600 mt-1">상위 5개 평균</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">레벨</CardTitle>
              <Award className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {Math.floor(user.totalPoints / 1000) + 1}
              </div>
              <p className="text-xs text-amber-600 mt-1">다음 레벨까지 {1000 - (user.totalPoints % 1000)}P</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Items */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              활용률 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.topItems.length === 0 ? (
              <div className="text-center py-8">
                <Shirt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">아직 등록된 아이템이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-all border border-purple-100"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-yellow-400 to-yellow-500' :
                      index === 1 ? 'from-gray-300 to-gray-400' :
                      index === 2 ? 'from-orange-400 to-orange-500' :
                      'from-purple-400 to-purple-500'
                    } text-white font-bold shadow-lg`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        {item.utilizationRate}%
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{item.wearCount}회 착용</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Chart */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              월별 지출 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.monthlySpending.map((data, index) => {
                const maxAmount = Math.max(...stats.monthlySpending.map(d => d.amount), 1);
                const percentage = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{data.month}</span>
                      <span className="font-bold text-blue-600">₩{formatCurrency(data.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all shadow-sm flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs text-white font-bold">{Math.round(percentage)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Section */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              나의 업적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm font-semibold text-gray-900">첫 아이템</p>
                <p className="text-xs text-gray-600 mt-1">{stats.totalItems > 0 ? '달성' : '미달성'}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">👕</div>
                <p className="text-sm font-semibold text-gray-900">옷장 마스터</p>
                <p className="text-xs text-gray-600 mt-1">{stats.totalItems >= 10 ? '달성' : `${stats.totalItems}/10`}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm font-semibold text-gray-900">포인트 부자</p>
                <p className="text-xs text-gray-600 mt-1">{user.totalPoints >= 1000 ? '달성' : `${user.totalPoints}/1000`}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-sm font-semibold text-gray-900">활용 달인</p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.topItems.some(item => item.utilizationRate >= 80) ? '달성' : '미달성'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}