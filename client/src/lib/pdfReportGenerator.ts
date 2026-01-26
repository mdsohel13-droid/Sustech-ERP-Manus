import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface AttendanceRecord {
  date: string;
  teamMember: { id: number; name: string };
  status: string;
  notes?: string;
}

interface ReportOptions {
  title: string;
  subtitle?: string;
  startDate: string;
  endDate: string;
  generatedBy?: string;
  generatedAt?: string;
}

/**
 * Generate PDF report for attendance records
 */
export function generateAttendanceReport(
  records: AttendanceRecord[],
  options: ReportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.text(options.title, margin, yPosition);
  yPosition += 10;

  if (options.subtitle) {
    doc.setFontSize(12);
    doc.text(options.subtitle, margin, yPosition);
    yPosition += 8;
  }

  // Report Info
  doc.setFontSize(10);
  doc.text(`Period: ${options.startDate} to ${options.endDate}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${options.generatedAt || new Date().toLocaleString()}`, margin, yPosition);
  if (options.generatedBy) {
    yPosition += 5;
    doc.text(`By: ${options.generatedBy}`, margin, yPosition);
  }
  yPosition += 10;

  // Summary Statistics
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const leaveCount = records.filter(r => r.status === "leave").length;
  const holidayCount = records.filter(r => r.status === "holiday").length;

  doc.setFontSize(11);
  doc.text("Summary Statistics:", margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.text(`• Total Records: ${records.length}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`• Present: ${presentCount}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`• Absent: ${absentCount}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`• Leave: ${leaveCount}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`• Holiday: ${holidayCount}`, margin + 5, yPosition);
  yPosition += 10;

  // Table Data
  const tableData = records.map(record => [
    record.date,
    record.teamMember.name,
    record.status.charAt(0).toUpperCase() + record.status.slice(1),
    record.notes || "-"
  ]);

  // Add table
  (doc as any).autoTable({
    head: [["Date", "Employee", "Status", "Notes"]],
    body: tableData,
    startY: yPosition,
    margin: margin,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - margin
    );
  }

  return doc;
}

/**
 * Generate PDF report for payroll/salary data
 */
export function generatePayrollReport(
  employees: any[],
  options: ReportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.text(options.title, margin, yPosition);
  yPosition += 10;

  // Report Info
  doc.setFontSize(10);
  doc.text(`Period: ${options.startDate} to ${options.endDate}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${options.generatedAt || new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Table Data
  const tableData = employees.map(emp => [
    emp.name || "N/A",
    emp.employeeId || "N/A",
    emp.designation || "N/A",
    emp.salary ? `${emp.salary.toLocaleString()}` : "N/A",
    emp.department || "N/A",
  ]);

  // Add table
  (doc as any).autoTable({
    head: [["Employee Name", "ID", "Designation", "Salary", "Department"]],
    body: tableData,
    startY: yPosition,
    margin: margin,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  return doc;
}

/**
 * Generate PDF report for performance reviews
 */
export function generatePerformanceReport(
  reviews: any[],
  options: ReportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.text(options.title, margin, yPosition);
  yPosition += 10;

  // Report Info
  doc.setFontSize(10);
  doc.text(`Period: ${options.startDate} to ${options.endDate}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${options.generatedAt || new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Table Data
  const tableData = reviews.map(review => [
    review.employeeName || "N/A",
    review.rating ? `${review.rating}/5` : "N/A",
    review.comments || "N/A",
    review.reviewDate || "N/A",
  ]);

  // Add table
  (doc as any).autoTable({
    head: [["Employee", "Rating", "Comments", "Review Date"]],
    body: tableData,
    startY: yPosition,
    margin: margin,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  return doc;
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
