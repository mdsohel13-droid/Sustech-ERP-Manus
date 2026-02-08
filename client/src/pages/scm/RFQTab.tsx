import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Award,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  responses_received: "bg-indigo-100 text-indigo-800",
  evaluated: "bg-amber-100 text-amber-800",
  closed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RFQTab() {
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [addResponseOpen, setAddResponseOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requiredDeliveryDate: "", rfqType: "standard" as const });
  const [lineForm, setLineForm] = useState({ productName: "", quantity: "1", unitOfMeasure: "pcs", estimatedUnitPrice: "", specifications: "" });
  const [responseForm, setResponseForm] = useState({ vendorId: 0, totalQuotedValue: "", deliveryDays: 14, paymentTerms: "", notes: "" });

  const { data: rfqs } = trpc.scm.getAllRFQs.useQuery(undefined, { refetchInterval: 15000 });
  const { data: selectedRFQ } = trpc.scm.getRFQById.useQuery({ id: detailId! }, { enabled: !!detailId });
  const { data: rfqLines } = trpc.scm.getRFQLines.useQuery({ rfqId: detailId! }, { enabled: !!detailId });
  const { data: rfqResponses } = trpc.scm.getRFQResponses.useQuery({ rfqId: detailId! }, { enabled: !!detailId });
  const { data: vendors } = trpc.procurement.getVendors.useQuery();

  const createMutation = trpc.scm.createRFQ.useMutation({
    onSuccess: () => { toast.success("RFQ created"); setCreateOpen(false); utils.scm.getAllRFQs.invalidate(); setForm({ title: "", description: "", requiredDeliveryDate: "", rfqType: "standard" }); },
    onError: (e) => toast.error(e.message),
  });

  const addLineMutation = trpc.scm.addRFQLine.useMutation({
    onSuccess: () => { toast.success("Line item added"); setAddLineOpen(false); utils.scm.getRFQLines.invalidate(); setLineForm({ productName: "", quantity: "1", unitOfMeasure: "pcs", estimatedUnitPrice: "", specifications: "" }); },
    onError: (e) => toast.error(e.message),
  });

  const addResponseMutation = trpc.scm.addRFQResponse.useMutation({
    onSuccess: () => { toast.success("Vendor response added"); setAddResponseOpen(false); utils.scm.getRFQResponses.invalidate(); setResponseForm({ vendorId: 0, totalQuotedValue: "", deliveryDays: 14, paymentTerms: "", notes: "" }); },
    onError: (e) => toast.error(e.message),
  });

  const evaluateMutation = trpc.scm.evaluateRFQResponses.useMutation({
    onSuccess: () => { toast.success("RFQ responses evaluated and ranked"); utils.scm.getRFQResponses.invalidate(); utils.scm.getRFQById.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const acceptMutation = trpc.scm.acceptRFQResponse.useMutation({
    onSuccess: (data: any) => { toast.success(`PO ${data.poNumber} created from accepted response`); utils.scm.getAllRFQs.invalidate(); utils.scm.getRFQResponses.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteRFQMutation = trpc.scm.deleteRFQ.useMutation({
    onSuccess: () => { toast.success("RFQ archived"); utils.scm.getAllRFQs.invalidate(); setDetailId(null); },
    onError: (e) => toast.error(e.message),
  });

  if (detailId && selectedRFQ) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(null)}>
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to RFQs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedRFQ.rfqNumber} — {selectedRFQ.title}</CardTitle>
                <CardDescription>{selectedRFQ.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[selectedRFQ.status || "draft"] || "bg-gray-100"}>{selectedRFQ.status}</Badge>
                <Badge variant="outline">{selectedRFQ.rfqType}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedRFQ.requiredDeliveryDate && (
              <p className="text-sm text-muted-foreground">Required Delivery: {selectedRFQ.requiredDeliveryDate}</p>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Line Items</h3>
                <Button size="sm" onClick={() => setAddLineOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
              </div>
              {rfqLines && rfqLines.length > 0 ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words">Product</TableHead>
                      <TableHead className="whitespace-normal break-words">Specifications</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Qty</TableHead>
                      <TableHead className="whitespace-normal break-words">Unit</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Est. Unit Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{line.productName}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{line.specifications || "—"}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{line.quantity}</TableCell>
                        <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{line.unitOfMeasure || "pcs"}</TableCell>
                        <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{line.estimatedUnitPrice || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No line items yet.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Vendor Responses</h3>
                <div className="flex gap-2">
                  {rfqResponses && rfqResponses.length > 1 && selectedRFQ.status !== "closed" && (
                    <Button size="sm" variant="outline" onClick={() => evaluateMutation.mutate({ rfqId: detailId })}>
                      <Award className="h-3 w-3 mr-1" /> Evaluate & Rank
                    </Button>
                  )}
                  {selectedRFQ.status !== "closed" && (
                    <Button size="sm" onClick={() => setAddResponseOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Response</Button>
                  )}
                </div>
              </div>
              {rfqResponses && rfqResponses.length > 0 ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words">Rank</TableHead>
                      <TableHead className="whitespace-normal break-words">Vendor</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Quoted Value</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Delivery Days</TableHead>
                      <TableHead className="whitespace-normal break-words">Payment Terms</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Score</TableHead>
                      <TableHead className="whitespace-normal break-words">Status</TableHead>
                      <TableHead className="whitespace-normal break-words text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqResponses.map((resp) => {
                      const vendor = vendors?.find((v) => v.id === resp.vendorId);
                      return (
                        <TableRow key={resp.id}>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{resp.rank || "—"}</TableCell>
                          <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{vendor?.name || `Vendor #${resp.vendorId}`}</TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{resp.totalQuotedValue || "—"}</TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{resp.deliveryDays || "—"}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{resp.paymentTerms || "—"}</TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>{resp.evaluationScore || "—"}</TableCell>
                          <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                            <Badge className={resp.status === "accepted" ? "bg-green-100 text-green-800" : resp.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                              {resp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                            {resp.status === "evaluated" && selectedRFQ.status !== "closed" && (
                              <Button size="sm" variant="outline" onClick={() => acceptMutation.mutate({ responseId: resp.id })}>
                                Accept & Create PO
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No responses yet.</p>
              )}
            </div>

            {selectedRFQ.status !== "closed" && (
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Archive this RFQ?")) deleteRFQMutation.mutate({ id: detailId }); }}>
                  Archive RFQ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={addLineOpen} onOpenChange={setAddLineOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Line Item</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Product Name *</Label><Input value={lineForm.productName} onChange={(e) => setLineForm({ ...lineForm, productName: e.target.value })} /></div>
              <div><Label>Specifications</Label><Textarea value={lineForm.specifications} onChange={(e) => setLineForm({ ...lineForm, specifications: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Quantity *</Label><Input type="number" value={lineForm.quantity} onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })} /></div>
                <div><Label>Unit</Label><Input value={lineForm.unitOfMeasure} onChange={(e) => setLineForm({ ...lineForm, unitOfMeasure: e.target.value })} /></div>
                <div><Label>Est. Unit Price</Label><Input value={lineForm.estimatedUnitPrice} onChange={(e) => setLineForm({ ...lineForm, estimatedUnitPrice: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddLineOpen(false)}>Cancel</Button>
              <Button onClick={() => addLineMutation.mutate({ rfqId: detailId, ...lineForm })} disabled={!lineForm.productName}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addResponseOpen} onOpenChange={setAddResponseOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Vendor Response</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Vendor *</Label>
                <Select value={String(responseForm.vendorId || "")} onValueChange={(v) => setResponseForm({ ...responseForm, vendorId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors?.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Total Quoted Value</Label><Input value={responseForm.totalQuotedValue} onChange={(e) => setResponseForm({ ...responseForm, totalQuotedValue: e.target.value })} /></div>
              <div><Label>Delivery Days</Label><Input type="number" value={responseForm.deliveryDays} onChange={(e) => setResponseForm({ ...responseForm, deliveryDays: Number(e.target.value) })} /></div>
              <div><Label>Payment Terms</Label><Input value={responseForm.paymentTerms} onChange={(e) => setResponseForm({ ...responseForm, paymentTerms: e.target.value })} placeholder="e.g., Net 30" /></div>
              <div><Label>Notes</Label><Textarea value={responseForm.notes} onChange={(e) => setResponseForm({ ...responseForm, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddResponseOpen(false)}>Cancel</Button>
              <Button onClick={() => addResponseMutation.mutate({ rfqId: detailId, ...responseForm })} disabled={!responseForm.vendorId}>Add Response</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Request for Quotation (RFQ)
            </CardTitle>
            <CardDescription>Manage procurement requests, vendor bids, and auto-evaluate responses</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> New RFQ</Button>
        </div>
      </CardHeader>
      <CardContent>
        {rfqs && rfqs.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal break-words">RFQ #</TableHead>
                <TableHead className="whitespace-normal break-words">Title</TableHead>
                <TableHead className="whitespace-normal break-words">Priority</TableHead>
                <TableHead className="whitespace-normal break-words">Status</TableHead>
                <TableHead className="whitespace-normal break-words">Delivery Date</TableHead>
                <TableHead className="whitespace-normal break-words">Created</TableHead>
                <TableHead className="whitespace-normal break-words text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(rfq.id)}>
                  <TableCell className="break-words font-mono text-sm" style={{ overflowWrap: "break-word" }}>{rfq.rfqNumber}</TableCell>
                  <TableCell className="break-words font-medium" style={{ overflowWrap: "break-word" }}>{rfq.title}</TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>
                    <Badge variant="outline" className={rfq.rfqType === "emergency" ? "border-red-300 text-red-700" : ""}>
                      {rfq.rfqType}
                    </Badge>
                  </TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}><Badge className={statusColors[rfq.status || "draft"] || "bg-gray-100"}>{rfq.status}</Badge></TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{rfq.requiredDeliveryDate || "—"}</TableCell>
                  <TableCell className="break-words" style={{ overflowWrap: "break-word" }}>{format(new Date(rfq.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="break-words text-right" style={{ overflowWrap: "break-word" }}>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDetailId(rfq.id); }}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No RFQs created yet. Click "New RFQ" to get started.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New RFQ</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Required Delivery Date</Label><Input type="date" value={form.requiredDeliveryDate} onChange={(e) => setForm({ ...form, requiredDeliveryDate: e.target.value })} /></div>
            <div>
              <Label>RFQ Type</Label>
              <Select value={form.rfqType} onValueChange={(v: any) => setForm({ ...form, rfqType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="framework">Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.title}>Create RFQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
