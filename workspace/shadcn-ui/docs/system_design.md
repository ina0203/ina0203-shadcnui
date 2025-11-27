# Style Bank Platform - System Design

## 1. Overview
Style Bank is a fashion platform connecting creators, sellers, and users through outfit inspiration and shopping.

## 2. User Roles
- **User**: Browse outfits, purchase products, manage closet
- **Creator**: Create outfit cards, earn revenue from engagement
- **Seller**: Register and sell products
- **Admin**: Manage users and content

## 3. Database Schema

### users (Supabase Auth)
- id (uuid, primary key)
- email (string)
- role (enum: 'user', 'creator', 'seller', 'admin')
- created_at (timestamp)

### profiles
- id (uuid, foreign key to auth.users)
- username (string)
- avatar_url (string)
- bio (text)
- total_points (integer, default: 0)
- created_at (timestamp)

### outfit_cards
- id (uuid, primary key)
- creator_id (uuid, foreign key to profiles)
- title (string)
- description (text)
- image_url (string)
- likes (integer, default: 0)
- comments (integer, default: 0)
- instagram_url (string, nullable)
- estimated_revenue (integer)
- created_at (timestamp)

### products
- id (uuid, primary key)
- seller_id (uuid, foreign key to profiles)
- name (string)
- description (text)
- price (integer)
- image_url (string)
- stock (integer)
- category (string)
- created_at (timestamp)

### outfit_products (junction table)
- outfit_id (uuid, foreign key to outfit_cards)
- product_id (uuid, foreign key to products)
- created_at (timestamp)

### orders
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- seller_id (uuid, foreign key to profiles)
- total_amount (integer)
- status (enum: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
- shipping_address (jsonb)
- created_at (timestamp)

### order_items
- id (uuid, primary key)
- order_id (uuid, foreign key to orders)
- product_id (uuid, foreign key to products)
- quantity (integer)
- price (integer)
- created_at (timestamp)

### closet_items
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- product_id (uuid, foreign key to products, nullable)
- name (string)
- brand (string)
- purchase_price (integer)
- purchase_date (date)
- image_url (string)
- wear_count (integer, default: 0)
- auto_registered (boolean, default: false)
- created_at (timestamp)

### wear_records
- id (uuid, primary key)
- closet_item_id (uuid, foreign key to closet_items)
- user_id (uuid, foreign key to profiles)
- worn_at (timestamp)
- points_earned (integer, default: 10)
- created_at (timestamp)

## 4. Storage Buckets
- **avatars**: User profile pictures
- **outfit-images**: Outfit card images
- **product-images**: Product images
- **closet-images**: Closet item images

## 5. Row Level Security (RLS) Policies

### profiles
- SELECT: Public (anyone can view profiles)
- INSERT/UPDATE: Own profile only
- DELETE: Admin only

### outfit_cards
- SELECT: Public (anyone can view)
- INSERT: Creators only
- UPDATE/DELETE: Own outfits only or Admin

### products
- SELECT: Public (anyone can view)
- INSERT: Sellers only
- UPDATE/DELETE: Own products only or Admin

### orders
- SELECT: Own orders only or Admin
- INSERT: Authenticated users
- UPDATE: Seller (status update) or Admin
- DELETE: Admin only

### closet_items
- SELECT/INSERT/UPDATE/DELETE: Own items only

### wear_records
- SELECT/INSERT/UPDATE/DELETE: Own records only

## 6. Key Features Implementation

### Authentication Flow
1. User signs up with email/password
2. Profile created automatically via trigger
3. Role assigned (default: 'user')
4. JWT token issued for subsequent requests

### Outfit Feed
1. Query outfit_cards with creator profiles
2. Left join outfit_products and products
3. Order by created_at DESC or likes DESC
4. Pagination (10-20 items per page)

### Purchase Flow
1. User adds products to cart (localStorage)
2. Creates order with shipping info
3. Order items created for each product
4. Stock decremented
5. Closet items auto-created with auto_registered=true
6. Points awarded to user

### Closet Management
1. Display all closet items (auto + manual)
2. Add wear record -> increment wear_count
3. Award points (10 per wear)
4. Calculate utilization rate: wear_count / days_owned

## 7. API Integration Points

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### Key Operations
- Auth: `supabase.auth.signUp/signIn/signOut`
- Query: `supabase.from('table').select/insert/update/delete`
- Storage: `supabase.storage.from('bucket').upload/download`
- Realtime: `supabase.from('table').on('INSERT', callback)`

## 8. File Structure
```
src/
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── auth.ts              # Auth helpers
│   └── database.types.ts    # TypeScript types
├── hooks/
│   ├── useAuth.tsx          # Auth context
│   ├── useOutfits.tsx       # Outfit queries
│   └── useProducts.tsx      # Product queries
├── pages/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── Feed/
│   │   ├── OutfitFeed.tsx
│   │   └── OutfitDetail.tsx
│   ├── Creator/
│   │   └── CreatorDashboard.tsx
│   ├── Seller/
│   │   ├── ProductManagement.tsx
│   │   └── SellerDashboard.tsx
│   ├── Shop/
│   │   ├── Cart.tsx
│   │   └── Checkout.tsx
│   ├── Closet/
│   │   └── Closet.tsx (enhanced)
│   └── Admin/
│       └── AdminDashboard.tsx
└── components/
    ├── OutfitCard.tsx
    ├── ProductCard.tsx
    └── ProtectedRoute.tsx
```

## 9. Development Phases

### Phase 1: Foundation (Current)
- Database schema setup
- Authentication system
- Basic UI structure

### Phase 2: Core Features
- Outfit feed and detail
- Product management
- Shopping cart

### Phase 3: Advanced Features
- Order processing
- Closet auto-registration
- Points system

### Phase 4: Admin & Polish
- Admin dashboard
- Performance optimization
- UI/UX refinement