import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, Phone, Mail, MapPin, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  source: string;
  assignedTo: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'dormant';
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  accountManager: string;
  creditLimit: number;
  paymentTerms: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  description: string;
  date: string;
  relatedTo: string;
  owner: string;
  status: 'completed' | 'pending' | 'overdue';
}

export default function CRMEnhanced() {
  const [activeTab, setActiveTab] = useState<'leads' | 'customers' | 'activities' | 'pipeline'>('leads');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Lead | Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      company: 'Tech Solutions Ltd',
      email: 'ahmed@techsolutions.com',
      phone: '+880-1234-567890',
      status: 'qualified',
      value: 500000,
      source: 'LinkedIn',
      assignedTo: 'Sales Manager',
      lastContact: '2026-01-24',
      nextFollowUp: '2026-01-27',
      notes: 'Interested in enterprise package',
    },
    {
      id: '2',
      name: 'Fatima Khan',
      company: 'Digital Marketing Co',
      email: 'fatima@digitalmarketing.com',
      phone: '+880-9876-543210',
      status: 'proposal',
      value: 300000,
      source: 'Referral',
      assignedTo: 'Sales Executive',
      lastContact: '2026-01-23',
      nextFollowUp: '2026-01-26',
      notes: 'Sent proposal for 3-month engagement',
    },
    {
      id: '3',
      name: 'Rajesh Patel',
      company: 'Manufacturing Inc',
      email: 'rajesh@manufacturing.com',
      phone: '+880-5555-666666',
      status: 'new',
      value: 750000,
      source: 'Cold Call',
      assignedTo: 'Sales Manager',
      lastContact: '2026-01-24',
      nextFollowUp: '2026-01-28',
      notes: 'Initial inquiry about bulk services',
    },
    {
      id: '4',
      name: 'Amina Begum',
      company: 'E-Commerce Platform',
      email: 'amina@ecommerce.com',
      phone: '+880-7777-888888',
      status: 'negotiation',
      value: 1200000,
      source: 'Website',
      assignedTo: 'Senior Sales Manager',
      lastContact: '2026-01-22',
      nextFollowUp: '2026-01-25',
      notes: 'Negotiating contract terms',
    },
  ];

  const customers: Customer[] = [
    {
      id: '1',
      name: 'ABC Corporation',
      company: 'ABC Corp Ltd',
      email: 'contact@abccorp.com',
      phone: '+880-1111-222222',
      address: '123 Business Street',
      city: 'Dhaka',
      country: 'Bangladesh',
      status: 'active',
      totalOrders: 45,
      totalValue: 5600000,
      lastOrder: '2026-01-20',
      accountManager: 'Senior Account Manager',
      creditLimit: 1000000,
      paymentTerms: 'Net 30',
    },
    {
      id: '2',
      name: 'XYZ Industries',
      company: 'XYZ Industries Ltd',
      email: 'sales@xyzindustries.com',
      phone: '+880-3333-444444',
      address: '456 Industrial Park',
      city: 'Chittagong',
      country: 'Bangladesh',
      status: 'active',
      totalOrders: 28,
      totalValue: 3200000,
      lastOrder: '2026-01-19',
      accountManager: 'Account Manager',
      creditLimit: 500000,
      paymentTerms: 'Net 45',
    },
    {
      id: '3',
      name: 'Global Enterprises',
      company: 'Global Enterprises Inc',
      email: 'info@globalenterprises.com',
      phone: '+880-5555-666666',
      address: '789 Commerce Avenue',
      city: 'Sylhet',
      country: 'Bangladesh',
      status: 'dormant',
      totalOrders: 12,
      totalValue: 1500000,
      lastOrder: '2025-11-15',
      accountManager: 'Account Manager',
      creditLimit: 300000,
      paymentTerms: 'Net 30',
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'call',
      description: 'Follow-up call with Ahmed Hassan',
      date: '2026-01-24',
      relatedTo: 'Ahmed Hassan - Tech Solutions',
      owner: 'Sales Manager',
      status: 'completed',
    },
    {
      id: '2',
      type: 'email',
      description: 'Sent proposal to Fatima Khan',
      date: '2026-01-23',
      relatedTo: 'Fatima Khan - Digital Marketing',
      owner: 'Sales Executive',
      status: 'completed',
    },
    {
      id: '3',
      type: 'meeting',
      description: 'Scheduled meeting with Amina Begum',
      date: '2026-01-25',
      relatedTo: 'Amina Begum - E-Commerce',
      owner: 'Senior Sales Manager',
      status: 'pending',
    },
    {
      id: '4',
      type: 'task',
      description: 'Prepare contract for ABC Corporation',
      date: '2026-01-26',
      relatedTo: 'ABC Corporation',
      owner: 'Sales Manager',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-purple-100 text-purple-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'dormant':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (item: Lead | Customer) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const totalLeadValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const qualifiedLeads = leads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CRM - Customer Relationship Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Lead/Customer
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['leads', 'customers', 'activities', 'pipeline'].map(tab => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leads.length}</div>
            <p className="text-xs text-gray-500 mt-1">Pipeline opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lead Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(totalLeadValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">Total pipeline value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Qualified Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{qualifiedLeads}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Ongoing relationships</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {leads.map(lead => (
              <div
                key={lead.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(lead)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">{lead.name}</h3>
                    <p className="text-sm text-gray-600">{lead.company}</p>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-blue-600 hover:underline">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{lead.phone}</span>
                  </div>
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-semibold">৳{(lead.value / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Contact</p>
                    <p className="font-semibold">{lead.lastContact}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Follow-up</p>
                    <p className="font-semibold text-orange-600">{lead.nextFollowUp}</p>
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
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Orders</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Value</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div
                        className="font-semibold text-blue-600 hover:underline cursor-pointer"
                        onClick={() => handleViewDetails(customer)}
                      >
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="text-blue-600 hover:underline cursor-pointer">{customer.email}</span>
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {customer.city}, {customer.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">{customer.totalOrders}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                      ৳{(customer.totalValue / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          {activities.map(activity => (
            <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getActivityTypeIcon(activity.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{activity.description}</h3>
                    <p className="text-sm text-gray-600">{activity.relatedTo}</p>
                  </div>
                </div>
                <Badge
                  variant={activity.status === 'completed' ? 'default' : activity.status === 'overdue' ? 'destructive' : 'secondary'}
                >
                  {activity.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{activity.owner}</span>
                <span>{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(stage => {
            const stageLeads = leads.filter(l => l.status === stage);
            const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
            return (
              <Card key={stage}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{stage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Leads</p>
                      <p className="text-2xl font-bold">{stageLeads.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Value</p>
                      <p className="text-lg font-semibold text-green-600">৳{(stageValue / 100000).toFixed(1)}L</p>
                    </div>
                    {stageLeads.length > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        {stageLeads.map(lead => (
                          <div
                            key={lead.id}
                            className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                            onClick={() => handleViewDetails(lead)}
                          >
                            <p className="font-semibold text-blue-600 hover:underline">{lead.name}</p>
                            <p className="text-gray-600">{lead.company}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {'name' in selectedItem && selectedItem.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {'company' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{selectedItem.company}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                    {selectedItem.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm font-semibold">{selectedItem.phone}</p>
                </div>
              </div>

              {'status' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                </div>
              )}

              {'value' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Lead Value</p>
                  <p className="text-lg font-semibold text-green-600">
                    ৳{(selectedItem.value / 1000).toFixed(0)}K
                  </p>
                </div>
              )}

              {'totalValue' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Total Customer Value</p>
                  <p className="text-lg font-semibold text-green-600">
                    ৳{(selectedItem.totalValue / 100000).toFixed(1)}L
                  </p>
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
            <DialogTitle>Add Lead/Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Enter name" />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input placeholder="Enter company" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="Enter email" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="Enter phone" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Lead</option>
                <option>Customer</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
