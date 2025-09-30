"use client";

import { getCurrentUser } from "@/app/auth";
import { useUpdateUser } from "@/app/lib/hooks/use-user-queries";
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
import { Calendar, Edit2, Mail, Save, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UpdateUser>>({});
  const [loading, setLoading] = useState(true);

  const { updateUser, updateUserLoading, updateUserError } = useUpdateUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Not Logged In
          </h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0).toUpperCase() || (
                      <UserIcon className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last updated {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={updateUserLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateUserLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {updateUserError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{updateUserError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{user.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm font-medium text-gray-500">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  {isEditing ? (
                    <Input
                      id="image"
                      value={editForm.image || ""}
                      onChange={(e) =>
                        handleInputChange("image", e.target.value)
                      }
                      placeholder="Enter image URL"
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {user.image || "No image set"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/profile/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>
                    View your profile analytics and statistics
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/profile/settings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
