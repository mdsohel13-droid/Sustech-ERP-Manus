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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GripVertical, Calendar, DollarSign, LayoutGrid, List, ArrowUpDown, Wallet, Search, TrendingUp, FileText, Briefcase, CheckCircle, ClipboardList, MoreHorizontal, Edit, Trash2, ChevronDown, Archive, ArchiveRestore, Eye, BarChart3, Paperclip } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import PortfolioDashboard from "@/pages/projects/PortfolioDashboard";
import { formatCurrency } from "@/lib/currencyUtils";
import { ProjectFinancials } from "@/components/ProjectFinancials";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { ProjectDetailDialog } from "@/components/ProjectDetailDialog";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";

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

const STAGE_DONUT_COLORS: Record<ProjectStage, string> = {
  lead: "#3B82F6",
  proposal: "#F59E0B",
  won: "#10B981",
  execution: "#8B5CF6",
  testing: "#64748B",
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [detailProject, setDetailProject] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: projects = [] } = trpc.projects.getAll.useQuery();
  const { data: archivedProjects = [] } = trpc.projects.getArchived.useQuery();
  const { data: stats = [] } = trpc.projects.getStats.useQuery();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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
      utils.projects.getArchived.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project deleted permanently");
    },
    onError: (error) => toast.error(error.message),
  });

  const archiveMutation = trpc.projects.archive.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getArchived.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project archived");
    },
    onError: (error) => toast.error(error.message),
  });

  const restoreMutation = trpc.projects.restore.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate();
      utils.projects.getArchived.invalidate();
      utils.projects.getStats.invalidate();
      toast.success("Project restored");
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
    
    const commonFields = {
      name: formData.get("name") as string,
      customerName: formData.get("customerName") as string,
      description: formData.get("description") as string,
      value: formData.get("value") as string,
      priority: formData.get("priority") as "high" | "medium" | "low",
      expectedCloseDate: formData.get("expectedCloseDate") as string,
      startDate: formData.get("startDate") as string,
      portfolio: (formData.get("portfolio") as string) || undefined,
      program: (formData.get("program") as string) || undefined,
      projectManager: (formData.get("projectManager") as string) || undefined,
      projectType: (formData.get("projectType") as any) || undefined,
      projectStatus: (formData.get("projectStatus") as any) || undefined,
      activeStage: (formData.get("activeStage") as any) || undefined,
      health: (formData.get("health") as any) || undefined,
    };

    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        ...commonFields,
        stage: formData.get("stage") as ProjectStage,
      });
    } else {
      createMutation.mutate({
        ...commonFields,
        stage: (formData.get("stage") as ProjectStage) || undefined,
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs px-3">
            <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Portfolio Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-1.5 text-xs px-3">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Active Projects ({projects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-1.5 text-xs px-3">
            <Archive className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Archive ({archivedProjects.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PortfolioDashboard
            onOpenFinancials={(project) => { setSelectedProject(project); setFinancialsOpen(true); }}
            onOpenDetail={(project) => { setDetailProject(project); setDetailDialogOpen(true); }}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {(() => {
            const stageData = (["lead", "proposal", "won", "execution", "testing"] as ProjectStage[]).map((stage) => {
              const stageStat = stats?.find((s) => s.stage === stage);
              const count = projects?.filter(p => p.stage === stage).length || 0;
              return {
                name: stageLabels[stage],
                stage,
                value: parseFloat(String(stageStat?.totalValue || 0)),
                count,
              };
            });
            const totalValue = stageData.reduce((s, d) => s + d.value, 0);
            const totalProjects = stageData.reduce((s, d) => s + d.count, 0);

            const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
              if (percent < 0.05) return null;
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 20;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text x={x} y={y} fill={STAGE_DONUT_COLORS[stageData[index].stage]} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11} fontWeight={600}>
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            };

            return (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Card className="border shadow-sm flex-shrink-0">
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Pipeline by Stage</p>
                    {totalValue > 0 ? (
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie
                            data={stageData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={renderLabel}
                            labelLine={false}
                          >
                            {stageData.filter(d => d.value > 0).map((entry) => (
                              <Cell key={entry.stage} fill={STAGE_DONUT_COLORS[entry.stage]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [formatCurrency(value, currency), ""]} contentStyle={{ fontSize: "12px", padding: "6px 10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-[220px] h-[220px] flex items-center justify-center text-sm text-gray-400">No data</div>
                    )}
                    <div className="text-center -mt-2">
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(totalValue, currency)}</p>
                      <p className="text-[10px] text-gray-500">{totalProjects} project{totalProjects !== 1 ? "s" : ""} total</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
                  {stageData.map((d) => (
                    <div key={d.stage} className="flex items-center gap-2 p-2 rounded-lg border bg-white">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: STAGE_DONUT_COLORS[d.stage] }} />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 leading-tight">{d.name}</p>
                        <p className="text-sm font-bold text-gray-800">{formatCurrency(d.value, currency)}</p>
                        <p className="text-[10px] text-gray-400">{d.count} project{d.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
                        <button onClick={() => { setDetailProject(project); setDetailDialogOpen(true); }} className="font-medium text-sm text-blue-600 hover:underline text-left">{project.name}</button>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingProject(project); setDialogOpen(true); }}>
                              <Edit className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => archiveMutation.mutate({ id: project.id })}>
                              <Archive className="h-4 w-4 mr-2" />Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[200px]">Project</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[140px]">Customer</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[100px] cursor-pointer hover:text-primary" onClick={() => { setSortField('value'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                      Value <ArrowUpDown className="inline h-2.5 w-2.5 ml-0.5" />
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[100px]">Status</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 text-center w-[70px]">Priority</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[95px]">Opening Date</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 w-[95px]">Planned Completion</TableHead>
                    <TableHead className="font-semibold text-xs py-2 px-2 text-center w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project, idx) => (
                    <TableRow key={project.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                      <TableCell className="py-2 px-2 w-[200px] max-w-[200px] overflow-hidden">
                        <div className="max-w-full overflow-hidden">
                          <button onClick={() => { setDetailProject(project); setDetailDialogOpen(true); }} className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline text-left leading-tight line-clamp-3 block max-w-full">
                            {project.name}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-2 w-[140px] max-w-[140px] overflow-hidden">
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-3 max-w-full">{project.customerName}</div>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-[100px] truncate">{formatCurrency(project.value, project.currency || currency)}</TableCell>
                      <TableCell className="py-2 px-2 w-[100px]">
                        <Badge className={`${stageColors[project.stage as ProjectStage]?.badge || "bg-gray-100"} text-[10px] px-1.5 py-0.5 font-medium whitespace-nowrap`}>
                          {stageLabels[project.stage as ProjectStage]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center w-[70px]">
                        <Badge className={`${getPriorityColor(project.priority)} text-[10px] px-1.5 py-0.5 font-medium capitalize`}>{project.priority}</Badge>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap w-[95px]">
                        {project.startDate ? format(new Date(project.startDate), "MMM dd, yy") : "-"}
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap w-[95px]">
                        {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM dd, yy") : "-"}
                      </TableCell>
                      <TableCell className="py-2 px-2 w-[70px]">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Financials" onClick={() => { setSelectedProject(project); setFinancialsOpen(true); }}>
                            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => { setEditingProject(project); setDialogOpen(true); }} className="text-xs">
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => archiveMutation.mutate({ id: project.id })} className="text-xs">
                                <Archive className="h-3 w-3 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                        {searchTerm ? "No projects match your search" : "No projects yet. Click 'New Project' to create one."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Archive className="h-4 w-4" />
                  Archived Projects ({archivedProjects.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search archived..."
                      className="pl-8 h-8 w-48 text-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      <TableHead className="font-semibold text-xs w-[180px] py-2 px-2">Project Name</TableHead>
                      <TableHead className="font-semibold text-xs w-[130px] py-2 px-2">Customer</TableHead>
                      <TableHead className="font-semibold text-xs w-[100px] py-2 px-2">Value</TableHead>
                      <TableHead className="font-semibold text-xs w-[90px] py-2 px-2">Last Stage</TableHead>
                      <TableHead className="font-semibold text-xs w-[70px] py-2 px-2 text-center">Priority</TableHead>
                      <TableHead className="font-semibold text-xs w-[85px] py-2 px-2">Created</TableHead>
                      <TableHead className="font-semibold text-xs w-[85px] py-2 px-2">Archived</TableHead>
                      <TableHead className="font-semibold text-xs w-[80px] py-2 px-2 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedProjects
                      .filter(p => !searchTerm || 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((project, idx) => (
                      <TableRow key={project.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                        <TableCell className="py-2 px-2 w-[180px] max-w-[180px] overflow-hidden">
                          <div className="max-w-full overflow-hidden">
                            <button 
                              onClick={() => { setDetailProject(project); setDetailDialogOpen(true); }}
                              className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline text-left leading-tight line-clamp-3 block max-w-full"
                            >
                              {project.name}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 w-[130px] max-w-[130px] overflow-hidden">
                          <div className="text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-3 max-w-full">{project.customerName}</div>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-[100px] truncate">{formatCurrency(project.value, project.currency || currency)}</TableCell>
                        <TableCell className="py-2 px-2 w-[90px]">
                          <Badge className={`${stageColors[project.stage as ProjectStage]?.badge || "bg-gray-100"} text-[10px] px-1.5 py-0.5 font-medium whitespace-nowrap`}>
                            {stageLabels[project.stage as ProjectStage]}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-center w-[70px]">
                          <Badge className={`${getPriorityColor(project.priority)} text-[10px] px-1.5 py-0.5 font-medium capitalize`}>{project.priority}</Badge>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap w-[85px]">
                          {project.createdAt ? format(new Date(project.createdAt), "MMM dd, yy") : "-"}
                        </TableCell>
                        <TableCell className="py-2 px-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap w-[85px]">
                          {project.archivedAt ? format(new Date(project.archivedAt), "MMM dd, yy") : "-"}
                        </TableCell>
                        <TableCell className="py-2 px-2 w-[80px]">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              title="View Details"
                              onClick={() => { setDetailProject(project); setDetailDialogOpen(true); }}
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Restore Project"
                                  onClick={() => restoreMutation.mutate({ id: project.id })}
                                >
                                  <ArchiveRestore className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700"
                                  title="Permanently Delete"
                                  onClick={() => { 
                                    if (confirm("Permanently delete this project? This cannot be undone.")) 
                                      deleteMutation.mutate({ id: project.id }); 
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {archivedProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No archived projects. Projects that are archived will appear here.
                      </TableCell>
                    </TableRow>
                  )}
                  {archivedProjects.length > 0 && archivedProjects.filter(p => !searchTerm || 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No archived projects match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProject(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle>{editingProject ? "Edit" : "Create New"} Project</DialogTitle>
              <DialogDescription>{editingProject ? "Update project details" : "Add a new project to the pipeline"}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name" className="text-xs">Project Name *</Label>
                    <Input id="name" name="name" defaultValue={editingProject?.name} required className="text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
                    <Input id="customerName" name="customerName" defaultValue={editingProject?.customerName} required className="text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="value" className="text-xs">Project Value</Label>
                    <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={editingProject?.value} placeholder="0.00" className="text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="priority" className="text-xs">Priority</Label>
                    <Select name="priority" defaultValue={editingProject?.priority || "medium"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" defaultValue={editingProject?.startDate ? format(new Date(editingProject.startDate), "yyyy-MM-dd") : ""} className="text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="expectedCloseDate" className="text-xs">Expected Close Date</Label>
                    <Input id="expectedCloseDate" name="expectedCloseDate" type="date" defaultValue={editingProject?.expectedCloseDate ? format(new Date(editingProject.expectedCloseDate), "yyyy-MM-dd") : ""} className="text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="stage" className="text-xs">Pipeline Stage</Label>
                    <Select name="stage" defaultValue={editingProject?.stage || "lead"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Leads/Inquiry</SelectItem>
                        <SelectItem value="proposal">Proposal Submitted</SelectItem>
                        <SelectItem value="won">Won/Contracted</SelectItem>
                        <SelectItem value="execution">Execution Phase</SelectItem>
                        <SelectItem value="testing">Testing/Handover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="projectStatus" className="text-xs">Project Status</Label>
                    <Select name="projectStatus" defaultValue={editingProject?.projectStatus || "not_started"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="activeStage" className="text-xs">Active Stage</Label>
                    <Select name="activeStage" defaultValue={editingProject?.activeStage || "initiate"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initiate">Initiate</SelectItem>
                        <SelectItem value="plan">Plan</SelectItem>
                        <SelectItem value="execute">Execute</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="close">Close</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="health" className="text-xs">Health</Label>
                    <Select name="health" defaultValue={editingProject?.health || "green"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green (On Track)</SelectItem>
                        <SelectItem value="yellow">Yellow (At Risk)</SelectItem>
                        <SelectItem value="red">Red (Critical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="projectType" className="text-xs">Project Type</Label>
                    <Select name="projectType" defaultValue={editingProject?.projectType || "operational"}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="projectManager" className="text-xs">Project Manager</Label>
                    <Input id="projectManager" name="projectManager" defaultValue={editingProject?.projectManager || ""} placeholder="Manager name" className="text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="portfolio" className="text-xs">Portfolio</Label>
                    <Input id="portfolio" name="portfolio" defaultValue={editingProject?.portfolio || ""} placeholder="Portfolio name" className="text-sm" />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="program" className="text-xs">Program</Label>
                  <Input id="program" name="program" defaultValue={editingProject?.program || ""} placeholder="Program name" className="text-sm" />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Textarea id="description" name="description" rows={3} defaultValue={editingProject?.description || ""} placeholder="Enter project details..." className="text-sm" />
                </div>

                {editingProject && (
                  <div className="grid gap-2 pt-3 border-t">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments (with short-note)
                    </Label>
                    <AttachmentUpload entityType="project" entityId={editingProject.id} />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="px-6 py-3 border-t flex-shrink-0">
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

      <ProjectDetailDialog
        project={detailProject}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={(project) => {
          setDetailDialogOpen(false);
          setEditingProject(project);
          setDialogOpen(true);
        }}
        formatCurrency={formatCurrency}
        currency={currency}
      />
    </div>
  );
}
