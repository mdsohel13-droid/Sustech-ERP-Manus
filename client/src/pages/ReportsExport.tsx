import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Download,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Clock,
  Mail,
  Plus,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'workflow' | 'alerts' | 'operations' | 'custom';
  template: 'executive' | 'detailed' | 'summary';
  format: 'csv' | 'pdf' | 'xlsx';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  lastGenerated?: Date;
  generatedCount: number;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  status: 'draft' | 'scheduled' | 'generating' | 'ready' | 'failed';
}

interface ExportJob {
  id: string;
  reportId: string;
  reportName: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: string[];
  icon: string;
}

export default function ReportsExport() {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'history' | 'schedule'>('reports');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);

  // Mock reports
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'report-1',
      name: 'Monthly Financial Summary',
      type: 'financial',
      template: 'executive',
      format: 'pdf',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      generatedCount: 12,
      schedule: {
        enabled: true,
        frequency: 'monthly',
        time: '09:00',
        recipients: ['finance@sustech.com', 'cfo@sustech.com'],
      },
      status: 'scheduled',
    },
    {
      id: 'report-2',
      name: 'Workflow Performance Report',
      type: 'workflow',
      template: 'detailed',
      format: 'xlsx',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      generatedCount: 5,
      status: 'ready',
    },
    {
      id: 'report-3',
      name: 'Active Alerts Summary',
      type: 'alerts',
      template: 'summary',
      format: 'csv',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      lastGenerated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      generatedCount: 24,
      status: 'ready',
    },
    {
      id: 'report-4',
      name: 'Operations Dashboard Export',
      type: 'operations',
      template: 'executive',
      format: 'pdf',
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      generatedCount: 0,
      status: 'draft',
    },
  ]);

  const [templates] = useState<ReportTemplate[]>([
    {
      id: 'template-1',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and trends',
      type: 'financial',
      sections: ['Key Metrics', 'Trends', 'Alerts', 'Recommendations'],
      icon: '📊',
    },
    {
      id: 'template-2',
      name: 'Detailed Analysis',
      description: 'Comprehensive report with detailed breakdowns',
      type: 'workflow',
      sections: ['Overview', 'Detailed Metrics', 'Trends', 'Analysis', 'Recommendations'],
      icon: '📈',
    },
    {
      id: 'template-3',
      name: 'Summary Report',
      description: 'Quick snapshot of key information',
      type: 'alerts',
      sections: ['Summary', 'Key Alerts', 'Status'],
      icon: '📋',
    },
    {
      id: 'template-4',
      name: 'Custom Report',
      description: 'Create your own report with selected fields',
      type: 'custom',
      sections: ['Custom Fields', 'Filters', 'Formatting'],
      icon: '⚙️',
    },
  ]);

  const [history] = useState<ExportJob[]>([
    {
      id: 'job-1',
      reportId: 'report-1',
      reportName: 'Monthly Financial Summary',
      format: 'pdf',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000),
      fileSize: 2.5,
      downloadUrl: '/reports/monthly-financial-summary-2025-01.pdf',
    },
    {
      id: 'job-2',
      reportId: 'report-2',
      reportName: 'Workflow Performance Report',
      format: 'xlsx',
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 15000),
      fileSize: 1.2,
      downloadUrl: '/reports/workflow-performance-2025-01.xlsx',
    },
    {
      id: 'job-3',
      reportId: 'report-3',
      reportName: 'Active Alerts Summary',
      format: 'csv',
      status: 'completed',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 5000),
      fileSize: 0.3,
      downloadUrl: '/reports/alerts-summary-2025-01.csv',
    },
    {
      id: 'job-4',
      reportId: 'report-1',
      reportName: 'Monthly Financial Summary',
      format: 'pdf',
      status: 'processing',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);

  const handleCreateReport = () => {
    setSelectedReport(null);
    setShowReportDialog(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const handleGenerateReport = (report: Report) => {
    // Simulate report generation
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      reportId: report.id,
      reportName: report.name,
      format: report.format,
      status: 'processing',
      createdAt: new Date(),
    };
    setExportJobs([newJob, ...exportJobs]);

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setExportJobs(prev =>
        prev.map(job =>
          job.id === newJob.id
            ? {
                ...job,
                status: 'completed',
                completedAt: new Date(),
                fileSize: Math.random() * 5,
                downloadUrl: `/reports/${report.name.toLowerCase().replace(/\s+/g, '-')}.${report.format}`,
              }
            : job
        )
      );
    }, 2000);
  };

  const handleScheduleReport = (report: Report) => {
    setSelectedReport(report);
    setShowScheduleDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Zap className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Data Export</h1>
        <Button onClick={handleCreateReport} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['reports', 'templates', 'history', 'schedule'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'reports' && '📋 Reports'}
            {tab === 'templates' && '🎨 Templates'}
            {tab === 'history' && '📜 Export History'}
            {tab === 'schedule' && '📅 Scheduled'}
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                      </CardDescription>
                    </div>
                    <Badge className={
                      report.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'ready' ? 'bg-green-100 text-green-800' :
                      report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Template</p>
                      <p className="font-semibold capitalize">{report.template}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Format</p>
                      <p className="font-semibold uppercase">{report.format}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Generated</p>
                      <p className="font-semibold">{report.generatedCount} times</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Generated</p>
                      <p className="font-semibold text-xs">
                        {report.lastGenerated
                          ? report.lastGenerated.toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport(report)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Generate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReport(report)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleReport(report)}
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {report.schedule?.enabled && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <p className="font-semibold text-blue-900 mb-1">Scheduled</p>
                      <p className="text-blue-800">
                        {report.schedule.frequency.charAt(0).toUpperCase() + report.schedule.frequency.slice(1)} at {report.schedule.time}
                      </p>
                      <p className="text-blue-800">Recipients: {report.schedule.recipients.join(', ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <p className="text-gray-600">Choose a template to start creating your report</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{template.icon}</span>
                        <CardTitle>{template.name}</CardTitle>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Sections Included:</p>
                    <div className="flex gap-2 flex-wrap">
                      {template.sections.map(section => (
                        <Badge key={section} variant="outline">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Export History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {history.map(job => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-semibold">{job.reportName}</h3>
                        <p className="text-sm text-gray-600">
                          {job.format.toUpperCase()} • {job.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>

                      {job.status === 'completed' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{job.fileSize?.toFixed(1)} MB</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 mt-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      )}

                      {job.status === 'processing' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Processing...</p>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {reports
              .filter(r => r.schedule?.enabled)
              .map(report => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{report.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.schedule?.frequency.charAt(0).toUpperCase() + report.schedule?.frequency.slice(1)} at {report.schedule?.time}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Recipients:</p>
                          <div className="flex gap-2 flex-wrap">
                            {report.schedule?.recipients.map(recipient => (
                              <Badge key={recipient} variant="outline" className="text-xs">
                                {recipient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Mail className="w-4 h-4" />
                          Send Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Create/Edit Report Dialog */}
      {showReportDialog && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedReport ? 'Edit Report' : 'Create New Report'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <input
                  type="text"
                  defaultValue={selectedReport?.name || ''}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  placeholder="e.g., Monthly Financial Summary"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Report Type</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option value="financial">Financial</option>
                  <option value="workflow">Workflow</option>
                  <option value="alerts">Alerts</option>
                  <option value="operations">Operations</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Template</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option value="executive">Executive Summary</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="summary">Summary</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Export Format</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    defaultValue={selectedReport?.dateRange.start.toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    defaultValue={selectedReport?.dateRange.end.toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowReportDialog(false);
              }}>
                {selectedReport ? 'Update' : 'Create'} Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Report Dialog */}
      {showScheduleDialog && selectedReport && (
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report: {selectedReport.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select className="w-full px-3 py-2 border rounded-md mt-1">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  defaultValue={selectedReport.schedule?.time || '09:00'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Recipients</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  rows={3}
                  placeholder="Enter email addresses (one per line)"
                  defaultValue={selectedReport.schedule?.recipients.join('\n') || ''}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowScheduleDialog(false);
              }}>
                Schedule Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
