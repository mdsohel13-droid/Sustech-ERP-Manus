import { ENV } from "./env";

export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    const { phoneNumber, message } = options;
    
    // Validate phone number format
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      console.error("Invalid phone number provided");
      return false;
    }

    // Construct SMS API URL with parameters
    const apiUrl = new URL(process.env.MAESTRO_SMS_API_URL || "");
    apiUrl.searchParams.append("api_key", process.env.MAESTRO_SMS_API_KEY || "");
    apiUrl.searchParams.append("type", "text");
    apiUrl.searchParams.append("contacts", phoneNumber);
    apiUrl.searchParams.append("senderid", process.env.MAESTRO_SMS_SENDER_ID || "");
    apiUrl.searchParams.append("msg", message);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`SMS API error: ${response.status} ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log("SMS sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

export async function sendOverdueInvoiceReminder(
  customerName: string,
  phoneNumber: string,
  invoiceAmount: number,
  daysOverdue: number
): Promise<boolean> {
  const message = `Hi ${customerName}, your invoice of ৳${invoiceAmount} is ${daysOverdue} days overdue. Please settle the payment at your earliest convenience. Thank you!`;
  
  return sendSMS({
    phoneNumber,
    message,
  });
}
