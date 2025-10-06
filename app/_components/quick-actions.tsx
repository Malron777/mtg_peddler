"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Package, Plus, Upload } from "lucide-react";
import Link from "next/link";

interface QuickActionButtonProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "gold";
  className?: string;
}

export function QuickActionButton({
  title,
  description,
  href,
  icon,
  variant = "primary",
  className = "",
}: QuickActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] text-white";
      case "secondary":
        return "border-2 border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] hover:border-[var(--olive-300)]";
      case "gold":
        return "bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] hover:from-[var(--gold-500)] hover:to-[var(--gold-600)] text-[var(--slate-900)]";
      default:
        return "bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] text-white";
    }
  };

  return (
    <Link href={href} className={`block ${className}`}>
      <Button
        className={`w-full h-auto p-6 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-1 ${getVariantStyles()}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center">
            <div className="text-lg font-bold mb-1">{title}</div>
            <div className="text-sm opacity-90">{description}</div>
          </div>
          <ArrowRight className="w-5 h-5 opacity-70" />
        </div>
      </Button>
    </Link>
  );
}

interface QuickActionsGridProps {
  actions: Array<{
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    variant?: "primary" | "secondary" | "gold";
  }>;
  className?: string;
}

export function QuickActionsGrid({
  actions,
  className = "",
}: QuickActionsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {actions.map((action, index) => (
        <QuickActionButton
          key={index}
          title={action.title}
          description={action.description}
          href={action.href}
          icon={action.icon}
          variant={action.variant}
        />
      ))}
    </div>
  );
}

// Predefined quick action buttons for marketplace
export function CreateCollectionButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <QuickActionButton
      title="Create Collection"
      description="Start building your card collection"
      href="/collections/create"
      icon={<Package className="w-6 h-6" />}
      variant="primary"
      className={className}
    />
  );
}

export function ImportCollectionButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <QuickActionButton
      title="Import Collection"
      description="Upload your existing collection"
      href="/collections/import"
      icon={<Upload className="w-6 h-6" />}
      variant="secondary"
      className={className}
    />
  );
}

export function CreateWantListButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <QuickActionButton
      title="Create Want List"
      description="List cards you want to trade for"
      href="/wants"
      icon={<Heart className="w-6 h-6" />}
      variant="gold"
      className={className}
    />
  );
}

// Combined marketplace quick actions component
interface MarketplaceQuickActionsProps {
  className?: string;
  showAll?: boolean;
}

export function MarketplaceQuickActions({
  className = "",
  showAll = true,
}: MarketplaceQuickActionsProps) {
  const actions = [
    {
      title: "Create Collection",
      description: "Start building your card collection",
      href: "/collections/create",
      icon: <Package className="w-6 h-6" />,
      variant: "primary" as const,
    },
    {
      title: "Import Collection",
      description: "Upload your existing collection",
      href: "/collections/import",
      icon: <Upload className="w-6 h-6" />,
      variant: "secondary" as const,
    },
    {
      title: "Create Want List",
      description: "List cards you want to trade for",
      href: "/wants",
      icon: <Heart className="w-6 h-6" />,
      variant: "gold" as const,
    },
  ];

  if (!showAll) {
    return (
      <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
        <CreateCollectionButton />
        <ImportCollectionButton />
        <CreateWantListButton />
      </div>
    );
  }

  return <QuickActionsGrid actions={actions} className={className} />;
}

// Floating action button for mobile
interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] text-white shadow-lg z-40 ${className}`}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}

// Compact quick actions for smaller spaces
export function CompactQuickActions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      <Link href="/collections/create">
        <Button className="bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-1">
          <Package className="w-5 h-5 mr-2" />
          Create Collection
        </Button>
      </Link>

      <Link href="/collections/import">
        <Button
          variant="outline"
          className="border-2 border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] hover:border-[var(--olive-300)] px-6 py-3 rounded-lg font-semibold transition-all"
        >
          <Upload className="w-5 h-5 mr-2" />
          Import Collection
        </Button>
      </Link>

      <Link href="/wants">
        <Button className="bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] hover:from-[var(--gold-500)] hover:to-[var(--gold-600)] text-[var(--slate-900)] px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-1">
          <Heart className="w-5 h-5 mr-2" />
          Create Want List
        </Button>
      </Link>
    </div>
  );
}
