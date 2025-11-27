# Style Bank Platform - Development TODO

## Phase 1: Database & Authentication Setup

### 1.1 Database Schema (Supabase SQL)
- [ ] Create profiles table with RLS policies
- [ ] Create outfit_cards table with RLS policies
- [ ] Create products table with RLS policies
- [ ] Create outfit_products junction table
- [ ] Create orders table with RLS policies
- [ ] Create order_items table with RLS policies
- [ ] Create closet_items table with RLS policies
- [ ] Create wear_records table with RLS policies
- [ ] Create storage buckets (avatars, outfit-images, product-images, closet-images)
- [ ] Set up RLS policies for storage buckets

### 1.2 Supabase Client Setup
- [ ] Install @supabase/supabase-js
- [ ] Create src/lib/supabase.ts
- [ ] Create src/lib/database.types.ts
- [ ] Create environment variables

### 1.3 Authentication System
- [ ] Create src/hooks/useAuth.tsx (Auth context)
- [ ] Create src/pages/Auth/Login.tsx
- [ ] Create src/pages/Auth/Signup.tsx
- [ ] Create src/components/ProtectedRoute.tsx
- [ ] Update App.tsx with auth routes

## Phase 2: Outfit Feed & Creator Features

### 2.1 Outfit Feed
- [ ] Create src/hooks/useOutfits.tsx
- [ ] Create src/pages/Feed/OutfitFeed.tsx
- [ ] Create src/pages/Feed/OutfitDetail.tsx
- [ ] Create src/components/OutfitCard.tsx
- [ ] Implement pagination
- [ ] Implement filtering (latest, popular)

### 2.2 Creator Dashboard
- [ ] Create src/pages/Creator/CreatorDashboard.tsx
- [ ] Update OutfitBank.tsx to use Supabase
- [ ] Implement image upload to Supabase Storage
- [ ] Add product linking to outfits
- [ ] Show creator statistics

## Phase 3: Seller & Shopping Features

### 3.1 Product Management
- [ ] Create src/hooks/useProducts.tsx
- [ ] Create src/pages/Seller/ProductManagement.tsx
- [ ] Create src/pages/Seller/SellerDashboard.tsx
- [ ] Create src/components/ProductCard.tsx
- [ ] Implement product CRUD operations
- [ ] Implement image upload for products

### 3.2 Shopping Cart & Checkout
- [ ] Create src/pages/Shop/Cart.tsx
- [ ] Create src/pages/Shop/Checkout.tsx
- [ ] Implement cart state management
- [ ] Create order processing logic
- [ ] Implement payment UI (mock for now)

## Phase 4: Closet & Points System

### 4.1 Enhanced Closet
- [ ] Update src/pages/Closet.tsx to use Supabase
- [ ] Implement auto-registration from purchases
- [ ] Show purchase source (auto vs manual)
- [ ] Update wear record system
- [ ] Implement points calculation

### 4.2 Points & Analytics
- [ ] Create points tracking system
- [ ] Update MyPage.tsx with real data
- [ ] Implement utilization rate calculation
- [ ] Show purchase history

## Phase 5: Admin Features

### 5.1 Admin Dashboard
- [ ] Create src/pages/Admin/AdminDashboard.tsx
- [ ] Implement user management
- [ ] Implement content moderation
- [ ] Show platform statistics
- [ ] Implement role management

## Phase 6: Polish & Optimization

### 6.1 UI/UX Improvements
- [ ] Add loading states
- [ ] Add error handling
- [ ] Improve responsive design
- [ ] Add animations and transitions

### 6.2 Performance
- [ ] Implement image optimization
- [ ] Add caching strategies
- [ ] Optimize database queries
- [ ] Add real-time updates where needed

## Files to Create/Update

### New Files (18 files)
1. src/lib/supabase.ts
2. src/lib/database.types.ts
3. src/lib/auth.ts
4. src/hooks/useAuth.tsx
5. src/hooks/useOutfits.tsx
6. src/hooks/useProducts.tsx
7. src/pages/Auth/Login.tsx
8. src/pages/Auth/Signup.tsx
9. src/pages/Feed/OutfitFeed.tsx
10. src/pages/Feed/OutfitDetail.tsx
11. src/pages/Creator/CreatorDashboard.tsx
12. src/pages/Seller/ProductManagement.tsx
13. src/pages/Seller/SellerDashboard.tsx
14. src/pages/Shop/Cart.tsx
15. src/pages/Shop/Checkout.tsx
16. src/pages/Admin/AdminDashboard.tsx
17. src/components/OutfitCard.tsx
18. src/components/ProtectedRoute.tsx

### Files to Update (5 files)
1. src/App.tsx - Add new routes
2. src/components/Layout.tsx - Update navigation
3. src/pages/OutfitBank.tsx - Integrate Supabase
4. src/pages/Closet.tsx - Integrate Supabase
5. src/pages/MyPage.tsx - Show real data

### Total: 23 files (within 8-file limit per response, will work in phases)