"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, MessageCircle, Package, User } from "lucide-react";

interface RecentActivityItemProps {
  id: string;
  type: "collection" | "deal" | "trade" | "message";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  status?: "pending" | "completed" | "in-progress";
  className?: string;
}

export function RecentActivityItem({
  id,
  type,
  title,
  description,
  timestamp,
  user,
  status = "in-progress",
  className,
}: RecentActivityItemProps) {
  const typeIcons = {
    collection: Package,
    deal: MessageCircle,
    trade: Package,
    message: MessageCircle,
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
  };

  const Icon = typeIcons[type];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card
      className={cn(
        "bg-white rounded-lg p-4 hover:shadow-sm transition-shadow",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-2 bg-olive-100 rounded-full">
            <Icon className="h-4 w-4 text-olive-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 truncate">{title}</h4>
            <Badge className={cn("text-xs", statusColors[status])}>
              {status.replace("-", " ")}
            </Badge>
          </div>

          <p className="text-sm text-slate-600 mb-2">{description}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(timestamp)}</span>
            </div>
            {user && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{user}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
