import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getClosetByUser, getOrdersByUser, getAllOutfits } from '@/lib/database';
import { Heart, ShoppingBag, Shirt, TrendingUp, LogOut } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
      const outfits = user.role === 'creator' ? getAllOutfits().filter(o => o.creatorId === user.id) : [];
      
      setStats({
        totalItems: closetItems.length,
        totalOrders: orders.length,
        totalOutfits: outfits.length,
        points: user.totalPoints
      });
    }
  }, [user]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Style Bank
            </h1>
            <div className="flex items-center space-x-4">
              <Avatar className="cursor-pointer" onClick={() => navigate('/my-page')}>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">안녕하세요, {user.username}님! 👋</h2>
          <p className="text-muted-foreground">
            {user.role === 'creator' && '크리에이터로서 멋진 Outfit을 공유해보세요!'}
            {user.role === 'seller' && '셀러로서 상품을 등록하고 판매해보세요!'}
            {user.role === 'user' && '다양한 Outfit을 둘러보고 쇼핑을 즐겨보세요!'}
            {user.role === 'admin' && '관리자 권한으로 플랫폼을 관리하세요!'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">내 옷장</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}개</div>
              <p className="text-xs text-muted-foreground">등록된 아이템</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">주문 내역</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}건</div>
              <p className="text-xs text-muted-foreground">총 주문 수</p>
            </CardContent>
          </Card>

          {user.role === 'creator' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">내 Outfit</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOutfits}개</div>
                <p className="text-xs text-muted-foreground">제작한 콘텐츠</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">포인트</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.points}P</div>
              <p className="text-xs text-muted-foreground">누적 포인트</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/feed')}>
            <CardHeader>
              <CardTitle>Outfit Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">크리에이터들의 멋진 Outfit을 둘러보세요</p>
            </CardContent>
          </Card>

          {user.role === 'creator' && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/outfit-bank')}>
              <CardHeader>
                <CardTitle>Outfit 만들기</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">새로운 Outfit 카드를 제작하고 공유하세요</p>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/closet')}>
            <CardHeader>
              <CardTitle>내 옷장</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">옷장을 관리하고 착용 기록을 남기세요</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resale')}>
            <CardHeader>
              <CardTitle>리셀 센터</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">아이템의 리셀 가치를 확인하세요</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-page')}>
            <CardHeader>
              <CardTitle>마이 페이지</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">프로필과 통계를 확인하세요</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}