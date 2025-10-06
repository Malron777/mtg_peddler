"use client";

import { getCurrentUser } from "@/app/auth-actions";
import { useUpdateUser } from "@/app/lib/hooks/user/use-user-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateUser, User } from "@/src/domain/auth/user.model";
import {
  BarChart3,
  Calendar,
  Edit2,
  Handshake,
  Heart,
  Mail,
  Package,
  Save,
  Settings,
  Shield,
  Star,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UpdateUser>>({});
  const [loading, setLoading] = useState(true);

  const {
    updateUser,
    loading: updateUserLoading,
    error: updateUserError,
  } = useUpdateUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser as User);
        if (currentUser) {
          setEditForm({
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.image,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        id: user.id,
        name: user.name,
        image: user.image,
      });
    }
  };

  const handleSave = async () => {
    if (!editForm.id) return;

    try {
      const updatedUser = await updateUser(editForm as UpdateUser);
      if (updatedUser) {
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleInputChange = (field: keyof UpdateUser, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--olive-50)] to-[var(--slate-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--olive-500)] mx-auto mb-4"></div>
          <p className="text-[var(--slate-600)] font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--olive-50)] to-[var(--slate-50)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--slate-900)] mb-4">
            Not Logged In
          </h1>
          <p className="text-[var(--slate-600)]">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--olive-600)] to-[var(--olive-800)] bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-[var(--slate-600)]">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-md">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-md">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-[var(--olive-400)] to-[var(--olive-600)] text-white">
                        {user.name?.charAt(0).toUpperCase() || (
                          <UserIcon className="h-12 w-12" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] rounded-md flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[var(--slate-900)]" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl text-[var(--slate-800)] mb-2">
                  {user.name}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 text-[var(--slate-600)]">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <div className="flex justify-center mt-4">
                  <Badge
                    variant={user.emailVerified ? "default" : "secondary"}
                    className={`${
                      user.emailVerified
                        ? "bg-gradient-to-r from-[var(--success)] to-[var(--success)] text-white"
                        : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-[var(--slate-600)]">
                  <Calendar className="h-4 w-4 text-[var(--olive-500)]" />
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--slate-600)]">
                  <Calendar className="h-4 w-4 text-[var(--olive-500)]" />
                  <span>
                    Last updated {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="pt-4 border-t border-[var(--slate-200)]">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[var(--olive-700)]">
                        12
                      </div>
                      <div className="text-xs text-[var(--slate-500)]">
                        Collections
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--olive-700)]">
                        8
                      </div>
                      <div className="text-xs text-[var(--slate-500)]">
                        Active Trades
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl text-[var(--slate-800)]">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-[var(--slate-600)]">
                    Manage your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] hover:border-[var(--olive-300)] rounded-md"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={updateUserLoading}
                      className="bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] text-white rounded-md"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateUserLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={updateUserLoading}
                      className="border-[var(--slate-300)] text-[var(--slate-600)] hover:bg-[var(--slate-50)] rounded-md"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {updateUserError && (
                  <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
                    <p className="text-sm text-[var(--error)]">
                      {updateUserError}
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[var(--slate-700)] font-medium"
                    >
                      Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter your name"
                        disabled={updateUserLoading}
                        className="border-[var(--olive-200)] focus:border-[var(--olive-400)] focus:ring-[var(--olive-100)] rounded-md"
                      />
                    ) : (
                      <p className="text-[var(--slate-800)] font-medium">
                        {user.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[var(--slate-700)] font-medium"
                    >
                      Email
                    </Label>
                    <p className="text-[var(--slate-600)] font-medium">
                      {user.email}
                    </p>
                    <p className="text-xs text-[var(--slate-500)]">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="image"
                      className="text-[var(--slate-700)] font-medium"
                    >
                      Profile Image URL
                    </Label>
                    {isEditing ? (
                      <Input
                        id="image"
                        value={editForm.image || ""}
                        onChange={(e) =>
                          handleInputChange("image", e.target.value)
                        }
                        placeholder="Enter image URL"
                        disabled={updateUserLoading}
                        className="border-[var(--olive-200)] focus:border-[var(--olive-400)] focus:ring-[var(--olive-100)] rounded-md"
                      />
                    ) : (
                      <p className="text-[var(--slate-600)] font-medium">
                        {user.image || "No image set"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/profile/analytics">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg text-[var(--slate-800)]">
                        Analytics
                      </CardTitle>
                    </div>
                    <CardDescription className="text-[var(--slate-600)]">
                      View your profile analytics and trading statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-[var(--olive-600)]">
                      <TrendingUp className="h-4 w-4" />
                      <span>View detailed metrics</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/profile/settings">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="h-5 w-5 text-[var(--slate-900)]" />
                      </div>
                      <CardTitle className="text-lg text-[var(--slate-800)]">
                        Settings
                      </CardTitle>
                    </div>
                    <CardDescription className="text-[var(--slate-600)]">
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-[var(--gold-600)]">
                      <Shield className="h-4 w-4" />
                      <span>Privacy & security</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Activity Overview */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                  <Star className="h-5 w-5 text-[var(--gold-500)]" />
                  Activity Overview
                </CardTitle>
                <CardDescription className="text-[var(--slate-600)]">
                  Your recent trading activity and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-[var(--olive-50)] to-[var(--olive-100)] rounded-md">
                    <Package className="h-8 w-8 text-[var(--olive-600)] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[var(--olive-700)]">
                      12
                    </div>
                    <div className="text-sm text-[var(--slate-600)]">
                      Collections
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[var(--gold-50)] to-[var(--gold-100)] rounded-md">
                    <Heart className="h-8 w-8 text-[var(--gold-600)] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[var(--gold-700)]">
                      5
                    </div>
                    <div className="text-sm text-[var(--slate-600)]">
                      Want Lists
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[var(--slate-50)] to-[var(--slate-100)] rounded-md">
                    <Handshake className="h-8 w-8 text-[var(--slate-600)] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[var(--slate-700)]">
                      8
                    </div>
                    <div className="text-sm text-[var(--slate-600)]">
                      Active Trades
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
