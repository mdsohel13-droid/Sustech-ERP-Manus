import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Paperclip,
  List,
  LayoutGrid,
  Search,
  ChevronDown,
  AlertTriangle,
  CircleDot,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Tag,
} from "lucide-react";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { useState } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";

const typeConfig = {
  action: {
    label: "Action",
    icon: Target,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-300",
  },
  decision: {
    label: "Decision",
    icon: CheckCircle2,
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  issue: {
    label: "Issue",
    icon: AlertTriangle,
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    lightBg: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-300",
  },
  opportunity: {
    label: "Opportunity",
    icon: Lightbulb,
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    lightBg: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    badgeColor: "bg-pink-100 text-pink-700 border-pink-300",
  }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
  high: { label: "High", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" }
};

const statusConfig = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700 border-gray-200" },
  not_started: { label: "Not Started", color: "bg-red-100 text-red-700 border-red-200" },
  awaiting_review: { label: "Awaiting Review", color: "bg-purple-100 text-purple-700 border-purple-200" }
};

export default function ActionTracker() {
  const [activeTab, setActiveTab] = useState<string>("actions");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const { data: items, isLoading } = trpc.actionTracker.getAll.useQuery();
  const { data: projects } = trpc.projects.getAll.useQuery();
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
    relatedModule: "",
    relatedId: undefined as number | undefined,
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
      relatedModule: item.relatedModule || "",
      relatedId: item.relatedId || undefined,
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
      relatedModule: "",
      relatedId: undefined,
    });
  };

  const openCreateDialog = (type: "action" | "decision" | "issue" | "opportunity") => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setIsDialogOpen(true);
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFilteredItems = (type: string) => {
    let filtered = items?.filter(item => item.type === type) || [];
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "due_date") {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "priority") {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => 
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      );
    }

    return filtered;
  };

  const getDueDateDisplay = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return { text: "Today", className: "bg-red-100 text-red-700 border-red-200" };
    }
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return { text: "Tomorrow", className: "bg-orange-100 text-orange-700 border-orange-200" };
    }
    if (isBefore(date, today)) {
      return { text: format(date, "MMM d, yyyy"), className: "bg-red-100 text-red-700 border-red-200" };
    }
    return { text: format(date, "MMM d, yyyy"), className: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const typeCounts = {
    action: items?.filter(i => i.type === "action").length || 0,
    decision: items?.filter(i => i.type === "decision").length || 0,
    issue: items?.filter(i => i.type === "issue").length || 0,
    opportunity: items?.filter(i => i.type === "opportunity").length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const renderItemsTable = (type: string) => {
    const filteredItems = getFilteredItems(type);
    const config = typeConfig[type as keyof typeof typeConfig];

    if (filteredItems.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <config.icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No {config.label.toLowerCase()}s found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => openCreateDialog(type as any)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {config.label}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="whitespace-normal break-words w-12">
                <Checkbox />
              </TableHead>
              <TableHead className="whitespace-normal break-words w-16">ISO</TableHead>
              <TableHead className="whitespace-normal break-words w-24">Priority</TableHead>
              <TableHead className="whitespace-normal break-words">Item</TableHead>
              <TableHead className="whitespace-normal break-words">Project</TableHead>
              <TableHead className="whitespace-normal break-words">Due Date</TableHead>
              <TableHead className="whitespace-normal break-words">Status</TableHead>
              <TableHead className="whitespace-normal break-words w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => {
              const dueDateDisplay = getDueDateDisplay(item.dueDate);
              const priorityCfg = priorityConfig[item.priority as keyof typeof priorityConfig];
              const statusCfg = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.open;
              
              return (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                        {index + 1}
                      </Badge>
                      <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${priorityCfg.color}`}>
                        !
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityCfg.dotColor}`} />
                      <span className="text-sm font-medium">{item.title.slice(0, 20)}...</span>
                    </div>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {item.title.length > 25 ? item.title.slice(0, 25) + "..." : item.title}
                    </button>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{item.relatedModule || "General"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    {dueDateDisplay && (
                      <Badge variant="outline" className={`text-xs ${dueDateDisplay.className}`}>
                        {dueDateDisplay.text}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Badge variant="outline" className={`text-xs ${statusCfg.color}`}>
                      {statusCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Action Tracker</h1>
          <p className="text-muted-foreground">
            Manage and track actions, decisions, issues and opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openCreateDialog("action")}>
            <Plus className="mr-2 h-4 w-4" />
            Action
          </Button>
          <Button variant="outline" onClick={() => openCreateDialog("decision")}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
            Add Decision
          </Button>
          <Button variant="outline" onClick={() => openCreateDialog("issue")}>
            <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
            Add Issue
          </Button>
        </div>
      </div>

      {/* KPI Cards with Gradients */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Action Card */}
        <Card 
          className={`relative overflow-hidden ${typeConfig.action.gradient} text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => setActiveTab("actions")}
        >
          <div className="absolute top-3 right-3 opacity-20">
            <Target className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeCounts.action}</div>
            <p className="text-xs text-blue-100 mt-1">Keep track of {typeCounts.action} actions</p>
          </CardContent>
        </Card>

        {/* Decision Card */}
        <Card 
          className={`relative overflow-hidden ${typeConfig.decision.gradient} text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => setActiveTab("decisions")}
        >
          <div className="absolute top-3 right-3 opacity-20">
            <FileText className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeCounts.decision}</div>
            <p className="text-xs text-emerald-100 mt-1">Document {typeCounts.decision} decisions</p>
          </CardContent>
        </Card>

        {/* Issue Card */}
        <Card 
          className={`relative overflow-hidden ${typeConfig.issue.gradient} text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => setActiveTab("issues")}
        >
          <div className="absolute top-3 right-3 opacity-20">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeCounts.issue}</div>
            <p className="text-xs text-orange-100 mt-1">Track {typeCounts.issue} issues</p>
          </CardContent>
        </Card>

        {/* Opportunity Card */}
        <Card 
          className={`relative overflow-hidden ${typeConfig.opportunity.gradient} text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => setActiveTab("opportunities")}
        >
          <div className="absolute top-3 right-3 opacity-20">
            <CircleDot className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-100 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeCounts.opportunity}</div>
            <p className="text-xs text-pink-100 mt-1">Oversee {typeCounts.opportunity} opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="actions" className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Decisions
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
        </TabsList>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 py-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <CircleDot className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100">
            <Tag className="h-3 w-3 mr-1" />
            Important
          </Badge>

          <Badge variant="outline" className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100">
            <Tag className="h-3 w-3 mr-1" />
            InSport Actions
          </Badge>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent Activity</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-1">
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="actions">
          {renderItemsTable("action")}
        </TabsContent>

        <TabsContent value="decisions">
          {renderItemsTable("decision")}
        </TabsContent>

        <TabsContent value="issues">
          {renderItemsTable("issue")}
        </TabsContent>

        <TabsContent value="opportunities">
          {renderItemsTable("opportunity")}
        </TabsContent>
      </Tabs>

      {/* Bottom Category Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-2 overflow-x-auto">
            <Button 
              variant={activeTab === "actions" ? "default" : "ghost"} 
              size="sm" 
              className={`flex items-center gap-1.5 ${activeTab === "actions" ? "bg-blue-600" : ""}`}
              onClick={() => setActiveTab("actions")}
            >
              <FileText className="h-4 w-4" />
              Action
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab("decisions")}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Decisions ({typeCounts.decision})
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab("issues")}
            >
              <FileText className="h-4 w-4 text-gray-600" />
              Issues ({typeCounts.issue})
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab("issues")}
            >
              <AlertCircle className="h-4 w-4 text-red-600" />
              Issue ({typeCounts.issue})
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab("opportunities")}
            >
              <CircleDot className="h-4 w-4 text-pink-600" />
              Opportunity ({typeCounts.opportunity})
            </Button>
          </div>
        </div>
      </div>
      <div className="h-16"></div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the details below" : "Fill in the details to create a new item"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Type Selector */}
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
                    const config = typeConfig[type];
                    const Icon = config.icon;
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.type === type ? "default" : "outline"}
                        className={`flex items-center justify-start gap-2 ${formData.type === type ? config.gradient + " text-white" : ""}`}
                        onClick={() => setFormData({ ...formData, type })}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">{typeConfig[formData.type].label}</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${typeConfig[formData.type].label.toLowerCase()} title`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <div className="flex items-center gap-2">
                  {(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map((priority) => (
                    <Button
                      key={priority}
                      type="button"
                      variant={formData.priority === priority ? "default" : "outline"}
                      size="sm"
                      className={formData.priority === priority ? priorityConfig[priority].color : ""}
                      onClick={() => setFormData({ ...formData, priority })}
                    >
                      <div className={`w-2 h-2 rounded-full ${priorityConfig[priority].dotColor} mr-1.5`} />
                      {priorityConfig[priority].label}
                    </Button>
                  ))}
                </div>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {editingItem && (
                <div className="grid gap-2">
                  <Label><Paperclip className="h-4 w-4 inline mr-1" />Attachments</Label>
                  <AttachmentUpload entityType="action_tracker" entityId={editingItem?.id || 0} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingItem ? "Update" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
