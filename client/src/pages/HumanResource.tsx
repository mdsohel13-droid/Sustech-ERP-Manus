import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Building2,
  Award,
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HumanResource() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: hrStats, isLoading } = trpc.hr.getDashboardStats.useQuery();
  const { data: employees } = trpc.hr.getAllEmployees.useQuery();
  const { data: pendingLeaves } = trpc.hr.getPendingLeaveApplications.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Human Resource Management</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Comprehensive employee management, attendance, leave, and performance tracking
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              {hrStats?.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-green-600">
              <Clock className="h-6 w-6" />
              {hrStats?.todayAttendance?.find(a => a.status === 'present')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hrStats?.todayAttendance?.find(a => a.status === 'absent')?.count || 0} absent
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-orange-600">
              <Calendar className="h-6 w-6" />
              {hrStats?.pendingLeaves || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-purple-600">
              <Building2 className="h-6 w-6" />
              {hrStats?.employeesByDept?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employees by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Employees by Department
                </CardTitle>
                <CardDescription>Workforce distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hrStats?.employeesByDept?.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept.departmentName || "Unassigned"}</span>
                      <Badge variant="secondary">{dept.count} employees</Badge>
                    </div>
                  ))}
                  {(!hrStats?.employeesByDept || hrStats.employeesByDept.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No department data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pending Leave Requests
                </CardTitle>
                <CardDescription>Requests awaiting manager approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingLeaves?.slice(0, 5).map((item) => (
                    <div key={item.application.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{item.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.application.leaveType} - {item.application.daysCount} days
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </div>
                  ))}
                  {(!pendingLeaves || pendingLeaves.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No pending leave requests
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span>Add Employee</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Mark Attendance</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Generate Report</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Award className="h-6 w-6 mb-2" />
                  <span>Performance Review</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Complete list of all employees with their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees?.map((emp) => (
                  <div key={emp.employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {emp.user?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{emp.user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {emp.employee.jobTitle || emp.position?.title || "No position"}
                          {emp.department && ` • ${emp.department.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{emp.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={emp.employee.status === 'active' ? 'default' : 'secondary'}>
                        {emp.employee.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
                {(!employees || employees.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No employees found. Add your first employee to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Track daily attendance and work hours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Attendance tracking feature coming soon. You can mark attendance and view reports here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>Manage leave requests and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Leave management feature coming soon. Employees can apply for leaves and managers can approve/reject here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance & KPIs</CardTitle>
              <CardDescription>Track employee performance and key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Performance management feature coming soon. Conduct reviews and track KPIs here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
