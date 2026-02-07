import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface WelcomeHeaderProps {
  pendingApprovals: number;
  lowStockCount: number;
  overdueActions: number;
  weeklyTarget: number;
}

function MiniGauge({ value, maxValue, label, color, size = 64 }: {
  value: number; maxValue: number; label: string; color: string; size?: number;
}) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const vb = size;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg style={{ width: size, height: size }} className="transform -rotate-90" viewBox={`0 0 ${vb} ${vb}`}>
          <circle cx={vb/2} cy={vb/2} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth={size * 0.1} fill="none" />
          <circle cx={vb/2} cy={vb/2} r={r} stroke={color} strokeWidth={size * 0.1} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold" style={{ fontSize: size * 0.22 }}>
            {typeof value === 'number' && maxValue === 100 ? `${value}%` : value}
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs text-blue-100 font-medium">{label}</p>
        {maxValue === 100 && <p className="text-[10px] text-emerald-200/60">of target</p>}
      </div>
    </div>
  );
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
          <MiniGauge value={weeklyTarget} maxValue={100} label="Weekly Target" color="#34d399" />
          <MiniGauge value={pendingApprovals} maxValue={Math.max(pendingApprovals + 5, 10)} label="Pending Approvals" color="#fbbf24" />
          <MiniGauge value={lowStockCount} maxValue={Math.max(lowStockCount + 5, 10)} label="Stock Alerts" color={lowStockCount > 0 ? '#f87171' : '#34d399'} />
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
            <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{new Date().getDate()}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Today</p>
              <p className="text-sm font-bold">{format(new Date(), "EEE, MMM d")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
