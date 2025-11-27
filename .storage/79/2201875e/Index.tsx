import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getClosetByUser, getOrdersByUser, getOutfitCards } from '@/lib/database';
import { Heart, ShoppingBag, Shirt, TrendingUp, Sparkles, ArrowRight, Instagram } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalOrders: 0,
    totalOutfits: 0,
    points: 0
  });

  useEffect(() => {
    if (user) {
      const closetItems = getClosetByUser(user.id);
      const orders = getOrdersByUser(user.id);
      const outfits = user.role === 'creator' ? getOutfitCards().filter(o => o.creatorId === user.id) : [];
      
      setStats({
        totalItems: closetItems.length,
        totalOrders: orders.length,
        totalOutfits: outfits.length,
        points: user.totalPoints
      });
    }
  }, [user]);

  if (!user) return null;

  const quickActions = [
    {
      title: 'Outfit Feed',
      description: '크리에이터들의 멋진 스타일을 둘러보세요',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      path: '/feed'
    },
    ...(user.role === 'creator' ? [{
      title: 'Outfit 만들기',
      description: '새로운 Outfit 카드를 제작하고 공유하세요',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      path: '/outfit-bank'
    }] : []),
    {
      title: '내 옷장',
      description: '옷장을 관리하고 착용 기록을 남기세요',
      icon: Shirt,
      color: 'from-blue-500 to-cyan-500',
      path: '/closet'
    },
    {
      title: '리셀 센터',
      description: '아이템의 리셀 가치를 확인하세요',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      path: '/resale'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20 ring-4 ring-white/50">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">안녕하세요, {user.username}님! 👋</h2>
              <p className="text-white/90 text-lg">
                {user.role === 'creator' && '크리에이터로서 멋진 Outfit을 공유해보세요!'}
                {user.role === 'seller' && '셀러로서 상품을 등록하고 판매해보세요!'}
                {user.role === 'user' && '다양한 Outfit을 둘러보고 쇼핑을 즐겨보세요!'}
                {user.role === 'admin' && '관리자 권한으로 플랫폼을 관리하세요!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">내 옷장</CardTitle>
            <Shirt className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900">{stats.totalItems}</div>
            <p className="text-xs text-pink-600 mt-1">등록된 아이템</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">주문 내역</CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.totalOrders}</div>
            <p className="text-xs text-blue-600 mt-1">총 주문 수</p>
          </CardContent>
        </Card>

        {user.role === 'creator' && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">내 Outfit</CardTitle>
              <Heart className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.totalOutfits}</div>
              <p className="text-xs text-purple-600 mt-1">제작한 콘텐츠</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">포인트</CardTitle>
            <Sparkles className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{stats.points}P</div>
            <p className="text-xs text-amber-600 mt-1">누적 포인트</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          빠른 시작
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.path}
                className="border-none shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate(action.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${action.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-xl mt-4">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}