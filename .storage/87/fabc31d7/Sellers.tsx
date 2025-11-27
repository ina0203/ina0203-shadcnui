import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSellers, Seller } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Star, TrendingUp, Users, Search, ArrowUpDown } from 'lucide-react';

export default function Sellers() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'followers' | 'sales' | 'products'>('rating');

  useEffect(() => {
    loadSellers();
  }, []);

  useEffect(() => {
    filterAndSortSellers();
  }, [sellers, searchQuery, sortBy]);

  const loadSellers = () => {
    const data = getSellers();
    setSellers(data);
  };

  const filterAndSortSellers = () => {
    let filtered = sellers.filter(seller =>
      seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'followers':
          return b.followers - a.followers;
        case 'sales':
          return b.totalSales - a.totalSales;
        case 'products':
          return b.productCount - a.productCount;
        default:
          return 0;
      }
    });

    setFilteredSellers(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            트렌디 셀러 발견
          </h1>
          <p className="text-muted-foreground text-lg">믿을 수 있는 셀러들을 비교하고 선택하세요</p>
        </div>

        {/* Search and Filter */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="셀러 이름이나 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-purple-200 focus:border-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-purple-600" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="w-[180px] bg-white border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">평점 높은 순</SelectItem>
                    <SelectItem value="followers">팔로워 많은 순</SelectItem>
                    <SelectItem value="sales">판매액 높은 순</SelectItem>
                    <SelectItem value="products">상품 많은 순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Grid */}
        {filteredSellers.length === 0 ? (
          <Card className="border-none shadow-xl">
            <CardContent className="text-center py-16">
              <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground text-lg">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSellers.map((seller) => (
              <Card
                key={seller.id}
                className="border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-purple-100">
                      <AvatarImage src={seller.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                        {seller.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{seller.username}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{seller.bio}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {seller.rating}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">상품 수</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{seller.productCount}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">팔로워</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{formatNumber(seller.followers)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">총 판매액</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">₩{formatCurrency(seller.totalSales)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="w-4 h-4 text-pink-600" />
                        <span className="text-xs text-pink-700 font-medium">평균 가격</span>
                      </div>
                      <p className="text-lg font-bold text-pink-900">₩{formatCurrency(seller.averagePrice)}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg">
                    <Store className="w-4 h-4 mr-2" />
                    상품 둘러보기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}