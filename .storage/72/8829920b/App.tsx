import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { initializeSampleData } from '@/lib/database';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OutfitFeed from './pages/Feed/OutfitFeed';
import OutfitBank from './pages/OutfitBank';
import OutfitDetail from './pages/OutfitDetail';
import Closet from './pages/Closet';
import Resale from './pages/Resale';
import MyPage from './pages/MyPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <OutfitFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outfit/:id"
        element={
          <ProtectedRoute>
            <OutfitDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outfit-bank"
        element={
          <ProtectedRoute>
            <OutfitBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/closet"
        element={
          <ProtectedRoute>
            <Closet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resale"
        element={
          <ProtectedRoute>
            <Resale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-page"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

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