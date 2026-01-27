import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TableBatchActionsProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onBulkDelete: () => void;
  onExport: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export function TableBatchActions({
  selectedIds,
  totalCount,
  onSelectAll,
  onBulkDelete,
  onExport,
  isLoading = false,
  isDeleting = false,
}: TableBatchActionsProps) {
  const allSelected = selectedIds.length === totalCount && totalCount > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalCount;

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border mb-4">
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onCheckedChange={onSelectAll}
        disabled={isLoading}
      />
      <span className="text-sm font-medium text-foreground">
        {selectedIds.length} of {totalCount} selected
      </span>
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading || selectedIds.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting || selectedIds.length === 0}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}

export function useTableBatchSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const exportToCSV = (data: T[], filename: string) => {
    if (selectedIds.length === 0) {
      toast.error('No items selected for export');
      return;
    }

    const selectedData = data.filter((item) => selectedIds.includes(item.id));
    const headers = Object.keys(selectedData[0] || {});
    const csv = [
      headers.join(','),
      ...selectedData.map((item) =>
        headers
          .map((header) => {
            const value = (item as any)[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success(`Exported ${selectedIds.length} items`);
  };

  return {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    exportToCSV,
  };
}
