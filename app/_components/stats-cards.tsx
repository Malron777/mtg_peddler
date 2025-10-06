"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Handshake,
  Heart,
  Package,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  href,
  className = "",
}: StatCardProps) {
  const cardContent = (
    <Card
      className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-[var(--slate-500)] flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[var(--olive-700)] mb-1">
          {value}
        </div>
        {change && (
          <div
            className={`text-xs flex items-center gap-1 ${
              change.type === "positive"
                ? "text-[var(--success)]"
                : change.type === "negative"
                ? "text-[var(--error)]"
                : "text-[var(--slate-500)]"
            }`}
          >
            {change.type === "positive" && <TrendingUp className="w-3 h-3" />}
            {change.type === "negative" && <TrendingDown className="w-3 h-3" />}
            {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

interface StatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    change?: {
      value: string;
      type: "positive" | "negative" | "neutral";
    };
    icon?: React.ReactNode;
    href?: string;
  }>;
  className?: string;
}

export function StatsGrid({ stats, className = "" }: StatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          href={stat.href}
        />
      ))}
    </div>
  );
}

// Predefined stat cards for common marketplace metrics
export function ActiveTradesCard({ count = 0 }: { count?: number }) {
  return (
    <StatCard
      title="Active Trades"
      value={count}
      change={{
        value: "↑ 12% this week",
        type: "positive",
      }}
      icon={<Handshake className="w-4 h-4" />}
      href="/deals"
    />
  );
}

export function CollectionValueCard({ value = 0 }: { value?: number }) {
  return (
    <StatCard
      title="Collection Value"
      value={`$${value.toFixed(2)}`}
      change={{
        value: "↑ 5.3% this month",
        type: "positive",
      }}
      icon={<Package className="w-4 h-4" />}
      href="/collections"
    />
  );
}

export function CompletedDealsCard({ count = 0 }: { count?: number }) {
  return (
    <StatCard
      title="Completed Deals"
      value={count}
      change={{
        value: "⭐ 4.9 rating",
        type: "neutral",
      }}
      icon={<Star className="w-4 h-4" />}
      href="/deals"
    />
  );
}

export function WantListMatchesCard({ count = 0 }: { count?: number }) {
  return (
    <StatCard
      title="Want List Matches"
      value={count}
      change={{
        value: "🔔 3 new today",
        type: "neutral",
      }}
      icon={<Heart className="w-4 h-4" />}
      href="/wants"
    />
  );
}

// Combined marketplace stats component
interface MarketplaceStatsProps {
  activeTradesCount?: number;
  collectionValue?: number;
  completedDealsCount?: number;
  wantListMatchesCount?: number;
  className?: string;
}

export function MarketplaceStats({
  activeTradesCount = 0,
  collectionValue = 0,
  completedDealsCount = 0,
  wantListMatchesCount = 0,
  className = "",
}: MarketplaceStatsProps) {
  return (
    <StatsGrid
      className={className}
      stats={[
        {
          title: "Active Trades",
          value: activeTradesCount,
          change: { value: "↑ 12% this week", type: "positive" },
          icon: <Handshake className="w-4 h-4" />,
          href: "/deals",
        },
        {
          title: "Collection Value",
          value: `$${collectionValue.toFixed(2)}`,
          change: { value: "↑ 5.3% this month", type: "positive" },
          icon: <Package className="w-4 h-4" />,
          href: "/collections",
        },
        {
          title: "Completed Deals",
          value: completedDealsCount,
          change: { value: "⭐ 4.9 rating", type: "neutral" },
          icon: <Star className="w-4 h-4" />,
          href: "/deals",
        },
        {
          title: "Want List Matches",
          value: wantListMatchesCount,
          change: { value: "🔔 3 new today", type: "neutral" },
          icon: <Heart className="w-4 h-4" />,
          href: "/wants",
        },
      ]}
    />
  );
}
