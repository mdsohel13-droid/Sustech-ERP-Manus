import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, AlertTriangle, Package, Receipt, FileText } from "lucide-react";

interface RevenueCardProps {
  totalRevenue: string;
  growthPercent: string;
  pendingActions: number;
  itemsToReorder: number;
  transactionCount: number;
  invoiceCount: number;
}

export default function RevenueCard({ totalRevenue, growthPercent, pendingActions, itemsToReorder, transactionCount, invoiceCount }: RevenueCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <Card className="sm:col-span-1 border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="text-xs opacity-80">Revenue</span>
          </div>
          <p className="text-2xl font-bold">{totalRevenue}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-200" />
            <span className="text-xs text-emerald-200">{growthPercent} vs last year</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-red-50 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingActions}</p>
          <p className="text-[11px] text-gray-500">Requires action</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-amber-50 mb-2">
            <Package className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{itemsToReorder}</p>
          <p className="text-[11px] text-gray-500">Items to reorder</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-blue-50 mb-2">
            <Receipt className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{transactionCount}</p>
          <p className="text-[11px] text-gray-500">Transactions</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-emerald-50 mb-2">
            <FileText className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoiceCount}</p>
          <p className="text-[11px] text-gray-500">Invoices</p>
        </CardContent>
      </Card>
    </div>
  );
}
