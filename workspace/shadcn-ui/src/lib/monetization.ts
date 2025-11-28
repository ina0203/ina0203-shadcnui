// Monetization Service
// Handles subscription tiers, affiliate links, sponsored content, and revenue tracking

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    price: number;
    monthlyPrice: number;
    features: string[];
    limits: {
        maxItems: number | null; // null = unlimited
        instagramSync: boolean;
        communityAccess: boolean;
        aiStyling: boolean;
        analytics: boolean;
        adsRemoved: boolean;
        prioritySupport: boolean;
    };
}

export interface AffiliateLink {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    productUrl: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commissionRate: number; // 0.10 = 10%
    createdAt: string;
}

export interface SponsoredContent {
    id: string;
    creatorId: string;
    brandId: string;
    brandName: string;
    outfitId: string;
    sponsorshipFee: number;
    impressions: number;
    clicks: number;
    conversions: number;
    status: 'pending' | 'active' | 'completed';
    createdAt: string;
}

export interface RevenueStats {
    totalRevenue: number;
    affiliateRevenue: number;
    sponsoredRevenue: number;
    subscriptionRevenue: number;
    thisMonth: number;
    lastMonth: number;
    growth: number; // percentage
}

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: '무료',
        price: 0,
        monthlyPrice: 0,
        features: [
            '기본 옷장 관리',
            '최대 10개 아이템',
            '착용 기록',
            '포인트 적립',
        ],
        limits: {
            maxItems: 10,
            instagramSync: false,
            communityAccess: false,
            aiStyling: false,
            analytics: false,
            adsRemoved: false,
            prioritySupport: false,
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 9900,
        monthlyPrice: 9900,
        features: [
            '무제한 아이템 등록',
            '인스타그램 자동 연동',
            '커뮤니티 클로젯 접근',
            '광고 제거',
            '상세 활용률 분석',
            '제휴 마케팅 수익',
        ],
        limits: {
            maxItems: null,
            instagramSync: true,
            communityAccess: true,
            aiStyling: false,
            analytics: true,
            adsRemoved: true,
            prioritySupport: false,
        },
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 19900,
        monthlyPrice: 19900,
        features: [
            'Pro 플랜의 모든 기능',
            'AI 스타일링 추천',
            '우선 고객 지원',
            '스폰서 콘텐츠 제작',
            '고급 수익 분석',
            '브랜드 협찬 매칭',
        ],
        limits: {
            maxItems: null,
            instagramSync: true,
            communityAccess: true,
            aiStyling: true,
            analytics: true,
            adsRemoved: true,
            prioritySupport: true,
        },
    },
];

// Storage keys
const SUBSCRIPTION_KEY = 'user_subscription';
const AFFILIATE_LINKS_KEY = 'affiliate_links';
const SPONSORED_CONTENT_KEY = 'sponsored_content';

/**
 * Get subscription plan details
 */
export const getSubscriptionPlan = (tier: SubscriptionTier): SubscriptionPlan => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === tier) || SUBSCRIPTION_PLANS[0];
};

/**
 * Get user's current subscription
 */
export const getUserSubscription = (userId: string): SubscriptionTier => {
    const key = `${SUBSCRIPTION_KEY}_${userId}`;
    const subscription = localStorage.getItem(key);
    return (subscription as SubscriptionTier) || 'free';
};

/**
 * Update user's subscription
 */
export const updateSubscription = (userId: string, tier: SubscriptionTier): void => {
    const key = `${SUBSCRIPTION_KEY}_${userId}`;
    localStorage.setItem(key, tier);

    // Log subscription change
    console.log(`User ${userId} upgraded to ${tier}`);
};

/**
 * Check if user has access to a feature
 */
export const hasFeatureAccess = (userId: string, feature: keyof SubscriptionPlan['limits']): boolean => {
    const tier = getUserSubscription(userId);
    const plan = getSubscriptionPlan(tier);
    return plan.limits[feature] as boolean;
};

/**
 * Get affiliate links for user
 */
export const getAffiliateLinks = (userId: string): AffiliateLink[] => {
    const data = localStorage.getItem(AFFILIATE_LINKS_KEY);
    if (!data) return [];

    try {
        const allLinks: AffiliateLink[] = JSON.parse(data);
        return allLinks.filter(link => link.userId === userId);
    } catch {
        return [];
    }
};

/**
 * Create affiliate link
 */
