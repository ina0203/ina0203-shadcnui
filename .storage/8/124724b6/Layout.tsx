import { Link, useLocation } from 'react-router-dom';
import { Home, Image, ShoppingBag, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '홈', href: '/', icon: Home },
  { name: '아웃핏 뱅크', href: '/outfit-bank', icon: Image },
  { name: '내 옷장', href: '/closet', icon: ShoppingBag },
  { name: '리셀 센터', href: '/resale', icon: DollarSign },
  { name: '마이페이지', href: '/mypage', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Style Bank
          </h1>
          <p className="text-sm text-gray-500 mt-1">입을수록 적립되는 패션</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700">💎 포인트 적립</p>
            <p className="text-xs text-gray-600 mt-1">
              옷을 입을 때마다 100P 적립!
            </p>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}