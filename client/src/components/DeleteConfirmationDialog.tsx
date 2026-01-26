import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDangerous?: boolean; // For critical deletions
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  isDeleting = false,
  onConfirm,
  onCancel,
  isDangerous = false,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${isDangerous ? "text-red-600" : "text-yellow-600"}`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className={`rounded-lg p-3 ${isDangerous ? "bg-red-50" : "bg-yellow-50"}`}>
          <p className="text-sm font-medium">
            {isDangerous ? "⚠️ This action cannot be undone." : "This action cannot be undone."}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You are about to delete: <span className="font-semibold">{itemName}</span>
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDangerous ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isDeleting}
            className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
