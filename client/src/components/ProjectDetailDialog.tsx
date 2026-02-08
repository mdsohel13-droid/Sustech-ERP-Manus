import { useState } from "react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttachmentUpload } from "./AttachmentUpload";
import {
  Edit,
  Calendar,
  DollarSign,
  User,
  Building2,
  FileText,
  Clock,
  Target,
  Flag,
  X,
  Download,
  File,
  Paperclip,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  customerName: string;
  stage: string;
  value?: string | null;
  currency?: string;
  description?: string | null;
  startDate?: string | null;
  expectedCloseDate?: string | null;
  actualCloseDate?: string | null;
  priority: string;
  assignedTo?: number | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: Project) => void;
  formatCurrency: (value: number | string, currency: string) => string;
  currency: string;
}

const stageLabels: Record<string, string> = {
  lead: "Lead",
  proposal: "Proposal",
  won: "Won/Contracted",
  execution: "Execution",
  testing: "Testing/Completion",
};

const stageColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800",
  proposal: "bg-amber-100 text-amber-800",
  won: "bg-green-100 text-green-800",
  execution: "bg-purple-100 text-purple-800",
  testing: "bg-teal-100 text-teal-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onEdit,
  formatCurrency,
  currency,
}: ProjectDetailDialogProps) {
  const { data: attachments, refetch: refetchAttachments } = trpc.attachments.getByEntity.useQuery(
    { entityType: "project", entityId: project?.id || 0 },
    { enabled: !!project?.id }
  );

  const { data: users } = trpc.users.getAll.useQuery();

  if (!project) return null;

  const assignedUser = users?.find((u) => u.id === project.assignedTo);
  const createdByUser = users?.find((u) => u.id === project.createdBy);

  const attachmentsByDate = attachments?.reduce((groups, attachment) => {
    const date = format(new Date(attachment.uploadedAt), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(attachment);
    return groups;
  }, {} as Record<string, typeof attachments>) || {};

  const sortedDates = Object.keys(attachmentsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0" showCloseButton={false}>
        <DialogHeader className="px-6 py-3 border-b bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 pr-2">
              <DialogTitle className="text-lg font-bold text-slate-800 leading-tight break-words">
                {project.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge className={stageColors[project.stage] || "bg-gray-100"}>
                  {stageLabels[project.stage] || project.stage}
                </Badge>
                <Badge className={priorityColors[project.priority] || "bg-gray-100"}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(project);
                }}
                className="flex items-center gap-1 text-xs"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Project
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto px-6 py-4" style={{ maxHeight: "calc(90vh - 80px)" }}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4 bg-slate-50">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-lg font-semibold text-slate-800">{project.customerName}</p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4 bg-slate-50">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Project Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(parseFloat(project.value || "0"), project.currency || currency)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border shadow-sm">
              <CardHeader className="py-3 px-4 bg-slate-50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Opening Date</p>
                    <p className="font-medium">
                      {project.startDate ? format(new Date(project.startDate), "MMM dd, yyyy") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Completion</p>
                    <p className="font-medium">
                      {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM dd, yyyy") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Close Date</p>
                    <p className="font-medium">
                      {project.actualCloseDate ? format(new Date(project.actualCloseDate), "MMM dd, yyyy") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="py-3 px-4 bg-slate-50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{assignedUser?.name || assignedUser?.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="font-medium">{createdByUser?.name || createdByUser?.email || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.description && (
              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4 bg-slate-50">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.description}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border shadow-sm">
              <CardHeader className="py-3 px-4 bg-slate-50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-rose-600" />
                  Attachments
                  {attachments && attachments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{attachments.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <AttachmentUpload
                  entityType="project"
                  entityId={project.id}
                  onUploadComplete={() => refetchAttachments()}
                />

                {sortedDates.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {sortedDates.map((date) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {format(new Date(date), "MMMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="space-y-2 pl-5 border-l-2 border-slate-200">
                          {attachmentsByDate[date]?.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.fileSize ? formatFileSize(attachment.fileSize) : ""} 
                                    {attachment.fileSize && " • "}
                                    {format(new Date(attachment.uploadedAt), "h:mm a")}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.fileUrl, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attachments yet. Upload files above.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground text-right">
              Last updated: {format(new Date(project.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
