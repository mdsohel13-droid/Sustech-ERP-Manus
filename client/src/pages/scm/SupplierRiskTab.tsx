import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Shield,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function SupplierRiskTab() {
  const utils = trpc.useUtils();
  const { data: vendorScores, isLoading } = trpc.scm.getLatestRiskScoresForAllVendors.useQuery(undefined, { refetchInterval: 30000 });

  const calculateMutation = trpc.scm.calculateSupplierRiskScore.useMutation({
    onSuccess: () => {
      toast.success("Risk score calculated");
      utils.scm.getLatestRiskScoresForAllVendors.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleRecalculateAll = async () => {
    if (!vendorScores) return;
    for (const vs of vendorScores as any[]) {
      calculateMutation.mutate({ vendorId: vs.vendor.id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Supplier Risk Scoring
            </CardTitle>
            <CardDescription>
              Rule-based risk assessment using on-time delivery, quality, price competitiveness, responsiveness, and compliance
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleRecalculateAll} disabled={calculateMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateMutation.isPending ? "animate-spin" : ""}`} />
            Recalculate All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {vendorScores && vendorScores.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                <TableHead className="whitespace-normal break-words">Risk Level</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Risk Score</TableHead>
                <TableHead className="whitespace-normal break-words text-right">On-Time %</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Quality</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Price</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Responsiveness</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Compliance</TableHead>
                <TableHead className="whitespace-normal break-words">Last Assessed</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorScores.map((vs: any) => {
                const score = vs.latestScore;
                return (
                  <TableRow key={vs.vendor.id}>
                    <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{vs.vendor.name}</TableCell>
                    <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                      {score ? (
                        <Badge className={riskColors[score.riskLevel] || "bg-gray-100"}>
                          {score.riskLevel === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {score.riskLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assessed</span>
                      )}
                    </TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                      {score ? (
                        <div className="flex items-center gap-2 justify-end">
                          <Progress value={100 - parseFloat(score.riskScore)} className="w-16 h-2" />
                          <span className="text-sm font-mono">{parseFloat(score.riskScore).toFixed(1)}</span>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{score ? `${parseFloat(score.onTimeDeliveryRate).toFixed(1)}%` : "—"}</TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{score ? parseFloat(score.qualityScore).toFixed(1) : "—"}</TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{score ? parseFloat(score.priceCompetitiveness).toFixed(1) : "—"}</TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{score ? parseFloat(score.responsiveness).toFixed(1) : "—"}</TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{score ? parseFloat(score.complianceScore).toFixed(1) : "—"}</TableCell>
                    <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{score?.assessmentDate || "—"}</TableCell>
                    <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => calculateMutation.mutate({ vendorId: vs.vendor.id })}
                        disabled={calculateMutation.isPending}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Score
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading vendor data...</div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vendors found. Add vendors in the Procurement module first.</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Scoring Formula</h4>
          <p className="text-xs text-muted-foreground">
            Risk Score = 100 - (On-Time Delivery x 35% + Quality Score x 25% + Price Competitiveness x 15% + Responsiveness x 15% + Compliance x 10%)
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span><Badge className="bg-green-100 text-green-800 text-[10px]">Low</Badge> 0-24</span>
            <span><Badge className="bg-amber-100 text-amber-800 text-[10px]">Medium</Badge> 25-49</span>
            <span><Badge className="bg-orange-100 text-orange-800 text-[10px]">High</Badge> 50-74</span>
            <span><Badge className="bg-red-100 text-red-800 text-[10px]">Critical</Badge> 75-100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
