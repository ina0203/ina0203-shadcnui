import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createOutfit, getOutfitsByCreator, deleteOutfit as dbDeleteOutfit, OutfitCard } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Heart, MessageCircle, DollarSign, Instagram, Link as LinkIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  url: string;
}

export default function OutfitBank() {
  const { user } = useAuth();
  const [outfitCards, setOutfitCards] = useState<OutfitCard[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    imageUrl: '',
    likes: 0,
    comments: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, url: '' });
  const [instagramUrl, setInstagramUrl] = useState('');

  useEffect(() => {
    if (user) {
      loadOutfitCards();
    }
  }, [user]);

  const loadOutfitCards = () => {
    if (!user) return;
    const cards = getOutfitsByCreator(user.id);
    setOutfitCards(cards);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCard({ ...newCard, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstagramUrlSubmit = () => {
    if (!instagramUrl) {
      toast.error('인스타그램 URL을 입력해주세요');
      return;
    }

    if (!instagramUrl.includes('instagram.com')) {
      toast.error('올바른 인스타그램 URL을 입력해주세요');
      return;
    }

    const postIdMatch = instagramUrl.match(/\/p\/([^/]+)/);
    if (postIdMatch) {
      toast.success('인스타그램 게시물 URL이 저장되었습니다.');
      setNewCard({ 
        ...newCard, 
        description: newCard.description + (newCard.description ? '\n\n' : '') + `📸 Instagram: ${instagramUrl}`
      });
    } else {
      toast.warning('게시물 URL 형식을 확인해주세요.');
    }
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      setProducts([...products, { ...newProduct, id: Date.now().toString() }]);
      setNewProduct({ name: '', price: 0, url: '' });
      toast.success('상품이 추가되었습니다');
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleCreateCard = () => {
    if (!user) return;
    if (!newCard.title || !newCard.imageUrl) {
      toast.error('제목과 이미지는 필수입니다');
      return;
    }

    const estimatedRevenue = newCard.likes * 10 + newCard.comments * 50 + products.length * 1000;

    createOutfit({
      creatorId: user.id,
      creatorUsername: user.username,
      creatorAvatar: user.avatarUrl,
      title: newCard.title,
      description: newCard.description,
      imageUrl: newCard.imageUrl,
      instagramUrl,
      estimatedRevenue,
      productIds: products.map(p => p.id),
    });

    loadOutfitCards();
    
    setNewCard({ title: '', description: '', imageUrl: '', likes: 0, comments: 0 });
    setProducts([]);
    setInstagramUrl('');
    setIsDialogOpen(false);
    toast.success('Outfit 카드가 생성되었습니다!');
  };

  const handleDeleteCard = (id: string) => {
    dbDeleteOutfit(id);
    loadOutfitCards();
    toast.success('Outfit 카드가 삭제되었습니다');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Outfit Bank
            </h1>
            <p className="text-gray-600 mt-2">Outfit 카드를 만들고 수익을 창출하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Outfit 만들기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  새 Outfit 카드 만들기
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      이미지 업로드
                    </TabsTrigger>
                    <TabsTrigger value="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      인스타그램 연동
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>이미지</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {newCard.imageUrl ? (
                            <div className="space-y-2">
                              <img src={newCard.imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                              <p className="text-sm text-gray-600">클릭하여 다른 이미지 선택</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 mx-auto text-gray-400" />
                              <p className="text-gray-600">클릭하여 이미지 업로드</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="instagram" className="space-y-4 mt-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-start gap-3 mb-4">
                        <Instagram className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">인스타그램 게시물 가져오기</h3>
                          <p className="text-sm text-gray-600">
                            인스타그램 게시물 URL을 입력하고, 이미지를 다운로드하여 업로드해주세요
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="https://instagram.com/p/..."
                              value={instagramUrl}
                              onChange={(e) => setInstagramUrl(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Button 
                            onClick={handleInstagramUrlSubmit}
                            className="bg-gradient-to-r from-pink-500 to-purple-600"
                          >
                            저장
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>다운로드한 이미지 업로드</Label>
                      <Input type="file" accept="image/*" onChange={handleImageUpload} />
                      {newCard.imageUrl && (
                        <div className="mt-2">
                          <img src={newCard.imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label>제목</Label>
                  <Input
                    placeholder="예: 봄 데일리룩"
                    value={newCard.title}
                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    placeholder="Outfit에 대한 설명을 입력하세요"
                    value={newCard.description}
                    onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    인스타그램 인사이트
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        좋아요 수
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newCard.likes || ''}
                        onChange={(e) => setNewCard({ ...newCard, likes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        댓글 수
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newCard.comments || ''}
                        onChange={(e) => setNewCard({ ...newCard, comments: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>상품 링크</Label>
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-4"
                      placeholder="상품명"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      placeholder="가격"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      className="col-span-4"
                      placeholder="URL"
                      value={newProduct.url}
                      onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
                    />
                    <Button onClick={addProduct} className="col-span-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {products.length > 0 && (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(product.price)}원</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleCreateCard} className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                  카드 생성하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {outfitCards.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Instagram className="w-16 h-16 mx-auto mb-4 opacity-50 text-pink-400" />
                <p className="text-lg font-medium">아직 Outfit 카드가 없습니다</p>
                <p className="text-sm mt-2">첫 Outfit을 만들어보세요!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfitCards.map((card) => (
              <Card key={card.id} className="border-none shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 bg-gradient-to-br from-pink-200 to-purple-200">
                  {card.imageUrl && (
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-medium">Instagram</span>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{card.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{card.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{card.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{card.comments.length}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">예상 수익</span>
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(card.estimatedRevenue)}원</span>
                      </div>
                    </div>
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