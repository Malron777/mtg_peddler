"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface BulkImportPanelProps {
  isOpen: boolean;
  bulkImportText: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onTextChange: (text: string) => void;
  onImport: () => void;
}

export function BulkImportPanel({
  isOpen,
  bulkImportText,
  loading,
  error,
  onClose,
  onTextChange,
  onImport,
}: BulkImportPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Bulk Import Cards</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="bulk-import">Card List</Label>
          <Textarea
            id="bulk-import"
            placeholder="Enter cards in the format:&#10;2x Lightning Bolt&#10;1x Black Lotus&#10;3 Counterspell"
            value={bulkImportText}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-sm text-slate-600 mt-2">
            Format: quantity (optional &quot;x&quot;) card name, one per line
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onImport}
            disabled={!bulkImportText.trim() || loading}
            className="bg-olive-600 hover:bg-olive-700 text-white"
          >
            {loading ? "Importing..." : "Import Cards"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
