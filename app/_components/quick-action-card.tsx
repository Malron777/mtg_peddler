"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, PlusCircle, Upload } from "lucide-react";
import React from "react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accentColor?: "olive" | "gold" | "rose" | "cyan";
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  accentColor = "olive",
  className,
}: QuickActionCardProps) {
  const accentColors = {
    olive: "bg-olive-600 hover:bg-olive-700",
    gold: "bg-gold-600 hover:bg-gold-700",
    rose: "bg-rose-600 hover:bg-rose-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
  };

  return (
    <Card
      className={cn(
        "bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={cn(
            "p-3 rounded-full transition-colors",
            accentColors[accentColor]
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <Button
          className={cn("w-full transition-all", accentColors[accentColor])}
          size="sm"
        >
          Get Started
        </Button>
      </div>
    </Card>
  );
}

// Predefined quick action cards
export function CreateCollectionCard({ onClick }: { onClick: () => void }) {
  return (
    <QuickActionCard
      title="Create Collection"
      description="Start building your MTG collection"
      icon={<PlusCircle className="h-6 w-6 text-white" />}
      onClick={onClick}
      accentColor="olive"
    />
  );
}

export function ImportCollectionCard({ onClick }: { onClick: () => void }) {
  return (
    <QuickActionCard
      title="Import Collection"
      description="Upload your existing collection"
      icon={<Upload className="h-6 w-6 text-white" />}
      onClick={onClick}
      accentColor="gold"
    />
  );
}

export function CreateWantListCard({ onClick }: { onClick: () => void }) {
  return (
    <QuickActionCard
      title="Create Want List"
      description="List cards you're looking for"
      icon={<Heart className="h-6 w-6 text-white" />}
      onClick={onClick}
      accentColor="rose"
    />
  );
}
