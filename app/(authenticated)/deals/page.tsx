"use client";
import { PageHeader } from "@/app/_components/page-header";
import { useDeals } from "@/app/lib/hooks/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  MoreHorizontal,
  Package,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface DealCardProps {
  deal: {
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
  };
}

function DealCard({ deal }: DealCardProps) {
  const statusConfig = {
    negotiating: {
      label: "Negotiating",
      color: "bg-yellow-100 text-yellow-700",
      icon: MessageCircle,
    },
    "payment-pending": {
      label: "Payment Pending",
      color: "bg-orange-100 text-orange-700",
      icon: Clock,
    },
    shipping: {
      label: "Shipping",
      color: "bg-blue-100 text-blue-700",
      icon: Package,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
  };

  const config = statusConfig[deal.status];
  const StatusIcon = config.icon;

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={deal.otherParty.avatar}
              alt={deal.otherParty.name}
            />
            <AvatarFallback>
              {deal.otherParty.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900">
              {deal.otherParty.name}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-600">
                {deal.otherParty.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards Preview */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            Cards in this deal
          </span>
        </div>
        <div className="flex gap-2">
          {deal.cards.slice(0, 3).map((card, index) => (
            <div key={index} className="relative">
              <div className="w-12 h-16 bg-slate-100 rounded border flex items-center justify-center">
                <img
                  src={card.imageUrl || "/card_back.png"}
                  alt={card.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              {card.quantity > 1 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {card.quantity}
                </Badge>
              )}
            </div>
          ))}
          {deal.cards.length > 3 && (
            <div className="w-12 h-16 bg-slate-100 rounded border flex items-center justify-center">
              <span className="text-xs text-slate-500">
                +{deal.cards.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deal Info */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${deal.totalValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Updated {formatDate(deal.updatedAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {deal.status === "negotiating" && (
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
          {deal.status === "payment-pending" && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
          {deal.status === "shipping" && (
            <Button size="sm" variant="outline">
              <Package className="h-4 w-4 mr-1" />
              Track
            </Button>
          )}
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function DealsPage() {
  const { data: deals } = useDeals();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const activeDeals = deals.filter((deal) => deal.status !== "completed");
  const completedDeals = deals.filter((deal) => deal.status === "completed");

  const activeDealsByStatus = activeDeals.reduce((acc, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalValueInProgress = activeDeals.reduce(
    (sum, deal) => sum + deal.totalValue,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Deals"
          description="Track your active trades and completed transactions"
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Deals
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeDeals.length}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-olive-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {completedDeals.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  ${totalValueInProgress.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Pending Payment
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeDealsByStatus["payment-pending"] || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-olive-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Active Deals
              <Badge
                variant="secondary"
                className={`ml-2 ${
                  activeTab === "active"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {activeDeals.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-olive-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Completed
              <Badge
                variant="secondary"
                className={`ml-2 ${
                  activeTab === "completed"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {completedDeals.length}
              </Badge>
            </button>
          </div>
        </div>

        {/* Deals List */}
        {activeTab === "active" ? (
          <div className="space-y-4">
            {activeDeals.length > 0 ? (
              activeDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <DealCard deal={deal} />
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No active deals
                </h3>
                <p className="text-slate-600 mb-6">
                  You don&apos;t have any active deals at the moment.
                </p>
                <Button className="bg-olive-600 hover:bg-olive-700 text-white">
                  Browse Marketplace
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {completedDeals.length > 0 ? (
              completedDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <DealCard deal={deal} />
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No completed deals
                </h3>
                <p className="text-slate-600">
                  Your completed deals will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
