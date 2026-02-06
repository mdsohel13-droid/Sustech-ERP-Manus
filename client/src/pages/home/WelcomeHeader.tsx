import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BarChart3, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface WelcomeHeaderProps {
  pendingApprovals: number;
  lowStockCount: number;
  overdueActions: number;
  weeklyTarget: number;
}

export default function WelcomeHeader({ pendingApprovals, lowStockCount, overdueActions, weeklyTarget }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-blue-700 p-6 lg:p-8 text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{greeting}</p>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">Welcome back, {firstName}</h1>
            <p className="text-blue-100 text-sm mt-2 max-w-xl">
              You have {pendingApprovals > 0 ? `${pendingApprovals} pending approval${pendingApprovals > 1 ? "s" : ""}` : "no pending approvals"}
              {lowStockCount > 0 ? `, ${lowStockCount} inventory alert${lowStockCount > 1 ? "s" : ""}` : ""}
              {overdueActions > 0 ? `, and ${overdueActions} overdue task${overdueActions > 1 ? "s" : ""}` : ""}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
              onClick={() => navigate("/action-tracker")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
              onClick={() => navigate("/financial")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="text-xs text-blue-100">Weekly Target</span>
            </div>
            <p className="text-2xl font-bold">{weeklyTarget}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-amber-300" />
              <span className="text-xs text-blue-100">Approvals</span>
            </div>
            <p className="text-2xl font-bold">{pendingApprovals}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-300" />
              <span className="text-xs text-blue-100">Stock Alerts</span>
            </div>
            <p className="text-2xl font-bold">{lowStockCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-200" />
              <span className="text-xs text-blue-100">Today</span>
            </div>
            <p className="text-lg font-bold">{format(new Date(), "EEE, MMM d")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
