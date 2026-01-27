import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface BudgetItem {
  id: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
  responsible: string;
  notes: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  reference: string;
  attachments: number;
}

export default function IncomeExpenditureEnhanced() {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'transactions' | 'analysis'>('overview');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const budgetItems: BudgetItem[] = [
    {
      id: '1',
      category: 'Salaries & Wages',
      budgetedAmount: 500000,
      actualAmount: 480000,
      variance: 20000,
      variancePercent: 4,
      status: 'on-track',
      responsible: 'HR Manager',
      notes: 'Within budget - 2 staff on leave',
    },
    {
      id: '2',
      category: 'Office Supplies',
      budgetedAmount: 50000,
      actualAmount: 62000,
      variance: -12000,
      variancePercent: -24,
      status: 'over-budget',
      responsible: 'Operations Manager',
      notes: 'Exceeded due to additional stationery purchase',
    },
    {
      id: '3',
      category: 'Marketing & Advertising',
      budgetedAmount: 150000,
      actualAmount: 95000,
      variance: 55000,
      variancePercent: 37,
      status: 'under-budget',
      responsible: 'Marketing Head',
      notes: 'Pending campaigns scheduled for next month',
    },
    {
      id: '4',
      category: 'Utilities & Maintenance',
      budgetedAmount: 80000,
      actualAmount: 78500,
      variance: 1500,
      variancePercent: 2,
      status: 'on-track',
      responsible: 'Facilities Manager',
      notes: 'Regular maintenance completed',
    },
    {
      id: '5',
      category: 'Travel & Transportation',
      budgetedAmount: 120000,
      actualAmount: 145000,
      variance: -25000,
      variancePercent: -21,
      status: 'over-budget',
      responsible: 'Operations Manager',
      notes: 'Additional client visits required',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-01-24',
      type: 'income',
      category: 'Sales Revenue',
      description: 'Invoice INV-2026-001 - Client ABC Corp',
      amount: 250000,
      status: 'approved',
      approvedBy: 'Finance Manager',
      reference: 'INV-2026-001',
      attachments: 1,
    },
    {
      id: '2',
      date: '2026-01-23',
      type: 'expense',
      category: 'Office Supplies',
      description: 'Stationery purchase from Office Depot',
      amount: 15000,
      status: 'pending',
      reference: 'EXP-2026-045',
      attachments: 2,
    },
    {
      id: '3',
      date: '2026-01-22',
      type: 'income',
      category: 'Service Revenue',
      description: 'Consulting services - Project XYZ',
      amount: 180000,
      status: 'approved',
      approvedBy: 'Finance Manager',
      reference: 'INV-2026-002',
      attachments: 1,
    },
    {
      id: '4',
      date: '2026-01-21',
      type: 'expense',
      category: 'Travel & Transportation',
      description: 'Flight and hotel for client meeting',
      amount: 45000,
      status: 'pending',
      reference: 'EXP-2026-046',
      attachments: 3,
    },
    {
      id: '5',
      date: '2026-01-20',
      type: 'expense',
      category: 'Utilities & Maintenance',
      description: 'Monthly electricity bill',
      amount: 28500,
      status: 'approved',
      approvedBy: 'Finance Manager',
      reference: 'EXP-2026-044',
      attachments: 1,
    },
  ];

  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const pendingApprovals = transactions.filter(t => t.status === 'pending').length;
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);

  const handleViewDetails = (item: BudgetItem) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'over-budget':
        return 'bg-red-100 text-red-800';
      case 'under-budget':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Income & Expenditure</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'budget', 'transactions', 'analysis'].map(tab => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">৳{(totalIncome / 100000).toFixed(1)}L</div>
                <p className="text-xs text-gray-500 mt-1">Approved transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Total Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">৳{(totalExpense / 100000).toFixed(1)}L</div>
                <p className="text-xs text-gray-500 mt-1">Approved transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ৳{(netProfit / 100000).toFixed(1)}L
                </div>
                <p className="text-xs text-gray-500 mt-1">Income - Expense</p>
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

          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Total Budget</span>
                    <span className="text-sm font-semibold">৳{(totalBudget / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Actual Spending</span>
                    <span className="text-sm font-semibold">৳{(totalActual / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(totalActual / totalBudget) * 100}%` }}></div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Variance</span>
                    <span className={`text-sm font-semibold ${totalBudget - totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ৳{((totalBudget - totalActual) / 100000).toFixed(1)}L ({(((totalBudget - totalActual) / totalBudget) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <Input
            placeholder="Search by category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {budgetItems.map(item => (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(item)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">{item.category}</h3>
                    <p className="text-sm text-gray-600">Responsible: {item.responsible}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Budgeted</p>
                    <p className="font-semibold">৳{(item.budgetedAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Actual</p>
                    <p className="font-semibold">৳{(item.actualAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Variance</p>
                    <p className={`font-semibold ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ৳{(item.variance / 1000).toFixed(0)}K ({item.variancePercent}%)
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.status === 'on-track' ? 'bg-green-600' :
                      item.status === 'over-budget' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${(item.actualAmount / item.budgetedAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={txn.type === 'income' ? 'default' : 'secondary'}>
                      {txn.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{txn.category}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">{txn.description}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ৳{txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={getTransactionStatusColor(txn.status)}>
                      {txn.status}
                    </Badge>
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
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category-wise Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.category}</span>
                    <span className="text-sm font-semibold">৳{(item.actualAmount / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.filter(t => t.status === 'pending').map(txn => (
                  <div key={txn.id} className="p-3 border rounded bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{txn.description}</p>
                        <p className="text-xs text-gray-600">{txn.reference}</p>
                      </div>
                      <Button size="sm" className="gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem.category}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Budgeted</p>
                  <p className="text-2xl font-bold">৳{(selectedItem.budgetedAmount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actual</p>
                  <p className="text-2xl font-bold">৳{(selectedItem.actualAmount / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status.replace('-', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Responsible</p>
                <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedItem.responsible}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-sm">{selectedItem.notes}</p>
              </div>

              {selectedItem.status === 'over-budget' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    This category has exceeded budget by ৳{(Math.abs(selectedItem.variance) / 1000).toFixed(0)}K
                  </AlertDescription>
                </Alert>
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

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input placeholder="Select category" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Enter description" />
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Reference</label>
              <Input placeholder="Invoice/Expense number" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
