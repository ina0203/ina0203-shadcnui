import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCreators, toggleFollowCreator, Creator } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, TrendingUp, Users, Search, ArrowUpDown, UserPlus, UserCheck, Instagram } from 'lucide-react';
import { toast } from 'sonner';

export default function Creators() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'likes' | 'followers' | 'revenue' | 'outfits'>('likes');

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    filterAndSortCreators();
  }, [creators, searchQuery, sortBy]);

  const loadCreators = () => {
    const data = getCreators();
    setCreators(data);
  };

  const filterAndSortCreators = () => {
    let filtered = creators.filter(creator =>
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return b.totalLikes - a.totalLikes;
        case 'followers':
          return b.followers - a.followers;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'outfits':
          return b.outfitCount - a.outfitCount;
        default:
          return 0;
      }
    });

    setFilteredCreators(filtered);
  };

  const handleFollow = (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }
    toggleFollowCreator(creatorId, user.id);
    loadCreators();
    const creator = creators.find(c => c.id === creatorId);
    const isFollowing = creator?.followedBy.includes(user.id);
    toast.success(isFollowing ? '팔로우를 취소했습니다' : '팔로우했습니다');
  };

  const isFollowing = (creator: Creator) => {
    return user ? creator.followedBy.includes(user.id) : false;
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            인기 크리에이터
          </h1>
          <p className="text-muted-foreground text-lg">트렌디한 스타일을 선도하는 크리에이터들을 만나보세요</p>
        </div>

        {/* Search and Filter */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="크리에이터 이름이나 설명으로 검색..."
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
                    <SelectItem value="likes">좋아요 많은 순</SelectItem>
                    <SelectItem value="followers">팔로워 많은 순</SelectItem>
                    <SelectItem value="revenue">수익 높은 순</SelectItem>
                    <SelectItem value="outfits">Outfit 많은 순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creators Grid */}
        {filteredCreators.length === 0 ? (
          <Card className="border-none shadow-xl">
            <CardContent className="text-center py-16">
              <Instagram className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground text-lg">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCreators.map((creator) => (
              <Card
                key={creator.id}
                className="border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden cursor-pointer"
                onClick={() => navigate('/feed')}
              >
                <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-purple-100">
                      <AvatarImage src={creator.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl">
                        {creator.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{creator.username}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
                    </div>
                    <Button
                      variant={isFollowing(creator) ? 'outline' : 'default'}
                      size="sm"
                      onClick={(e) => handleFollow(creator.id, e)}
                      className={
                        isFollowing(creator)
                          ? 'border-purple-300 text-purple-600 hover:bg-purple-50'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                      }
                    >
                      {isFollowing(creator) ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          팔로잉
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          팔로우
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-xs text-pink-700 font-medium">Outfit</span>
                      </div>
                      <p className="text-2xl font-bold text-pink-900">{creator.outfitCount}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">좋아요</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{formatNumber(creator.totalLikes)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">팔로워</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{formatNumber(creator.followers)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">총 수익</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">₩{formatCurrency(creator.totalRevenue)}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-lg">
                    <Instagram className="w-4 h-4 mr-2" />
                    Outfit 둘러보기
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