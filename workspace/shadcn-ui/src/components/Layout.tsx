import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Image, ShoppingBag, Shirt, TrendingUp, User, LogOut, ArrowLeft, Instagram } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInstagramConnect = () => {
    window.open('https://www.instagram.com', '_blank');
  };

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/feed', label: 'Feed', icon: Image },
    ...(user?.role === 'creator' ? [{ path: '/outfit-bank', label: 'Outfit Bank', icon: ShoppingBag }] : []),
    { path: '/closet', label: '옷장', icon: Shirt },
    { path: '/resale', label: '리셀', icon: TrendingUp },
    { path: '/my-page', label: 'MY', icon: User },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isHomePage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="hover:bg-purple-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  뒤로
                </Button>
              )}
              <h1 
                className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate('/')}
              >
                ✨ Style Bank
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstagramConnect}
                className="hidden sm:flex items-center space-x-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                <span className="text-sm">Instagram</span>
              </Button>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                <span className="text-xs px-2 py-0.5 bg-white rounded-full text-purple-700 font-semibold">
                  {user?.role === 'creator' ? '크리에이터' : user?.role === 'seller' ? '셀러' : user?.role === 'admin' ? '관리자' : '일반'}
                </span>
              </div>
              <Avatar className="cursor-pointer ring-2 ring-purple-200 hover:ring-purple-300 transition-all" onClick={() => navigate('/my-page')}>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-purple-100 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`flex items-center space-x-2 rounded-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700' 
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Instagram Connect Button (Mobile) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleInstagramConnect}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
        >
          <Instagram className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-purple-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              © 2024 Style Bank
            </p>
            <p className="text-xs text-gray-500">패션을 더 가치있게 만드는 플랫폼</p>
          </div>
        </div>
      </footer>
    </div>
  );
}