export const createAffiliateLink = (
    userId: string,
    productId: string,
    productName: string,
    productUrl: string,
    commissionRate: number = 0.10
): AffiliateLink => {
    const data = localStorage.getItem(AFFILIATE_LINKS_KEY);
    const allLinks: AffiliateLink[] = data ? JSON.parse(data) : [];

    const newLink: AffiliateLink = {
        id: `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        productId,
        productName,
        productUrl: `${productUrl}?ref=${userId}`,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        commissionRate,
        createdAt: new Date().toISOString(),
    };

    allLinks.push(newLink);
    localStorage.setItem(AFFILIATE_LINKS_KEY, JSON.stringify(allLinks));

    return newLink;
};

/**
 * Track affiliate link click
 */
export const trackAffiliateClick = (linkId: string): void => {
    const data = localStorage.getItem(AFFILIATE_LINKS_KEY);
    if (!data) return;

    const allLinks: AffiliateLink[] = JSON.parse(data);
    const link = allLinks.find(l => l.id === linkId);

    if (link) {
        link.clicks++;
        localStorage.setItem(AFFILIATE_LINKS_KEY, JSON.stringify(allLinks));
    }
};

/**
 * Track affiliate conversion (purchase)
 */
export const trackAffiliateConversion = (linkId: string, purchaseAmount: number): void => {
    const data = localStorage.getItem(AFFILIATE_LINKS_KEY);
    if (!data) return;

    const allLinks: AffiliateLink[] = JSON.parse(data);
    const link = allLinks.find(l => l.id === linkId);

    if (link) {
        link.conversions++;
        link.revenue += purchaseAmount * link.commissionRate;
        localStorage.setItem(AFFILIATE_LINKS_KEY, JSON.stringify(allLinks));
    }
};

/**
 * Get sponsored content for user
 */
export const getSponsoredContent = (userId: string): SponsoredContent[] => {
    const data = localStorage.getItem(SPONSORED_CONTENT_KEY);
    if (!data) return [];

    try {
        const allContent: SponsoredContent[] = JSON.parse(data);
        return allContent.filter(content => content.creatorId === userId);
    } catch {
        return [];
    }
};

/**
 * Create sponsored content
 */
export const createSponsoredContent = (
    creatorId: string,
    brandId: string,
    brandName: string,
    outfitId: string,
    sponsorshipFee: number
): SponsoredContent => {
    const data = localStorage.getItem(SPONSORED_CONTENT_KEY);
    const allContent: SponsoredContent[] = data ? JSON.parse(data) : [];

    const newContent: SponsoredContent = {
        id: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        creatorId,
        brandId,
        brandName,
        outfitId,
        sponsorshipFee,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
    };

    allContent.push(newContent);
    localStorage.setItem(SPONSORED_CONTENT_KEY, JSON.stringify(allContent));

    return newContent;
};

/**
 * Track sponsored content impression
 */
export const trackSponsoredImpression = (contentId: string): void => {
    const data = localStorage.getItem(SPONSORED_CONTENT_KEY);
    if (!data) return;

    const allContent: SponsoredContent[] = JSON.parse(data);
    const content = allContent.find(c => c.id === contentId);

    if (content) {
        content.impressions++;
        localStorage.setItem(SPONSORED_CONTENT_KEY, JSON.stringify(allContent));
    }
};

/**
 * Calculate revenue statistics for user
 */
export const calculateRevenueStats = (userId: string): RevenueStats => {
    const affiliateLinks = getAffiliateLinks(userId);
    const sponsoredContent = getSponsoredContent(userId);

    const affiliateRevenue = affiliateLinks.reduce((sum, link) => sum + link.revenue, 0);
    const sponsoredRevenue = sponsoredContent
        .filter(c => c.status === 'completed')
        .reduce((sum, content) => sum + content.sponsorshipFee, 0);

    const totalRevenue = affiliateRevenue + sponsoredRevenue;

    // Mock monthly data (in production, would calculate from actual dates)
    const thisMonth = totalRevenue * 0.3;
    const lastMonth = totalRevenue * 0.25;
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
        totalRevenue,
        affiliateRevenue,
        sponsoredRevenue,
        subscriptionRevenue: 0, // Platform revenue, not user revenue
        thisMonth,
        lastMonth,
        growth,
    };
};

/**
 * Get recommended products for affiliate marketing
 */
export const getRecommendedProducts = (itemName: string, brand: string) => {
    // Mock product recommendations
    return [
        {
            id: 'prod_1',
            name: `${itemName} - 유사 상품`,
            brand: brand,
            price: 89000,
            imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',
            affiliateUrl: 'https://example.com/product1',
            commission: 0.12,
        },
        {
            id: 'prod_2',
            name: `${brand} 추천 아이템`,
            brand: brand,
            price: 129000,
            imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300',
            affiliateUrl: 'https://example.com/product2',
            commission: 0.10,
        },
        {
            id: 'prod_3',
            name: '스타일리시한 대체 상품',
            brand: 'Premium Brand',
            price: 159000,
            imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300',
            affiliateUrl: 'https://example.com/product3',
            commission: 0.15,
        },
    ];
};
