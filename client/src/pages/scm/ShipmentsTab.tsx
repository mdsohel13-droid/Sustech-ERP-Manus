import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Truck,
  Plus,
  MapPin,
  ChevronRight,
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
  pending: "bg-gray-100 text-gray-800",
  picked: "bg-blue-100 text-blue-800",
  packed: "bg-indigo-100 text-indigo-800",
  shipped: "bg-amber-100 text-amber-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function ShipmentsTab() {
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [form, setForm] = useState({ shipmentType: "inbound", logisticsProvider: "", trackingNumber: "", estimatedDeliveryDate: "", notes: "", shipmentDate: new Date().toISOString().split("T")[0] });
  const [eventForm, setEventForm] = useState({ trackingEvent: "", eventDescription: "", eventLocation: "" });

  const { data: shipments } = trpc.scm.getAllShipments.useQuery(undefined, { refetchInterval: 15000 });
  const { data: selectedShipment } = trpc.scm.getShipmentById.useQuery({ id: detailId! }, { enabled: !!detailId });
  const { data: trackingEvents } = trpc.scm.getShipmentTrackingEvents.useQuery({ shipmentId: detailId! }, { enabled: !!detailId });
  const { data: shipmentLines } = trpc.scm.getShipmentLines.useQuery({ shipmentId: detailId! }, { enabled: !!detailId });

  const createMutation = trpc.scm.createShipment.useMutation({
    onSuccess: () => { toast.success("Shipment created"); setCreateOpen(false); utils.scm.getAllShipments.invalidate(); setForm({ shipmentType: "inbound", logisticsProvider: "", trackingNumber: "", estimatedDeliveryDate: "", notes: "", shipmentDate: new Date().toISOString().split("T")[0] }); },
    onError: (e) => toast.error(e.message),
  });

  const addEventMutation = trpc.scm.addShipmentTrackingEvent.useMutation({
    onSuccess: () => { toast.success("Tracking event added"); setAddEventOpen(false); utils.scm.getShipmentTrackingEvents.invalidate(); setEventForm({ trackingEvent: "", eventDescription: "", eventLocation: "" }); },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMutation = trpc.scm.updateShipmentStatus.useMutation({
    onSuccess: () => { toast.success("Shipment status updated"); utils.scm.getAllShipments.invalidate(); utils.scm.getShipmentById.invalidate(); utils.scm.getShipmentTrackingEvents.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const nextStatus: Record<string, string> = {
    pending: "picked",
    picked: "packed",
    packed: "shipped",
    shipped: "in_transit",
    in_transit: "delivered",
  };

  if (detailId && selectedShipment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setDetailId(null)}>
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Shipments
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedShipment.shipmentNumber}</CardTitle>
                <CardDescription>
                  {selectedShipment.shipmentType.toUpperCase()} | Carrier: {selectedShipment.logisticsProvider || "N/A"} | Tracking: {selectedShipment.trackingNumber || "N/A"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[selectedShipment.status || "pending"] || "bg-gray-100"}>{selectedShipment.status}</Badge>
                {selectedShipment.status && nextStatus[selectedShipment.status] && (
                  <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: detailId, status: nextStatus[selectedShipment.status!] })}>
                    Move to {nextStatus[selectedShipment.status!]}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedShipment.expectedDeliveryDate && (
              <p className="text-sm text-muted-foreground">Est. Delivery: {selectedShipment.expectedDeliveryDate}</p>
            )}

            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              {shipmentLines && shipmentLines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Weight (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.productName}</TableCell>
                        <TableCell className="text-right">{line.quantity}</TableCell>
                        <TableCell>{line.weightKg || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No items in this shipment.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Tracking Events</h3>
                <Button size="sm" onClick={() => setAddEventOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Event</Button>
              </div>
              {trackingEvents && trackingEvents.length > 0 ? (
                <div className="space-y-3">
                  {trackingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 border-l-2 border-blue-200 pl-4 py-2">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{event.trackingEvent}</p>
                        <p className="text-xs text-muted-foreground">{event.eventDescription}</p>
                        {event.eventLocation && <p className="text-xs text-muted-foreground">Location: {event.eventLocation}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(event.eventTimestamp), "MMM d, yyyy HH:mm")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tracking events yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Tracking Event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Event *</Label><Input value={eventForm.trackingEvent} onChange={(e) => setEventForm({ ...eventForm, trackingEvent: e.target.value })} placeholder="e.g., Departed origin warehouse" /></div>
              <div><Label>Description</Label><Textarea value={eventForm.eventDescription} onChange={(e) => setEventForm({ ...eventForm, eventDescription: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={eventForm.eventLocation} onChange={(e) => setEventForm({ ...eventForm, eventLocation: e.target.value })} placeholder="e.g., Dubai, UAE" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddEventOpen(false)}>Cancel</Button>
              <Button onClick={() => addEventMutation.mutate({ shipmentId: detailId, ...eventForm })} disabled={!eventForm.trackingEvent}>Add Event</Button>
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
              <Truck className="h-5 w-5 text-cyan-500" />
              Shipment Tracking
            </CardTitle>
            <CardDescription>Track inbound, outbound, and transfer shipments with real-time status</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Shipment</Button>
        </div>
      </CardHeader>
      <CardContent>
        {shipments && shipments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Tracking #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(s.id)}>
                  <TableCell className="font-mono text-sm">{s.shipmentNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.shipmentType}</Badge>
                  </TableCell>
                  <TableCell>{s.logisticsProvider || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{s.trackingNumber || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[s.status || "pending"] || "bg-gray-100"}>{s.status}</Badge></TableCell>
                  <TableCell>{s.expectedDeliveryDate || "—"}</TableCell>
                  <TableCell>{format(new Date(s.createdAt), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shipments yet. Click "New Shipment" to create one.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Shipment Type *</Label>
              <Select value={form.shipmentType} onValueChange={(v) => setForm({ ...form, shipmentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Logistics Provider</Label><Input value={form.logisticsProvider} onChange={(e) => setForm({ ...form, logisticsProvider: e.target.value })} placeholder="e.g., DHL, FedEx" /></div>
            <div><Label>Tracking Number</Label><Input value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} /></div>
            <div><Label>Shipment Date</Label><Input type="date" value={form.shipmentDate} onChange={(e) => setForm({ ...form, shipmentDate: e.target.value })} /></div>
            <div><Label>Expected Delivery Date</Label><Input type="date" value={form.estimatedDeliveryDate} onChange={(e) => setForm({ ...form, estimatedDeliveryDate: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)}>Create Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
