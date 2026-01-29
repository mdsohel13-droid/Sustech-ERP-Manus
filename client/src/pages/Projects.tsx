import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, GripVertical, Calendar, DollarSign, LayoutGrid, List, ArrowUpDown, Wallet, Search, TrendingUp, FileText, Briefcase, CheckCircle, ClipboardList, MoreHorizontal, Edit, Trash2, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/currencyUtils";
import { ProjectFinancials } from "@/components/ProjectFinancials";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format } from "date-fns";

type ProjectStage = "lead" | "proposal" | "won" | "execution" | "testing";

const stageLabels: Record<ProjectStage, string> = {
  lead: "Leads/Inquiry",
  proposal: "Proposal Submitted",
  won: "Won/Contracted",
  execution: "Execution Phase",
  testing: "Testing/Handover",
};

const stageColors: Record<ProjectStage, { bg: string; badge: string }> = {
  lead: { bg: "bg-gradient-to-r from-blue-500 to-blue-600", badge: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  proposal: { bg: "bg-gradient-to-r from-amber-500 to-amber-600", badge: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  won: { bg: "bg-gradient-to-r from-emerald-500 to-emerald-600", badge: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  execution: { bg: "bg-gradient-to-r from-purple-500 to-purple-600", badge: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  testing: { bg: "bg-gradient-to-r from-slate-500 to-slate-600", badge: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
};

const stageIcons: Record<ProjectStage, React.ReactNode> = {
  lead: <ClipboardList className="h-5 w-5" />,
  proposal: <FileText className="h-5 w-5" />,
  won: <Briefcase className="h-5 w-5" />,
  execution: <DollarSign className="h-5 w-5" />,
  testing: <CheckCircle className="h-5 w-5" />,
};

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedProject, setDraggedProject] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [sortField, setSortField] = useState<'name' | 'value' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [financialsOpen, setFinancialsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const utils = trpc.useUtils();
  const { data: projects = [] } = trpc.projects.getAll.useQuery();
  const { data: stats = [] } = trpc.projects.getStats.useQuery();
  const { currency } = useCurrency();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("Project created successfully");
      setDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project updated");
      setDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDragStart = (projectId: number) => {
    setDraggedProject(projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: ProjectStage) => {
    e.preventDefault();
    if (!draggedProject) return;

    const project = projects?.find((p) => p.id === draggedProject);
    if (project && project.stage !== newStage) {
      updateMutation.mutate({ id: draggedProject, stage: newStage });
    }
    setDraggedProject(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        name: formData.get("name") as string,
        customerName: formData.get("customerName") as string,
        description: formData.get("description") as string,
        value: formData.get("value") as string,
        priority: formData.get("priority") as "high" | "medium" | "low",
        stage: formData.get("stage") as ProjectStage,
        expectedCloseDate: formData.get("expectedCloseDate") as string,
      });
    } else {
      createMutation.mutate({
        name: formData.get("name") as string,
        customerName: formData.get("customerName") as string,
        description: formData.get("description") as string,
        value: formData.get("value") as string,
        priority: formData.get("priority") as "high" | "medium" | "low",
        expectedCloseDate: formData.get("expectedCloseDate") as string,
      });
    }
  };

  const getProjectsByStage = (stage: ProjectStage) => {
    return projects?.filter((p) => p.stage === stage) || [];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      medium: "bg-blue-100 text-blue-700",
      low: "bg-gray-100 text-gray-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search) ||
        p.customerName.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'value') {
        return ((Number(a.value) || 0) - (Number(b.value) || 0)) * direction;
      } else if (sortField === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
      }
      return a.name.localeCompare(b.name) * direction;
    });
  }, [projects, searchTerm, sortField, sortDirection]);

  const totalPipelineValue = useMemo(() => {
    return projects.reduce((sum, p) => sum + Number(p.value || 0), 0);
  }, [projects]);

  const projectedProfitMargin = useMemo(() => {
    const testingValue = stats.find((s) => s.stage === 'testing')?.totalValue || 0;
    if (totalPipelineValue === 0) return 0;
    return ((testingValue / totalPipelineValue) * 100).toFixed(1);
  }, [stats, totalPipelineValue]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
          <p className="text-muted-foreground">Track projects through stages from lead to completion</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="h-4 w-4 mr-1" />Kanban
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4 mr-1" />List
            </Button>
          </div>
          <Input type="date" className="w-40" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />New Project
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setEditingProject(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {(["lead", "proposal", "won", "execution", "testing"] as ProjectStage[]).map((stage, index) => {
          const stageStat = stats?.find((s) => s.stage === stage);
          const isLastStage = stage === 'testing';
          return (
            <Card key={stage} className={`${stageColors[stage].bg} text-white border-0 shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {stageIcons[stage]}
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-90">{stageLabels[stage]}</p>
                      <p className="text-2xl font-bold">{formatCurrency(stageStat?.totalValue || 0, currency)}</p>
                    </div>
                  </div>
                  {isLastStage && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">{projectedProfitMargin}%</span>
                      </div>
                      <p className="text-xs opacity-80">Projected Profit Margin</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(["lead", "proposal", "won", "execution", "testing"] as ProjectStage[]).map((stage) => (
            <div key={stage} className="bg-muted/30 rounded-lg p-4 min-h-[400px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Badge className={stageColors[stage].badge}>{stageLabels[stage]}</Badge>
                <span className="text-muted-foreground text-sm">({getProjectsByStage(stage).length})</span>
              </h3>
              <div className="space-y-3">
                {getProjectsByStage(stage).map((project) => (
                  <div key={project.id} className="bg-background rounded-lg p-3 shadow-sm border cursor-grab" draggable onDragStart={() => handleDragStart(project.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <button onClick={() => { setEditingProject(project); setDialogOpen(true); }} className="font-medium text-sm text-blue-600 hover:underline text-left">{project.name}</button>
                        <p className="text-xs text-muted-foreground">{project.customerName}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {project.value && (
                      <p className="text-sm font-semibold mb-2">{formatCurrency(project.value, project.currency || currency)}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedProject(project); setFinancialsOpen(true); }}>
                          <Wallet className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingProject(project); setDialogOpen(true); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate({ id: project.id }); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Project Name</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => { setSortField('value'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    Value <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Expected Close</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/30">
                    <TableCell>
                      <button onClick={() => { setEditingProject(project); setDialogOpen(true); }} className="font-medium text-blue-600 hover:underline text-left">
                        {project.name}
                      </button>
                    </TableCell>
                    <TableCell>{project.customerName}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(project.value, project.currency || currency)}</TableCell>
                    <TableCell>
                      <Badge className={stageColors[project.stage as ProjectStage]?.badge || "bg-gray-100"}>
                        {stageLabels[project.stage as ProjectStage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {project.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setFinancialsOpen(true); }}>
                          <Wallet className="h-4 w-4 mr-1" />Financials
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingProject(project); setDialogOpen(true); }}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate({ id: project.id }); }}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No projects match your search" : "No projects yet. Click 'New Project' to create one."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProject(null); }}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit" : "Create New"} Project</DialogTitle>
              <DialogDescription>{editingProject ? "Update project details" : "Add a new project to the pipeline"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input id="name" name="name" defaultValue={editingProject?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input id="customerName" name="customerName" defaultValue={editingProject?.customerName} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">Project Value</Label>
                  <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={editingProject?.value} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={editingProject?.priority || "medium"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input id="expectedCloseDate" name="expectedCloseDate" type="date" defaultValue={editingProject?.expectedCloseDate ? format(new Date(editingProject.expectedCloseDate), "yyyy-MM-dd") : ""} />
                </div>
              </div>
              {editingProject && (
                <div className="grid gap-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select name="stage" defaultValue={editingProject?.stage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Leads/Inquiry</SelectItem>
                      <SelectItem value="proposal">Proposal Submitted</SelectItem>
                      <SelectItem value="won">Won/Contracted</SelectItem>
                      <SelectItem value="execution">Execution Phase</SelectItem>
                      <SelectItem value="testing">Testing/Handover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} defaultValue={editingProject?.description || ""} placeholder="Enter project details..." />
              </div>
              {editingProject && (
                <div className="grid gap-2 mt-4 pt-4 border-t">
                  <Label>Attachments</Label>
                  <AttachmentUpload entityType="project" entityId={editingProject.id} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? (updateMutation.isPending ? "Updating..." : "Update Project") : (createMutation.isPending ? "Creating..." : "Create Project")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {selectedProject && (
        <ProjectFinancials
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          open={financialsOpen}
          onOpenChange={setFinancialsOpen}
        />
      )}
    </div>
  );
}
