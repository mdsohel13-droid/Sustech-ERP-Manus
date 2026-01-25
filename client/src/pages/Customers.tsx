import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Phone, Mail, Building, Calendar, MessageSquare, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Customers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: customers } = trpc.customers.getAll.useQuery();
  const { data: stats } = trpc.customers.getStats.useQuery();
  const { data: interactions } = trpc.customers.getInteractions.useQuery(
    { customerId: selectedCustomer! },
    { enabled: !!selectedCustomer }
  );

  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      utils.customers.getStats.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("Customer created successfully");
      setDialogOpen(false);
    },
  });

  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      utils.customers.getStats.invalidate();
      utils.dashboard.getOverview.invalidate();
      toast.success("Customer updated successfully");
      setDialogOpen(false);
      setEditingCustomer(null);
    },
  });

  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.getAll.invalidate();
      utils.customers.getStats.invalidate();
      toast.success("Customer deleted");
    },
  });

  const createInteractionMutation = trpc.customers.createInteraction.useMutation({
    onSuccess: () => {
      utils.customers.getInteractions.invalidate();
      toast.success("Interaction logged");
      setInteractionDialogOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (editingCustomer) {
      updateMutation.mutate({
        id: editingCustomer.id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        company: formData.get("company") as string,
        status: formData.get("status") as any,
        notes: formData.get("notes") as string,
      });
    } else {
      createMutation.mutate({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        company: formData.get("company") as string,
        status: formData.get("status") as any,
        notes: formData.get("notes") as string,
      });
    }
  };

  const handleInteractionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const formData = new FormData(e.currentTarget);
    createInteractionMutation.mutate({
      customerId: selectedCustomer,
      interactionType: formData.get("interactionType") as any,
      subject: formData.get("subject") as string,
      notes: formData.get("notes") as string,
      interactionDate: formData.get("interactionDate") as string,
    });
  };

  const getStatusBadge = (status: string) => {
    return <Badge className={`status-${status}`}>{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Customer CRM</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage customer relationships and track interactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingCustomer(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Customer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit" : "Add New"} Customer</DialogTitle>
                <DialogDescription>{editingCustomer ? "Update customer" : "Create a new customer"} record</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input id="name" name="name" defaultValue={editingCustomer?.name || ""} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={editingCustomer?.phone || ""} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" defaultValue={editingCustomer?.company || ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingCustomer?.status || "warm"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} defaultValue={editingCustomer?.notes || ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCustomer ? (updateMutation.isPending ? "Updating..." : "Update Customer") : (createMutation.isPending ? "Creating..." : "Create Customer")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats?.map((stat) => (
          <Card key={stat.status} className="editorial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm label-text capitalize">{stat.status} Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="editorial-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium"><button onClick={() => { setEditingCustomer(customer); setDialogOpen(true); }} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{customer.name}</button></TableCell>
                  <TableCell>{customer.company || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      {customer.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</div>}
                      {customer.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{customer.lastContactDate ? format(new Date(customer.lastContactDate), "MMM dd, yyyy") : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomer(customer.id); setInteractionDialogOpen(true); }}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this customer?")) { deleteMutation.mutate({ id: customer.id }); } }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No customers found. Add your first customer above.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={interactionDialogOpen} onOpenChange={setInteractionDialogOpen}>
        <DialogContent>
          <form onSubmit={handleInteractionSubmit}>
            <DialogHeader>
              <DialogTitle>Log Interaction</DialogTitle>
              <DialogDescription>Record a customer interaction</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="interactionType">Type</Label>
                <Select name="interactionType" defaultValue="call">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interactionDate">Date</Label>
                <Input id="interactionDate" name="interactionDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createInteractionMutation.isPending}>
                {createInteractionMutation.isPending ? "Logging..." : "Log Interaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
