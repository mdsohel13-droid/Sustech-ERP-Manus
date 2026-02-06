import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircleDollarSign, Target, FileText, Users, ShoppingCart, Package, Briefcase, TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";

interface KPIOverviewRowProps {
  totalRevenue: string;
  totalSales: string;
  projectsTotal: number;
  projectsRunning: number;
  tendersTotal: number;
  tendersWon: number;
  totalLeads: number;
  totalEmployees: number;
  totalStock: number;
  lowStockCount: number;
  transactionCount: number;
}

export default function KPIOverviewRow(props: KPIOverviewRowProps) {
  const [, navigate] = useLocation();

  const cards = [
    {
      label: "Revenue", value: props.totalRevenue, sub: "Total Income",
      icon: CircleDollarSign, gradient: "from-emerald-500 to-emerald-600",
      badge: "+18%", route: "/financial",
    },
    {
      label: "Sales", value: props.totalSales, sub: "This Period",
      icon: ShoppingCart, gradient: "from-blue-500 to-blue-600",
      badge: "+23%", route: "/sales",
    },
    {
      label: "Projects", value: props.projectsTotal.toString(), sub: `${props.projectsRunning} running`,
      icon: Target, gradient: "from-violet-500 to-purple-600",
      badge: `${props.projectsRunning} active`, route: "/projects",
    },
    {
      label: "Quotations", value: props.tendersTotal.toString(), sub: `${props.tendersWon} won`,
      icon: FileText, gradient: "from-amber-500 to-amber-600",
      badge: `${props.tendersWon} won`, route: "/tender-quotation",
    },
    {
      label: "CRM Leads", value: props.totalLeads.toString(), sub: "Active Leads",
      icon: Users, gradient: "from-rose-500 to-pink-600",
      badge: "Pipeline", route: "/crm",
    },
    {
      label: "Inventory", value: props.totalStock.toLocaleString(), sub: "Total Stock",
      icon: Package, gradient: "from-teal-500 to-teal-600",
      badge: props.lowStockCount > 0 ? `${props.lowStockCount} low` : "OK", route: "/inventory",
    },
    {
      label: "Team", value: props.totalEmployees.toString(), sub: "Employees",
      icon: Briefcase, gradient: "from-indigo-500 to-indigo-600",
      badge: "Active", route: "/hr",
    },
    {
      label: "Transactions", value: props.transactionCount.toString(), sub: "Records",
      icon: TrendingUp, gradient: "from-cyan-500 to-cyan-600",
      badge: "Total", route: "/accounting",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} text-white border-0 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
          onClick={() => navigate(card.route)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="h-4 w-4 opacity-80" />
              <Badge className="bg-white/20 text-white text-[10px] px-1.5 border-0">{card.badge}</Badge>
            </div>
            <p className="text-lg sm:text-xl font-bold truncate leading-tight">{card.value}</p>
            <p className="text-[10px] opacity-80 leading-tight mt-0.5">{card.sub}</p>
            <p className="text-[9px] mt-1 opacity-60 font-medium">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
