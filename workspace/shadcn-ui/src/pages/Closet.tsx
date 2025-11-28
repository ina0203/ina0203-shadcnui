import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getClosetByUser,
  addToCloset,
  addWearRecord,
  ClosetItem,
  getPublicClosetItems,
  togglePublicItem,
  likeClosetItem,
  addFromInstagram
} from '@/lib/database';
import {
  connectInstagram,
  disconnectInstagram,
  getInstagramConnection,
  fetchInstagramMedia,
  extractClothingFromPost,
  InstagramPost
} from '@/lib/instagram';
import { addPoints } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Star, Package, Sparkles, TrendingUp, Instagram, Heart, Users, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Closet() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [communityItems, setCommunityItems] = useState<ClosetItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWearDialogOpen, setIsWearDialogOpen] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    brand: '',
    imageUrl: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [newWear, setNewWear] = useState({
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
  });

  const instagramConnection = user ? getInstagramConnection(user.id) : null;

  useEffect(() => {
    if (user) {
      loadItems();
      loadCommunityItems();
    }
  }, [user]);

  const loadItems = () => {
    if (!user) return;
    const loadedItems = getClosetByUser(user.id);
    setItems(loadedItems);
  };

  const loadCommunityItems = () => {
    const publicItems = getPublicClosetItems();
    setCommunityItems(publicItems);
  };

  const handleConnectInstagram = async () => {
    if (!user) return;

    setIsConnectingInstagram(true);
    try {
      await connectInstagram(user.id);
      toast.success('Instagram이 연동되었습니다!');
      refreshUser();
    } catch (error) {
      toast.error('Instagram 연동에 실패했습니다.');
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  const handleDisconnectInstagram = () => {
    if (!user) return;
    disconnectInstagram(user.id);
    toast.success('Instagram 연동이 해제되었습니다.');
    refreshUser();
  };

  const handleOpenInstagramImport = async () => {
    if (!user) return;

    try {
      const posts = await fetchInstagramMedia(user.id);
      setInstagramPosts(posts);
      setIsInstagramDialogOpen(true);
    } catch (error) {
      toast.error('Instagram 게시물을 불러오는데 실패했습니다.');
    }
  };

  const handleTogglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleImportFromInstagram = () => {
    if (!user) return;

    let importCount = 0;
    selectedPosts.forEach(postId => {
      const post = instagramPosts.find(p => p.id === postId);
      if (post) {
        const extracted = extractClothingFromPost(post);
        addFromInstagram(
          user.id,
          post.id,
          extracted.name,
          extracted.brand,
          post.imageUrl,
          extracted.estimatedPrice
        );
        importCount++;
      }
    });

    loadItems();
    setSelectedPosts(new Set());
    setIsInstagramDialogOpen(false);
    toast.success(`${importCount}개의 아이템을 가져왔습니다!`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'item' | 'wear') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'item') {
          setNewItem({ ...newItem, imageUrl: reader.result as string });
        } else {
          setNewWear({ ...newWear, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!user) return;
    if (!newItem.name || !newItem.brand || newItem.purchasePrice <= 0) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    addToCloset({
      userId: user.id,
      name: newItem.name,
      brand: newItem.brand,
      purchasePrice: newItem.purchasePrice,
      purchaseDate: newItem.purchaseDate,
      imageUrl: newItem.imageUrl,
      autoRegistered: false,
      source: 'manual',
      isPublic: false,
    });

    loadItems();
    setNewItem({
      name: '',
      brand: '',
      imageUrl: '',
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(false);
    toast.success('아이템이 등록되었습니다!');
  };

  const handleAddWear = () => {
    if (!selectedItem || !user) return;

    addWearRecord(selectedItem.id, user.id);
    addPoints(10);
    refreshUser();

    loadItems();
    setNewWear({
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
    });
    setIsWearDialogOpen(false);
    setSelectedItem(null);
    toast.success('착용 기록이 추가되었습니다! +10P');
  };

  const handleTogglePublic = (item: ClosetItem) => {
    if (!user) return;
    togglePublicItem(item.id, user.id);
    loadItems();
    loadCommunityItems();
    toast.success(item.isPublic ? '비공개로 전환되었습니다' : '커뮤니티에 공개되었습니다!');
  };

  const handleLikeItem = (item: ClosetItem) => {
    if (!user) return;
    const isLiked = likeClosetItem(item.id, user.id);
    loadCommunityItems();
    toast.success(isLiked ? '좋아요!' : '좋아요 취소');
  };

  const openWearDialog = (item: ClosetItem) => {
    setSelectedItem(item);
    setIsWearDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'from-green-500 to-emerald-500';
    if (rate >= 50) return 'from-blue-500 to-cyan-500';
    if (rate >= 30) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const renderItemCard = (item: ClosetItem, isMyCloset: boolean = true) => (
    <Card key={item.id} className="border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all group">
      <div className="relative h-56 bg-gradient-to-br from-pink-200 to-purple-200">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-purple-600 opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {item.source === 'instagram' && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-3 py-1 shadow-lg">
              <Instagram className="w-3 h-3 mr-1" />
              Instagram
            </Badge>
          )}
          {isMyCloset && (
            <Badge className={`bg-gradient-to-r ${getUtilizationColor(item.utilizationRate)} text-white font-bold px-3 py-1 shadow-lg`}>
              {item.utilizationRate}%
            </Badge>
          )}
        </div>
        {!isMyCloset && item.communityLikes > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-white/90 text-pink-600 font-bold px-3 py-1 shadow-lg">
              <Heart className="w-3 h-3 mr-1 fill-current" />
              {item.communityLikes}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">{item.name}</div>
            <div className="text-sm font-normal text-gray-600 mt-1">{item.brand}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-1">구매가</p>
            <p className="font-bold text-blue-900">{formatCurrency(item.purchasePrice)}원</p>
          </div>
          {isMyCloset && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 mb-1">착용 횟수</p>
              <p className="font-bold text-purple-900">{item.wearCount}회</p>
            </div>
          )}
        </div>

        {isMyCloset && (
          <>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-amber-700">포인트</span>
              </div>
              <span className="font-bold text-amber-600 text-lg">{formatCurrency(item.wearCount * 10)}P</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  활용률
                </span>
                <span className="font-bold text-purple-600">{item.utilizationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${getUtilizationColor(item.utilizationRate)} h-3 rounded-full transition-all shadow-sm`}
                  style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">커뮤니티 공개</span>
              </div>
              <Switch
                checked={item.isPublic}
                onCheckedChange={() => handleTogglePublic(item)}
              />
            </div>

            <Button
              onClick={() => openWearDialog(item)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              <Calendar className="w-4 h-4 mr-2" />
              착용 기록 추가
            </Button>
          </>
        )}

        {!isMyCloset && (
          <Button
            onClick={() => handleLikeItem(item)}
            variant={item.communityLikedBy.includes(user?.id || '') ? 'default' : 'outline'}
            className="w-full"
          >
            <Heart className={`w-4 h-4 mr-2 ${item.communityLikedBy.includes(user?.id || '') ? 'fill-current' : ''}`} />
            {item.communityLikedBy.includes(user?.id || '') ? '좋아요 취소' : '좋아요'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            내 옷장
          </h1>
          <p className="text-muted-foreground text-lg">옷을 등록하고 착용 기록을 관리하세요</p>
        </div>
      </div>

      <Tabs defaultValue="my-closet" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="my-closet" className="text-lg">
            <Package className="w-4 h-4 mr-2" />
            나의 클로젯
          </TabsTrigger>
          <TabsTrigger value="community" className="text-lg">
            <Users className="w-4 h-4 mr-2" />
            커뮤니티 클로젯
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-closet" className="space-y-6">
          <div className="flex gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  아이템 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl">새 아이템 등록</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>사진</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'item')}
                        className="hidden"
                        id="item-upload"
                      />
                      <label htmlFor="item-upload" className="cursor-pointer">
                        {newItem.imageUrl ? (
                          <img src={newItem.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        ) : (
                          <div className="space-y-2">
                            <Package className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-600">클릭하여 이미지 업로드</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>아이템 이름</Label>
                    <Input
                      placeholder="예: 흰색 셔츠"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>브랜드</Label>
                    <Input
                      placeholder="예: ZARA"
                      value={newItem.brand}
                      onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>구매가</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newItem.purchasePrice || ''}
                      onChange={(e) => setNewItem({ ...newItem, purchasePrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>구매일</Label>
                    <Input
                      type="date"
                      value={newItem.purchaseDate}
                      onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddItem} className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                    등록하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {instagramConnection?.isConnected ? (
              <>
                <Button
                  onClick={handleOpenInstagramImport}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram에서 가져오기
                </Button>
                <Button
                  onClick={handleDisconnectInstagram}
                  variant="outline"
                  className="border-purple-300"
                >
                  연동 해제
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectInstagram}
                disabled={isConnectingInstagram}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
              >
                <Instagram className="w-4 h-4 mr-2" />
                {isConnectingInstagram ? '연동 중...' : 'Instagram 연동'}
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
              <CardContent className="text-center py-16">
                <div className="inline-block p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                  <Package className="w-16 h-16 text-purple-600" />
                </div>
                <p className="text-2xl font-bold mb-2 text-gray-800">아직 등록된 아이템이 없습니다</p>
                <p className="text-muted-foreground text-lg">첫 아이템을 등록해보세요!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => renderItemCard(item, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {communityItems.length === 0 ? (
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="text-center py-16">
                <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <Users className="w-16 h-16 text-purple-600" />
                </div>
                <p className="text-2xl font-bold mb-2 text-gray-800">아직 공개된 아이템이 없습니다</p>
                <p className="text-muted-foreground text-lg">다른 사용자들이 공유한 아이템을 확인해보세요!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityItems.map((item) => renderItemCard(item, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Instagram Import Dialog */}
      <Dialog open={isInstagramDialogOpen} onOpenChange={setIsInstagramDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Instagram className="w-6 h-6 text-purple-600" />
              Instagram에서 아이템 가져오기
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">가져올 게시물을 선택하세요</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {instagramPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleTogglePostSelection(post.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${selectedPosts.has(post.id) ? 'border-purple-500 shadow-lg' : 'border-transparent'
                    }`}
                >
                  <img src={post.imageUrl} alt={post.caption} className="w-full h-48 object-cover" />
                  {selectedPosts.has(post.id) && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">{selectedPosts.size}개 선택됨</p>
              <Button
                onClick={handleImportFromInstagram}
                disabled={selectedPosts.size === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                선택한 항목 가져오기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wear Record Dialog */}
      <Dialog open={isWearDialogOpen} onOpenChange={setIsWearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">착용 기록 추가</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-purple-200">
                <p className="font-bold text-lg text-gray-900">{selectedItem.name}</p>
                <p className="text-sm text-gray-600">{selectedItem.brand}</p>
              </div>

              <div className="space-y-2">
                <Label>착용 날짜</Label>
                <Input
                  type="date"
                  value={newWear.date}
                  onChange={(e) => setNewWear({ ...newWear, date: e.target.value })}
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold text-lg">+10 포인트 적립!</span>
                </div>
              </div>

              <Button onClick={handleAddWear} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                기록 추가하기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}