import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getClothingItems, saveClothingItem, updateClothingItem } from '@/lib/storage';
import { calculateUtilizationRate, calculatePoints } from '@/lib/calculations';
import { ClothingItem, WearRecord } from '@/types';
import { Plus, Calendar, TrendingUp, Star, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Closet() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWearDialogOpen, setIsWearDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
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

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const loadedItems = getClothingItems();
    setItems(loadedItems);
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
    if (!newItem.name || !newItem.brand || newItem.purchasePrice <= 0) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    const item: ClothingItem = {
      id: Date.now().toString(),
      ...newItem,
      wearRecords: [],
      wearCount: 0,
      points: 0,
      utilizationRate: 0,
    };

    saveClothingItem(item);
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
    if (!selectedItem) return;

    const wearRecord: WearRecord = {
      id: Date.now().toString(),
      ...newWear,
    };

    const updatedItem: ClothingItem = {
      ...selectedItem,
      wearRecords: [...selectedItem.wearRecords, wearRecord],
      wearCount: selectedItem.wearCount + 1,
    };

    updatedItem.points = calculatePoints(updatedItem.wearCount);
    updatedItem.utilizationRate = calculateUtilizationRate(updatedItem);

    updateClothingItem(updatedItem.id, updatedItem);
    loadItems();
    setNewWear({
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
    });
    setIsWearDialogOpen(false);
    setSelectedItem(null);
    toast.success('착용 기록이 추가되었습니다! +100P');
  };

  const openWearDialog = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsWearDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            내 옷장
          </h1>
          <p className="text-gray-600 mt-2">옷을 등록하고 착용 기록을 관리하세요</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              아이템 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 아이템 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>사진</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'item')} />
                {newItem.imageUrl && (
                  <div className="mt-2">
                    <img src={newItem.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
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
      </div>

      {/* 아이템 목록 */}
      {items.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">아직 등록된 아이템이 없습니다</p>
              <p className="text-sm mt-2">첫 아이템을 등록해보세요!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="border-none shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-pink-200 to-purple-200">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-purple-600 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white text-purple-600 font-bold">
                    {item.utilizationRate}%
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-lg">{item.name}</div>
                    <div className="text-sm font-normal text-gray-600">{item.brand}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">구매가</p>
                    <p className="font-semibold">{formatCurrency(item.purchasePrice)}원</p>
                  </div>
                  <div>
                    <p className="text-gray-600">착용 횟수</p>
                    <p className="font-semibold">{item.wearCount}회</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-700">적립 포인트</span>
                  </div>
                  <span className="font-bold text-amber-600">{formatCurrency(item.points)}P</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">활용률</span>
                    <span className="font-semibold text-purple-600">{item.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => openWearDialog(item)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  착용 기록 추가
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 착용 기록 추가 다이얼로그 */}
      <Dialog open={isWearDialogOpen} onOpenChange={setIsWearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>착용 기록 추가</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedItem.name}</p>
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

              <div className="space-y-2">
                <Label>착용 사진 (선택)</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'wear')} />
                {newWear.imageUrl && (
                  <div className="mt-2">
                    <img src={newWear.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">+100 포인트 적립!</span>
                </div>
              </div>

              <Button onClick={handleAddWear} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
                기록 추가하기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}