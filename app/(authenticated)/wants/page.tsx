"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { PageHeader } from "@/app/_components/page-header";
import { useWantLists } from "@/app/lib/hooks/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Heart, Plus, Target } from "lucide-react";
import Link from "next/link";

interface WantListCardProps {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  budgetRemaining: number;
  matchesFound: number;
  priority: "high" | "medium" | "low";
}

function WantListCard({
  id,
  name,
  description,
  itemCount,
  budgetRemaining,
  matchesFound,
  priority,
}: WantListCardProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  const priorityLabels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>
          {description && (
            <p className="text-sm text-slate-600 mb-2">{description}</p>
          )}
        </div>
        <Badge className={priorityColors[priority]}>
          {priorityLabels[priority]}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Heart className="h-4 w-4" />
          <span>{itemCount} items</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">
            ${budgetRemaining.toFixed(2)} remaining
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Target className="h-4 w-4" />
          <span>{matchesFound} matches found</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link href={`/wants/${id}`}>
          <Button className="w-full bg-olive-600 hover:bg-olive-700 text-white">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function WantsPage() {
  const { data: wantLists } = useWantLists();

  const totalItems = wantLists.reduce((sum, w) => sum + w.itemCount, 0);
  const totalBudget = wantLists.reduce((sum, w) => sum + w.budgetRemaining, 0);
  const totalMatches = wantLists.reduce((sum, w) => sum + w.matchesFound, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Want Lists"
          description="Manage your Magic: The Gathering want lists and find cards you're looking for"
          actions={
            <Link href="/wants/create">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Want List
              </Button>
            </Link>
          }
        />

        {/* Stats Bar */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {wantLists.length}
              </div>
              <div className="text-sm text-slate-600">Want Lists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {totalItems}
              </div>
              <div className="text-sm text-slate-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {totalMatches}
              </div>
              <div className="text-sm text-slate-600">Matches Found</div>
            </div>
          </div>
        </div>

        {/* Want Lists Grid */}
        {wantLists.length > 0 ? (
          <CardGrid>
            {wantLists.map((wantList) => (
              <WantListCard key={wantList.id} {...wantList} />
            ))}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No want lists yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first want list to start finding cards you're looking
              for.
            </p>
            <Link href="/wants/create">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Want List
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
