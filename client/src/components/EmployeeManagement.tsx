import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Edit2, Trash2, Eye, Lock, DollarSign } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function EmployeeManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState("employees");
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [confidentialOpen, setConfidentialOpen] = useState(false);
  const [selectedEmployeeForConfidential, setSelectedEmployeeForConfidential] = useState<any>(null);

  const utils = trpc.useUtils();
  
  // Queries
  const { data: employees } = trpc.hr.getAllEmployees.useQuery();
  const { data: departments } = trpc.hr.getAllDepartments.useQuery();
  const { data: jobDescriptions } = trpc.hr.getJobDescriptions.useQuery();
  const { data: employeeRoles } = trpc.hr.getEmployeeRoles.useQuery();
  const { data: allUsers } = trpc.users.getAll.useQuery();

  // Mutations
  const createEmployeeMutation = trpc.hr.createEmployee.useMutation({
    onSuccess: () => {
      utils.hr.getAllEmployees.invalidate();
      setAddEmployeeOpen(false);
      alert("Employee created successfully!");
    },
    onError: (error) => {
      alert("Failed to create employee: " + error.message);
    },
  });

  const updateConfidentialMutation = trpc.hr.updateEmployeeConfidential.useMutation({
    onSuccess: () => {
      utils.hr.getEmployeeConfidential.invalidate();
      setConfidentialOpen(false);
      alert("Confidential information updated successfully!");
    },
    onError: (error) => {
      alert("Failed to update: " + error.message);
    },
  });

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userId = parseInt(formData.get('userId') as string);
    const joinDate = formData.get('joinDate') as string;
    
    createEmployeeMutation.mutate({
      userId,
      employeeCode: formData.get('employeeCode') as string,
      departmentId: formData.get('departmentId') ? parseInt(formData.get('departmentId') as string) : undefined,
      jobTitle: formData.get('jobTitle') as string,
      employmentType: formData.get('employmentType') as any,
      joinDate,
      workLocation: formData.get('workLocation') as string,
      workSchedule: formData.get('workSchedule') as string,
      emergencyContactName: formData.get('emergencyContactName') as string,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string,
    });
  };

  const handleOpenConfidential = (employee: any) => {
    setSelectedEmployeeForConfidential(employee);
    setConfidentialOpen(true);
  };

  const handleSaveConfidential = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateConfidentialMutation.mutate({
      employeeId: selectedEmployeeForConfidential.employee.id,
      baseSalary: formData.get('baseSalary') as string,
      currency: formData.get('currency') as string,
      benefits: formData.get('benefits') as string,
      bankAccountNumber: formData.get('bankAccountNumber') as string,
      bankName: formData.get('bankName') as string,
      taxId: formData.get('taxId') as string,
      notes: formData.get('notes') as string,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="roles">Roles & Designations</TabsTrigger>
          <TabsTrigger value="jobs">Job Descriptions</TabsTrigger>
          <TabsTrigger value="confidential">Confidential (Admin)</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Employee Directory</h2>
              <p className="text-muted-foreground">Manage employee information and assignments</p>
            </div>
            {isAdmin && (
              <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Create a new employee record with basic information
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userId">User Account</Label>
                        <Select name="userId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
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
                        <Label htmlFor="employeeCode">Employee Code</Label>
                        <Input id="employeeCode" name="employeeCode" placeholder="EMP-001" required />
                      </div>
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" placeholder="Senior Developer" />
                      </div>
                      <div>
                        <Label htmlFor="departmentId">Department</Label>
                        <Select name="departmentId">
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map((d: any) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="employmentType">Employment Type</Label>
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
                        <Label htmlFor="joinDate">Join Date</Label>
                        <Input id="joinDate" name="joinDate" type="date" required />
                      </div>
                      <div>
                        <Label htmlFor="workLocation">Work Location</Label>
                        <Input id="workLocation" name="workLocation" placeholder="Dhaka Office" />
                      </div>
                      <div>
                        <Label htmlFor="workSchedule">Work Schedule</Label>
                        <Input id="workSchedule" name="workSchedule" placeholder="9 AM - 6 PM" />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                        <Input id="emergencyContactName" name="emergencyContactName" />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input id="emergencyContactPhone" name="emergencyContactPhone" />
                      </div>
                    </div>
                    <DialogFooter>
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
              <CardTitle>Active Employees</CardTitle>
              <CardDescription>All employees in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Join Date</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees?.map((emp: any) => (
                      <TableRow key={emp.employee.id}>
                        <TableCell className="font-medium">{emp.user?.name || 'N/A'}</TableCell>
                        <TableCell>{emp.employee.employeeCode}</TableCell>
                        <TableCell>{emp.employee.jobTitle || '-'}</TableCell>
                        <TableCell>{emp.department?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {emp.employee.employmentType?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(emp.employee.joinDate).toLocaleDateString()}</TableCell>
                        {isAdmin && (
                          <TableCell className="space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenConfidential(emp)}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Designations Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Roles & Designations</CardTitle>
              <CardDescription>Manage organizational roles and designations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeRoles?.map((role: any) => (
                  <Card key={role.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {isAdmin && (
                        <div className="space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Descriptions Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Descriptions</CardTitle>
              <CardDescription>Position-specific job descriptions and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobDescriptions?.map((job: any) => (
                  <Card key={job.id} className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.summary}</p>
                      {job.salaryRange && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidential Information Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="confidential" className="space-y-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Confidential Information (Admin Only)
                </CardTitle>
                <CardDescription>
                  Sensitive employee information including salary, benefits, and banking details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees?.map((emp: any) => (
                    <Card key={emp.employee.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{emp.user?.name}</h3>
                          <p className="text-sm text-muted-foreground">{emp.employee.employeeCode}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenConfidential(emp)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View/Edit
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Confidential Information Dialog */}
      {isAdmin && (
        <Dialog open={confidentialOpen} onOpenChange={setConfidentialOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Confidential Information</DialogTitle>
              <DialogDescription>
                {selectedEmployeeForConfidential?.user?.name} - {selectedEmployeeForConfidential?.employee?.employeeCode}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveConfidential} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input id="baseSalary" name="baseSalary" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="BDT">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea id="benefits" name="benefits" placeholder="List benefits (e.g., Health insurance, Bonus, etc.)" />
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input id="bankAccountNumber" name="bankAccountNumber" placeholder="Account number" />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" name="bankName" placeholder="Bank name" />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" name="taxId" placeholder="Tax ID / TIN" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Additional confidential notes" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateConfidentialMutation.isPending}>
                  {updateConfidentialMutation.isPending ? "Saving..." : "Save Information"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
