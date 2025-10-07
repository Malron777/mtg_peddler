"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { PageHeader } from "@/app/_components/page-header";
import { SearchBar } from "@/app/_components/search-bar";
import { getCurrentUser } from "@/app/auth-actions";
import { useStores } from "@/app/lib/hooks/store/use-stores.hook";
import { useUsersFromUseCase } from "@/app/lib/hooks/user/use-users.hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Plus,
  Shield,
  SlidersHorizontal,
  Star,
  Store,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type CreateStoreFormData = {
  name: string;
  description?: string;
  websiteUrl?: string;
  physicalAddress?: string;
};

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    websiteUrl?: string | null;
    physicalAddress?: string | null;
    description?: string | null;
    isVerified: boolean;
    createdBy: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    reputationScore: string;
    role: "admin" | "user" | "store";
    preferredCurrency: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

function StoreCard({ store }: StoreCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-olive-100 text-olive-700">
            <Store className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{store.name}</h3>
            {store.isVerified && (
              <Badge className="bg-blue-100 text-blue-700">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {store.physicalAddress && (
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span>{store.physicalAddress}</span>
            </div>
          )}

          {store.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {store.description}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <Calendar className="h-3 w-3" />
            <span>
              Created {new Date(store.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {store.websiteUrl && (
          <Button
            className="flex-1 bg-olive-600 hover:bg-olive-700 text-white"
            onClick={() => window.open(store.websiteUrl!, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
        )}
        <Button variant="outline">Message</Button>
      </div>
    </Card>
  );
}

function CreateStoreForm({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (store: CreateStoreFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteUrl: "",
    physicalAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const storeData: CreateStoreFormData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      websiteUrl: formData.websiteUrl.trim() || undefined,
      physicalAddress: formData.physicalAddress.trim() || undefined,
    };

    await onCreate(storeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Store</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter store name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your store"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                placeholder="https://yourstore.com"
              />
            </div>

            <div>
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Textarea
                id="physicalAddress"
                value={formData.physicalAddress}
                onChange={(e) =>
                  setFormData({ ...formData, physicalAddress: e.target.value })
                }
                placeholder="123 Main St, City, State, Country"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-olive-600 hover:bg-olive-700"
              >
                Create Store
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

function UserCard({ user }: UserCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "store":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "store":
        return "Store Owner";
      default:
        return "User";
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 min-h-[200px]">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="bg-slate-100 text-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-slate-900 truncate">
              {user.name}
            </h3>
            <Badge className={getRoleColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs">Email:</span>
            </div>
            <p className="text-sm text-slate-700 break-all pl-5">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-slate-700">
              Reputation: {user.reputationScore}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button className="flex-1 bg-olive-600 hover:bg-olive-700 text-white">
          View Profile
        </Button>
        <Button variant="outline">Message</Button>
      </div>
    </Card>
  );
}

export default function StoresPage() {
  const {
    getAllStores,
    getAllStoresLoading,
    getAllStoresError,
    getAllStoresData: stores,
    createStore,
  } = useStores();

  const {
    getAllUsers,
    getAllUsersLoading,
    getAllUsersError,
    getAllUsersData: users,
  } = useUsersFromUseCase();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"stores" | "users">("stores");
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
  } | null>(null);

  // Load data on component mount
  useEffect(() => {
    getAllStores();
    getAllUsers();

    // Get current user
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, [getAllStores, getAllUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateStore = async (storeData: CreateStoreFormData) => {
    try {
      await createStore(storeData);
      // Refresh the stores list after creating
      await getAllStores();
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };

  const filteredStores = (stores || []).filter((store) => {
    const matchesSearch =
      !searchQuery ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description &&
        store.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (store.physicalAddress &&
        store.physicalAddress
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesVerified = !filterVerified || store.isVerified;

    return matchesSearch && matchesVerified;
  });

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const verifiedStores = (stores || []).filter((s) => s.isVerified).length;
  const totalUsers = users?.length || 0;
  const adminUsers = (users || []).filter((u) => u.role === "admin").length;
  const storeUsers = (users || []).filter((u) => u.role === "store").length;

  if (getAllStoresLoading || getAllUsersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading stores and users...</p>
        </div>
      </div>
    );
  }

  if (getAllStoresError || getAllUsersError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading data: {getAllStoresError || getAllUsersError}
          </p>
          <Button
            onClick={() => {
              getAllStores();
              getAllUsers();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Stores & Users"
          description="Discover Magic: The Gathering stores and community members"
          actions={
            activeTab === "stores" &&
            currentUser?.role === "admin" && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-olive-600 hover:bg-olive-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Store
              </Button>
            )
          }
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("stores")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "stores"
                  ? "bg-white text-olive-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="h-4 w-4 inline mr-2" />
              Stores ({stores?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-white text-olive-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users ({users?.length || 0})
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {activeTab === "stores" ? (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Stores
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stores?.length || 0}
                    </p>
                  </div>
                  <Store className="h-8 w-8 text-olive-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Verified
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {verifiedStores}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      With Website
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(stores || []).filter((s) => s.websiteUrl).length}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Physical Locations
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(stores || []).filter((s) => s.physicalAddress).length}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-olive-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Admins</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {adminUsers}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Store Owners
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {storeUsers}
                    </p>
                  </div>
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Regular Users
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalUsers - adminUsers - storeUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder={
                  activeTab === "stores"
                    ? "Search stores, descriptions, or locations..."
                    : "Search users by name or email..."
                }
                onSearch={handleSearch}
                filters={
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <Card className="mt-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeTab === "stores" ? (
                  <>
                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        Store Type
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filterVerified}
                            onChange={(e) =>
                              setFilterVerified(e.target.checked)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">
                            Verified Stores Only
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        Location
                      </h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="City, State, Country"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        Features
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-slate-700">
                            Has Website
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-slate-700">
                            Physical Location
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        User Role
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="all"
                            checked={filterRole === "all"}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">
                            All Users
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={filterRole === "user"}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">
                            Regular Users
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="store"
                            checked={filterRole === "store"}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">
                            Store Owners
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={filterRole === "admin"}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">Admins</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        Reputation
                      </h3>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">
                        Join Date
                      </h3>
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeTab === "stores"
                ? "All Stores"
                : "All Users"}
            </h2>
            <p className="text-slate-600">
              {activeTab === "stores"
                ? `${filteredStores.length} stores found`
                : `${filteredUsers.length} users found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select className="px-3 py-2 border border-slate-300 rounded-md text-sm">
              {activeTab === "stores" ? (
                <>
                  <option>Name: A to Z</option>
                  <option>Name: Z to A</option>
                  <option>Verified First</option>
                  <option>Recently Created</option>
                </>
              ) : (
                <>
                  <option>Name: A to Z</option>
                  <option>Name: Z to A</option>
                  <option>Reputation: High to Low</option>
                  <option>Recently Joined</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === "stores" ? (
          filteredStores.length > 0 ? (
            <CardGrid>
              {filteredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12">
              <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Store className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery || filterVerified
                  ? "No stores found"
                  : "No stores yet"}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || filterVerified
                  ? "Try adjusting your search terms or filters to find stores."
                  : currentUser?.role === "admin"
                  ? "Be the first to create a store and start trading Magic: The Gathering cards!"
                  : "No stores have been created yet. Contact an administrator to create a store."}
              </p>
              <div className="flex gap-2 justify-center">
                {searchQuery || filterVerified ? (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterVerified(false);
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                ) : currentUser?.role === "admin" ? (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-olive-600 hover:bg-olive-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Store
                  </Button>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Only administrators can create stores.
                  </p>
                )}
              </div>
            </div>
          )
        ) : filteredUsers.length > 0 ? (
          <CardGrid columns={2}>
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No users found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search terms or filters to find users.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterRole("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Create Store Form Modal */}
      {showCreateForm && (
        <CreateStoreForm
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreateStore}
        />
      )}
    </div>
  );
}
