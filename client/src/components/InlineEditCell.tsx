import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InlineEditCellProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  type?: "text" | "number" | "email" | "date" | "select";
  className?: string;
  placeholder?: string;
  isLoading?: boolean;
  options?: { value: string; label: string }[];
}

export function InlineEditCell({
  value,
  onSave,
  onCancel,
  isEditing: initialIsEditing = false,
  type = "text",
  className = "",
  placeholder = "",
  isLoading = false,
  options = [],
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== String(value)) {
      onSave(type === "number" ? parseFloat(editValue) : editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    if (type === 'select' && options.length > 0) {
      return (
        <TableCell className={`p-1 ${className}`}>
          <div className="flex gap-1 items-center">
            <Select value={editValue} onValueChange={(val) => {
              setEditValue(val);
              onSave(val);
              setIsEditing(false);
            }}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell className={`p-1 ${className}`}>
        <div className="flex gap-1 items-center">
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-8 text-sm"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Save (Enter)"
          >
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value}
    </TableCell>
  );
}
