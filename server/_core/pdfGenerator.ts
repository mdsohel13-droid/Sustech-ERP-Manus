// Brand Colors
const BRAND_COLORS = {
  blue: "#0052CC",
  golden: "#D4AF37",
  green: "#00A651",
};

export interface QuotationData {
  quotationId: string;
  date: Date;
  validUntil: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
}

export interface InvoiceData {
  invoiceId: string;
  date: Date;
  dueDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

function generateQuotationHTML(data: QuotationData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">৳${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">৳${item.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid ${BRAND_COLORS.blue}; padding-bottom: 20px; }
        .company-info h1 { color: ${BRAND_COLORS.blue}; margin: 0; font-size: 28px; }
        .company-info p { color: ${BRAND_COLORS.green}; margin: 5px 0; }
        .quotation-title { text-align: right; }
        .quotation-title h2 { color: ${BRAND_COLORS.blue}; margin: 0; font-size: 24px; }
        .quotation-title p { margin: 5px 0; }
        .info-section { display: flex; justify-content: space-between; margin: 30px 0; }
        .info-block { width: 48%; }
        .info-block h3 { color: ${BRAND_COLORS.blue}; margin-top: 0; }
        .dates { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
        .date-item { flex: 1; }
        .date-item strong { color: ${BRAND_COLORS.blue}; }
        .date-item.highlight strong { color: ${BRAND_COLORS.golden}; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background-color: ${BRAND_COLORS.blue}; color: white; padding: 12px; text-align: left; }
        th:last-child { text-align: right; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        td:last-child { text-align: right; }
        .totals { width: 50%; margin-left: auto; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .total-row.grand-total { background-color: ${BRAND_COLORS.green}; color: white; font-size: 18px; font-weight: bold; padding: 15px; margin-top: 10px; }
        .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid ${BRAND_COLORS.golden}; }
        .notes h4 { color: ${BRAND_COLORS.blue}; margin-top: 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid ${BRAND_COLORS.blue}; }
        .footer p { margin: 5px 0; color: ${BRAND_COLORS.blue}; }
        .footer .tagline { color: ${BRAND_COLORS.golden}; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>SUSTECH</h1>
          <p>Sustainable Technology Solutions</p>
        </div>
        <div class="quotation-title">
          <h2>QUOTATION</h2>
          <p><strong>Quotation #:</strong> ${data.quotationId}</p>
        </div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3 style="color: ${BRAND_COLORS.blue};">FROM:</h3>
          <strong>SUSTECH</strong><br>
          Dhaka, Bangladesh<br>
          info@sustech.com.bd
        </div>
        <div class="info-block">
          <h3 style="color: ${BRAND_COLORS.blue};">TO:</h3>
          <strong>${data.customerName}</strong><br>
          ${data.customerAddress}<br>
          ${data.customerEmail}<br>
          ${data.customerPhone}
        </div>
      </div>

      <div class="dates">
        <div class="date-item">
          <strong>Date:</strong> ${data.date.toLocaleDateString()}
        </div>
        <div class="date-item highlight">
          <strong>Valid Until:</strong> ${data.validUntil.toLocaleDateString()}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>৳${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (15%):</span>
          <span>৳${data.tax.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>৳${data.total.toFixed(2)}</span>
        </div>
      </div>

      ${
        data.notes
          ? `
      <div class="notes">
        <h4>Notes:</h4>
        <p>${data.notes}</p>
      </div>
      `
          : ""
      }

      ${
        data.terms
          ? `
      <div class="notes" style="border-left-color: ${BRAND_COLORS.blue};">
        <h4>Terms & Conditions:</h4>
        <p>${data.terms}</p>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p class="tagline">Thank you for your business!</p>
        <p>SUSTECH | Sustainable Technology Solutions | www.sustech.com.bd</p>
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">৳${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">৳${item.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid ${BRAND_COLORS.blue}; padding-bottom: 20px; }
        .company-info h1 { color: ${BRAND_COLORS.blue}; margin: 0; font-size: 28px; }
        .company-info p { color: ${BRAND_COLORS.green}; margin: 5px 0; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { color: ${BRAND_COLORS.blue}; margin: 0; font-size: 24px; }
        .invoice-title p { margin: 5px 0; }
        .info-section { display: flex; justify-content: space-between; margin: 30px 0; }
        .info-block { width: 48%; }
        .info-block h3 { color: ${BRAND_COLORS.blue}; margin-top: 0; }
        .dates { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
        .date-item { flex: 1; }
        .date-item strong { color: ${BRAND_COLORS.blue}; }
        .date-item.highlight strong { color: ${BRAND_COLORS.golden}; }
        .date-item.status strong { color: ${BRAND_COLORS.green}; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background-color: ${BRAND_COLORS.blue}; color: white; padding: 12px; text-align: left; }
        th:last-child { text-align: right; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        td:last-child { text-align: right; }
        .totals { width: 50%; margin-left: auto; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .total-row.grand-total { background-color: ${BRAND_COLORS.green}; color: white; font-size: 18px; font-weight: bold; padding: 15px; margin-top: 10px; }
        .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid ${BRAND_COLORS.golden}; }
        .notes h4 { color: ${BRAND_COLORS.blue}; margin-top: 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid ${BRAND_COLORS.blue}; }
        .footer p { margin: 5px 0; color: ${BRAND_COLORS.blue}; }
        .footer .tagline { color: ${BRAND_COLORS.golden}; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>SUSTECH</h1>
          <p>Sustainable Technology Solutions</p>
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${data.invoiceId}</p>
        </div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3 style="color: ${BRAND_COLORS.blue};">FROM:</h3>
          <strong>SUSTECH</strong><br>
          Dhaka, Bangladesh<br>
          info@sustech.com.bd
        </div>
        <div class="info-block">
          <h3 style="color: ${BRAND_COLORS.blue};">BILL TO:</h3>
          <strong>${data.customerName}</strong><br>
          ${data.customerAddress}<br>
          ${data.customerEmail}<br>
          ${data.customerPhone}
        </div>
      </div>

      <div class="dates">
        <div class="date-item">
          <strong>Invoice Date:</strong> ${data.date.toLocaleDateString()}
        </div>
        <div class="date-item highlight">
          <strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}
        </div>
        <div class="date-item status">
          <strong>Status:</strong> PENDING
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>৳${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (15%):</span>
          <span>৳${data.tax.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL DUE:</span>
          <span>৳${data.total.toFixed(2)}</span>
        </div>
      </div>

      ${
        data.paymentTerms
          ? `
      <div class="notes">
        <h4>Payment Terms:</h4>
        <p>${data.paymentTerms}</p>
      </div>
      `
          : ""
      }

      ${
        data.notes
          ? `
      <div class="notes" style="border-left-color: ${BRAND_COLORS.blue};">
        <h4>Notes:</h4>
        <p>${data.notes}</p>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p class="tagline">Thank you for your business!</p>
        <p>SUSTECH | Sustainable Technology Solutions | www.sustech.com.bd</p>
        <p style="font-size: 12px; font-style: italic;">Payment should be made within 30 days of invoice date</p>
      </div>
    </body>
    </html>
  `;
}

export async function generateQuotationPDF(data: QuotationData): Promise<string> {
  return generateQuotationHTML(data);
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  return generateInvoiceHTML(data);
}
