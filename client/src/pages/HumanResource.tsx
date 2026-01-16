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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
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
    </div>
  );
}
