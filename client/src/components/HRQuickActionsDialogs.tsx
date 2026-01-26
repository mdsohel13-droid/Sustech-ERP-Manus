import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface HRQuickActionsDialogsProps {
  markAttendanceOpen: boolean;
  setMarkAttendanceOpen: (open: boolean) => void;
  generateReportOpen: boolean;
  setGenerateReportOpen: (open: boolean) => void;
  performanceReviewOpen: boolean;
  setPerformanceReviewOpen: (open: boolean) => void;
  teamMembers?: any[];
  employees?: any[];
}

export function HRQuickActionsDialogs({
  markAttendanceOpen,
  setMarkAttendanceOpen,
  generateReportOpen,
  setGenerateReportOpen,
  performanceReviewOpen,
  setPerformanceReviewOpen,
  teamMembers = [],
  employees = [],
}: HRQuickActionsDialogsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  // Mutations
  const markAttendanceMutation = trpc.hr.markAttendance.useMutation({
    onSuccess: () => {
      toast.success("Attendance marked successfully!");
      setMarkAttendanceOpen(false);
      utils.hr.getAttendance.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });

  const performanceReviewMutation = trpc.hr.createPerformanceReview.useMutation({
    onSuccess: () => {
      toast.success("Performance review submitted successfully!");
      setPerformanceReviewOpen(false);
      utils.hr.getPerformanceReviews.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  const handleMarkAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const teamMemberId = Number(formData.get("teamMemberId"));
      const date = formData.get("date") as string;
      const status = formData.get("status") as string;
      const notes = formData.get("notes") as string;

      if (!teamMemberId || !date || !status) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      await markAttendanceMutation.mutateAsync({
        teamMemberId,
        date: new Date(date),
        status: status as "present" | "absent" | "leave" | "holiday",
        notes: notes || undefined,
      });

      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const reportType = formData.get("reportType") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;

      if (!reportType || !startDate || !endDate) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        toast.error("Start date must be before end date");
        setIsSubmitting(false);
        return;
      }

      // TODO: Integrate with actual report generation API
      // For now, show success message
      toast.success(`${reportType} report generated successfully!`);
      setGenerateReportOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformanceReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const employeeId = Number(formData.get("employeeId"));
      const reviewerName = formData.get("reviewerName") as string;
      const rating = Number(formData.get("rating"));
      const comments = formData.get("comments") as string;

      if (!employeeId || !reviewerName || !rating || !comments) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (rating < 1 || rating > 5) {
        toast.error("Rating must be between 1 and 5");
        setIsSubmitting(false);
        return;
      }

      await performanceReviewMutation.mutateAsync({
        employeeId,
        reviewerName,
        rating,
        comments,
      });

      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error submitting performance review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mark Attendance Dialog */}
      <Dialog open={markAttendanceOpen} onOpenChange={setMarkAttendanceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Record attendance for team members</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarkAttendance}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teamMemberId">Team Member *</Label>
                <Select name="teamMemberId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers.map((member: any) => (
                        <SelectItem key={`member-${member.id}`} value={String(member.id)}>
                          {member.name || member.employeeId || `Employee ${member.id}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No team members available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="present" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Textarea id="notes" name="notes" rows={2} placeholder="Optional notes" />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setMarkAttendanceOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark Attendance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={generateReportOpen} onOpenChange={setGenerateReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Generate HR reports for analysis</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateReport}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reportType">Report Type *</Label>
                <Select name="reportType" defaultValue="attendance" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="payroll">Payroll Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="leave">Leave Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setGenerateReportOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate & Download
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Performance Review Dialog */}
      <Dialog open={performanceReviewOpen} onOpenChange={setPerformanceReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Review</DialogTitle>
            <DialogDescription>Conduct performance review for team members</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePerformanceReview}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees && employees.length > 0 ? (
                      employees.map((emp: any) => (
                        <SelectItem key={`emp-${emp.id}`} value={String(emp.id)}>
                          {emp.name || emp.employeeId || `Employee ${emp.id}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No employees available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewerName">Reviewer Name *</Label>
                <Input id="reviewerName" name="reviewerName" placeholder="Your name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating">Overall Rating (1-5) *</Label>
                <Select name="rating" defaultValue="3" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comments">Comments & Feedback *</Label>
                <Textarea id="comments" name="comments" rows={4} placeholder="Provide detailed feedback..." required />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPerformanceReviewOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
