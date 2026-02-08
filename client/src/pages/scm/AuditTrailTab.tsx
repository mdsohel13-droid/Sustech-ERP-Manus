import { trpc } from "@/lib/trpc";
import {
  Shield,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function AuditTrailTab() {
  const { data: auditEntries } = trpc.scm.getScmAuditTrail.useQuery(undefined, { refetchInterval: 30000 });

  const rfqChain = trpc.scm.verifyAuditChain.useQuery({ entityType: "rfq" });
  const shipmentChain = trpc.scm.verifyAuditChain.useQuery({ entityType: "shipment" });
  const riskChain = trpc.scm.verifyAuditChain.useQuery({ entityType: "supplier_risk_score" });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "RFQ Chain", data: rfqChain.data },
          { label: "Shipment Chain", data: shipmentChain.data },
          { label: "Risk Score Chain", data: riskChain.data },
        ].map((chain) => (
          <Card key={chain.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{chain.label}</p>
                  <p className="text-xs text-muted-foreground">{chain.data?.totalEntries || 0} entries</p>
                </div>
                {chain.data ? (
                  chain.data.valid ? (
                    <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Valid</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Tampered</Badge>
                  )
                ) : (
                  <Badge variant="outline">No data</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            SCM Audit Trail
          </CardTitle>
          <CardDescription>Hash-chained audit log for tamper-evident record keeping (SHA-256)</CardDescription>
        </CardHeader>
        <CardContent>
          {auditEntries && auditEntries.length > 0 ? (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-normal break-words">Timestamp</TableHead>
                  <TableHead className="whitespace-normal break-words">Entity Type</TableHead>
                  <TableHead className="whitespace-normal break-words">Entity ID</TableHead>
                  <TableHead className="whitespace-normal break-words">Action</TableHead>
                  <TableHead className="whitespace-normal break-words">Hash (first 16)</TableHead>
                  <TableHead className="whitespace-normal break-words">Previous Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="break-words text-xs" style={{ overflowWrap: "break-word" }}>{format(new Date(entry.createdAt), "MMM d, yyyy HH:mm:ss")}</TableCell>
                    <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                      <Badge variant="outline">{entry.entityType}</Badge>
                    </TableCell>
                    <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{entry.entityId}</TableCell>
                    <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                      <Badge className={entry.action === "create" ? "bg-green-100 text-green-800" : entry.action === "update" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}>
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="break-words font-mono text-xs" style={{ overflowWrap: "break-word" }}>{entry.dataHash.substring(0, 16)}...</TableCell>
                    <TableCell className="break-words font-mono text-xs" style={{ overflowWrap: "break-word" }}>{entry.previousHash ? `${entry.previousHash.substring(0, 16)}...` : "GENESIS"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit entries yet. Actions on RFQs, shipments, and risk scores will be recorded here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
