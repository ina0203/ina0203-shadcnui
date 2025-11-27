import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getClosetByUser, getOrdersByUser, getOutfitCards } from '@/lib/database';
import { Heart, ShoppingBag, Shirt, TrendingUp, Sparkles, ArrowRight, Instagram, Store, Users, Zap } from 'lucide-react';

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

  const exploreActions = [
    {
      title: '트렌디 셀러 발견',
      description: '믿을 수 있는 셀러들을 비교하고 선택하세요',
      icon: Store,
      color: 'from-blue-500 via-purple-500 to-pink-500',
      bgColor: 'from-blue-50 to-purple-50',
      path: '/sellers',
      stats: '4+ 검증된 셀러'
    },
    {
      title: '인기 크리에이터',
      description: '트렌디한 스타일을 선도하는 크리에이터들',
      icon: Users,
      color: 'from-pink-500 via-purple-500 to-blue-500',
      bgColor: 'from-pink-50 to-purple-50',
      path: '/creators',
      stats: '4+ 인기 크리에이터'
    },
    {
      title: 'HOT 아이템 비교',
      description: '인기 상품을 한눈에 비교하고 최적의 선택',
      icon: Zap,
      color: 'from-green-500 via-blue-500 to-purple-500',
      bgColor: 'from-green-50 to-blue-50',
      path: '/compare',
      stats: '실시간 비교 분석'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section - Enhanced with larger avatar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -ml-36 -mb-36"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Large Avatar with glow effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <Avatar className="relative h-32 w-32 md:h-40 md:w-40 ring-4 ring-white/50 shadow-2xl">
                <AvatarImage 
                  src={user.role === 'user' ? '/assets/user-profile-avatar.jpg' : user.avatarUrl} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 text-white text-4xl md:text-5xl font-bold">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Decorative sparkle */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full p-2 shadow-lg animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                {user.role === 'creator' && '✨ 크리에이터'}
                {user.role === 'seller' && '🏪 셀러'}
                {user.role === 'user' && '👤 일반 사용자'}
                {user.role === 'admin' && '⚡ 관리자'}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                안녕하세요, {user.username}님! 👋
              </h2>
              <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl">
                {user.role === 'creator' && '크리에이터로서 멋진 Outfit을 공유하고 수익을 창출해보세요!'}
                {user.role === 'seller' && '셀러로서 트렌디한 상품을 등록하고 판매를 시작해보세요!'}
                {user.role === 'user' && '다양한 스타일의 Outfit을 발견하고 나만의 패션을 완성해보세요!'}
                {user.role === 'admin' && '관리자 권한으로 플랫폼을 효율적으로 관리하세요!'}
              </p>
              
              {/* Quick stats in hero */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <div className="text-sm text-white/90">내 옷장</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                  <div className="text-2xl font-bold">{stats.points}P</div>
                  <div className="text-sm text-white/90">포인트</div>
                </div>
                {user.role === 'creator' && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                    <div className="text-2xl font-bold">{stats.totalOutfits}</div>
                    <div className="text-sm text-white/90">Outfit</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - More compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => navigate('/closet')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">내 옷장</CardTitle>
            <Shirt className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900">{stats.totalItems}</div>
            <p className="text-xs text-pink-600 mt-1">등록된 아이템</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
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
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => navigate('/feed')}>
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

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
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

      {/* Explore Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            탐색하기
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.path}
                className={`border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden bg-gradient-to-br ${action.bgColor}`}
                onClick={() => navigate(action.path)}
              >
                <div className={`h-3 bg-gradient-to-r ${action.color}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.color} shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                  </div>
                  <CardTitle className="text-xl mb-2">{action.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${action.color} text-white text-xs font-semibold`}>
                    {action.stats}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
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