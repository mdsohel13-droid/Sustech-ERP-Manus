import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Target,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Filter,
  Paperclip
} from "lucide-react";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { useState } from "react";
import { format } from "date-fns";

const typeConfig = {
  action: {
    label: "Action",
    icon: Target,
    color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300",
    borderColor: "border-l-blue-500"
  },
  decision: {
    label: "Decision",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300",
    borderColor: "border-l-green-500"
  },
  issue: {
    label: "Issue",
    icon: AlertCircle,
    color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300",
    borderColor: "border-l-red-500"
  },
  opportunity: {
    label: "Opportunity",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300",
    borderColor: "border-l-yellow-500"
  }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" }
};

const statusConfig = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" }
};

export default function ActionTracker() {
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const { data: items, isLoading } = trpc.actionTracker.getAll.useQuery();
  const createMutation = trpc.actionTracker.create.useMutation();
  const updateMutation = trpc.actionTracker.update.useMutation();
  const deleteMutation = trpc.actionTracker.delete.useMutation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    type: "action" as "action" | "decision" | "issue" | "opportunity",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    status: "open" as "open" | "in_progress" | "resolved" | "closed",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
        toast.success("Item updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Item created successfully");
      }
      utils.actionTracker.getAll.invalidate();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Item deleted successfully");
      utils.actionTracker.getAll.invalidate();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || "",
      priority: item.priority,
      status: item.status,
      dueDate: item.dueDate ? format(new Date(item.dueDate), "yyyy-MM-dd") : "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      type: "action",
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      dueDate: "",
    });
  };

  const filteredItems = items?.filter(item => 
    filterType === "all" || item.type === filterType
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const typeCounts = {
    action: items?.filter(i => i.type === "action").length || 0,
    decision: items?.filter(i => i.type === "decision").length || 0,
    issue: items?.filter(i => i.type === "issue").length || 0,
    opportunity: items?.filter(i => i.type === "opportunity").length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Action Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track actions, decisions, issues, and opportunities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                <DialogDescription>
                  Track actions, decisions, issues, or opportunities
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label><Paperclip className="h-4 w-4 inline mr-1" />Attachments</Label>
                  <AttachmentUpload entityType="action_tracker" entityId={editingItem?.id || 0} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          return (
            <Card key={type} className={`${config.borderColor} border-l-4 hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => setFilterType(filterType === type ? "all" : type)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                  {config.label}
                </CardTitle>
                <div className={`h-12 w-12 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{typeCounts[type]}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {filterType === type ? "Filtered" : "Click to filter"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All ({items?.length || 0})
        </Button>
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {typeConfig[type].label} ({typeCounts[type]})
          </Button>
        ))}
      </div>

      {/* Items List */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No items found. Click "Add New Item" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const config = typeConfig[item.type as keyof typeof typeConfig];
            const Icon = config.icon;
            return (
              <Card key={item.id} className={`${config.borderColor} border-l-4 hover:shadow-md transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                          <Badge className={priorityConfig[item.priority as keyof typeof priorityConfig].color}>
                            {priorityConfig[item.priority as keyof typeof priorityConfig].label}
                          </Badge>
                          <Badge className={statusConfig[item.status as keyof typeof statusConfig].color}>
                            {statusConfig[item.status as keyof typeof statusConfig].label}
                          </Badge>
                        </div>
                        <button onClick={() => handleEdit(item)} className="text-xl mb-2 font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{item.title}</button>
                        {item.description && (
                          <CardDescription className="text-sm">{item.description}</CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {item.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Due: {format(new Date(item.dueDate), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Created: {format(new Date(item.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
