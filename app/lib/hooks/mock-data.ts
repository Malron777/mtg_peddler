// Mock data hooks for MTG Trading Platform
// TODO: Replace with actual implementation using hexagonal architecture

export interface Collection {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  value?: number;
  isPublic: boolean;
  pendingDeals: number;
  lastUpdated: Date;
  status: "trade" | "sale" | "both";
  userId: string;
}

export interface UserStats {
  totalCards: number;
  collectionValue: number;
  activeDeals: number;
  wantMatches: number;
}

export interface RecentActivity {
  id: string;
  type: "collection" | "deal" | "trade" | "message";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  status: "pending" | "completed" | "in-progress";
}

export interface MarketplaceItem {
  id: string;
  name: string;
  set: string;
  rarity: "common" | "uncommon" | "rare" | "mythic" | "special";
  condition: "nm" | "lp" | "mp" | "hp" | "dmg";
  price: number;
  seller: {
    name: string;
    rating: number;
    reviewCount: number;
  };
  location: string;
  shipping: string;
  imageUrl?: string;
}

export interface WantList {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  budgetRemaining: number;
  matchesFound: number;
  priority: "high" | "medium" | "low";
  userId: string;
}

export interface Deal {
  id: string;
  otherParty: {
    name: string;
    rating: number;
    avatar?: string;
  };
  cards: Array<{
    name: string;
    imageUrl?: string;
    quantity: number;
  }>;
  totalValue: number;
  status: "negotiating" | "payment-pending" | "shipping" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  logoUrl?: string;
  isVerified: boolean;
  isOnlineOnly: boolean;
}

// Mock data
const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Modern Staples",
    description: "Essential cards for Modern format",
    cardCount: 156,
    value: 2847.5,
    isPublic: true,
    pendingDeals: 3,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "trade",
    userId: "user1",
  },
  {
    id: "2",
    name: "Commander Collection",
    description: "My favorite Commander decks",
    cardCount: 89,
    value: 1234.75,
    isPublic: false,
    pendingDeals: 1,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "sale",
    userId: "user1",
  },
  {
    id: "3",
    name: "Vintage Collection",
    description: "Old school Magic cards",
    cardCount: 45,
    value: 5678.9,
    isPublic: true,
    pendingDeals: 0,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "both",
    userId: "user1",
  },
  {
    id: "4",
    name: "Standard Rotation",
    description: "Current Standard format cards",
    cardCount: 234,
    value: 456.25,
    isPublic: true,
    pendingDeals: 2,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: "trade",
    userId: "user1",
  },
  {
    id: "5",
    name: "Pauper Staples",
    description: "Common cards for Pauper format",
    cardCount: 312,
    value: 89.5,
    isPublic: true,
    pendingDeals: 0,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "sale",
    userId: "user1",
  },
];

const mockUserStats: UserStats = {
  totalCards: 836,
  collectionValue: 10306.9,
  activeDeals: 6,
  wantMatches: 12,
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "deal",
    title: "New trade offer",
    description: "Received offer for Lightning Bolt playset",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    user: "MagicTrader123",
    status: "pending",
  },
  {
    id: "2",
    type: "collection",
    title: "Collection updated",
    description: "Added 15 new cards to Modern Staples",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "3",
    type: "message",
    title: "New message",
    description: "Discussion about card condition",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    user: "CardCollector456",
    status: "in-progress",
  },
  {
    id: "4",
    type: "trade",
    title: "Trade completed",
    description: "Successfully traded Tarmogoyf for Force of Will",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    user: "VintagePlayer789",
    status: "completed",
  },
];

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    name: "Lightning Bolt",
    set: "Magic 2010",
    rarity: "common",
    condition: "nm",
    price: 0.25,
    seller: {
      name: "QuickDeals",
      rating: 4.8,
      reviewCount: 1247,
    },
    location: "New York, NY",
    shipping: "Free shipping",
    imageUrl: "/api/placeholder/200/280",
  },
  {
    id: "2",
    name: "Black Lotus",
    set: "Alpha",
    rarity: "mythic",
    condition: "hp",
    price: 15000.0,
    seller: {
      name: "VintageVault",
      rating: 4.9,
      reviewCount: 89,
    },
    location: "Los Angeles, CA",
    shipping: "$50 insured",
    imageUrl: "/api/placeholder/200/280",
  },
  {
    id: "3",
    name: "Force of Will",
    set: "Alliances",
    rarity: "rare",
    condition: "lp",
    price: 89.99,
    seller: {
      name: "LegacyCards",
      rating: 4.7,
      reviewCount: 456,
    },
    location: "Chicago, IL",
    shipping: "$5.99",
    imageUrl: "/api/placeholder/200/280",
  },
];

