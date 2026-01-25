import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetPlan {
  id: string;
  year: number;
  quarter: string;
  department: string;
  category: string;
  budgetedAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  committed: number;
  available: number;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'closed';
  owner: string;
  notes: string;
}

interface BudgetVariance {
  id: string;
  department: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
  reason: string;
  correctionPlan?: string;
  approver?: string;
}

interface BudgetApproval {
  id: string;
  department: string;
  year: number;
  quarter: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvalDate?: string;
  comments?: string;
}

export default function BudgetEnhanced() {
  const [activeTab, setActiveTab] = useState<'planning' | 'variance' | 'approvals' | 'analysis'>('planning');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetPlan | BudgetVariance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const budgetPlans: BudgetPlan[] = [
    {
      id: '1',
      year: 2026,
      quarter: 'Q1',
      department: 'Sales',
      category: 'Marketing & Advertising',
      budgetedAmount: 500000,
      allocatedAmount: 450000,
      spentAmount: 320000,
      committed: 80000,
      available: 50000,
      status: 'active',
      owner: 'Sales Manager',
      notes: 'Budget allocated for Q1 campaigns',
    },
    {
      id: '2',
      year: 2026,
      quarter: 'Q1',
      department: 'Operations',
      category: 'Utilities & Maintenance',
      budgetedAmount: 300000,
      allocatedAmount: 300000,
      spentAmount: 250000,
      committed: 30000,
      available: 20000,
      status: 'active',
      owner: 'Operations Manager',
      notes: 'Regular maintenance and utilities',
    },
    {
      id: '3',
      year: 2026,
      quarter: 'Q1',
      department: 'HR',
      category: 'Training & Development',
      budgetedAmount: 200000,
      allocatedAmount: 200000,
      spentAmount: 85000,
      committed: 50000,
      available: 65000,
      status: 'active',
      owner: 'HR Manager',
      notes: 'Employee training programs',
    },
    {
      id: '4',
      year: 2026,
      quarter: 'Q2',
      department: 'Finance',
      category: 'Technology & Software',
      budgetedAmount: 400000,
      allocatedAmount: 0,
      spentAmount: 0,
      committed: 0,
      available: 0,
      status: 'submitted',
      owner: 'Finance Manager',
      notes: 'Q2 budget under review',
    },
  ];

  const budgetVariances: BudgetVariance[] = [
    {
      id: '1',
      department: 'Sales',
      category: 'Marketing & Advertising',
      budgeted: 500000,
      actual: 400000,
      variance: 100000,
      variancePercent: 20,
      status: 'under-budget',
      reason: 'Delayed campaign launch',
      correctionPlan: 'Accelerate Q2 campaigns',
      approver: 'Finance Manager',
    },
    {
      id: '2',
      department: 'Operations',
      category: 'Office Supplies',
      budgeted: 150000,
      actual: 185000,
      variance: -35000,
      variancePercent: -23,
      status: 'over-budget',
      reason: 'Additional stationery purchase for new office',
      correctionPlan: 'Reduce discretionary purchases in Q2',
    },
    {
      id: '3',
      department: 'HR',
      category: 'Salaries & Wages',
      budgeted: 2000000,
      actual: 1950000,
      variance: 50000,
      variancePercent: 2.5,
      status: 'on-track',
      reason: 'Two staff members on unpaid leave',
    },
    {
      id: '4',
      department: 'Finance',
      category: 'Professional Services',
      budgeted: 300000,
      actual: 320000,
      variance: -20000,
      variancePercent: -6.7,
      status: 'over-budget',
      reason: 'Additional audit services required',
    },
  ];

  const budgetApprovals: BudgetApproval[] = [
    {
      id: '1',
      department: 'Sales',
      year: 2026,
      quarter: 'Q1',
      totalAmount: 1500000,
      status: 'approved',
      submittedBy: 'Sales Manager',
      submittedDate: '2025-12-15',
      approvedBy: 'Finance Manager',
      approvalDate: '2025-12-20',
    },
    {
      id: '2',
      department: 'Operations',
      year: 2026,
      quarter: 'Q1',
      totalAmount: 1200000,
      status: 'approved',
      submittedBy: 'Operations Manager',
      submittedDate: '2025-12-18',
      approvedBy: 'Finance Manager',
      approvalDate: '2025-12-22',
    },
    {
      id: '3',
      department: 'Finance',
      year: 2026,
      quarter: 'Q2',
      totalAmount: 1800000,
      status: 'pending',
      submittedBy: 'Finance Manager',
      submittedDate: '2026-01-20',
      comments: 'Awaiting CFO review',
    },
    {
      id: '4',
      department: 'HR',
      year: 2026,
      quarter: 'Q2',
      totalAmount: 900000,
      status: 'pending',
      submittedBy: 'HR Manager',
      submittedDate: '2026-01-22',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'over-budget':
        return 'bg-red-100 text-red-800';
      case 'under-budget':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (item: BudgetPlan | BudgetVariance) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const totalBudget = budgetPlans.reduce((sum, b) => sum + b.budgetedAmount, 0);
  const totalSpent = budgetPlans.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalCommitted = budgetPlans.reduce((sum, b) => sum + b.committed, 0);
  const totalAvailable = budgetPlans.reduce((sum, b) => sum + b.available, 0);
  const overBudgetCount = budgetVariances.filter(v => v.status === 'over-budget').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Budget
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['planning', 'variance', 'approvals', 'analysis'].map(tab => (
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(totalBudget / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">All departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(totalSpent / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">{((totalSpent / totalBudget) * 100).toFixed(0)}% of budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Committed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{(totalCommitted / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">Purchase orders & contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">৳{(totalAvailable / 100000).toFixed(1)}L</div>
            <p className="text-xs text-gray-500 mt-1">Remaining to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Over Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overBudgetCount}</div>
            <p className="text-xs text-gray-500 mt-1">Categories to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div className="space-y-4">
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {budgetPlans.map(plan => (
              <div
                key={plan.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(plan)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">
                      {plan.year} {plan.quarter} - {plan.department} - {plan.category}
                    </h3>
                    <p className="text-sm text-gray-600">Owner: {plan.owner}</p>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Budgeted</p>
                    <p className="font-semibold">৳{(plan.budgetedAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Allocated</p>
                    <p className="font-semibold">৳{(plan.allocatedAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold">৳{(plan.spentAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Committed</p>
                    <p className="font-semibold">৳{(plan.committed / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-semibold text-green-600">৳{(plan.available / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(plan.spentAmount / plan.budgetedAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variance Tab */}
      {activeTab === 'variance' && (
        <div className="space-y-4">
          <Input
            placeholder="Search variances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {budgetVariances.map(variance => (
              <div
                key={variance.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(variance)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">
                      {variance.department} - {variance.category}
                    </h3>
                    <p className="text-sm text-gray-600">{variance.reason}</p>
                  </div>
                  <Badge className={getStatusColor(variance.status)}>
                    {variance.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Budgeted</p>
                    <p className="font-semibold">৳{(variance.budgeted / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Actual</p>
                    <p className="font-semibold">৳{(variance.actual / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Variance</p>
                    <p className={`font-semibold ${variance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ৳{(variance.variance / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">%</p>
                    <p className={`font-semibold ${variance.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variance.variancePercent}%
                    </p>
                  </div>
                </div>

                {variance.correctionPlan && (
                  <div className="pt-3 border-t text-sm">
                    <p className="text-gray-600">Correction Plan: {variance.correctionPlan}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Period</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted By</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Submitted Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgetApprovals.map(approval => (
                <tr key={approval.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold">{approval.department}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    {approval.year} {approval.quarter}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                    ৳{(approval.totalAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={getStatusColor(approval.status)}>
                      {approval.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">
                    {approval.submittedBy}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{approval.submittedDate}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {approval.status === 'pending' && (
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
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
              <CardTitle>Budget Utilization by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Sales', 'Operations', 'HR', 'Finance'].map((dept, idx) => {
                  const deptBudgets = budgetPlans.filter(b => b.department === dept);
                  const deptTotal = deptBudgets.reduce((sum, b) => sum + b.budgetedAmount, 0);
                  const deptSpent = deptBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
                  const utilization = deptTotal > 0 ? (deptSpent / deptTotal) * 100 : 0;
                  return (
                    <div key={dept}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{dept}</span>
                        <span className="text-sm font-semibold">{utilization.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On Track</span>
                  <span className="text-sm font-semibold text-green-600">
                    {budgetVariances.filter(v => v.status === 'on-track').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Under Budget</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {budgetVariances.filter(v => v.status === 'under-budget').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Over Budget</span>
                  <span className="text-sm font-semibold text-red-600">
                    {budgetVariances.filter(v => v.status === 'over-budget').length}
                  </span>
                </div>
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
              <DialogTitle>
                {'category' in selectedItem ? selectedItem.category : selectedItem.category}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {'department' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{selectedItem.department}</p>
                </div>
              )}

              {'status' in selectedItem && (
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {typeof selectedItem.status === 'string' ? selectedItem.status : 'N/A'}
                  </Badge>
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
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input type="number" placeholder="2026" />
            </div>
            <div>
              <label className="text-sm font-medium">Quarter</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input placeholder="Enter department" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input placeholder="Enter category" />
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="0" />
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
