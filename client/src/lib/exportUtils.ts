import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Generate headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    csvHeaders.join(","), // Header row
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    )
  ];

  const csvContent = csvRows.join("\n");
  
  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export HTML element to PDF
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  options?: {
    orientation?: "portrait" | "landscape";
    format?: "a4" | "letter";
  }
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    // Capture element as canvas with RGB fallback for OKLCH colors
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#faf8f5', // Cream background fallback for OKLCH
      onclone: (clonedDoc) => {
        // Force all elements to use computed RGB colors
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const computed = window.getComputedStyle(el);
            // Force browser to resolve OKLCH to RGB
            if (computed.backgroundColor) {
              el.style.backgroundColor = computed.backgroundColor;
            }
            if (computed.color) {
              el.style.color = computed.color;
            }
            if (computed.borderColor) {
              el.style.borderColor = computed.borderColor;
            }
          }
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: options?.orientation || "portrait",
      unit: "mm",
      format: options?.format || "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

/**
 * Export table data to PDF with custom formatting
 */
export function exportTableToPDF(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string
) {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(title, 14, 15);
  
  // Add timestamp
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  
  // Calculate column widths
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const tableWidth = pageWidth - (margin * 2);
  const colWidth = tableWidth / headers.length;
  
  let yPos = 30;
  
  // Draw headers
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  headers.forEach((header, i) => {
    pdf.text(header, margin + (i * colWidth), yPos);
  });
  
  // Draw rows
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  yPos += 7;
  
  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (yPos > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      yPos = 20;
    }
    
    row.forEach((cell, colIndex) => {
      pdf.text(String(cell || ""), margin + (colIndex * colWidth), yPos);
    });
    
    yPos += 7;
  });
  
  pdf.save(`${filename}.pdf`);
}

/**
 * Format data for export by converting dates and removing internal fields
 */
export function formatDataForExport(data: any[]): any[] {
  return data.map(item => {
    const formatted: any = {};
    
    Object.entries(item).forEach(([key, value]) => {
      // Skip internal fields
      if (key === "id" || key === "userId") return;
      
      // Format dates
      if (value instanceof Date) {
        formatted[key] = value.toLocaleDateString();
      } else if (typeof value === "string" && !isNaN(Date.parse(value))) {
        // Check if string is a valid date
        const date = new Date(value);
        if (date.getFullYear() > 2000) {
          formatted[key] = date.toLocaleDateString();
        } else {
          formatted[key] = value;
        }
      } else {
        formatted[key] = value;
      }
    });
    
    return formatted;
  });
}
