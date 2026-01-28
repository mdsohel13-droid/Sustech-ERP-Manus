import { TRPCError } from "@trpc/server";

export interface KPIUpdateInput {
  totalRevenue?: number;
  activeCustomers?: number;
  totalOrders?: number;
  inventoryValue?: number;
}

export interface DoubleEntryResult {
  success: boolean;
  verified: boolean;
  discrepancies?: string[];
}

export async function verifyKPIUpdate(
  db: any,
  expectedValues: KPIUpdateInput
): Promise<DoubleEntryResult> {
  const discrepancies: string[] = [];
  
  const actualKPIs = await db.getDashboardKPIs();
  
  if (expectedValues.totalRevenue !== undefined) {
    const diff = Math.abs(actualKPIs.totalRevenue - expectedValues.totalRevenue);
    if (diff > 0.01) {
      discrepancies.push(
        `Revenue mismatch: expected ${expectedValues.totalRevenue}, got ${actualKPIs.totalRevenue}`
      );
    }
  }
  
  if (expectedValues.activeCustomers !== undefined) {
    if (actualKPIs.activeCustomers !== expectedValues.activeCustomers) {
      discrepancies.push(
        `Customer count mismatch: expected ${expectedValues.activeCustomers}, got ${actualKPIs.activeCustomers}`
      );
    }
  }
  
  if (expectedValues.totalOrders !== undefined) {
    if (actualKPIs.totalOrders !== expectedValues.totalOrders) {
      discrepancies.push(
        `Order count mismatch: expected ${expectedValues.totalOrders}, got ${actualKPIs.totalOrders}`
      );
    }
  }
  
  if (expectedValues.inventoryValue !== undefined) {
    const diff = Math.abs(actualKPIs.inventoryValue - expectedValues.inventoryValue);
    if (diff > 0.01) {
      discrepancies.push(
        `Inventory value mismatch: expected ${expectedValues.inventoryValue}, got ${actualKPIs.inventoryValue}`
      );
    }
  }
  
  return {
    success: discrepancies.length === 0,
    verified: true,
    discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
  };
}

export async function executeWithTransaction<T>(
  pool: any,
  operation: (client: any) => Promise<T>,
  rollbackOnError: boolean = true
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const result = await operation(client);
    
    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (rollbackOnError) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function executeKPIUpdateWithVerification(
  db: any,
  pool: any,
  operation: () => Promise<any>,
  expectedChange: {
    field: "revenue" | "customers" | "orders" | "inventory";
    delta: number;
  }
): Promise<{ success: boolean; result: any; verification: DoubleEntryResult }> {
  const beforeKPIs = await db.getDashboardKPIs();
  
  return await executeWithTransaction(pool, async (client) => {
    const result = await operation();
    
    const afterKPIs = await db.getDashboardKPIs();
    
    let expectedValue: number;
    let actualValue: number;
    let fieldName: string;
    
    switch (expectedChange.field) {
      case "revenue":
        expectedValue = beforeKPIs.totalRevenue + expectedChange.delta;
        actualValue = afterKPIs.totalRevenue;
        fieldName = "Total Revenue";
        break;
      case "customers":
        expectedValue = beforeKPIs.activeCustomers + expectedChange.delta;
        actualValue = afterKPIs.activeCustomers;
        fieldName = "Active Customers";
        break;
      case "orders":
        expectedValue = beforeKPIs.totalOrders + expectedChange.delta;
        actualValue = afterKPIs.totalOrders;
        fieldName = "Total Orders";
        break;
      case "inventory":
        expectedValue = beforeKPIs.inventoryValue + expectedChange.delta;
        actualValue = afterKPIs.inventoryValue;
        fieldName = "Inventory Value";
        break;
    }
    
    const tolerance = expectedChange.field === "customers" || expectedChange.field === "orders" ? 0 : 0.01;
    const diff = Math.abs(actualValue - expectedValue);
    
    const verification: DoubleEntryResult = {
      success: diff <= tolerance,
      verified: true,
      discrepancies: diff > tolerance 
        ? [`${fieldName}: expected ${expectedValue}, got ${actualValue} (delta: ${diff})`]
        : undefined,
    };
    
    if (!verification.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Double-entry verification failed: ${verification.discrepancies?.join(", ")}`,
      });
    }
    
    return { success: true, result, verification };
  });
}

export function validateFinancialAmount(amount: number | string, fieldName: string): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be a valid number`,
    });
  }
  
  if (numAmount < 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} cannot be negative`,
    });
  }
  
  if (!isFinite(numAmount)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be a finite number`,
    });
  }
  
  if (numAmount > 999999999999.99) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} exceeds maximum allowed value`,
    });
  }
  
  return Math.round(numAmount * 100) / 100;
}
