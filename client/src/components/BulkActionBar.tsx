import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Download, X } from "lucide-react";
import { toast } from "sonner";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
  isLoading = false,
}: BulkActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBulkDelete = () => {
    if (selectedCount === 0) {
      toast.error("No items selected");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onBulkDelete();
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={selectedCount === totalCount && totalCount > 0}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
          title="Select all items"
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} of {totalCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!showDeleteConfirm ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
              disabled={isLoading}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-red-700">
              Delete {selectedCount} items? This cannot be undone.
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isLoading}
            >
              Confirm Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
