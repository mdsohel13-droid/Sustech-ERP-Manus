import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

interface TeamWorkloadProps {
  departments: { name: string; count: number }[];
  totalEmployees: number;
}

export default function TeamWorkload({ departments, totalEmployees }: TeamWorkloadProps) {
  const deptColors = [
    { bar: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
    { bar: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
    { bar: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
    { bar: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50" },
  ];

  const maxCount = Math.max(...departments.map(d => d.count), 1);

  const workloadData = departments.length > 0 ? departments : [
    { name: "Engineering", count: 8 },
    { name: "Sales", count: 5 },
    { name: "Operations", count: 4 },
    { name: "HR", count: 3 },
    { name: "Finance", count: 3 },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            Team Workload
          </CardTitle>
          <span className="text-xs text-gray-500">{Math.round((departments.reduce((s, d) => s + d.count, 0) / Math.max(totalEmployees, 1)) * 100)}% capacity</span>
        </div>
        <p className="text-xs text-gray-500">By department</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workloadData.slice(0, 6).map((dept, idx) => {
            const colors = deptColors[idx % deptColors.length];
            const percentage = Math.round((dept.count / maxCount) * 100);
            return (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    <span className="text-[11px] text-gray-400">({dept.count})</span>
                  </div>
                  <span className={`text-xs font-semibold ${colors.text}`}>{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${colors.bar} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Total Members</span>
          <span className="text-sm font-bold text-gray-900">{totalEmployees} people</span>
        </div>
      </CardContent>
    </Card>
  );
}
