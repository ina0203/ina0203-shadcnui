import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { initializeSampleData } from '@/lib/database';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OutfitBank from './pages/OutfitBank';
import Closet from './pages/Closet';
import Resale from './pages/Resale';
import MyPage from './pages/MyPage';
import OutfitFeed from './pages/Feed/OutfitFeed';
import OutfitDetail from './pages/OutfitDetail';
import Sellers from './pages/Sellers';
import Creators from './pages/Creators';
import Compare from './pages/Compare';
import Subscription from './pages/Subscription';
import Layout from './components/Layout';

const queryClient = new QueryClient();

// Initialize sample data
initializeSampleData();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/outfit-bank" element={<ProtectedRoute><OutfitBank /></ProtectedRoute>} />
    <Route path="/closet" element={<ProtectedRoute><Closet /></ProtectedRoute>} />
    <Route path="/resale" element={<ProtectedRoute><Resale /></ProtectedRoute>} />
    <Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
    <Route path="/feed" element={<ProtectedRoute><OutfitFeed /></ProtectedRoute>} />
    <Route path="/outfit/:id" element={<ProtectedRoute><OutfitDetail /></ProtectedRoute>} />
    <Route path="/sellers" element={<ProtectedRoute><Sellers /></ProtectedRoute>} />
    <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
    <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
    <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;