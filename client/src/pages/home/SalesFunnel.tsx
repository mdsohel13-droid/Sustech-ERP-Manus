import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingDown } from "lucide-react";

interface SalesFunnelProps {
  totalLeads: number;
  qualified: number;
  proposal: number;
  negotiation: number;
  closedWon: number;
  pipelineValue: string;
  conversionRate: number;
}

export default function SalesFunnel({ totalLeads, qualified, proposal, negotiation, closedWon, pipelineValue, conversionRate }: SalesFunnelProps) {
  const stages = [
    { label: "Leads", count: totalLeads, color: "bg-blue-500", width: "100%", dropOff: null },
    { label: "Qualified", count: qualified, color: "bg-cyan-500", width: `${Math.max(20, (qualified / Math.max(totalLeads, 1)) * 100)}%`, dropOff: totalLeads > 0 ? `-${Math.round(((totalLeads - qualified) / totalLeads) * 100)}%` : null },
    { label: "Proposal", count: proposal, color: "bg-amber-500", width: `${Math.max(15, (proposal / Math.max(totalLeads, 1)) * 100)}%`, dropOff: qualified > 0 ? `-${Math.round(((qualified - proposal) / qualified) * 100)}%` : null },
    { label: "Negotiation", count: negotiation, color: "bg-orange-500", width: `${Math.max(12, (negotiation / Math.max(totalLeads, 1)) * 100)}%`, dropOff: proposal > 0 ? `-${Math.round(((proposal - negotiation) / proposal) * 100)}%` : null },
    { label: "Closed Won", count: closedWon, color: "bg-emerald-500", width: `${Math.max(10, (closedWon / Math.max(totalLeads, 1)) * 100)}%`, dropOff: negotiation > 0 ? `-${Math.round(((negotiation - closedWon) / negotiation) * 100)}%` : null },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            CRM
          </CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Conversion</span>
            <span className="text-sm font-bold text-emerald-600">{conversionRate}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Pipeline value:</span>
          <span className="text-sm font-bold text-blue-600">{pipelineValue}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="w-20 text-right">
                <p className="text-xs font-medium text-gray-700">{stage.label}</p>
              </div>
              <div className="flex-1 relative">
                <div className={`${stage.color} rounded-md h-8 flex items-center justify-between px-3 transition-all duration-500`} style={{ width: stage.width }}>
                  <span className="text-white text-xs font-bold">{stage.count}</span>
                </div>
              </div>
              {stage.dropOff && (
                <div className="w-12 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] text-red-500 font-medium">{stage.dropOff}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{totalLeads}</p>
            <p className="text-[10px] text-gray-500">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{proposal}</p>
            <p className="text-[10px] text-gray-500">In Proposal</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{closedWon}</p>
            <p className="text-[10px] text-gray-500">Closed Won</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