const mockWantLists: WantList[] = [
  {
    id: "1",
    name: "Modern Burn Deck",
    description: "Building a competitive Modern burn deck",
    itemCount: 15,
    budgetRemaining: 234.5,
    matchesFound: 8,
    priority: "high",
    userId: "user1",
  },
  {
    id: "2",
    name: "Commander Staples",
    description: "Essential cards for Commander format",
    itemCount: 42,
    budgetRemaining: 567.75,
    matchesFound: 23,
    priority: "medium",
    userId: "user1",
  },
];

const mockDeals: Deal[] = [
  {
    id: "1",
    otherParty: {
      name: "MagicTrader123",
      rating: 4.8,
      avatar: "/api/placeholder/40/40",
    },
    cards: [
      { name: "Lightning Bolt", quantity: 4 },
      { name: "Chain Lightning", quantity: 2 },
    ],
    totalValue: 12.5,
    status: "negotiating",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "2",
    otherParty: {
      name: "CardCollector456",
      rating: 4.9,
      avatar: "/api/placeholder/40/40",
    },
    cards: [{ name: "Tarmogoyf", quantity: 1 }],
    totalValue: 89.99,
    status: "payment-pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockStores: Store[] = [
  {
    id: "1",
    name: "Mystic Games",
    location: "Seattle, WA",
    rating: 4.8,
    reviewCount: 1247,
    specialties: ["Modern", "Legacy", "Vintage"],
    logoUrl: "/api/placeholder/60/60",
    isVerified: true,
    isOnlineOnly: false,
  },
  {
    id: "2",
    name: "Digital Card Vault",
    location: "Online Only",
    rating: 4.6,
    reviewCount: 892,
    specialties: ["Commander", "Pauper"],
    logoUrl: "/api/placeholder/60/60",
    isVerified: true,
    isOnlineOnly: true,
  },
];

// Hook implementations
export function useCollections() {
  return {
    data: mockCollections,
    isLoading: false,
    error: null,
  };
}

export function useUserStats() {
  return {
    data: mockUserStats,
    isLoading: false,
    error: null,
  };
}

export function useRecentActivity() {
  return {
    data: mockRecentActivity,
    isLoading: false,
    error: null,
  };
}

export function useMarketplaceSearch(query: string = "") {
  const filteredItems = query
    ? mockMarketplaceItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.set.toLowerCase().includes(query.toLowerCase())
      )
    : mockMarketplaceItems;

  return {
    data: filteredItems,
    isLoading: false,
    error: null,
  };
}

export function useWantLists() {
  return {
    data: mockWantLists,
    isLoading: false,
    error: null,
  };
}

export function useDeals() {
  return {
    data: mockDeals,
    isLoading: false,
    error: null,
  };
}

export function useStores() {
  return {
    data: mockStores,
    isLoading: false,
    error: null,
  };
}

export function useCollection(id: string) {
  const collection = mockCollections.find((c) => c.id === id);
  return {
    data: collection,
    isLoading: false,
    error: collection ? null : "Collection not found",
  };
}

export function useCollectionItems(id: string) {
  // Mock collection items - in real app this would fetch from API
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}
