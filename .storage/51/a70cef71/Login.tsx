import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Create demo accounts on component mount
  useEffect(() => {
    const createDemoAccounts = () => {
      const demoAccounts = [
        { email: 'user@demo.com', password: 'demo123', username: 'DemoUser', role: 'user' as const },
        { email: 'creator@demo.com', password: 'demo123', username: 'DemoCreator', role: 'creator' as const },
        { email: 'seller@demo.com', password: 'demo123', username: 'DemoSeller', role: 'seller' as const },
      ];

      demoAccounts.forEach(account => {
        // Try to create account (will fail silently if already exists)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Style Bank</CardTitle>
            <CardDescription className="text-center">
              로그인하여 패션 플랫폼을 이용하세요
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
              
              <div className="text-sm text-center text-muted-foreground">
                계정이 없으신가요?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  회원가입
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Accounts Card */}
        <Card className="w-full bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl">🎯 빠른 체험하기</CardTitle>
            <CardDescription>
              데모 계정으로 바로 시작해보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">일반 사용자</p>
                    <p className="text-xs text-gray-600">user@demo.com</p>
                  </div>
                  <Badge variant="secondary">User</Badge>
                </div>
                <Button 
                  onClick={() => handleDemoLogin('user@demo.com')}
                  className="w-full mt-2"
                  variant="outline"
                  disabled={isLoading}
                >
                  체험하기
                </Button>
              </div>

              <div className="p-4 bg-white rounded-lg border border-pink-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">크리에이터</p>
                    <p className="text-xs text-gray-600">creator@demo.com</p>
                  </div>
                  <Badge className="bg-pink-500">Creator</Badge>
                </div>
                <Button 
                  onClick={() => handleDemoLogin('creator@demo.com')}
                  className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600"
                  disabled={isLoading}
                >
                  체험하기
                </Button>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">셀러</p>
                    <p className="text-xs text-gray-600">seller@demo.com</p>
                  </div>
                  <Badge className="bg-blue-500">Seller</Badge>
                </div>
                <Button 
                  onClick={() => handleDemoLogin('seller@demo.com')}
                  className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  체험하기
                </Button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-800">
                💡 <strong>Tip:</strong> 각 역할별로 다른 기능을 체험할 수 있습니다!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}