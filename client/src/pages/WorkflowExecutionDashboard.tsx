import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  BarChart3,
  Zap,
  Mail,
  MessageSquare,
  CheckCheck,
  X,
} from 'lucide-react';

interface WorkflowTrigger {
  id: string;
  name: string;
  eventType: string;
  enabled: boolean;
  executionCount: number;
  lastExecuted?: Date;
  successRate: number;
}

interface WorkflowExecution {
  id: string;
  triggerId: string;
  triggerName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  sourceModule: string;
  sourceId: string;
  actions: WorkflowAction[];
  approvals?: ApprovalChain[];
}

interface WorkflowAction {
  id: string;
  type: 'notification' | 'approval' | 'task' | 'update' | 'email' | 'sms' | 'webhook';
  name: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  timestamp?: Date;
  details?: Record<string, any>;
}

interface ApprovalChain {
  id: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: Date;
  comments?: string;
}

interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  successRate: number;
}

export default function WorkflowExecutionDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'triggers' | 'metrics'>('overview');
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [showExecutionDetail, setShowExecutionDetail] = useState(false);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');

  // Mock workflow triggers
  const triggers: WorkflowTrigger[] = [
    {
      id: 'trigger-1',
      name: 'Invoice Overdue Reminder',
      eventType: 'invoice.overdue',
      enabled: true,
      executionCount: 156,
      lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      successRate: 98.7,
    },
    {
      id: 'trigger-2',
      name: 'High Value Order Approval',
      eventType: 'order.created',
      enabled: true,
      executionCount: 42,
      lastExecuted: new Date(Date.now() - 30 * 60 * 1000),
      successRate: 100,
    },
    {
      id: 'trigger-3',
      name: 'Low Inventory Alert',
      eventType: 'inventory.low',
      enabled: true,
      executionCount: 89,
      lastExecuted: new Date(Date.now() - 60 * 60 * 1000),
      successRate: 96.6,
    },
    {
      id: 'trigger-4',
      name: 'Budget Exceeded Alert',
      eventType: 'budget.exceeded',
      enabled: true,
      executionCount: 12,
      lastExecuted: new Date(Date.now() - 24 * 60 * 60 * 1000),
      successRate: 100,
    },
    {
      id: 'trigger-5',
      name: 'Lead Qualified Follow-up',
      eventType: 'lead.qualified',
      enabled: true,
      executionCount: 67,
      lastExecuted: new Date(Date.now() - 4 * 60 * 60 * 1000),
      successRate: 97.0,
    },
    {
      id: 'trigger-6',
      name: 'Project Completion Notification',
      eventType: 'project.completed',
      enabled: true,
      executionCount: 8,
      lastExecuted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      successRate: 100,
    },
  ];

  // Mock workflow executions
  const executions: WorkflowExecution[] = [
    {
      id: 'exec-1',
      triggerId: 'trigger-1',
      triggerName: 'Invoice Overdue Reminder',
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000),
      sourceModule: 'Financial',
      sourceId: 'INV-2025-001',
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          name: 'Send Notification',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000),
        },
        {
          id: 'action-2',
          type: 'email',
          name: 'Send Email Reminder',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000),
        },
        {
          id: 'action-3',
          type: 'task',
          name: 'Create Follow-up Task',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3000),
        },
      ],
    },
    {
      id: 'exec-2',
      triggerId: 'trigger-2',
      triggerName: 'High Value Order Approval',
      status: 'running',
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      sourceModule: 'Sales',
      sourceId: 'ORD-2025-456',
      actions: [
        {
          id: 'action-4',
          type: 'notification',
          name: 'Send Approval Request',
          status: 'completed',
          timestamp: new Date(Date.now() - 30 * 60 * 1000 + 1000),
        },
        {
          id: 'action-5',
          type: 'approval',
          name: 'Wait for Manager Approval',
          status: 'executing',
          timestamp: new Date(Date.now() - 30 * 60 * 1000 + 2000),
        },
      ],
      approvals: [
        {
          id: 'approval-1',
          approverName: 'John Manager',
          approverRole: 'Sales Manager',
          status: 'pending',
        },
      ],
    },
    {
      id: 'exec-3',
      triggerId: 'trigger-3',
      triggerName: 'Low Inventory Alert',
      status: 'completed',
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(Date.now() - 60 * 60 * 1000 + 4000),
      sourceModule: 'Inventory',
      sourceId: 'SKU-001',
      actions: [
        {
          id: 'action-6',
          type: 'notification',
          name: 'Send Alert',
          status: 'completed',
          timestamp: new Date(Date.now() - 60 * 60 * 1000 + 1000),
        },
        {
          id: 'action-7',
          type: 'task',
          name: 'Create Purchase Order',
          status: 'completed',
          timestamp: new Date(Date.now() - 60 * 60 * 1000 + 2000),
        },
      ],
    },
    {
      id: 'exec-4',
      triggerId: 'trigger-5',
      triggerName: 'Lead Qualified Follow-up',
      status: 'failed',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 2000),
      sourceModule: 'CRM',
      sourceId: 'LEAD-789',
      actions: [
        {
          id: 'action-8',
          type: 'email',
          name: 'Send Follow-up Email',
          status: 'failed',
          result: 'Invalid email address',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1000),
        },
      ],
    },
  ];

  // Mock metrics
  const metrics: WorkflowMetrics = {
    totalExecutions: 374,
    successfulExecutions: 365,
    failedExecutions: 9,
    averageExecutionTime: 2.3,
    successRate: 97.6,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'approval':
        return <CheckCheck className="w-4 h-4" />;
      case 'task':
        return <Zap className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewExecution = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setShowExecutionDetail(true);
  };

  const filteredExecutions = executions.filter(exec => {
    const matchesStatus = filterStatus === 'all' || exec.status === filterStatus;
    const matchesTrigger = filterTrigger === 'all' || exec.triggerId === filterTrigger;
    return matchesStatus && matchesTrigger;
  });

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress...';
    const duration = (end.getTime() - start.getTime()) / 1000;
    if (duration < 60) return `${duration.toFixed(1)}s`;
    return `${(duration / 60).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Execution Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalExecutions}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.successfulExecutions}</div>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.failedExecutions}</div>
            <p className="text-xs text-gray-500 mt-1">Errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics.successRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Reliability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.averageExecutionTime}s</div>
            <p className="text-xs text-gray-500 mt-1">Per execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'executions', 'triggers', 'metrics'].map(tab => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {executions.slice(0, 4).map(exec => (
                <div
                  key={exec.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewExecution(exec)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(exec.status)}
                      <h4 className="font-semibold text-sm">{exec.triggerName}</h4>
                    </div>
                    <Badge className={getStatusColor(exec.status)}>
                      {exec.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {exec.startTime.toLocaleTimeString()} • {exec.sourceModule}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Triggers */}
          <Card>
            <CardHeader>
              <CardTitle>Active Triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {triggers.filter(t => t.enabled).map(trigger => (
                <div key={trigger.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{trigger.name}</h4>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Executions</p>
                      <p className="font-semibold">{trigger.executionCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Success Rate</p>
                      <p className="font-semibold text-green-600">{trigger.successRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Triggers</option>
              {triggers.map(trigger => (
                <option key={trigger.id} value={trigger.id}>
                  {trigger.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredExecutions.map(execution => (
              <div key={execution.id} className={`border rounded-lg p-4 ${getStatusColor(execution.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(execution.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{execution.triggerName}</h3>
                        <Badge variant="outline">{execution.sourceModule}</Badge>
                      </div>
                      <p className="text-sm mb-2">
                        Source ID: <span className="font-mono font-semibold">{execution.sourceId}</span>
                      </p>
                      <p className="text-xs">
                        Started: {execution.startTime.toLocaleString()} •
                        Duration: {formatDuration(execution.startTime, execution.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewExecution(execution)}
                    >
                      View Details
                    </Button>
                    <button
                      onClick={() => setExpandedExecution(expandedExecution === execution.id ? null : execution.id)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {expandedExecution === execution.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedExecution === execution.id && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {execution.actions.map(action => (
                      <div key={action.id} className="flex items-center gap-3 p-2 bg-white bg-opacity-50 rounded">
                        {getActionIcon(action.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{action.name}</p>
                          <p className="text-xs text-gray-600">{action.type}</p>
                        </div>
                        <Badge variant="outline" className={
                          action.status === 'completed' ? 'text-green-600' :
                          action.status === 'failed' ? 'text-red-600' :
                          action.status === 'executing' ? 'text-blue-600' :
                          'text-yellow-600'
                        }>
                          {action.status}
                        </Badge>
                      </div>
                    ))}

                    {execution.approvals && execution.approvals.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-semibold mb-2">Approvals</p>
                        {execution.approvals.map(approval => (
                          <div key={approval.id} className="flex items-center justify-between p-2 bg-white bg-opacity-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{approval.approverName}</p>
                              <p className="text-xs text-gray-600">{approval.approverRole}</p>
                            </div>
                            <Badge variant="outline" className={
                              approval.status === 'approved' ? 'text-green-600' :
                              approval.status === 'rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }>
                              {approval.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {triggers.map(trigger => (
            <Card key={trigger.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{trigger.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{trigger.eventType}</p>
                  </div>
                  <Badge className={trigger.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {trigger.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold">{trigger.executionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{trigger.successRate}%</p>
                  </div>
                </div>

                {trigger.lastExecuted && (
                  <div>
                    <p className="text-sm text-gray-600">Last Executed</p>
                    <p className="text-sm font-medium">{trigger.lastExecuted.toLocaleString()}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Play className="w-4 h-4" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Settings className="w-4 h-4" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Workflow Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Execution Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Executions</span>
                    <span className="font-semibold">{metrics.totalExecutions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Successful</span>
                    <span className="font-semibold text-green-600">{metrics.successfulExecutions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-semibold text-red-600">{metrics.failedExecutions}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-blue-600">{metrics.successRate}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Execution Time</span>
                    <span className="font-semibold">{metrics.averageExecutionTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fastest Execution</span>
                    <span className="font-semibold">0.8s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Slowest Execution</span>
                    <span className="font-semibold">12.5s</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Median Time</span>
                    <span className="font-semibold">1.9s</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Trigger Performance</h3>
              <div className="space-y-2">
                {triggers.map(trigger => (
                  <div key={trigger.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{trigger.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">{trigger.executionCount} executions</span>
                      <span className="font-semibold text-green-600">{trigger.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Detail Dialog */}
      {selectedExecution && (
        <Dialog open={showExecutionDetail} onOpenChange={setShowExecutionDetail}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExecution.triggerName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedExecution.status)}>
                    {selectedExecution.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source Module</p>
                  <p className="font-semibold">{selectedExecution.sourceModule}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-semibold text-sm">{selectedExecution.startTime.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-sm">
                    {formatDuration(selectedExecution.startTime, selectedExecution.endTime)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Actions Executed</p>
                <div className="space-y-2">
                  {selectedExecution.actions.map(action => (
                    <div key={action.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getActionIcon(action.type)}
                          <span className="font-semibold text-sm">{action.name}</span>
                        </div>
                        <Badge variant="outline">
                          {action.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{action.type}</p>
                      {action.result && (
                        <p className="text-xs text-red-600 mt-1">{action.result}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedExecution.approvals && selectedExecution.approvals.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Approvals</p>
                  <div className="space-y-2">
                    {selectedExecution.approvals.map(approval => (
                      <div key={approval.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{approval.approverName}</p>
                            <p className="text-xs text-gray-600">{approval.approverRole}</p>
                          </div>
                          <Badge variant="outline">
                            {approval.status}
                          </Badge>
                        </div>
                        {approval.comments && (
                          <p className="text-xs text-gray-600 mt-2">{approval.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExecutionDetail(false)}>
                Close
              </Button>
              <Button>Retry Execution</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
