import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
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
import Layout from './components/Layout';

const queryClient = new QueryClient();

// Initialize sample data
initializeSampleData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/outfit-bank" element={<OutfitBank />} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/resale" element={<Resale />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/feed" element={<OutfitFeed />} />
            <Route path="/outfit/:id" element={<OutfitDetail />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;