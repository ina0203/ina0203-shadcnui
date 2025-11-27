import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOutfitCardById, toggleLike, addComment, deleteComment, OutfitCard, Product, Comment } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Trash2, ExternalLink, Instagram, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function OutfitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [outfit, setOutfit] = useState<OutfitCard | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadOutfit();
  }, [id]);

  const loadOutfit = () => {
    if (!id) return;
    const data = getOutfitCardById(id);
    if (data) {
      setOutfit(data);
      setIsLiked(user ? data.likedBy.includes(user.id) : false);
    } else {
      navigate('/feed');
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!id) return;
    
    const liked = toggleLike(id, user.id);
    loadOutfit();
    refreshUser();
    
    if (liked) {
      toast.success('좋아요! 크리에이터에게 10P가 적립되었습니다', {
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      });
    } else {
      toast.info('좋아요를 취소했습니다');
    }
  };

  const handleComment = () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!id || !commentText.trim()) {
      toast.error('댓글 내용을 입력해주세요');
      return;
    }

    addComment(id, user.id, user.username, commentText.trim(), user.avatarUrl);
    setCommentText('');
    loadOutfit();
    toast.success('댓글이 등록되었습니다');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!id) return;
    deleteComment(id, commentId);
    loadOutfit();
    toast.success('댓글이 삭제되었습니다');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  if (!outfit) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">아웃핏을 찾을 수 없습니다</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Outfit Image and Info */}
        <Card className="border-none shadow-2xl overflow-hidden">
          <div className="relative">
            <img
              src={outfit.imageUrl}
              alt={outfit.title}
              className="w-full h-[500px] object-cover"
            />
            {outfit.instagramUrl && (
              <a
                href={outfit.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Instagram className="w-6 h-6 text-white" />
              </a>
            )}
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Title and Actions */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{outfit.title}</h1>
              <p className="text-lg text-gray-600">{outfit.description}</p>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? 'default' : 'outline'}
                  className={`flex items-center gap-2 ${
                    isLiked
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600'
                      : 'border-pink-300 text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {outfit.likes}
                </Button>

                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{outfit.comments.length}</span>
                </div>

                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none ml-auto">
                  예상 수익: ₩{formatCurrency(outfit.expectedRevenue)}
                </Badge>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">착용 아이템</h2>
              <div className="grid gap-4">
                {outfit.products.map((product: Product) => (
                  <Card key={product.id} className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                          <p className="text-lg font-bold text-purple-600 mt-2">
                            ₩{formatCurrency(product.price)}
                          </p>
                        </div>
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full hover:scale-110 transition-transform"
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-none shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              댓글 {outfit.comments.length}개
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Comment Input */}
            {user && (
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="댓글을 입력하세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <Button
                    onClick={handleComment}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {outfit.comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">첫 댓글을 남겨보세요!</p>
                </div>
              ) : (
                outfit.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        {comment.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">{comment.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          {user && comment.userId === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}