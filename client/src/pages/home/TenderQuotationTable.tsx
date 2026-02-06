import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface TenderQuotationTableProps {
  tenders: any[];
  totalTenders: number;
  pipelineValue: string;
  wonValue: string;
  formatCurrency: (val: number) => string;
}

export default function TenderQuotationTable({ tenders, totalTenders, pipelineValue, wonValue, formatCurrency }: TenderQuotationTableProps) {
  const [, navigate] = useLocation();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "win": case "po_received": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "lost": case "no_decision": return "bg-red-100 text-red-700 border-red-200";
      case "preparing": return "bg-amber-100 text-amber-700 border-amber-200";
      case "not_started": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "Draft";
      case "preparing": return "Preparing";
      case "submitted": return "Submitted";
      case "win": return "Won";
      case "po_received": return "PO Received";
      case "lost": return "Lost";
      case "no_decision": return "No Decision";
      default: return status;
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            Tender/Quotation
            <Badge variant="secondary" className="ml-1 text-xs">{tenders.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tender-quotation")} className="text-amber-600 h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Quote
          </Button>
        </div>
        <div className="flex gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Total Pipeline</span>
            <span className="text-sm font-bold text-blue-600">{pipelineValue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Won Value</span>
            <span className="text-sm font-bold text-emerald-600">{wonValue}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[340px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Ref#</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-right py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Value</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenders.length > 0 ? tenders.map((tender) => (
                  <tr key={tender.id} className="border-b border-gray-50 hover:bg-amber-50/30 cursor-pointer transition-colors" onClick={() => navigate("/tender-quotation")}>
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-gray-600">{tender.referenceNumber || `QT-${tender.id}`}</p>
                    </td>
                    <td className="py-3 px-3 max-w-[250px]">
                      <p className="font-medium text-gray-900 text-sm truncate">{tender.title || tender.name}</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-semibold text-gray-800 text-sm">{formatCurrency(parseFloat(tender.estimatedValue || "0"))}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={`${getStatusStyle(tender.status)} text-[11px] font-medium`} variant="outline">
                        {getStatusLabel(tender.status)}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No quotations</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        {tenders.length > 0 && (
          <div className="px-4 pt-3 flex items-center justify-between border-t border-gray-100">
            <p className="text-xs text-gray-400">{tenders.length} of {totalTenders} quotations</p>
            <Button variant="link" size="sm" className="text-amber-600 text-xs" onClick={() => navigate("/tender-quotation")}>View All</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
