"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Download,
  Eye,
  Globe,
  Key,
  Lock,
  Mail,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    tradeUpdates: true,
    priceAlerts: true,
    weeklyDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    collectionsPublic: false,
    tradingHistory: true,
    showEmail: false,
    showLocation: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--olive-600)] to-[var(--olive-800)] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-[var(--slate-600)]">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-lg transition-all duration-300 rounded-md">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--slate-800)] flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[var(--olive-500)]" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <Card className="hover:shadow-lg transition-all duration-300 rounded-md">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[var(--olive-500)]" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-[var(--slate-600)]">
                  Choose how you want to be notified about trading activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[var(--olive-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Receive updates via email
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={notifications.email ? "default" : "secondary"}
                      className={
                        notifications.email
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {notifications.email ? "On" : "Off"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-[var(--olive-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Get instant notifications on your device
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={notifications.push ? "default" : "secondary"}
                      className={
                        notifications.push
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {notifications.push ? "On" : "Off"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-[var(--olive-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Trade Updates
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Notifications about trade status changes
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        notifications.tradeUpdates ? "default" : "secondary"
                      }
                      className={
                        notifications.tradeUpdates
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {notifications.tradeUpdates ? "On" : "Off"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-[var(--gold-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Price Alerts
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Get notified when cards reach target prices
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        notifications.priceAlerts ? "default" : "secondary"
                      }
                      className={
                        notifications.priceAlerts
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {notifications.priceAlerts ? "On" : "Off"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="hover:shadow-lg transition-all duration-300 rounded-md">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[var(--gold-500)]" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-[var(--slate-600)]">
                  Control what information is visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-[var(--gold-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Public Profile
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Make your profile visible to other traders
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={privacy.profilePublic ? "default" : "secondary"}
                      className={
                        privacy.profilePublic
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {privacy.profilePublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-[var(--gold-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Public Collections
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Allow others to view your collections
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        privacy.collectionsPublic ? "default" : "secondary"
                      }
                      className={
                        privacy.collectionsPublic
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {privacy.collectionsPublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-[var(--gold-500)]" />
                      <div>
                        <Label className="text-[var(--slate-700)] font-medium">
                          Trading History
                        </Label>
                        <p className="text-sm text-[var(--slate-500)]">
                          Show completed trades on your profile
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={privacy.tradingHistory ? "default" : "secondary"}
                      className={
                        privacy.tradingHistory
                          ? "bg-[var(--success)] text-white"
                          : "bg-[var(--slate-200)] text-[var(--slate-700)]"
                      }
                    >
                      {privacy.tradingHistory ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="hover:shadow-lg transition-all duration-300 rounded-md">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                  <Key className="h-5 w-5 text-[var(--slate-500)]" />
                  Account Actions
                </CardTitle>
                <CardDescription className="text-[var(--slate-600)]">
                  Manage your account data and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <div className="pt-4 border-t border-[var(--slate-200)]">
                  <Button
                    variant="outline"
                    className="border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10 rounded-md"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-xs text-[var(--slate-500)] mt-2">
                    This action cannot be undone. All your data will be
                    permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
