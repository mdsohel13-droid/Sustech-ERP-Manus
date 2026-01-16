import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Calendar, DollarSign, LayoutGrid, List, ArrowUpDown, Wallet } from "lucide-react";
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

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedProject, setDraggedProject] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sortField, setSortField] = useState<'name' | 'value' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [financialsOpen, setFinancialsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: projects } = trpc.projects.getAll.useQuery();
  const { data: stats } = trpc.projects.getStats.useQuery();
  const { currency } = useCurrency();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("Project created successfully");
      setDialogOpen(false);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project updated");
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project deleted");
    },
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
      setEditingProject(null);
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
      high: "priority-high",
      medium: "priority-medium",
      low: "priority-low",
    };
    return colors[priority] || "";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Project Pipeline</h1>
          <p className="text-muted-foreground text-lg mt-2">Track projects through stages from lead to completion</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="h-4 w-4 mr-2" />Kanban
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4 mr-2" />List
            </Button>
          </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProject(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit" : "Create New"} Project</DialogTitle>
                <DialogDescription>{editingProject ? "Update" : "Add a new"} project {editingProject ? "details" : "to the pipeline"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" defaultValue={editingProject?.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" name="customerName" defaultValue={editingProject?.customerName} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="value">Project Value</Label>
                    <Input id="value" name="value" type="number" step="0.01" defaultValue={editingProject?.value} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue={editingProject?.currency || currency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                    <Input id="expectedCloseDate" name="expectedCloseDate" type="date" defaultValue={editingProject?.expectedCloseDate ? format(new Date(editingProject.expectedCloseDate), "yyyy-MM-dd") : ""} />
                  </div>
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
                  <Textarea id="description" name="description" rows={3} defaultValue={editingProject?.description || ""} />
                </div>
                {editingProject && (
                  <div className="grid gap-2 mt-4 pt-4 border-t">
                    <Label>Attachments</Label>
                    <AttachmentUpload entityType="project" entityId={editingProject.id} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? (updateMutation.isPending ? "Updating..." : "Update Project") : (createMutation.isPending ? "Creating..." : "Create Project")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {(["lead", "proposal", "won", "execution", "testing"] as ProjectStage[]).map((stage) => {
          const stageStat = stats?.find((s) => s.stage === stage);
          return (
            <Card key={stage} className="editorial-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm label-text">{stageLabels[stage]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stageStat?.count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stageStat?.totalValue || 0, currency)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(["lead", "proposal", "won", "execution", "testing"] as ProjectStage[]).map((stage) => (
            <div key={stage} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
              <h3 className="font-medium mb-4 label-text">{stageLabels[stage]}</h3>
              <div className="space-y-3">
                {getProjectsByStage(stage).map((project) => (
                  <div key={project.id} className="kanban-card" draggable onDragStart={() => handleDragStart(project.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{project.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{project.customerName}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </div>
                    {project.value && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(project.value, project.currency || currency)}</span>
                      </div>
                    )}
                    {project.expectedCloseDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(project.expectedCloseDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setFinancialsOpen(true); }}><Wallet className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setDialogOpen(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this project?")) { deleteMutation.mutate({ id: project.id }); } }}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="editorial-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Project Name</th>
                    <th className="text-left p-4 font-semibold">Customer</th>
                    <th className="text-left p-4 font-semibold cursor-pointer" onClick={() => { setSortField('value'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                      Value <ArrowUpDown className="inline h-3 w-3" />
                    </th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Priority</th>
                    <th className="text-left p-4 font-semibold">Expected Close</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                    ?.slice()
                    .sort((a, b) => {
                      const direction = sortDirection === 'asc' ? 1 : -1;
                      if (sortField === 'value') {
                        return ((Number(a.value) || 0) - (Number(b.value) || 0)) * direction;
                      } else if (sortField === 'createdAt') {
                        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
                      }
                      return a.name.localeCompare(b.name) * direction;
                    })
                    .sort((a, b) => {
                      // Sort completed projects to bottom
                      if (a.stage === 'testing' && b.stage !== 'testing') return 1;
                      if (a.stage !== 'testing' && b.stage === 'testing') return -1;
                      return 0;
                    })
                    .map((project) => (
                      <tr key={project.id} className={`border-t hover:bg-muted/30 transition-colors ${
                        project.stage === 'lead' ? 'bg-blue-50/30' :
                        project.stage === 'proposal' ? 'bg-yellow-50/30' :
                        project.stage === 'won' ? 'bg-green-50/30' :
                        project.stage === 'execution' ? 'bg-purple-50/30' :
                        'bg-gray-50/30'
                      }`}>
                        <td className="p-4 font-medium">{project.name}</td>
                        <td className="p-4">{project.customerName}</td>
                        <td className="p-4">{formatCurrency(project.value, project.currency)}</td>
                        <td className="p-4">
                          <Badge variant="outline">{stageLabels[project.stage as ProjectStage]}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </td>
                        <td className="p-4">
                          {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM dd, yyyy") : "-"}
                        </td>
                        <td className="p-4 max-w-xs truncate">{project.description || "-"}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setFinancialsOpen(true); }}><Wallet className="h-4 w-4 mr-1" />Financials</Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingProject(project); setDialogOpen(true); }}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this project?")) { deleteMutation.mutate({ id: project.id }); } }}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Project Financials Dialog */}
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
