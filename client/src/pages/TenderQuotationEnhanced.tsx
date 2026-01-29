import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Eye, MoreHorizontal, Search, Calendar, Filter, FileText, Building2, Clock, CheckCircle } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/currencyUtils';

type TenderStatus = 'not_started' | 'preparing' | 'submitted' | 'win' | 'loss' | 'po_received';
type TenderType = 'government_tender' | 'private_quotation';

export default function TenderQuotationEnhanced() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();
  
  const [activeTab, setActiveTab] = useState<'tenders' | 'quotations'>('tenders');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'tender' | 'quotation'>('tender');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  const { data: allTenderQuotations = [], isLoading } = trpc.tenderQuotation.getAll.useQuery();
  const { data: customers = [] } = trpc.customers.getAll.useQuery();

  const createMutation = trpc.tenderQuotation.create.useMutation({
    onSuccess: () => {
      utils.tenderQuotation.getAll.invalidate();
      setAddDialogOpen(false);
      toast.success('Created successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.tenderQuotation.update.useMutation({
    onSuccess: () => {
      utils.tenderQuotation.getAll.invalidate();
      setEditDialogOpen(false);
      setSelectedItem(null);
      toast.success('Updated successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.tenderQuotation.delete.useMutation({
    onSuccess: () => {
      utils.tenderQuotation.getAll.invalidate();
      toast.success('Deleted successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const tenders = useMemo(() => 
    allTenderQuotations.filter((t: any) => t.type === 'government_tender'),
    [allTenderQuotations]
  );

  const quotations = useMemo(() => 
    allTenderQuotations.filter((t: any) => t.type === 'private_quotation'),
    [allTenderQuotations]
  );

  const dashboardStats = useMemo(() => {
    const govTenders = tenders.filter((t: any) => !t.archivedAt);
    const privateQuotations = quotations.filter((q: any) => !q.archivedAt);
    const wonPoReceived = allTenderQuotations.filter((t: any) => 
      t.status === 'win' || t.status === 'po_received'
    );
    const pendingFollowUp = allTenderQuotations.filter((t: any) => {
      if (!t.followUpDate) return false;
      const followUp = new Date(t.followUpDate);
      const today = new Date();
      return isBefore(followUp, addDays(today, 7)) && t.status !== 'win' && t.status !== 'loss' && t.status !== 'po_received';
    });

    return {
      governmentTenders: govTenders.length,
      privateQuotations: privateQuotations.length,
      wonPoReceived: wonPoReceived.length,
      pendingFollowUp: pendingFollowUp.length,
    };
  }, [tenders, quotations, allTenderQuotations]);

  const getStatusBadge = (status: TenderStatus) => {
    const statusConfig: Record<TenderStatus, { label: string; className: string }> = {
      'not_started': { label: 'Not Started', className: 'bg-gray-100 text-gray-800' },
      'preparing': { label: 'Preparing', className: 'bg-blue-100 text-blue-800' },
      'submitted': { label: 'Submitted', className: 'bg-purple-100 text-purple-800' },
      'win': { label: 'Won', className: 'bg-green-100 text-green-800' },
      'loss': { label: 'Loss', className: 'bg-red-100 text-red-800' },
      'po_received': { label: 'PO Received', className: 'bg-emerald-100 text-emerald-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getFollowUpBadge = (status: TenderStatus, followUpDate: string | null) => {
    if (status === 'win' || status === 'loss' || status === 'po_received') {
      return getStatusBadge(status);
    }
    if (!followUpDate) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    const followUp = new Date(followUpDate);
    const today = new Date();
    if (isBefore(followUp, today)) {
      return <Badge className="bg-red-100 text-red-800">Follow Up</Badge>;
    }
    if (isBefore(followUp, addDays(today, 3))) {
      return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const filterData = (data: any[]) => {
    return data.filter((item: any) => {
      const matchesSearch = searchTerm === '' || 
        item.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesClient = clientFilter === 'all' || item.clientName === clientFilter;
      
      let matchesTimeline = true;
      if (timelineFilter !== 'all' && item.submissionDate) {
        const subDate = new Date(item.submissionDate);
        const today = new Date();
        if (timelineFilter === 'overdue') {
          matchesTimeline = isBefore(subDate, today);
        } else if (timelineFilter === 'this_week') {
          matchesTimeline = isBefore(subDate, addDays(today, 7)) && isAfter(subDate, today);
        } else if (timelineFilter === 'this_month') {
          matchesTimeline = isBefore(subDate, addDays(today, 30)) && isAfter(subDate, today);
        }
      }
      
      return matchesSearch && matchesStatus && matchesClient && matchesTimeline;
    });
  };

  const uniqueClients = useMemo(() => {
    const clients = new Set(allTenderQuotations.map((t: any) => t.clientName).filter(Boolean));
    return Array.from(clients);
  }, [allTenderQuotations]);

  const handleOpenAddDialog = (type: 'tender' | 'quotation') => {
    setDialogType(type);
    setSelectedItem(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setDialogType(item.type === 'government_tender' ? 'tender' : 'quotation');
    setEditDialogOpen(true);
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate({ id });
    }
  };

  const TenderQuotationForm = ({ 
    type, 
    initialData, 
    onSubmit, 
    isLoading 
  }: { 
    type: 'tender' | 'quotation'; 
    initialData?: any; 
    onSubmit: (data: any) => void;
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState({
      referenceId: initialData?.referenceId || '',
      description: initialData?.description || '',
      clientName: initialData?.clientName || '',
      submissionDate: initialData?.submissionDate ? format(new Date(initialData.submissionDate), 'yyyy-MM-dd') : '',
      followUpDate: initialData?.followUpDate ? format(new Date(initialData.followUpDate), 'yyyy-MM-dd') : '',
      status: initialData?.status || 'not_started',
      estimatedValue: initialData?.estimatedValue || '',
      notes: initialData?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        type: type === 'tender' ? 'government_tender' : 'private_quotation',
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        createdBy: 1,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{type === 'tender' ? 'Tender ID' : 'Quotation ID'}</Label>
            <Input 
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              placeholder={type === 'tender' ? 'GE-7652' : 'QT-2026-001'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={formData.clientName} onValueChange={(v) => setFormData({ ...formData, clientName: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c: any) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Submission Deadline</Label>
            <Input 
              type="date"
              value={formData.submissionDate}
              onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Follow-Up Date</Label>
            <Input 
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estimated Value</Label>
            <Input 
              type="number"
              value={formData.estimatedValue}
              onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="win">Won</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="po_received">PO Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea 
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const DataTable = ({ data, type }: { data: any[]; type: 'tender' | 'quotation' }) => {
    const filteredData = filterData(data);
    
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">{type === 'tender' ? 'Tender ID' : 'Quotation ID'}</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Submission Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Est. Value</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No {type === 'tender' ? 'tenders' : 'quotations'} found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-blue-600">{item.referenceId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">{item.clientName}</TableCell>
                  <TableCell>
                    {item.submissionDate ? format(new Date(item.submissionDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getFollowUpBadge(item.status, item.followUpDate)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.estimatedValue ? formatCurrency(parseFloat(item.estimatedValue), currency) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tender & Quotation Tracking</h1>
          <p className="text-muted-foreground text-sm">Track government tenders and private quotations with follow-up management</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tender
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenAddDialog('tender')}>
              <FileText className="h-4 w-4 mr-2" />
              Add Government Tender
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenAddDialog('quotation')}>
              <Building2 className="h-4 w-4 mr-2" />
              Add Private Quotation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-xs opacity-90 uppercase tracking-wide">Government Tenders</p>
          <p className="text-3xl font-bold mt-1">{dashboardStats.governmentTenders}</p>
          <p className="text-xs opacity-75 mt-1">Active tenders</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-white shadow-md">
          <p className="text-xs opacity-90 uppercase tracking-wide">Private Quotations</p>
          <p className="text-3xl font-bold mt-1">{dashboardStats.privateQuotations}</p>
          <p className="text-xs opacity-75 mt-1">Active quotations</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-xs opacity-90 uppercase tracking-wide">Won/PO Received</p>
          <p className="text-3xl font-bold mt-1">{dashboardStats.wonPoReceived}</p>
          <p className="text-xs opacity-75 mt-1">Successful bids</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-4 text-white shadow-md">
          <p className="text-xs opacity-90 uppercase tracking-wide">Pending Follow-Up</p>
          <p className="text-3xl font-bold mt-1">{dashboardStats.pendingFollowUp}</p>
          <p className="text-xs opacity-75 mt-1">Awaiting response</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="tenders" className="px-6">Tenders</TabsTrigger>
            <TabsTrigger value="quotations" className="px-6">Quotations</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={() => handleOpenAddDialog(activeTab === 'tenders' ? 'tender' : 'quotation')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New {activeTab === 'tenders' ? 'Tender' : 'Quotation'}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="win">Won</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
            <SelectItem value="po_received">PO Received</SelectItem>
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {uniqueClients.map((client: string) => (
              <SelectItem key={client} value={client}>{client}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timelineFilter} onValueChange={setTimelineFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {activeTab === 'tenders' ? 'Tender ID' : 'Quotation ID'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTab === 'tenders' ? (
            <DataTable data={tenders} type="tender" />
          ) : (
            <DataTable data={quotations} type="quotation" />
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add New {dialogType === 'tender' ? 'Government Tender' : 'Private Quotation'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the new {dialogType === 'tender' ? 'tender' : 'quotation'}
            </DialogDescription>
          </DialogHeader>
          <TenderQuotationForm 
            type={dialogType}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Edit {dialogType === 'tender' ? 'Tender' : 'Quotation'}
            </DialogTitle>
            <DialogDescription>
              Update the details for this {dialogType === 'tender' ? 'tender' : 'quotation'}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <TenderQuotationForm 
              type={dialogType}
              initialData={selectedItem}
              onSubmit={(data) => updateMutation.mutate({ id: selectedItem.id, ...data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'government_tender' ? 'Tender' : 'Quotation'} Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Reference ID</Label>
                  <p className="font-medium">{selectedItem.referenceId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="font-medium">{selectedItem.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Client</Label>
                  <p className="font-medium">{selectedItem.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Estimated Value</Label>
                  <p className="font-medium">
                    {selectedItem.estimatedValue ? formatCurrency(parseFloat(selectedItem.estimatedValue), currency) : '-'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Submission Date</Label>
                  <p className="font-medium">
                    {selectedItem.submissionDate ? format(new Date(selectedItem.submissionDate), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Follow-Up Date</Label>
                  <p className="font-medium">
                    {selectedItem.followUpDate ? format(new Date(selectedItem.followUpDate), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
              </div>
              {selectedItem.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Notes</Label>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => handleEdit(selectedItem)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
