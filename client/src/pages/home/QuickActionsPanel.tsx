import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, MessageCircle, Receipt, Zap, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActionsPanel() {
  const [, navigate] = useLocation();

  const actions = [
    { label: "New Quote", icon: FileText, desc: "Create tender", route: "/tender-quotation", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
    { label: "Add Task", icon: ClipboardList, desc: "Track progress", route: "/action-tracker", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100" },
    { label: "Message", icon: MessageCircle, desc: "Team chat", route: "/", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
    { label: "Invoice", icon: Receipt, desc: "Bill client", route: "/financial", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100" },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50">
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              className={`${action.bg} rounded-xl p-3 text-left transition-all hover:shadow-sm`}
              onClick={() => navigate(action.route)}
            >
              <action.icon className={`h-5 w-5 ${action.color} mb-2`} />
              <p className="text-sm font-medium text-gray-800">{action.label}</p>
              <p className="text-[11px] text-gray-500">{action.desc}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
