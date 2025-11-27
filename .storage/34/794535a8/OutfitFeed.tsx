import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOutfits, toggleLike, OutfitCard } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">아직 Outfit이 없습니다</h2>
            <p className="text-muted-foreground mb-6">크리에이터가 되어 첫 Outfit을 만들어보세요!</p>
            {user?.role === 'creator' && (
              <Button onClick={() => navigate('/outfit-bank')}>
                Outfit 만들기
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Outfit Feed
          </h1>
          {user?.role === 'creator' && (
            <Button onClick={() => navigate('/outfit-bank')}>
              새 Outfit 만들기
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {outfits.map((outfit) => (
            <Card key={outfit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={outfit.creatorAvatar} />
                      <AvatarFallback>{outfit.creatorUsername[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{outfit.creatorUsername}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(outfit.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    예상 수익: ₩{outfit.estimatedRevenue.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-3 cursor-pointer" onClick={() => handleOutfitClick(outfit.id)}>
                <img
                  src={outfit.imageUrl}
                  alt={outfit.title}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{outfit.title}</h3>
                <p className="text-muted-foreground line-clamp-2">{outfit.description}</p>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => handleLike(outfit.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${likedOutfits.has(outfit.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{outfit.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => handleOutfitClick(outfit.id)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{outfit.comments.length}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}