import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOutfitCards, toggleLike } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Instagram, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function OutfitFeed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<any[]>([]);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = () => {
    const data = getOutfitCards();
    setOutfits(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleLike = (outfitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    toggleLike(outfitId, user.id);
    loadOutfits();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const isLiked = (outfit: any) => {
    return user ? outfit.likedBy.includes(user.id) : false;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Outfit Feed
          </h1>
          <p className="text-muted-foreground text-lg">크리에이터들의 최신 스타일을 만나보세요</p>
        </div>

        {outfits.length === 0 ? (
          <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="text-center py-16">
              <Instagram className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <p className="text-2xl font-bold mb-2 text-gray-800">아직 등록된 Outfit이 없습니다</p>
              <p className="text-muted-foreground text-lg">첫 Outfit을 만들어보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <Card
                key={outfit.id}
                className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => navigate(`/outfit/${outfit.id}`)}
              >
                <div className="relative h-80 bg-gradient-to-br from-pink-200 to-purple-200">
                  <img
                    src={outfit.imageUrl}
                    alt={outfit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {outfit.instagramUrl && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none shadow-lg">
                        <Instagram className="w-3 h-3 mr-1" />
                        Instagram
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-lg">
                      ₩{formatCurrency(outfit.expectedRevenue)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{outfit.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{outfit.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleLike(outfit.id, e)}
                        className={`flex items-center gap-2 ${
                          isLiked(outfit)
                            ? 'text-pink-600 hover:text-pink-700'
                            : 'text-gray-600 hover:text-pink-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked(outfit) ? 'fill-current' : ''}`} />
                        <span className="font-bold">{outfit.likes}</span>
                      </Button>

                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold">{outfit.comments.length}</span>
                      </div>
                    </div>

                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-none">
                      {outfit.products.length}개 아이템
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}