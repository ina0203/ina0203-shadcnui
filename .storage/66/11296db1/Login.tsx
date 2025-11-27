import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Palette, Store } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const createDemoAccounts = () => {
      const demoAccounts = [
        { email: 'user@demo.com', password: 'demo123', username: 'DemoUser', role: 'user' as const },
        { email: 'creator@demo.com', password: 'demo123', username: 'DemoCreator', role: 'creator' as const },
        { email: 'seller@demo.com', password: 'demo123', username: 'DemoSeller', role: 'seller' as const },
      ];

      demoAccounts.forEach(account => {
        signUp(account.email, account.password, account.username, account.role);
      });
    };

    createDemoAccounts();
  }, [signUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);

    const result = await signIn(demoEmail, 'demo123');
    
    if (result.success) {
      navigate('/');
    } else {
      setError('데모 계정 로그인에 실패했습니다.');
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    {
      email: 'user@demo.com',
      role: 'user',
      name: '일반 사용자',
      description: '옷장 관리, Outfit 둘러보기',
      icon: User,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
    },
    {
      email: 'creator@demo.com',
      role: 'creator',
      name: '크리에이터',
      description: 'Outfit 제작, 인스타그램 연동',
      icon: Palette,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'from-pink-50 to-purple-100',
      borderColor: 'border-pink-200',
    },
    {
      email: 'seller@demo.com',
      role: 'seller',
      name: '셀러',
      description: '상품 등록, 판매 관리',
      icon: Store,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-100',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            ✨ Style Bank
          </h1>
          <p className="text-xl text-gray-600">패션을 더 가치있게 만드는 플랫폼</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Login Form */}
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
            <CardHeader className="space-y-1 bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
              <CardDescription className="text-center">
                계정으로 로그인하세요
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
                
                <div className="text-sm text-center text-muted-foreground">
                  계정이 없으신가요?{' '}
                  <Link to="/signup" className="text-purple-600 hover:underline font-medium">
                    회원가입
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Right Side - Demo Accounts */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 빠른 체험하기</h2>
              <p className="text-gray-600">데모 계정으로 바로 시작해보세요</p>
            </div>

            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <Card
                  key={account.email}
                  className={`border-2 ${account.borderColor} shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-gradient-to-br ${account.bgColor}`}
                  onClick={() => handleDemoLogin(account.email)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${account.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
                          <Badge className={`bg-gradient-to-r ${account.color} text-white border-none`}>
                            {account.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{account.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{account.email}</p>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 transition-all">
                        <Sparkles className="w-5 h-5 text-purple-600 group-hover:text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="border-none shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="font-semibold text-amber-900 mb-2">Tip</p>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• 각 역할별로 다른 기능을 체험할 수 있습니다</li>
                      <li>• 크리에이터는 Outfit 제작 기능이 추가됩니다</li>
                      <li>• 모든 데이터는 브라우저에 저장됩니다</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}