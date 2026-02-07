import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Briefcase, ListChecks, AlertTriangle, Clock, Search, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#6366f1",
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "#94a3b8",
  in_progress: "#3b82f6",
  on_hold: "#f59e0b",
  completed: "#10b981",
  cancelled: "#ef4444",
};

const HEALTH_COLORS: Record<string, string> = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
};

const TYPE_COLORS: Record<string, string> = {
  strategic: "#8b5cf6",
  improvement: "#3b82f6",
  operational: "#10b981",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const formatLabel = (val: string) =>
  val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface FilterState {
  portfolio?: string;
  program?: string;
  projectTemplate?: string;
  projectManager?: string;
  projectStatus?: string;
  projectType?: string;
  priority?: string;
  health?: string;
}

export default function PortfolioDashboard() {
  const [filters, setFilters] = useState<FilterState>({});
  const [tableSearch, setTableSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = trpc.projects.getPortfolioDashboard.useQuery(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  );

  const clearFilters = () => setFilters({});

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const filteredTableData = useMemo(() => {
    if (!data?.projects) return [];
    let list = [...data.projects];
    if (tableSearch) {
      const s = tableSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.customerName.toLowerCase().includes(s) ||
          (p.projectManager || "").toLowerCase().includes(s)
      );
    }
    list.sort((a: any, b: any) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortCol === "value") return ((Number(a.value) || 0) - (Number(b.value) || 0)) * dir;
      if (sortCol === "progressPercentage") return ((a.progressPercentage || 0) - (b.progressPercentage || 0)) * dir;
      const aVal = String(a[sortCol] || "");
      const bVal = String(b[sortCol] || "");
      return aVal.localeCompare(bVal) * dir;
    });
    return list;
  }, [data?.projects, tableSearch, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 ml-1 inline" /> : <ChevronDown className="h-3 w-3 ml-1 inline" />
    ) : null;

  const healthBadge = (h: string | null) => {
    const colors: Record<string, string> = {
      green: "bg-emerald-100 text-emerald-700",
      yellow: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
    };
    return <Badge className={colors[h || "green"] || "bg-gray-100 text-gray-700"}>{formatLabel(h || "green")}</Badge>;
  };

  const statusBadge = (s: string | null) => {
    const colors: Record<string, string> = {
      not_started: "bg-slate-100 text-slate-700",
      in_progress: "bg-blue-100 text-blue-700",
      on_hold: "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return <Badge className={colors[s || "not_started"] || "bg-gray-100 text-gray-700"}>{formatLabel(s || "not_started")}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const kpis = data?.kpis || { totalProjects: 0, totalTasks: 0, totalIssues: 0, totalLateTasks: 0 };
  const charts = data?.charts || {
    byProgram: [],
    byProjectManager: [],
    byProjectStatus: [],
    byHealth: [],
    byProjectType: [],
    byPriority: [],
  };
  const filterOptions = data?.filterOptions || { portfolios: [], programs: [], templates: [], managers: [] };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderDonut = (
    title: string,
    chartData: { name: string; value: number }[],
    colorMap?: Record<string, string>
  ) => (
    <Card className="shadow-sm border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${formatLabel(name)} (${value})`}
                labelLine={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={colorMap?.[entry.name] || CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, formatLabel(name)]} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value: string) => formatLabel(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <Card className="shadow-sm border">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filters:</span>

            <Select value={filters.portfolio || "all"} onValueChange={(v) => updateFilter("portfolio", v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Portfolio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portfolios</SelectItem>
                {filterOptions.portfolios.map((p) => p && <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.program || "all"} onValueChange={(v) => updateFilter("program", v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {filterOptions.programs.map((p) => p && <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.projectManager || "all"} onValueChange={(v) => updateFilter("projectManager", v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {filterOptions.managers.map((m) => m && <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.projectStatus || "all"} onValueChange={(v) => updateFilter("projectStatus", v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["not_started", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.projectType || "all"} onValueChange={(v) => updateFilter("projectType", v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {["strategic", "improvement", "operational"].map((t) => (
                  <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.priority || "all"} onValueChange={(v) => updateFilter("priority", v)}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {["high", "medium", "low"].map((p) => (
                  <SelectItem key={p} value={p}>{formatLabel(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.health || "all"} onValueChange={(v) => updateFilter("health", v)}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Health" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                {["green", "yellow", "red"].map((h) => (
                  <SelectItem key={h} value={h}>{formatLabel(h)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-red-600 hover:text-red-700">
                <RotateCcw className="h-3 w-3 mr-1" />Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Projects</p>
                <p className="text-3xl font-bold mt-1">{kpis.totalProjects}</p>
              </div>
              <div className="bg-blue-400/30 p-2.5 rounded-xl"><Briefcase className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium">Total Tasks</p>
                <p className="text-3xl font-bold mt-1">{kpis.totalTasks}</p>
              </div>
              <div className="bg-emerald-400/30 p-2.5 rounded-xl"><ListChecks className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium">Issues</p>
                <p className="text-3xl font-bold mt-1">{kpis.totalIssues}</p>
              </div>
              <div className="bg-amber-400/30 p-2.5 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs font-medium">Late Tasks</p>
                <p className="text-3xl font-bold mt-1">{kpis.totalLateTasks}</p>
              </div>
              <div className="bg-red-400/30 p-2.5 rounded-xl"><Clock className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {renderDonut("By Program", charts.byProgram)}
        {renderDonut("By Project Manager", charts.byProjectManager)}
        {renderDonut("By Project Status", charts.byProjectStatus, STATUS_COLORS)}
        {renderDonut("By Health", charts.byHealth, HEALTH_COLORS)}
        {renderDonut("By Project Type", charts.byProjectType, TYPE_COLORS)}
        {renderDonut("By Priority", charts.byPriority, PRIORITY_COLORS)}
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Project Details</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8 h-8 w-56 text-xs"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort("name")}>Project <SortIcon col="name" /></TableHead>
                  <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort("customerName")}>Customer <SortIcon col="customerName" /></TableHead>
                  <TableHead className="cursor-pointer text-xs" onClick={() => toggleSort("projectManager")}>Manager <SortIcon col="projectManager" /></TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Health</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="cursor-pointer text-xs text-right" onClick={() => toggleSort("progressPercentage")}>Progress <SortIcon col="progressPercentage" /></TableHead>
                  <TableHead className="text-xs text-right">Tasks</TableHead>
                  <TableHead className="text-xs text-right">Issues</TableHead>
                  <TableHead className="cursor-pointer text-xs text-right" onClick={() => toggleSort("value")}>Value <SortIcon col="value" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-400">
                      No projects match the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTableData.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{p.name || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{p.customerName || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{p.projectManager || "—"}</TableCell>
                      <TableCell>{statusBadge(p.projectStatus)}</TableCell>
                      <TableCell>{healthBadge(p.health)}</TableCell>
                      <TableCell>
                        <Badge className={
                          p.priority === "high" ? "bg-red-100 text-red-700" :
                          p.priority === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }>{formatLabel(p.priority)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatLabel(p.projectType || "operational")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${p.progressPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8 text-right">{p.progressPercentage || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{p.totalTasks || 0}</TableCell>
                      <TableCell className="text-right text-sm">{p.issuesCount || 0}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {p.value ? Number(p.value).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 text-xs text-gray-500 border-t">
            Showing {filteredTableData.length} of {data?.projects?.length || 0} projects
          </div>
        </CardContent>
      </Card>
    </div>
  );
}