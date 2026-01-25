import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrossModuleHyperlink } from '@/components/CrossModuleHyperlink';
import { Plus, Edit, Trash2, Eye, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: 'Website Redesign',
    code: 'PROJ-2026-001',
    status: 'In Progress',
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    budget: 500000,
    spent: 250000,
    progress: 50,
    manager: 'John Doe',
    managerId: 1,
    team: ['Alice', 'Bob', 'Charlie'],
    teamSize: 3,
    customer: 'ABC Corporation',
    customerId: 101
  },
  {
    id: 2,
    name: 'Mobile App Development',
    code: 'PROJ-2026-002',
    status: 'Planning',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    budget: 1200000,
    spent: 0,
    progress: 10,
    manager: 'Jane Smith',
    managerId: 2,
    team: ['David', 'Eve'],
    teamSize: 2,
    customer: 'XYZ Industries',
    customerId: 102
  },
  {
    id: 3,
    name: 'Cloud Migration',
    code: 'PROJ-2026-003',
    status: 'Completed',
    startDate: '2025-12-01',
    endDate: '2026-01-20',
    budget: 800000,
    spent: 750000,
    progress: 100,
    manager: 'Mike Johnson',
    managerId: 3,
    team: ['Frank', 'Grace', 'Henry'],
    teamSize: 3,
    customer: 'Global Solutions',
    customerId: 103
  },
];

// Project status distribution
const statusDistribution = [
  { name: 'In Progress', value: 1, color: '#3b82f6' },
  { name: 'Planning', value: 1, color: '#f59e0b' },
  { name: 'Completed', value: 1, color: '#10b981' },
];

// Budget utilization
const budgetData = [
  { name: 'Website Redesign', budget: 500000, spent: 250000 },
  { name: 'Mobile App', budget: 1200000, spent: 0 },
  { name: 'Cloud Migration', budget: 800000, spent: 750000 },
];

export function ProjectsEnhanced() {
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <p className="text-gray-600 mt-2">Manage projects with resource allocation, timeline tracking, and budget management</p>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="text-xs text-gray-500 mt-1">{activeProjects} active, {completedProjects} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{totalBudget.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{Math.round((totalSpent / totalBudget) * 100)}% utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.reduce((sum, p) => sum + p.teamSize, 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Projects List</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Allocation</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* PROJECTS LIST */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Projects</h2>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-50">
                        <TableCell className="font-semibold">{project.name}</TableCell>
                        <TableCell>{project.code}</TableCell>
                        <TableCell>
                          <CrossModuleHyperlink
                            module="hr"
                            id={project.managerId}
                            label={project.manager}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell>
                          <CrossModuleHyperlink
                            module="customers"
                            id={project.customerId}
                            label={project.customer}
                            variant="link"
                          />
                        </TableCell>
                        <TableCell>৳{project.budget.toLocaleString()}</TableCell>
                        <TableCell>৳{project.spent.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div
                                className={`h-full rounded ${getProgressColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowDetailView(true);
                            }}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUDGET ANALYSIS */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>Budget vs Spent by project</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `৳${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" />
                  <Bar dataKey="spent" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM ALLOCATION */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Allocation</CardTitle>
              <CardDescription>Resource distribution across projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.teamSize} team members</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Users className="w-3 h-3" /> Manage Team
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Start and end dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{project.name}</p>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{project.startDate} to {project.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>৳{project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAIL VIEW MODAL */}
      {showDetailView && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>{selectedProject.code}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowDetailView(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Project Name</p>
                  <p className="font-semibold">{selectedProject.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project Manager</p>
                  <p className="font-semibold">
                    <CrossModuleHyperlink
                      module="hr"
                      id={selectedProject.managerId}
                      label={selectedProject.manager}
                      variant="link"
                    />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">
                    <CrossModuleHyperlink
                      module="customers"
                      id={selectedProject.customerId}
                      label={selectedProject.customer}
                      variant="link"
                    />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{selectedProject.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">{selectedProject.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-bold text-lg">৳{selectedProject.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="font-bold text-lg">৳{selectedProject.spent.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className={`h-full rounded ${getProgressColor(selectedProject.progress)}`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                  <span className="font-semibold">{selectedProject.progress}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Team Members ({selectedProject.teamSize})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Edit Project</Button>
                <Button variant="outline">Add Task</Button>
                <Button variant="outline">Export</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
