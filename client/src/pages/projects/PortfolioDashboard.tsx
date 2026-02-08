import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, RotateCcw, Wallet, SlidersHorizontal, Search } from "lucide-react";
import { format } from "date-fns";

const CHART_COLORS = [
  "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5",
  "#70AD47", "#264478", "#9B57A0", "#636363", "#FF5050",
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "#A5A5A5",
  in_progress: "#4472C4",
  on_hold: "#FFC000",
  completed: "#70AD47",
  cancelled: "#FF5050",
};

const HEALTH_COLORS: Record<string, string> = {
  green: "#70AD47",
  yellow: "#FFC000",
  red: "#FF5050",
};

const HEALTH_BAR_COLORS: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

const TYPE_COLORS: Record<string, string> = {
  strategic: "#5B9BD5",
  improvement: "#4472C4",
  operational: "#70AD47",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#FF5050",
  medium: "#FFC000",
  low: "#70AD47",
  Unassigned: "#A5A5A5",
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

interface PortfolioDashboardProps {
  onOpenFinancials?: (project: any) => void;
}

export default function PortfolioDashboard({ onOpenFinancials }: PortfolioDashboardProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [sortCol, setSortCol] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p: any) =>
        (p.name || "").toLowerCase().includes(term) ||
        (p.projectManager || "").toLowerCase().includes(term) ||
        (p.projectStatus || "").toLowerCase().includes(term) ||
        (p.activeStage || "").toLowerCase().includes(term) ||
        (p.portfolio || "").toLowerCase().includes(term) ||
        (p.program || "").toLowerCase().includes(term)
      );
    }
    list.sort((a: any, b: any) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortCol === "durationDays" || sortCol === "progressPercentage" || sortCol === "totalTasks" || sortCol === "lateTasks" || sortCol === "issuesCount") {
        return ((Number(a[sortCol]) || 0) - (Number(b[sortCol]) || 0)) * dir;
      }
      if (sortCol === "startDate" || sortCol === "expectedCloseDate") {
        const aD = a[sortCol] ? new Date(a[sortCol]).getTime() : 0;
        const bD = b[sortCol] ? new Date(b[sortCol]).getTime() : 0;
        return (aD - bD) * dir;
      }
      const aVal = String(a[sortCol] || "");
      const bVal = String(b[sortCol] || "");
      return aVal.localeCompare(bVal) * dir;
    });
    return list;
  }, [data?.projects, sortCol, sortDir, searchTerm]);

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
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 ml-0.5 inline" /> : <ChevronDown className="h-3 w-3 ml-0.5 inline" />
    ) : null;

  const kpis = data?.kpis || { totalProjects: 0, totalTasks: 0, totalIssues: 0, totalLateTasks: 0 };
  const charts = data?.charts || {
    byProgram: [], byProjectManager: [], byProjectStatus: [],
    byHealth: [], byProjectType: [], byPriority: [],
  };
  const filterOptions = data?.filterOptions || { portfolios: [], programs: [], templates: [], managers: [] };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const projectNames = useMemo(() => {
    if (!data?.projects) return [];
    return Array.from(new Set(data.projects.map((p) => p.name).filter(Boolean)));
  }, [data?.projects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const renderDonut = (
    title: string,
    chartData: { name: string; value: number }[],
    colorMap?: Record<string, string>
  ) => (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-700 mb-1 text-center">{title}</p>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[120px] w-[120px] text-xs text-gray-400">No data</div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={1}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={colorMap?.[entry.name] || CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, formatLabel(name)]}
                contentStyle={{ fontSize: "11px", padding: "4px 8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-0.5 max-w-[160px]">
            {chartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: colorMap?.[entry.name] || CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="text-[9px] text-gray-600 whitespace-nowrap">
                  {formatLabel(entry.name).length > 10 ? formatLabel(entry.name).slice(0, 10) + "…" : formatLabel(entry.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return format(new Date(d), "d MMM yyyy"); } catch { return "—"; }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3 w-3" />
          {showFilters ? "Hide Filters" : "Filters"}
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-1">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-red-600 hover:text-red-700">
            <RotateCcw className="h-3 w-3 mr-1" />Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="shadow-sm border bg-gray-50/50">
          <CardContent className="py-2.5 px-3">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Portfolio</p>
                <Select value={filters.portfolio || "all"} onValueChange={(v) => updateFilter("portfolio", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.portfolios.map((p) => p && <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Program</p>
                <Select value={filters.program || "all"} onValueChange={(v) => updateFilter("program", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.programs.map((p) => p && <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Project Templ...</p>
                <Select value={filters.projectTemplate || "all"} onValueChange={(v) => updateFilter("projectTemplate", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.templates.map((t) => t && <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Project Manag...</p>
                <Select value={filters.projectManager || "all"} onValueChange={(v) => updateFilter("projectManager", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.managers.map((m) => m && <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Project Status</p>
                <Select value={filters.projectStatus || "all"} onValueChange={(v) => updateFilter("projectStatus", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {["not_started", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                      <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Project Type</p>
                <Select value={filters.projectType || "all"} onValueChange={(v) => updateFilter("projectType", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {["strategic", "improvement", "operational"].map((t) => (
                      <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Project Priority</p>
                <Select value={filters.priority || "all"} onValueChange={(v) => updateFilter("priority", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {["high", "medium", "low"].map((p) => (
                      <SelectItem key={p} value={p}>{formatLabel(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 mb-0.5">Health</p>
                <Select value={filters.health || "all"} onValueChange={(v) => updateFilter("health", v)}>
                  <SelectTrigger className="h-7 text-xs bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {["green", "yellow", "red"].map((h) => (
                      <SelectItem key={h} value={h}>{formatLabel(h)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="grid grid-cols-2 gap-3 w-[200px] flex-shrink-0">
          <Card className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-3xl font-bold text-gray-900">{kpis.totalProjects}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Projects</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-3xl font-bold text-gray-900">{kpis.totalTasks}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Tasks</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-3xl font-bold text-gray-900">{kpis.totalIssues}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Issues</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-3xl font-bold text-gray-900">{kpis.totalLateTasks}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Late Tasks</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex items-start justify-between gap-2 overflow-x-auto">
          {renderDonut("Program", charts.byProgram)}
          {renderDonut("Project Manager", charts.byProjectManager)}
          {renderDonut("Project Status", charts.byProjectStatus, STATUS_COLORS)}
          {renderDonut("Health", charts.byHealth, HEALTH_COLORS)}
          {renderDonut("Project Type", charts.byProjectType, TYPE_COLORS)}
          {renderDonut("Project Priority", charts.byPriority, PRIORITY_COLORS)}
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-700">Project Details</p>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs pl-8 pr-2 bg-white"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "210px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "60px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "50px" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "50px" }} />
                <col style={{ width: "50px" }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-center text-[11px] font-semibold text-gray-700 py-2 px-1 whitespace-normal break-words">
                    SL
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("name")}>
                    Project <SortIcon col="name" />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("projectManager")}>
                    Project Manager <SortIcon col="projectManager" />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("projectStatus")}>
                    Project Status <SortIcon col="projectStatus" />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("activeStage")}>
                    Active Stage <SortIcon col="activeStage" />
                  </th>
                  <th className="text-center text-[11px] font-semibold text-gray-700 py-2 px-2 whitespace-normal break-words">
                    Health
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("startDate")}>
                    Current Start <SortIcon col="startDate" />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("expectedCloseDate")}>
                    Current Finish <SortIcon col="expectedCloseDate" />
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("durationDays")}>
                    Duration <SortIcon col="durationDays" />
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("progressPercentage")}>
                    Progress <SortIcon col="progressPercentage" />
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("totalTasks")}>
                    Tasks <SortIcon col="totalTasks" />
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("lateTasks")}>
                    Late Tasks <SortIcon col="lateTasks" />
                  </th>
                  <th className="text-right text-[11px] font-semibold text-gray-700 py-2 px-2 cursor-pointer hover:bg-gray-200 whitespace-normal break-words" onClick={() => toggleSort("issuesCount")}>
                    Issues <SortIcon col="issuesCount" />
                  </th>
                  <th className="text-center text-[11px] font-semibold text-gray-700 py-2 px-1 whitespace-normal break-words">
                    Fin.
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-8 text-gray-400 text-sm">
                      No projects match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredTableData.map((p, idx) => (
                    <tr key={p.id} className={`border-b border-gray-200 hover:bg-blue-50/50 ${idx % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                      <td className="py-1.5 px-1 text-center">
                        <span className="text-[11px] text-gray-500 font-medium">{idx + 1}</span>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="text-[11px] text-blue-600 font-medium break-words leading-tight" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                          {p.name || "—"}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="text-[11px] text-gray-700 break-words leading-tight" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                          {p.projectManager || "—"}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="text-[11px] text-gray-700 break-words leading-tight" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                          {formatLabel(p.projectStatus || "not_started")}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="text-[11px] text-gray-700 break-words leading-tight" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                          {formatLabel(p.activeStage || "initiate")}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <div className={`w-full h-4 rounded-sm ${HEALTH_BAR_COLORS[p.health || "green"] || "bg-green-500"}`} title={formatLabel(p.health || "green")} />
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-[11px] text-gray-700 whitespace-nowrap">{formatDate(p.startDate)}</span>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="text-[11px] text-gray-700 whitespace-nowrap">{formatDate(p.expectedCloseDate)}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <span className="text-[11px] text-gray-700">{p.durationDays ?? "—"}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <span className="text-[11px] text-gray-700">{p.progressPercentage || 0}%</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <span className="text-[11px] text-gray-700">{p.totalTasks || 0}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <span className="text-[11px] text-gray-700">{p.lateTasks || 0}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <span className="text-[11px] text-gray-700">{p.issuesCount || 0}</span>
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        {onOpenFinancials && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onOpenFinancials(p)}
                            title="View Financials"
                          >
                            <Wallet className="h-3 w-3 text-blue-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 text-[10px] text-gray-500 border-t bg-gray-50">
            Showing {filteredTableData.length} of {data?.projects?.length || 0} projects
          </div>
        </CardContent>
      </Card>
    </div>
  );
}