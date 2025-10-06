"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-olive-50 to-slate-50 rounded-xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-olive-800">{title}</h1>
          {description && <p className="text-slate-600 mt-2">{description}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
