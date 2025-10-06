"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, Globe, Lock, Package, Target } from "lucide-react";

interface CollectionCardProps {
  id: string;
  name: string;
  cardCount: number;
  value?: number;
  isPublic: boolean;
  pendingDeals?: number;
  lastUpdated: Date;
  status?: "trade" | "sale" | "both";
  className?: string;
}

export function CollectionCard({
  id,
  name,
  cardCount,
  value,
  isPublic,
  pendingDeals = 0,
  lastUpdated,
  status = "trade",
  className,
}: CollectionCardProps) {
  const statusColors = {
    trade: "border-olive-500",
    sale: "border-cyan-500",
    both: "border-violet-500",
  };

  const formatValue = (val?: number) => {
    if (!val) return "No value";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );
  };

  return (
    <Card
      className={cn(
        "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-slate-100 border-l-4",
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Globe className="h-4 w-4 text-slate-500" />
          ) : (
            <Lock className="h-4 w-4 text-slate-500" />
          )}
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
        </div>
        <Badge
          className={cn(
            "text-xs",
            status === "trade" && "bg-olive-100 text-olive-700",
            status === "sale" && "bg-cyan-100 text-cyan-700",
            status === "both" && "bg-violet-100 text-violet-700"
          )}
        >
          {status === "both"
            ? "Trade & Sale"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package className="h-4 w-4" />
          <span>{cardCount} cards</span>
        </div>

        {value && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{formatValue(value)}</span>
          </div>
        )}

        {pendingDeals > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Target className="h-4 w-4" />
            <span>{pendingDeals} deals</span>
          </div>
        )}

        <div className="text-xs text-slate-500">
          Updated {formatDate(lastUpdated)}
        </div>
      </div>
    </Card>
  );
}
