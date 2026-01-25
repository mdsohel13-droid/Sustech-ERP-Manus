import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, Download, Send, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface Tender {
  id: string;
  number: string;
  title: string;
  description: string;
  client: string;
  value: number;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'awarded';
  submittedDate: string;
  dueDate: string;
  owner: string;
  probability: number;
  notes: string;
}

interface Quotation {
  id: string;
  number: string;
  client: string;
  items: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  validUntil: string;
  approvedBy?: string;
  approvalDate?: string;
  owner: string;
}

interface ApprovalRequest {
  id: string;
  type: 'tender' | 'quotation';
  reference: string;
  amount: number;
  requester: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  dueDate: string;
  approver?: string;
  approvalDate?: string;
  comments?: string;
}

export default function TenderQuotationEnhanced() {
  const [activeTab, setActiveTab] = useState<'tenders' | 'quotations' | 'approvals'>('tenders');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Tender | Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const tenders: Tender[] = [
    {
      id: '1',
      number: 'TND-2026-001',
      title: 'Supply of Office Equipment',
      description: 'Tender for supply of office furniture and equipment for new office setup',
      client: 'Government Ministry',
      value: 2500000,
      status: 'submitted',
      submittedDate: '2026-01-20',
      dueDate: '2026-02-20',
      owner: 'Procurement Manager',
      probability: 65,
      notes: 'Competitive bid expected. Strong technical proposal submitted.',
    },
    {
      id: '2',
      number: 'TND-2026-002',
      title: 'IT Infrastructure Project',
      description: 'Tender for implementation of enterprise IT infrastructure',
      client: 'Large Manufacturing Corp',
      value: 5000000,
      status: 'under-review',
      submittedDate: '2026-01-15',
      dueDate: '2026-02-15',
      owner: 'Project Manager',
      probability: 45,
      notes: 'Awaiting client evaluation. Technical clarifications submitted.',
    },
    {
      id: '3',
      number: 'TND-2026-003',
      title: 'Logistics & Distribution Services',
      description: 'Tender for 2-year logistics and distribution services contract',
      client: 'E-Commerce Company',
      value: 3500000,
      status: 'awarded',
      submittedDate: '2026-01-10',
      dueDate: '2026-02-10',
      owner: 'Sales Manager',
      probability: 100,
      notes: 'Contract awarded! Negotiations in progress for final terms.',
    },
    {
      id: '4',
      number: 'TND-2026-004',
      title: 'Consulting Services',
      description: 'Tender for business transformation consulting services',
      client: 'Financial Institution',
      value: 1800000,
      status: 'draft',
      submittedDate: '2026-01-22',
      dueDate: '2026-02-22',
      owner: 'Consulting Manager',
      probability: 30,
      notes: 'Proposal under preparation. Awaiting client requirements clarification.',
    },
  ];

  const quotations: Quotation[] = [
    {
      id: '1',
      number: 'QT-2026-001',
      client: 'ABC Corporation',
      items: 5,
      subtotal: 450000,
      discount: 45000,
      tax: 64500,
      total: 469500,
      status: 'accepted',
      createdDate: '2026-01-15',
      validUntil: '2026-02-15',
      approvedBy: 'Finance Manager',
      approvalDate: '2026-01-16',
      owner: 'Sales Executive',
    },
    {
      id: '2',
      number: 'QT-2026-002',
      client: 'XYZ Industries',
      items: 8,
      subtotal: 650000,
      discount: 0,
      tax: 93000,
      total: 743000,
      status: 'sent',
      createdDate: '2026-01-20',
      validUntil: '2026-02-20',
      owner: 'Sales Manager',
    },
    {
      id: '3',
      number: 'QT-2026-003',
      client: 'Global Enterprises',
      items: 3,
      subtotal: 280000,
      discount: 28000,
      tax: 36120,
      total: 288120,
      status: 'draft',
      createdDate: '2026-01-22',
      validUntil: '2026-02-22',
      owner: 'Sales Executive',
    },
    {
      id: '4',
      number: 'QT-2026-004',
      client: 'Tech Solutions',
      items: 12,
      subtotal: 1200000,
      discount: 120000,
      tax: 154800,
      total: 1234800,
      status: 'sent',
      createdDate: '2026-01-18',
      validUntil: '2026-02-18',
      approvedBy: 'Finance Manager',
      approvalDate: '2026-01-19',
      owner: 'Sales Manager',
    },
  ];

  const approvals: ApprovalRequest[] = [
    {
      id: '1',
      type: 'quotation',
      reference: 'QT-2026-002',
      amount: 743000,
      requester: 'Sales Manager',
      status: 'pending',
      requestDate: '2026-01-20',
      dueDate: '2026-01-25',
    },
    {
      id: '2',
      type: 'tender',
      reference: 'TND-2026-002',
      amount: 5000000,
      requester: 'Project Manager',
      status: 'pending',
      requestDate: '2026-01-18',
      dueDate: '2026-01-28',
    },
    {
      id: '3',
      type: 'quotation',
      reference: 'QT-2026-001',
      amount: 469500,
      requester: 'Sales Executive',
      status: 'approved',
      requestDate: '2026-01-15',
      dueDate: '2026-01-16',
      approver: 'Finance Manager',
      approvalDate: '2026-01-16',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (item: Tender | Quotation) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const totalTenderValue = tenders.reduce((sum, t) => sum + t.value, 0);
  const awardedTenders = tenders.filter(t => t.status === 'awarded').length;
  const totalQuotationValue = quotations.reduce((sum, q) => sum + q.total, 0);
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tender & Quotation Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Tender/Quotation
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['tenders', 'quotations', 'approvals'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenders.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tender Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(totalTenderValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">Total pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{awardedTenders}</div>
            <p className="text-xs text-gray-500 mt-1">Won tenders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quotations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total value ৳{(totalQuotationValue / 100000).toFixed(1)}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingApprovals}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenders Tab */}
      {activeTab === 'tenders' && (
        <div className="space-y-4">
          <Input
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {tenders.map(tender => (
              <div
                key={tender.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(tender)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-600 hover:underline">{tender.number} - {tender.title}</h3>
                      <Badge className={getStatusColor(tender.status)}>
                        {tender.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tender.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Client</p>
                    <p className="font-semibold text-blue-600 hover:underline">{tender.client}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-semibold">৳{(tender.value / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Probability</p>
                    <p className="font-semibold">{tender.probability}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-semibold">{tender.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Owner</p>
                    <p className="font-semibold text-blue-600 hover:underline">{tender.owner}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quotation #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Valid Until</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(quotation => (
                <tr key={quotation.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div
                      className="font-semibold text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleViewDetails(quotation)}
                    >
                      {quotation.number}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{quotation.client}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold">{quotation.items}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    ৳{quotation.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{quotation.validUntil}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          {approvals.map(approval => (
            <div key={approval.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-blue-600 hover:underline">{approval.reference}</h3>
                    <Badge className={getStatusColor(approval.status)}>
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {approval.type === 'tender' ? 'Tender' : 'Quotation'} approval request
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold">৳{(approval.amount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-gray-600">Requester</p>
                  <p className="font-semibold text-blue-600 hover:underline">{approval.requester}</p>
                </div>
                <div>
                  <p className="text-gray-600">Requested</p>
                  <p className="font-semibold">{approval.requestDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Due</p>
                  <p className={`font-semibold ${new Date(approval.dueDate) < new Date() ? 'text-red-600' : ''}`}>
                    {approval.dueDate}
                  </p>
                </div>
              </div>

              {approval.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Reject
                  </Button>
                </div>
              )}

              {approval.status === 'approved' && (
                <div className="pt-3 border-t text-sm">
                  <p className="text-gray-600">Approved by {approval.approver} on {approval.approvalDate}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {'number' in selectedItem && selectedItem.number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {'title' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-semibold">{selectedItem.title}</p>
                </div>
              )}

              {'client' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedItem.client}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor('status' in selectedItem ? selectedItem.status : 'draft')}>
                  {'status' in selectedItem ? selectedItem.status : 'draft'}
                </Badge>
              </div>

              {'value' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="text-lg font-semibold text-green-600">৳{(selectedItem.value / 100000).toFixed(1)}L</p>
                </div>
              )}

              {'total' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-semibold text-green-600">৳{selectedItem.total.toLocaleString()}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              <Button className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tender/Quotation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Tender</option>
                <option>Quotation</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Title/Description</label>
              <Input placeholder="Enter title" />
            </div>
            <div>
              <label className="text-sm font-medium">Client</label>
              <Input placeholder="Enter client name" />
            </div>
            <div>
              <label className="text-sm font-medium">Value</label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
