"use client";

import { useDeals } from "@/app/lib/hooks/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  MessageCircle,
  Package,
  Send,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";

interface DealDetailPageProps {
  params: {
    dealId: string;
  };
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const { data: deals } = useDeals();
  const [messageText, setMessageText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const deal = deals.find((d) => d.id === params.dealId);

  if (!deal) {
    notFound();
  }

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

  const StatusIcon = statusConfig[deal.status].icon;

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Implement message sending
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleEditDeal = () => {
    setIsEditing(true);
    // TODO: Implement deal editing
  };

  const handleSaveDeal = () => {
    setIsEditing(false);
    // TODO: Implement deal saving
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/deals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Deal with {deal.otherParty.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusConfig[deal.status].color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[deal.status].label}
              </Badge>
              <span className="text-sm text-slate-500">
                Started {deal.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            onClick={isEditing ? handleSaveDeal : handleEditDeal}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Save" : "Edit Deal"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Cards in Deal
                </h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    ${deal.totalValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-500">Total Value</div>
                </div>
              </div>

              <div className="space-y-4">
                {deal.cards.map((card, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="w-16 h-20 bg-slate-200 rounded flex items-center justify-center">
                      <img
                        src={card.imageUrl || "/card_back.png"}
                        alt={card.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {card.name}
                      </h3>
                      <p className="text-sm text-slate-600">{card.set}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-xs ${
                            card.condition === "nm"
                              ? "bg-green-100 text-green-700"
                              : card.condition === "lp"
                              ? "bg-blue-100 text-blue-700"
                              : card.condition === "mp"
                              ? "bg-yellow-100 text-yellow-700"
                              : card.condition === "hp"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {card.condition.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          ${card.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={deal.otherParty.avatar}
                    alt={deal.otherParty.name}
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {deal.otherParty.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-600">
                      {deal.otherParty.rating} ({deal.otherParty.reviewCount}{" "}
                      reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
                <div className="text-center text-sm text-slate-500">
                  Deal started {deal.createdAt.toLocaleDateString()}
                </div>

                {/* Sample messages */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-olive-100 text-slate-900 p-3 rounded-lg max-w-xs">
                      <p className="text-sm">
                        Hi! I&apos;m interested in trading these cards. What do
                        you think?
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 p-3 rounded-lg max-w-xs">
                      <p className="text-sm">
                        Sounds good! I&apos;m happy with the trade. When can you
                        ship?
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-olive-600 hover:bg-olive-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
