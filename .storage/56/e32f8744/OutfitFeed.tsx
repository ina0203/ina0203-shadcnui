import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOutfits, toggleLike, OutfitCard } from '@/lib/database';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Instagram, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OutfitFeed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<OutfitCard[]>([]);
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOutfits();
    loadLikes();
  }, []);

  const loadOutfits = () => {
    const allOutfits = getAllOutfits();
    setOutfits(allOutfits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const loadLikes = () => {
    if (!user) return;
    const likes = JSON.parse(localStorage.getItem('stylebank_likes') || '{}');
    const userLikes = new Set<string>();
    Object.keys(likes).forEach(key => {
      if (key.endsWith(`_${user.id}`) && likes[key]) {
        userLikes.add(key.split('_')[0]);
      }
    });
    setLikedOutfits(userLikes);
  };

  const handleLike = (outfitId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const result = toggleLike(outfitId, user.id);
    
    if (result.liked) {
      setLikedOutfits(prev => new Set([...prev, outfitId]));
    } else {
      setLikedOutfits(prev => {
        const newSet = new Set(prev);
        newSet.delete(outfitId);
        return newSet;
      });
    }
    
    loadOutfits();
  };

  const handleOutfitClick = (outfitId: string) => {
    navigate(`/outfit/${outfitId}`);
  };

  if (outfits.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
              <Instagram className="w-16 h-16 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              아직 Outfit이 없습니다
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">크리에이터가 되어 첫 Outfit을 만들어보세요!</p>
            {user?.role === 'creator' && (
              <Button 
                onClick={() => navigate('/outfit-bank')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Outfit 만들기
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Outfit Feed
            </h1>
            <p className="text-muted-foreground">크리에이터들의 멋진 스타일을 만나보세요</p>
          </div>
          {user?.role === 'creator' && (
            <Button 
              onClick={() => navigate('/outfit-bank')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              새 Outfit
            </Button>
          )}
        </div>

        <div className="space-y-8">
          {outfits.map((outfit) => (
            <Card key={outfit.id} className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all">
              <CardHeader className="pb-3 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="ring-2 ring-purple-200">
                      <AvatarImage src={outfit.creatorAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                        {outfit.creatorUsername[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{outfit.creatorUsername}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(outfit.createdAt).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none">
                    <Sparkles className="w-3 h-3 mr-1" />
                    ₩{outfit.estimatedRevenue.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 cursor-pointer" onClick={() => handleOutfitClick(outfit.id)}>
                <div className="relative group">
                  <img
                    src={outfit.imageUrl}
                    alt={outfit.title}
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-bold text-2xl mb-2">{outfit.title}</h3>
                      <p className="line-clamp-2">{outfit.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-semibold text-gray-800">Instagram</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{outfit.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{outfit.description}</p>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-4 border-t bg-gradient-to-r from-pink-50/50 to-purple-50/50">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-pink-100"
                    onClick={() => handleLike(outfit.id)}
                  >
                    <Heart
                      className={`h-6 w-6 transition-all ${
                        likedOutfits.has(outfit.id) 
                          ? 'fill-red-500 text-red-500 scale-110' 
                          : 'text-gray-500'
                      }`}
                    />
                    <span className="font-semibold">{outfit.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-blue-100"
                    onClick={() => handleOutfitClick(outfit.id)}
                  >
                    <MessageCircle className="h-6 w-6 text-gray-500" />
                    <span className="font-semibold">{outfit.comments.length}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}