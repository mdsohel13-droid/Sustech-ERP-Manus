import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

interface StockAlertsProps {
  lowStockItems: { id: number; name: string; sku: string; quantity: number; reorderLevel: number; critical: boolean }[];
  outOfStock: number;
}

export default function StockAlerts({ lowStockItems, outOfStock }: StockAlertsProps) {
  const [, navigate] = useLocation();
  const criticalCount = lowStockItems.filter(i => i.critical).length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            Stock Alerts
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">{criticalCount} Critical</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">Items requiring attention</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px]">
          <div className="space-y-3">
            {lowStockItems.length > 0 ? lowStockItems.slice(0, 5).map((item) => {
              const percent = Math.round((item.quantity / item.reorderLevel) * 100);
              return (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">{item.sku}</p>
                    </div>
                    <Badge className={item.critical ? "bg-red-100 text-red-700 text-[10px]" : "bg-amber-100 text-amber-700 text-[10px]"} variant="outline">
                      {item.critical ? "Critical" : "Low"}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Stock Level</span>
                      <span className="font-medium">{item.quantity} / {item.reorderLevel}</span>
                    </div>
                    <Progress value={Math.min(percent, 100)} className="h-1.5" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7" onClick={() => navigate("/inventory")}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Reorder
                  </Button>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All stock levels healthy</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
