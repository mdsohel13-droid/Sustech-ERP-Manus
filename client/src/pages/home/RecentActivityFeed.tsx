import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, ChevronRight, FileText, ShoppingCart, AlertTriangle, UserPlus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

interface RecentActivityFeedProps {
  actionItems: any[];
  tenders: any[];
  users: any[];
}

export default function RecentActivityFeed({ actionItems, tenders, users }: RecentActivityFeedProps) {
  const [, navigate] = useLocation();

  const activities = [
    ...(tenders || []).slice(0, 3).map(t => ({
      id: `t-${t.id}`,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: t.status === "submitted" ? "Quotation submitted" : "Quotation updated",
      detail: `${t.referenceNumber || `QT-${t.id}`} - ${t.title || t.name}`,
      user: "System",
      time: t.updatedAt || t.createdAt,
    })),
    ...(actionItems || []).slice(0, 3).map(a => ({
      id: `a-${a.id}`,
      icon: a.priority === "high" ? AlertTriangle : MessageSquare,
      iconBg: a.priority === "high" ? "bg-red-50" : "bg-amber-50",
      iconColor: a.priority === "high" ? "text-red-600" : "text-amber-600",
      title: a.status === "resolved" ? "Task completed" : "Task updated",
      detail: a.title,
      user: users.find(u => u.id === a.assignedTo)?.name || "System",
      time: a.updatedAt || a.createdAt,
    })),
  ]
    .filter(a => a.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100">
              <Activity className="h-4 w-4 text-gray-600" />
            </div>
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-500 h-8 text-xs" onClick={() => navigate("/action-tracker")}>
            View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-1">
            {activities.length > 0 ? activities.map((act) => (
              <div key={act.id} className="flex gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${act.iconBg} shrink-0 self-start`}>
                  <act.icon className={`h-4 w-4 ${act.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{act.title}</p>
                  <p className="text-xs text-gray-500 truncate">{act.detail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{act.user}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{formatDistanceToNow(new Date(act.time), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
