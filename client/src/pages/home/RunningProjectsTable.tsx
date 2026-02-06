import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      case "execution": return "bg-blue-100 text-blue-700 border-blue-200";
      case "won": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "proposal": return "bg-amber-100 text-amber-700 border-amber-200";
      case "lead": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": case "critical": return "bg-red-50 text-red-600";
      case "medium": return "bg-amber-50 text-amber-600";
      case "low": return "bg-green-50 text-green-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            Running Projects
            <Badge variant="secondary" className="ml-1 text-xs">{projects.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 h-8">
              <Filter className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-purple-600 h-8">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">Top {Math.min(10, projects.length)} active projects</p>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[380px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Project</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Value</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Priority</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Opening</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Completion</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => navigate("/projects")}>
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">{project.name}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-gray-600 text-xs truncate max-w-[150px]">{project.customerName || "-"}</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-semibold text-emerald-600 text-sm">{formatCurrency(parseFloat(project.value || "0"))}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={`${getStageStyle(project.stage)} text-[11px] font-medium`} variant="outline">
                        {project.stage === "won" ? "Won/Contracted" : project.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={`${getPriorityStyle(project.priority || "medium")} text-[11px]`} variant="outline">
                        {project.priority || "Medium"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                      {project.createdAt ? format(new Date(project.createdAt), "MMM d, yy") : "-"}
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                      {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM d, yy") : "-"}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No running projects</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        {projects.length > 0 && (
          <div className="px-4 pt-3 flex items-center justify-between border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {projects.length} of {totalProjects} projects</p>
            <Button variant="link" size="sm" className="text-purple-600 text-xs" onClick={() => navigate("/projects")}>View All Projects</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
