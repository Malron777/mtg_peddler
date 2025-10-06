"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-slate-200 to-slate-100 rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Predefined skeleton variants for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-4", className)}>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-24 rounded-lg", className)} />;
}

export function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn("h-6 w-16 rounded-full", className)} />;
}
