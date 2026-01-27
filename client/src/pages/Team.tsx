import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Team() {
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const currentDate = new Date();
  const [selectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear] = useState(currentDate.getFullYear());

  const utils = trpc.useUtils();
  const { data: members } = trpc.team.getAllMembers.useQuery();
  const { data: attendance } = trpc.team.getAttendanceByMonth.useQuery({ year: selectedYear, month: selectedMonth });
  const { data: leaveRequests } = trpc.team.getAllLeaveRequests.useQuery();

  const createAttendanceMutation = trpc.team.createAttendance.useMutation({
    onSuccess: () => {
      utils.team.getAttendanceByMonth.invalidate();
      toast.success("Attendance recorded");
      setAttendanceDialogOpen(false);
    },
  });

  const createLeaveRequestMutation = trpc.team.createLeaveRequest.useMutation({
    onSuccess: () => {
      utils.team.getAllLeaveRequests.invalidate();
      toast.success("Leave request submitted");
      setLeaveDialogOpen(false);
    },
  });

  const updateLeaveRequestMutation = trpc.team.updateLeaveRequest.useMutation({
    onSuccess: () => {
      utils.team.getAllLeaveRequests.invalidate();
      toast.success("Leave request updated");
    },
  });

  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAttendanceMutation.mutate({
      teamMemberId: Number(formData.get("teamMemberId")),
      date: formData.get("date") as string,
      status: formData.get("status") as any,
      notes: formData.get("notes") as string,
    });
  };

  const handleLeaveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLeaveRequestMutation.mutate({
      teamMemberId: Number(formData.get("teamMemberId")),
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      leaveType: formData.get("leaveType") as any,
      reason: formData.get("reason") as string,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Team Operations</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage team attendance and leave requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendance?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm label-text">Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leaveRequests?.filter(r => r.status === "pending").length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Attendance Tracker</h3>
            <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Mark Attendance</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAttendanceSubmit}>
                  <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                    <DialogDescription>Record team member attendance</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="teamMemberId">Team Member</Label>
                      <Select name="teamMemberId" required>
                        <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>Member {member.id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="present">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createAttendanceMutation.isPending}>
                      {createAttendanceMutation.isPending ? "Recording..." : "Record Attendance"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance && attendance.length > 0 ? (
                  attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date ? format(new Date(record.date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>Member {record.teamMemberId}</TableCell>
                      <TableCell>
                        <Badge className={record.status === "present" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No attendance records for this month.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">Leave Requests</h3>
            <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Leave Request</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleLeaveSubmit}>
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                    <DialogDescription>Request time off for a team member</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="teamMemberId">Team Member</Label>
                      <Select name="teamMemberId" required>
                        <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>Member {member.id}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" name="endDate" type="date" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select name="leaveType" defaultValue="vacation">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" name="reason" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createLeaveRequestMutation.isPending}>
                      {createLeaveRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="editorial-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests && leaveRequests.length > 0 ? (
                  leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>Member {request.teamMemberId}</TableCell>
                      <TableCell className="capitalize">{request.leaveType}</TableCell>
                      <TableCell>{request.startDate ? format(new Date(request.startDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{request.endDate ? format(new Date(request.endDate), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Badge className={request.status === "approved" ? "bg-green-100 text-green-800" : request.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => updateLeaveRequestMutation.mutate({ id: request.id, status: "approved" })}>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => updateLeaveRequestMutation.mutate({ id: request.id, status: "rejected" })}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No leave requests found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
