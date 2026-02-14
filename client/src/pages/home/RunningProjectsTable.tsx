import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface RunningProjectsTableProps {
  projects: any[];
  totalProjects: number;
  formatCurrency: (val: number) => string;
}

export default function RunningProjectsTable({ projects, totalProjects, formatCurrency }: RunningProjectsTableProps) {
  const [, navigate] = useLocation();

  const getStageStyle = (stage: string) => {
    switch (stage) {
      case "initiation": return "bg-blue-100 text-blue-700 border-blue-200";
      case "planning": return "bg-amber-100 text-amber-700 border-amber-200";
      case "execution": return "bg-purple-100 text-purple-700 border-purple-200";
      case "monitoring": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "closure_technical": return "bg-teal-100 text-teal-700 border-teal-200";
      case "payment_due": return "bg-orange-100 text-orange-700 border-orange-200";
      case "financial_closure": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "initiation": return "Initiation";
      case "planning": return "Planning";
      case "execution": return "Execution";
      case "monitoring": return "Monitoring & Control";
      case "closure_technical": return "Closure (Technical)";
      case "payment_due": return "Payment Due";
      case "financial_closure": return "Financial Closure";
      default: return stage;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": case "critical": return "text-red-600 bg-red-50";
      case "medium": return "text-amber-600 bg-amber-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <Target className="h-3.5 w-3.5 text-purple-600" />
            </div>
            Running Projects
            <Badge variant="secondary" className="ml-1 text-[10px]">{projects.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-gray-400 h-7 w-7 p-0">
              <Filter className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-purple-600 h-7 text-[11px]">
              View All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left py-2 px-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider w-8">#</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Project Name</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Customer</th>
                <th className="text-right py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Value</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Stage</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Priority</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Source</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Open Date</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Close Date</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Probability</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? projects.map((project, idx) => (
                <tr key={project.id} className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => navigate("/projects")}>
                  <td className="py-2 px-3 text-[11px] text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-2 max-w-[200px]">
                    <p className="font-medium text-gray-900 text-[11px] leading-tight line-clamp-1">{project.name}</p>
                  </td>
                  <td className="py-2 px-2">
                    <p className="text-gray-600 text-[11px] truncate max-w-[120px]">{project.customerName || "-"}</p>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <p className="font-semibold text-emerald-600 text-[11px]">{formatCurrency(parseFloat(project.value || "0"))}</p>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`${getStageStyle(project.stage)} text-[9px] font-medium px-1.5 py-0`} variant="outline">
                      {getStageLabel(project.stage)}
                    </Badge>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`${getPriorityStyle(project.priority || "medium")} text-[9px] px-1.5 py-0`} variant="outline">
                      {(project.priority || "medium").charAt(0).toUpperCase() + (project.priority || "medium").slice(1)}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-[11px] text-gray-500 truncate max-w-[80px]">
                    {project.source || "-"}
                  </td>
                  <td className="py-2 px-2 text-gray-500 text-[11px] whitespace-nowrap">
                    {project.createdAt ? format(new Date(project.createdAt), "dd MMM yy") : "-"}
                  </td>
                  <td className="py-2 px-2 text-gray-500 text-[11px] whitespace-nowrap">
                    {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "dd MMM yy") : "-"}
                  </td>
                  <td className="py-2 px-2 text-[11px] text-gray-600 font-medium">
                    {project.probability ? `${project.probability}%` : "-"}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={10} className="py-6 text-center text-gray-400 text-xs">No running projects</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {projects.length > 0 && (
          <div className="px-3 pt-2 flex items-center justify-between border-t border-gray-100">
            <p className="text-[10px] text-gray-400">Showing {projects.length} of {totalProjects} projects</p>
            <Button variant="link" size="sm" className="text-purple-600 text-[10px] h-6" onClick={() => navigate("/projects")}>View All Projects</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
