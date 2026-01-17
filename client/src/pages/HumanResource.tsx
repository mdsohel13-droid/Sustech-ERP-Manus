import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  Building2,
  Award,
  FileText,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { AttachmentUpload } from "@/components/AttachmentUpload";

const MODULES = [
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'financial', label: 'Financial' },
  { name: 'income_expenditure', label: 'Income & Expenditure' },
  { name: 'sales', label: 'Sales' },
  { name: 'projects', label: 'Projects' },
  { name: 'customers', label: 'Customers' },
  { name: 'hr', label: 'Human Resource' },
  { name: 'action_tracker', label: 'Action Tracker' },
  { name: 'tender_quotation', label: 'Tender/Quotation' },
  { name: 'ideas', label: 'Ideas' },
  { name: 'settings', label: 'Settings' },
];

export default function HumanResource() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [selectedUserForDocs, setSelectedUserForDocs] = useState<any>(null);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  
  const { data: hrStats, isLoading } = trpc.hr.getDashboardStats.useQuery();
  const { data: employees } = trpc.hr.getAllEmployees.useQuery();
  const { data: pendingLeaves } = trpc.hr.getPendingLeaveApplications.useQuery();
  const { data: allUsers } = trpc.users.getAll.useQuery();

  // Mutations
  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      setAddUserDialogOpen(false);
      alert("User created successfully!");
    },
    onError: (error) => {
      alert("Failed to create user: " + error.message);
    },
  });

  const updateUserMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      alert("User role updated successfully!");
    },
  });

  const setPermissionsMutation = trpc.permissions.setUserPermissions.useMutation({
    onSuccess: () => {
      setPermissionsDialogOpen(false);
      alert("Permissions updated successfully!");
    },
  });

  const createEmployeeMutation = trpc.hr.createEmployee.useMutation({
    onSuccess: () => {
      utils.hr.getAllEmployees.invalidate();
      setAddEmployeeDialogOpen(false);
      alert("Employee created successfully!");
    },
    onError: (error) => {
      alert("Failed to create employee: " + error.message);
    },
  });

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userId = parseInt(formData.get('userId') as string);
    const joinDate = formData.get('joinDate') as string;
    const departmentId = formData.get('departmentId') as string;
    
    createEmployeeMutation.mutate({
      userId,
      employeeCode: formData.get('employeeCode') as string,
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      jobTitle: formData.get('jobTitle') as string || undefined,
      employmentType: (formData.get('employmentType') as any) || 'full_time',
      joinDate,
      salaryGrade: formData.get('salaryGrade') as string || undefined,
      workLocation: formData.get('workLocation') as string || undefined,
      workSchedule: formData.get('workSchedule') as string || undefined,
      emergencyContactName: formData.get('emergencyContactName') as string || undefined,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
    });
  };

  const handleOpenPermissions = (targetUser: any) => {
    setSelectedUser(targetUser);
    const defaultPerms = MODULES.map(m => {
      const isAdmin = targetUser.role === 'admin';
      const isManager = targetUser.role === 'manager';
      return {
        moduleName: m.name,
        canView: isAdmin || isManager || !['settings', 'hr'].includes(m.name),
        canCreate: isAdmin || (isManager && m.name !== 'settings'),
        canEdit: isAdmin || (isManager && m.name !== 'settings'),
        canDelete: isAdmin || (isManager && !['settings', 'hr'].includes(m.name)),
      };
    });
    setUserPermissions(defaultPerms);
    setPermissionsDialogOpen(true);
  };

  const handlePermissionChange = (moduleName: string, permission: string, value: boolean) => {
    setUserPermissions(prev => prev.map(p => 
      p.moduleName === moduleName ? { ...p, [permission]: value } : p
    ));
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    setPermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions: userPermissions,
    });
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
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
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Human Resource Management</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Comprehensive employee management, attendance, leave, and access control
          </p>
        </div>
        {isAdmin && (
          <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and permissions
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createUserMutation.mutate({
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    role: formData.get('role') as 'admin' | 'manager' | 'viewer' | 'user',
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="viewer" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="manager">Manager (Limited Admin)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                      <SelectItem value="user">User (Custom Permissions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              {allUsers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">System users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-red-600">
              <Shield className="h-6 w-6" />
              {allUsers?.filter((u: any) => u.role === 'admin').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Full access users</p>
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="roles">Role Guide</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setAddUserDialogOpen(true)}>
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span>Add User</span>
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

        {/* Users & Access Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and their module access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={u.role === 'admin' ? 'destructive' : u.role === 'manager' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Select
                              value={u.role}
                              onValueChange={(value) => {
                                if (confirm(`Change ${u.name}'s role to ${value}?`)) {
                                  updateUserMutation.mutate({ userId: u.id, role: value as any });
                                }
                              }}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPermissions(u)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Permissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUserForDocs(u);
                                setDocsDialogOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Docs
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Employee Directory</h2>
              <p className="text-muted-foreground">Manage employee records and information</p>
            </div>
            {user?.role === 'admin' && (
              <Dialog open={addEmployeeDialogOpen} onOpenChange={setAddEmployeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Create a new employee record with basic and job information
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emp_userId">Link to User Account</Label>
                        <Select name="userId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user account" />
                          </SelectTrigger>
                          <SelectContent>
                            {allUsers?.map((u: any) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp_employeeCode">Employee Code *</Label>
                        <Input id="emp_employeeCode" name="employeeCode" placeholder="EMP-001" required />
                      </div>
                      <div>
                        <Label htmlFor="emp_jobTitle">Job Title / Designation</Label>
                        <Input id="emp_jobTitle" name="jobTitle" placeholder="Senior Developer" />
                      </div>
                      <div>
                        <Label htmlFor="emp_departmentId">Department</Label>
                        <Select name="departmentId">
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {hrStats?.employeesByDept?.map((d: any) => (
                              <SelectItem key={d.departmentId || d.department} value={(d.departmentId || 1).toString()}>
                                {d.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp_employmentType">Employment Type</Label>
                        <Select name="employmentType" defaultValue="full_time">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp_joinDate">Join Date *</Label>
                        <Input id="emp_joinDate" name="joinDate" type="date" required />
                      </div>
                      <div>
                        <Label htmlFor="emp_salaryGrade">Salary Grade</Label>
                        <Input id="emp_salaryGrade" name="salaryGrade" placeholder="Grade A" />
                      </div>
                      <div>
                        <Label htmlFor="emp_workLocation">Work Location</Label>
                        <Input id="emp_workLocation" name="workLocation" placeholder="Dhaka Office" />
                      </div>
                      <div>
                        <Label htmlFor="emp_workSchedule">Work Schedule</Label>
                        <Input id="emp_workSchedule" name="workSchedule" placeholder="9 AM - 6 PM" />
                      </div>
                      <div>
                        <Label htmlFor="emp_emergencyContactName">Emergency Contact Name</Label>
                        <Input id="emp_emergencyContactName" name="emergencyContactName" placeholder="Contact person name" />
                      </div>
                      <div>
                        <Label htmlFor="emp_emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input id="emp_emergencyContactPhone" name="emergencyContactPhone" placeholder="+880 1XXX-XXXXXX" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setAddEmployeeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createEmployeeMutation.isPending}>
                        {createEmployeeMutation.isPending ? "Creating..." : "Create Employee"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Clock In/Out Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Clock In / Out
                </CardTitle>
                <CardDescription>Record your attendance for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold tabular-nums">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      alert('Clock In recorded at ' + new Date().toLocaleTimeString());
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Clock In
                  </Button>
                  <Button 
                    size="lg" 
                    variant="destructive"
                    onClick={() => {
                      alert('Clock Out recorded at ' + new Date().toLocaleTimeString());
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Clock Out
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Your attendance will be recorded with timestamp and location (if enabled)
                </p>
              </CardContent>
            </Card>

            {/* Today's Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Status</CardTitle>
                <CardDescription>Your attendance summary for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Present
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Clock In</span>
                    <span className="text-sm">09:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Clock Out</span>
                    <span className="text-sm text-muted-foreground">Not yet</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Working Hours</span>
                    <span className="text-sm">5h 30m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, idx) => {
                    const date = new Date();
                    date.setDate(date.getDate() - idx);
                    const statuses = ['Present', 'Present', 'Late', 'Present', 'Absent'];
                    const status = statuses[idx];
                    return (
                      <TableRow key={idx}>
                        <TableCell>{date.toLocaleDateString()}</TableCell>
                        <TableCell>{status === 'Absent' ? '-' : idx === 2 ? '09:45 AM' : '09:00 AM'}</TableCell>
                        <TableCell>{status === 'Absent' ? '-' : '06:00 PM'}</TableCell>
                        <TableCell>{status === 'Absent' ? '-' : idx === 2 ? '8h 15m' : '9h 00m'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={status === 'Present' ? 'default' : status === 'Late' ? 'secondary' : 'destructive'}
                            className={status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-6">
          {/* Leave Balance Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-muted-foreground">Annual Leave</p>
                  <p className="text-xs text-muted-foreground mt-1">8 used / 4 remaining</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">10</div>
                  <p className="text-sm text-muted-foreground">Sick Leave</p>
                  <p className="text-xs text-muted-foreground mt-1">3 used / 7 remaining</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">5</div>
                  <p className="text-sm text-muted-foreground">Casual Leave</p>
                  <p className="text-xs text-muted-foreground mt-1">2 used / 3 remaining</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">3</div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Apply for Leave */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for Leave</CardTitle>
                <CardDescription>Submit a new leave request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Leave Type</Label>
                  <Select defaultValue="annual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reason</Label>
                  <Input placeholder="Brief reason for leave" />
                </div>
                <Button className="w-full" onClick={() => alert('Leave request submitted! Awaiting manager approval.')}>
                  Submit Leave Request
                </Button>
              </CardContent>
            </Card>

            {/* Pending Approvals (for managers) */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>Leave requests awaiting your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{ name: 'John Doe', type: 'Annual Leave', dates: 'Jan 20-22, 2026', days: 3 },
                      { name: 'Jane Smith', type: 'Sick Leave', dates: 'Jan 18, 2026', days: 1 },
                      { name: 'Bob Wilson', type: 'Casual Leave', dates: 'Jan 25, 2026', days: 1 }].map((req, idx) => (
                      <div key={idx} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{req.name}</span>
                          <Badge variant="outline">{req.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{req.dates}</span>
                          <span>{req.days} day(s)</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => alert('Leave approved!')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => alert('Leave rejected.')}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Leave History */}
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
              <CardDescription>Your past leave requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[{ type: 'Annual Leave', start: '2026-01-10', end: '2026-01-12', days: 3, status: 'Approved', approver: 'Admin' },
                    { type: 'Sick Leave', start: '2025-12-20', end: '2025-12-20', days: 1, status: 'Approved', approver: 'Manager' },
                    { type: 'Casual Leave', start: '2025-12-05', end: '2025-12-05', days: 1, status: 'Rejected', approver: 'Manager' },
                    { type: 'Annual Leave', start: '2025-11-25', end: '2025-11-27', days: 3, status: 'Approved', approver: 'Admin' }].map((leave, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{leave.start}</TableCell>
                      <TableCell>{leave.end}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>
                        <Badge variant={leave.status === 'Approved' ? 'default' : leave.status === 'Pending' ? 'secondary' : 'destructive'}
                          className={leave.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{leave.approver}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-muted-foreground">Overall Performance</p>
                  <p className="text-xs text-green-600 mt-1">↑ 5% from last quarter</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-muted-foreground">KPIs Tracked</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all employees</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">8</div>
                  <p className="text-sm text-muted-foreground">Reviews Due</p>
                  <p className="text-xs text-orange-600 mt-1">This month</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">92%</div>
                  <p className="text-sm text-muted-foreground">Target Achievement</p>
                  <p className="text-xs text-muted-foreground mt-1">Company-wide</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Performance Review */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Performance Review</CardTitle>
                  <CardDescription>Start a new employee performance evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.employee.id} value={emp.employee.id.toString()}>{emp.user?.name || emp.employee.employeeCode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Review Period</Label>
                    <Select defaultValue="q1-2026">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q1-2026">Q1 2026</SelectItem>
                        <SelectItem value="q4-2025">Q4 2025</SelectItem>
                        <SelectItem value="q3-2025">Q3 2025</SelectItem>
                        <SelectItem value="annual-2025">Annual 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Review Type</Label>
                    <Select defaultValue="quarterly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="annual">Annual Review</SelectItem>
                        <SelectItem value="probation">Probation Review</SelectItem>
                        <SelectItem value="promotion">Promotion Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={() => alert('Performance review created!')}>
                    Start Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* KPI Targets */}
            <Card>
              <CardHeader>
                <CardTitle>KPI Targets</CardTitle>
                <CardDescription>Current performance targets and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{ name: 'Sales Target', target: '৳50,00,000', current: '৳42,50,000', progress: 85 },
                    { name: 'Customer Satisfaction', target: '90%', current: '88%', progress: 98 },
                    { name: 'Project Completion', target: '100%', current: '75%', progress: 75 },
                    { name: 'Response Time', target: '<2 hours', current: '1.5 hours', progress: 100 }].map((kpi, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <span className="text-sm text-muted-foreground">{kpi.current} / {kpi.target}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${kpi.progress >= 90 ? 'bg-green-500' : kpi.progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${kpi.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Recent and upcoming performance evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[{ employee: 'John Doe', period: 'Q4 2025', type: 'Quarterly', rating: 4.2, status: 'Completed' },
                    { employee: 'Jane Smith', period: 'Q4 2025', type: 'Quarterly', rating: 4.5, status: 'Completed' },
                    { employee: 'Bob Wilson', period: 'Q1 2026', type: 'Quarterly', rating: null, status: 'Pending' },
                    { employee: 'Alice Brown', period: 'Annual 2025', type: 'Annual', rating: 4.0, status: 'Completed' }].map((review, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{review.employee}</TableCell>
                      <TableCell>{review.period}</TableCell>
                      <TableCell>{review.type}</TableCell>
                      <TableCell>
                        {review.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{review.rating}</span>
                            <span className="text-yellow-500">★</span>
                            <span className="text-muted-foreground text-xs">/ 5</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.status === 'Completed' ? 'default' : 'secondary'}
                          className={review.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => alert('View review details')}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Guide Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Guide</CardTitle>
              <CardDescription>
                Understanding default permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-red-50">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Full access to all modules including Settings and HR management. Can create, edit, and delete any data. Can manage user roles and permissions.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Manager
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Access to most modules except Settings. Can create and edit data in their accessible modules. Cannot delete HR records or access system settings.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Viewer
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Read-only access to operational modules (Dashboard, Financial, Sales, Projects, Customers). Cannot access Settings or HR modules. Cannot create, edit, or delete data.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User (Custom)
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Custom permissions set by Admin. Use this role for specialized access patterns like Sales Executive (Sales module only) or Project Manager (Projects only).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Module Permissions for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Configure which modules this user can access and what actions they can perform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-center">View</TableHead>
                  <TableHead className="text-center">Create</TableHead>
                  <TableHead className="text-center">Edit</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPermissions.map((perm) => {
                  const module = MODULES.find(m => m.name === perm.moduleName);
                  return (
                    <TableRow key={perm.moduleName}>
                      <TableCell className="font-medium">{module?.label || perm.moduleName}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.canView}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(perm.moduleName, 'canView', !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.canCreate}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(perm.moduleName, 'canCreate', !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.canEdit}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(perm.moduleName, 'canEdit', !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.canDelete}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(perm.moduleName, 'canDelete', !!checked)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={setPermissionsMutation.isPending}>
              {setPermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Documents Dialog */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Documents - {selectedUserForDocs?.name}</DialogTitle>
            <DialogDescription>
              Upload and manage documents for this employee (ID cards, certificates, contracts, etc.)
            </DialogDescription>
          </DialogHeader>
          {selectedUserForDocs && (
            <AttachmentUpload 
              entityType="employee" 
              entityId={selectedUserForDocs.id} 
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
