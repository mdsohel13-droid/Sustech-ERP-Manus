import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export interface BulkEditItem {
  id: number;
  [key: string]: any;
}

export interface BulkEditField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

interface BulkEditModeProps {
  isEnabled: boolean;
  items: BulkEditItem[];
  fields: BulkEditField[];
  onToggle: (enabled: boolean) => void;
  onSave: (updates: Record<number, Record<string, any>>) => Promise<void>;
  children: React.ReactNode;
}

export const BulkEditMode: React.FC<BulkEditModeProps> = ({
  isEnabled,
  items,
  fields,
  onToggle,
  onSave,
  children,
}) => {
  const [edits, setEdits] = useState<Record<number, Record<string, any>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = useCallback(
    (itemId: number, fieldName: string, value: any) => {
      setEdits((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          [fieldName]: value,
        },
      }));
    },
    []
  );

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(edits);
      setEdits({});
      onToggle(false);
      toast.success(`Updated ${Object.keys(edits).length} records`);
    } catch (error) {
      toast.error(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEdits({});
    onToggle(false);
    toast.info('Bulk edit cancelled');
  };

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-4">
      {isEnabled && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Bulk Edit Mode Active
              {hasChanges && ` - ${Object.keys(edits).length} record(s) modified`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Provide context for children */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              bulkEditMode: isEnabled,
              bulkEdits: edits,
              onBulkFieldChange: handleFieldChange,
            })
          : child
      )}
    </div>
  );
};

/**
 * Hook to use bulk edit mode context
 */
export const useBulkEditMode = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return {
    isEnabled,
    toggle: (enabled?: boolean) => {
      setIsEnabled((prev) => (enabled !== undefined ? enabled : !prev));
    },
  };
};
