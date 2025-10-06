"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-white to-olive-50 rounded-xl p-6 hover:-translate-y-1 transition-transform duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                change.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {change.positive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        {icon && <div className="text-olive-600">{icon}</div>}
      </div>
    </Card>
  );
}
