import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface ProjectCardsGridProps {
  projects: any[];
  formatCurrency: (val: number) => string;
}

export default function ProjectCardsGrid({ projects, formatCurrency }: ProjectCardsGridProps) {
  const [, navigate] = useLocation();

  const getProjectStatus = (stage: string) => {
    switch (stage) {
      case "execution": return { label: "In Progress", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" };
      case "won": return { label: "On Track", color: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-500" };
      case "proposal": return { label: "Proposal", color: "bg-amber-100 text-amber-700", dotColor: "bg-amber-500" };
      case "lead": return { label: "New Lead", color: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500" };
      case "testing": return { label: "At Risk", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" };
      default: return { label: stage, color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500" };
    }
  };

  const getProgress = (stage: string) => {
    switch (stage) {
      case "won": return 92;
      case "execution": return 60;
      case "proposal": return 35;
      case "lead": return 15;
      default: return 25;
    }
  };

  const avatarColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
  const displayProjects = projects.slice(0, 4);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            Projects
          </CardTitle>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/projects")}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayProjects.map((project, idx) => {
            const status = getProjectStatus(project.stage);
            const progress = getProgress(project.stage);
            const value = parseFloat(project.value || "0");
            const budgetUsed = value * (progress / 100);
            return (
              <div key={project.id} className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-200" onClick={() => navigate("/projects")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${status.color} text-[10px] px-2`} variant="outline">{status.label}</Badge>
                      {project.expectedCloseDate && (
                        <span className="text-[11px] text-gray-400">Due {format(new Date(project.expectedCloseDate), "MMM d")}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2 mb-3">
                  {[0, 1, 2].map(i => (
                    <Avatar key={i} className="h-7 w-7 border-2 border-white">
                      <AvatarFallback className={`${avatarColors[(idx + i) % avatarColors.length]} text-white text-[10px]`}>
                        {String.fromCharCode(65 + ((idx + i) % 26))}{String.fromCharCode(75 + ((idx + i * 3) % 26))}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-700">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-700">{formatCurrency(budgetUsed)} / {formatCurrency(value)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {projects.length > 4 && (
          <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-600 text-xs" onClick={() => navigate("/projects")}>
            View All Projects <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
