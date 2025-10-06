"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  BarChart3,
  Calendar,
  DollarSign,
  Handshake,
  Package,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

export default function ProfileAnalyticsPage() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--olive-600)] to-[var(--olive-800)] bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-[var(--slate-600)]">
            Track your trading performance and collection growth
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--slate-500)] flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--olive-700)] mb-1">
                $2,847.50
              </div>
              <p className="text-sm text-[var(--success)] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5% this month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--slate-500)] flex items-center gap-2">
                <Handshake className="h-4 w-4" />
                Completed Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--olive-700)] mb-1">
                47
              </div>
              <p className="text-sm text-[var(--success)] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8 this month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--slate-500)] flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--gold-700)] mb-1">
                4.9
              </div>
              <p className="text-sm text-[var(--slate-600)]">
                Based on 47 reviews
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--slate-500)] flex items-center gap-2">
                <Target className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--olive-700)] mb-1">
                98%
              </div>
              <p className="text-sm text-[var(--success)] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2% this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Collection Growth */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--olive-500)]" />
                Collection Growth
              </CardTitle>
              <CardDescription className="text-[var(--slate-600)]">
                Your collection value over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-[var(--olive-50)] to-[var(--olive-100)] rounded-md flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-[var(--olive-400)] mx-auto mb-4" />
                  <p className="text-[var(--slate-600)]">
                    Chart visualization coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Activity */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--slate-800)] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--gold-500)]" />
                Trading Activity
              </CardTitle>
              <CardDescription className="text-[var(--slate-600)]">
                Monthly trading volume and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-[var(--gold-50)] to-[var(--gold-100)] rounded-md flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-[var(--gold-400)] mx-auto mb-4" />
                  <p className="text-[var(--slate-600)]">
                    Chart visualization coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Stats */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--slate-800)] flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--olive-500)]" />
                Collection Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Total Cards</span>
                <span className="font-semibold text-[var(--slate-800)]">
                  1,247
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Unique Cards</span>
                <span className="font-semibold text-[var(--slate-800)]">
                  892
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Sets Collected</span>
                <span className="font-semibold text-[var(--slate-800)]">
                  23
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Avg. Card Value</span>
                <span className="font-semibold text-[var(--olive-700)]">
                  $2.28
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trading Stats */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--slate-800)] flex items-center gap-2">
                <Handshake className="h-5 w-5 text-[var(--gold-500)]" />
                Trading Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Active Trades</span>
                <span className="font-semibold text-[var(--slate-800)]">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">
                  Completed This Month
                </span>
                <span className="font-semibold text-[var(--slate-800)]">
                  12
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">
                  Avg. Trade Value
                </span>
                <span className="font-semibold text-[var(--gold-700)]">
                  $45.20
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--slate-600)]">Response Time</span>
                <span className="font-semibold text-[var(--success)]">
                  2.3 hrs
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Stats */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--slate-800)] flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--slate-500)]" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] rounded-md flex items-center justify-center">
                  <Star className="h-4 w-4 text-[var(--slate-900)]" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--slate-800)]">
                    Trusted Trader
                  </div>
                  <div className="text-sm text-[var(--slate-600)]">
                    50+ successful trades
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--olive-400)] to-[var(--olive-500)] rounded-md flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--slate-800)]">
                    Collection Master
                  </div>
                  <div className="text-sm text-[var(--slate-600)]">
                    1000+ cards collected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--slate-400)] to-[var(--slate-500)] rounded-md flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--slate-800)]">
                    Early Adopter
                  </div>
                  <div className="text-sm text-[var(--slate-600)]">
                    Joined in first month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
