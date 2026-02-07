import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
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

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": case "critical": return "text-red-600 bg-red-50";
      case "medium": return "text-amber-600 bg-amber-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <FileText className="h-3.5 w-3.5 text-amber-600" />
            </div>
            Tender / Quotation
            <Badge variant="secondary" className="ml-1 text-[10px]">{tenders.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">Pipeline:</span>
              <span className="text-[11px] font-bold text-blue-600">{pipelineValue}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">Won:</span>
              <span className="text-[11px] font-bold text-emerald-600">{wonValue}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tender-quotation")} className="text-amber-600 h-7 text-[11px]">
              <Plus className="h-3 w-3 mr-0.5" /> New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left py-2 px-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider w-8">#</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Ref #</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Title</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Customer</th>
                <th className="text-right py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Est. Value</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Priority</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Type</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Submission</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {tenders.length > 0 ? tenders.map((tender, idx) => (
                <tr key={tender.id} className="border-b border-gray-50 hover:bg-amber-50/30 cursor-pointer transition-colors" onClick={() => navigate("/tender-quotation")}>
                  <td className="py-2 px-3 text-[11px] text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <p className="font-mono text-[11px] text-gray-600">{tender.referenceNumber || `QT-${tender.id}`}</p>
                  </td>
                  <td className="py-2 px-2 max-w-[180px]">
                    <p className="font-medium text-gray-900 text-[11px] truncate">{tender.title || tender.name}</p>
                  </td>
                  <td className="py-2 px-2">
                    <p className="text-gray-600 text-[11px] truncate max-w-[120px]">{tender.customerName || "-"}</p>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <p className="font-semibold text-gray-800 text-[11px]">{formatCurrency(parseFloat(tender.estimatedValue || "0"))}</p>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`${getStatusStyle(tender.status)} text-[9px] font-medium px-1.5 py-0`} variant="outline">
                      {getStatusLabel(tender.status)}
                    </Badge>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`${getPriorityStyle(tender.priority || "medium")} text-[9px] px-1.5 py-0`} variant="outline">
                      {(tender.priority || "medium").charAt(0).toUpperCase() + (tender.priority || "medium").slice(1)}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-[11px] text-gray-500">
                    {tender.type === "tender" ? "Tender" : tender.type === "quotation" ? "Quote" : tender.type || "-"}
                  </td>
                  <td className="py-2 px-2 text-gray-500 text-[11px] whitespace-nowrap">
                    {tender.submissionDate ? format(new Date(tender.submissionDate), "dd MMM yy") : "-"}
                  </td>
                  <td className="py-2 px-2 text-gray-500 text-[11px] whitespace-nowrap">
                    {tender.createdAt ? format(new Date(tender.createdAt), "dd MMM yy") : "-"}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={10} className="py-6 text-center text-gray-400 text-xs">No quotations</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {tenders.length > 0 && (
          <div className="px-3 pt-2 flex items-center justify-between border-t border-gray-100">
            <p className="text-[10px] text-gray-400">{tenders.length} of {totalTenders} quotations</p>
            <Button variant="link" size="sm" className="text-amber-600 text-[10px] h-6" onClick={() => navigate("/tender-quotation")}>View All Quotations</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
