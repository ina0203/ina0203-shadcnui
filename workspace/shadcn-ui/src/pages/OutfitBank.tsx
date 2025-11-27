import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createOutfitCard, Product } from '@/lib/database';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Instagram, Upload, Link as LinkIcon, Heart, MessageCircle, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductLink {
  name: string;
  brand: string;
  price: number;
  url: string;
}

export default function OutfitBank() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [outfit, setOutfit] = useState({
    title: '',
    description: '',
    imageUrl: '',
    instagramUrl: '',
  });
  const [productLinks, setProductLinks] = useState<ProductLink[]>([
    { name: '', brand: '', price: 0, url: '' }
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutfit({ ...outfit, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProductLink = () => {
    setProductLinks([...productLinks, { name: '', brand: '', price: 0, url: '' }]);
  };

  const updateProductLink = (index: number, field: keyof ProductLink, value: string | number) => {
    const newLinks = [...productLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setProductLinks(newLinks);
  };

  const removeProductLink = (index: number) => {
    const newLinks = productLinks.filter((_, i) => i !== index);
    setProductLinks(newLinks);
  };

  const calculateRevenue = () => {
    const validProducts = productLinks.filter(p => p.name && p.brand && p.price > 0);
    return validProducts.reduce((sum, p) => sum + p.price * 0.1, 0);
  };

  const handleSubmit = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!outfit.title || !outfit.imageUrl) {
      toast.error('제목과 이미지는 필수입니다');
      return;
    }

    const validProducts = productLinks.filter(p => p.name && p.brand && p.price > 0 && p.url);
    
    if (validProducts.length === 0) {
      toast.error('최소 1개의 상품 정보를 입력해주세요');
      return;
    }

    const products: Product[] = validProducts.map(p => ({
      id: '',
      name: p.name,
      brand: p.brand,
      price: p.price,
      imageUrl: outfit.imageUrl,
      affiliateLink: p.url,
      createdAt: new Date().toISOString(),
    }));

    createOutfitCard({
      creatorId: user.id,
      title: outfit.title,
      description: outfit.description,
      imageUrl: outfit.imageUrl,
      instagramUrl: outfit.instagramUrl,
      products: products,
      expectedRevenue: calculateRevenue(),
    });

    toast.success('Outfit이 성공적으로 등록되었습니다!');
    navigate('/feed');
  };

  const estimatedRevenue = calculateRevenue();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Outfit 만들기
          </h1>
          <p className="text-muted-foreground text-lg">인스타그램 콘텐츠를 연동하여 Outfit 카드를 제작하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Outfit 이미지 *</Label>
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                      id="outfit-upload"
                    />
                    <label htmlFor="outfit-upload" className="cursor-pointer">
                      {outfit.imageUrl ? (
                        <img src={outfit.imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-16 h-16 mx-auto text-purple-400" />
                          <p className="text-gray-600 font-medium">클릭하여 이미지 업로드</p>
                          <p className="text-xs text-gray-500">JPG, PNG 파일 지원</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>제목 *</Label>
                  <Input
                    placeholder="예: 가을 데일리룩 OOTD"
                    value={outfit.title}
                    onChange={(e) => setOutfit({ ...outfit, title: e.target.value })}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    placeholder="Outfit에 대한 설명을 작성해주세요..."
                    value={outfit.description}
                    onChange={(e) => setOutfit({ ...outfit, description: e.target.value })}
                    rows={4}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instagram 게시물 URL</Label>
                  <div className="flex gap-2">
                    <Instagram className="w-5 h-5 text-pink-500 mt-2" />
                    <Input
                      placeholder="https://instagram.com/p/..."
                      value={outfit.instagramUrl}
                      onChange={(e) => setOutfit({ ...outfit, instagramUrl: e.target.value })}
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  상품 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {productLinks.map((product, index) => (
                  <div key={index} className="p-4 border-2 border-blue-100 rounded-xl space-y-3 bg-blue-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900">상품 {index + 1}</span>
                      {productLinks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductLink(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="상품명"
                      value={product.name}
                      onChange={(e) => updateProductLink(index, 'name', e.target.value)}
                      className="bg-white"
                    />
                    <Input
                      placeholder="브랜드"
                      value={product.brand}
                      onChange={(e) => updateProductLink(index, 'brand', e.target.value)}
                      className="bg-white"
                    />
                    <Input
                      type="number"
                      placeholder="가격"
                      value={product.price || ''}
                      onChange={(e) => updateProductLink(index, 'price', parseInt(e.target.value) || 0)}
                      className="bg-white"
                    />
                    <Input
                      placeholder="구매 링크 URL"
                      value={product.url}
                      onChange={(e) => updateProductLink(index, 'url', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addProductLink}
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  + 상품 추가
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Preview */}
          <div className="space-y-6">
            <Card className="border-none shadow-2xl sticky top-32">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  미리보기
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  {outfit.imageUrl ? (
                    <img src={outfit.imageUrl} alt="Preview" className="w-full h-80 object-cover" />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-16 h-16 mx-auto text-purple-300" />
                        <p className="text-gray-500">이미지를 업로드하세요</p>
                      </div>
                    </div>
                  )}
                  {outfit.instagramUrl && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-semibold text-gray-800">Instagram</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {outfit.title || '제목을 입력하세요'}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {outfit.description || '설명을 입력하세요'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">0</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700">예상 수익</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ₩{estimatedRevenue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      상품 가격의 10% 수수료
                    </p>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-lg py-6 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Outfit 등록하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}