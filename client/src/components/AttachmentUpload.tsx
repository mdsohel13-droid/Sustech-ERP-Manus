import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, File, X, Download, Loader2 } from "lucide-react";


interface AttachmentUploadProps {
  entityType: string;
  entityId: number;
  onUploadComplete?: () => void;
}

export function AttachmentUpload({ entityType, entityId, onUploadComplete }: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);

  
  const { data: attachments, refetch } = trpc.attachments.getByEntity.useQuery({
    entityType,
    entityId,
  });
  
  const uploadMutation = trpc.attachments.upload.useMutation({
    onSuccess: () => {
      refetch();
      onUploadComplete?.();
      alert("File uploaded successfully");
    },
    onError: (error) => {
      alert("Failed to upload file: " + (error.message || "Unknown error"));
    },
  });
  
  const deleteMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("File deleted successfully");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await uploadMutation.mutateAsync({
          entityType,
          entityId,
          fileName: file.name,
          fileData: base64,
          fileType: file.type,
          fileSize: file.size,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload file</p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, Images (Max 10MB)
                </p>
              </div>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
          />
        </label>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attached Files</h4>
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <File className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.fileSize && formatFileSize(attachment.fileSize)} •{" "}
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.fileUrl, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this file?")) {
                        deleteMutation.mutate({ id: attachment.id });
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
