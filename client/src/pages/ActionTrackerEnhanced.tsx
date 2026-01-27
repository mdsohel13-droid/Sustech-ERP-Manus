import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, CheckCircle, Clock, AlertCircle, User, Calendar, Flag, MessageSquare } from 'lucide-react';

interface Action {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'completed' | 'overdue' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  owner: string;
  assignee: string;
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  category: string;
  relatedTo: string;
  comments: number;
  attachments: number;
}

interface FollowUp {
  id: string;
  actionId: string;
  actionTitle: string;
  followUpDate: string;
  status: 'pending' | 'completed' | 'overdue';
  owner: string;
  notes: string;
  nextFollowUp?: string;
}

interface ActionMetrics {
  totalActions: number;
  openActions: number;
  overdue: number;
  completedThisMonth: number;
  avgCompletionTime: number;
  completionRate: number;
}

export default function ActionTrackerEnhanced() {
  const [activeTab, setActiveTab] = useState<'all' | 'my-actions' | 'follow-ups' | 'metrics'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  const actions: Action[] = [
    {
      id: '1',
      title: 'Finalize Q1 Sales Strategy',
      description: 'Develop and finalize the sales strategy for Q1 2026 including targets and initiatives',
      status: 'in-progress',
      priority: 'high',
      owner: 'Sales Manager',
      assignee: 'Sales Manager',
      dueDate: '2026-01-31',
      createdDate: '2026-01-10',
      category: 'Strategic Planning',
      relatedTo: 'Sales Module',
      comments: 5,
      attachments: 2,
    },
    {
      id: '2',
      title: 'Review Budget Allocations',
      description: 'Review and approve budget allocations for all departments for Q1',
      status: 'completed',
      priority: 'high',
      owner: 'Finance Manager',
      assignee: 'Finance Manager',
      dueDate: '2026-01-25',
      createdDate: '2026-01-15',
      completedDate: '2026-01-24',
      category: 'Finance',
      relatedTo: 'Budget Module',
      comments: 3,
      attachments: 1,
    },
    {
      id: '3',
      title: 'Conduct Employee Training',
      description: 'Organize and conduct training sessions for new software implementation',
      status: 'open',
      priority: 'medium',
      owner: 'HR Manager',
      assignee: 'HR Manager',
      dueDate: '2026-02-15',
      createdDate: '2026-01-20',
      category: 'HR & Development',
      relatedTo: 'HR Module',
      comments: 2,
      attachments: 3,
    },
    {
      id: '4',
      title: 'Resolve Inventory Discrepancies',
      description: 'Investigate and resolve inventory count discrepancies in warehouse',
      status: 'overdue',
      priority: 'high',
      owner: 'Operations Manager',
      assignee: 'Inventory Manager',
      dueDate: '2026-01-20',
      createdDate: '2026-01-05',
      category: 'Operations',
      relatedTo: 'Inventory Module',
      comments: 8,
      attachments: 4,
    },
    {
      id: '5',
      title: 'Follow up with Prospect ABC',
      description: 'Contact ABC Corporation regarding their quotation and schedule meeting',
      status: 'in-progress',
      priority: 'medium',
      owner: 'Sales Executive',
      assignee: 'Sales Executive',
      dueDate: '2026-01-28',
      createdDate: '2026-01-22',
      category: 'Sales',
      relatedTo: 'CRM Module',
      comments: 1,
      attachments: 0,
    },
    {
      id: '6',
      title: 'Update Product Catalog',
      description: 'Update product information and pricing in the catalog',
      status: 'on-hold',
      priority: 'low',
      owner: 'Product Manager',
      assignee: 'Product Manager',
      dueDate: '2026-02-28',
      createdDate: '2026-01-18',
      category: 'Product Management',
      relatedTo: 'Products Module',
      comments: 0,
      attachments: 1,
    },
  ];

  const followUps: FollowUp[] = [
    {
      id: '1',
      actionId: '1',
      actionTitle: 'Finalize Q1 Sales Strategy',
      followUpDate: '2026-01-28',
      status: 'pending',
      owner: 'Sales Manager',
      notes: 'Check progress on strategy document and team alignment',
      nextFollowUp: '2026-02-04',
    },
    {
      id: '2',
      actionId: '5',
      actionTitle: 'Follow up with Prospect ABC',
      followUpDate: '2026-01-25',
      status: 'completed',
      owner: 'Sales Executive',
      notes: 'Contacted ABC Corp, scheduled meeting for Feb 5',
    },
    {
      id: '3',
      actionId: '4',
      actionTitle: 'Resolve Inventory Discrepancies',
      followUpDate: '2026-01-22',
      status: 'overdue',
      owner: 'Operations Manager',
      notes: 'Awaiting warehouse audit results',
      nextFollowUp: '2026-01-27',
    },
  ];

  const metrics: ActionMetrics = {
    totalActions: actions.length,
    openActions: actions.filter(a => a.status === 'open').length,
    overdue: actions.filter(a => a.status === 'overdue').length,
    completedThisMonth: actions.filter(a => a.status === 'completed').length,
    avgCompletionTime: 8,
    completionRate: 45,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (action: Action) => {
    setSelectedAction(action);
    setShowDetailDialog(true);
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || action.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const myActions = filteredActions.filter(a => a.assignee === 'Sales Manager' || a.assignee === 'Finance Manager');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Action Tracker</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Action
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['all', 'my-actions', 'follow-ups', 'metrics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalActions}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics.openActions}</div>
            <p className="text-xs text-gray-500 mt-1">Not started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.overdue}</div>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.completedThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* All Actions Tab */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredActions.map(action => (
              <div
                key={action.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(action)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-600 hover:underline">{action.title}</h3>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-blue-600 hover:underline">{action.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{action.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category: </span>
                    <span className="font-semibold">{action.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Related: </span>
                    <span className="font-semibold text-blue-600 hover:underline">{action.relatedTo}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-600">{action.comments} comments</span>
                    <span className="text-gray-600">{action.attachments} files</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {action.status !== 'completed' && (
                    <Button variant="outline" size="sm">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Actions Tab */}
      {activeTab === 'my-actions' && (
        <div className="space-y-3">
          {myActions.length > 0 ? (
            myActions.map(action => (
              <div
                key={action.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(action)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(action.status)}>
                      {action.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              No actions assigned to you
            </div>
          )}
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-3">
          {followUps.map(followUp => (
            <div key={followUp.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-600 hover:underline">{followUp.actionTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>
                </div>
                <Badge className={getStatusColor(followUp.status)}>
                  {followUp.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                <span>{followUp.owner}</span>
                <span>Follow-up: {followUp.followUpDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['open', 'in-progress', 'completed', 'overdue', 'on-hold'].map(status => {
                  const count = actions.filter(a => a.status === status).length;
                  const percentage = (count / actions.length) * 100;
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{status.replace('-', ' ')}</span>
                        <span className="text-sm font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'completed' ? 'bg-green-600' :
                            status === 'overdue' ? 'bg-red-600' :
                            status === 'in-progress' ? 'bg-purple-600' :
                            'bg-blue-600'
                          }`}
                          style={{ width: `${percentage}%` }}
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
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Average Completion Time</p>
                  <p className="text-2xl font-bold">{metrics.avgCompletionTime} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completionRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overdue Actions</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedAction && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAction.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm">{selectedAction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedAction.status)}>
                    {selectedAction.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <Badge className={getPriorityColor(selectedAction.priority)}>
                    {selectedAction.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Assignee</p>
                <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedAction.assignee}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">{selectedAction.dueDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Related To</p>
                <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedAction.relatedTo}</p>
              </div>
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
            <DialogTitle>Create New Action</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Enter action title" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Enter description" />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Assign To</label>
              <Input placeholder="Enter assignee" />
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
