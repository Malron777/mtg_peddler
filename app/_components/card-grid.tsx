"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface CardGridProps {
  columns?: "auto" | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
}

export function CardGrid({
  columns = "auto",
  children,
  className,
}: CardGridProps) {
  const gridClasses = {
    auto: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", gridClasses[columns], className)}>
      {children}
    </div>
  );
}
