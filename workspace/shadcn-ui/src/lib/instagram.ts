// Instagram Integration Service
// Note: This is a simulated implementation for demo purposes
// Production would require Instagram Basic Display API integration

export interface InstagramPost {
    id: string;
    imageUrl: string;
    caption: string;
    timestamp: string;
    permalink: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

export interface InstagramConnection {
    isConnected: boolean;
    username?: string;
    userId?: string;
    accessToken?: string;
    connectedAt?: string;
}

// Storage keys
const INSTAGRAM_CONNECTION_KEY = 'instagram_connection';

// Mock Instagram posts for demo
const MOCK_INSTAGRAM_POSTS: InstagramPost[] = [
    {
        id: 'ig_post_1',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        caption: '오늘의 OOTD 💕 베이지 블레이저로 시크하게 #데일리룩 #패션',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock1',
        mediaType: 'IMAGE',
    },
    {
        id: 'ig_post_2',
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
        caption: '새로 산 가죽 재킷 👗 완전 마음에 들어요! #쇼핑 #레더재킷',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock2',
        mediaType: 'IMAGE',
    },
    {
        id: 'ig_post_3',
        imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
        caption: '트렌치코트 시즌이 돌아왔어요 🍂 #가을패션 #트렌치코트',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock3',
        mediaType: 'IMAGE',
    },
    {
        id: 'ig_post_4',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        caption: '화이트 셔츠는 언제나 옳다 ✨ #베이직아이템 #화이트셔츠',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock4',
        mediaType: 'IMAGE',
    },
    {
        id: 'ig_post_5',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        caption: '데님 진은 역시 클래식 👖 #데님 #진스타그램',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock5',
        mediaType: 'IMAGE',
    },
    {
        id: 'ig_post_6',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
        caption: '니트 스웨터로 따뜻하게 🧶 #니트 #겨울패션',
        timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        permalink: 'https://instagram.com/p/mock6',
        mediaType: 'IMAGE',
    },
];

/**
 * Simulates Instagram OAuth connection
 * In production, this would redirect to Instagram OAuth and handle callback
 */
export const connectInstagram = async (userId: string): Promise<InstagramConnection> => {
    // Simulate OAuth delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const connection: InstagramConnection = {
        isConnected: true,
        username: 'fashion_lover_' + userId.substring(0, 6),
        userId: userId,
        accessToken: 'mock_access_token_' + Date.now(),
        connectedAt: new Date().toISOString(),
    };

    // Store connection in localStorage
    localStorage.setItem(INSTAGRAM_CONNECTION_KEY + '_' + userId, JSON.stringify(connection));

    return connection;
};

/**
 * Disconnects Instagram account
 */
export const disconnectInstagram = (userId: string): void => {
    localStorage.removeItem(INSTAGRAM_CONNECTION_KEY + '_' + userId);
};

/**
 * Gets Instagram connection status for a user
 */
export const getInstagramConnection = (userId: string): InstagramConnection | null => {
    const data = localStorage.getItem(INSTAGRAM_CONNECTION_KEY + '_' + userId);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
};

/**
 * Checks if user has connected Instagram
 */
export const isInstagramConnected = (userId: string): boolean => {
    const connection = getInstagramConnection(userId);
    return connection?.isConnected ?? false;
};

/**
 * Fetches Instagram media for connected user
 * In production, this would call Instagram Graph API
 */
export const fetchInstagramMedia = async (userId: string): Promise<InstagramPost[]> => {
    const connection = getInstagramConnection(userId);

    if (!connection?.isConnected) {
        throw new Error('Instagram not connected');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return mock posts
    return MOCK_INSTAGRAM_POSTS;
};

/**
 * Extracts clothing item information from Instagram post
 * In production, this could use AI/ML to detect clothing items
 */
export const extractClothingFromPost = (post: InstagramPost): {
    name: string;
    brand: string;
    estimatedPrice: number;
} => {
    // Simple keyword extraction from caption
    const caption = post.caption.toLowerCase();

    let name = '인스타그램 아이템';
    let brand = 'Unknown';
    let estimatedPrice = 50000;

    // Extract item name from caption
    if (caption.includes('블레이저') || caption.includes('재킷')) {
        name = caption.includes('베이지') ? '베이지 블레이저' : '재킷';
        estimatedPrice = 89000;
    } else if (caption.includes('셔츠')) {
        name = '화이트 셔츠';
        brand = 'UNIQLO';
        estimatedPrice = 29900;
    } else if (caption.includes('데님') || caption.includes('진')) {
        name = '블루 데님 진';
        brand = "Levi's";
        estimatedPrice = 129000;
    } else if (caption.includes('니트') || caption.includes('스웨터')) {
        name = '니트 스웨터';
        brand = 'H&M';
        estimatedPrice = 49900;
    } else if (caption.includes('트렌치') || caption.includes('코트')) {
        name = '트렌치 코트';
        brand = 'MANGO';
        estimatedPrice = 189000;
    } else if (caption.includes('가죽') || caption.includes('레더')) {
        name = '레더 재킷';
        brand = 'ZARA';
        estimatedPrice = 159000;
    }

    // Try to extract brand from hashtags
    const brandHashtags = ['#zara', '#uniqlo', '#hm', '#mango', '#cos', '#levis'];
    for (const tag of brandHashtags) {
        if (caption.includes(tag)) {
            brand = tag.replace('#', '').toUpperCase();
            break;
        }
    }

    return { name, brand, estimatedPrice };
};

/**
 * Gets Instagram post by ID
 */
export const getInstagramPostById = (postId: string): InstagramPost | undefined => {
    return MOCK_INSTAGRAM_POSTS.find(post => post.id === postId);
};
