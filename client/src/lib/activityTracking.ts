/**
 * User Activity Tracking and Audit Logs System
 * 
 * Tracks all user actions for compliance, auditing, and analytics purposes.
 */

export type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "IMPORT"
  | "DOWNLOAD"
  | "SHARE"
  | "COMMENT"
  | "APPROVE"
  | "REJECT"
  | "NAVIGATE"
  | "SEARCH"
  | "FILTER"
  | "SETTINGS_CHANGE"
  | "REPORT_GENERATE"
  | "WORKFLOW_TRIGGER";

export type ResourceType =
  | "Sales"
  | "Products"
  | "Customers"
  | "Purchases"
  | "Inventory"
  | "Financial"
  | "Income & Expenditure"
  | "Budget"
  | "Tender/Quotation"
  | "Projects"
  | "CRM"
  | "Action Tracker"
  | "HR"
  | "Reports"
  | "Settings"
  | "Dashboard"
  | "Alerts"
  | "Workflow";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  activityType: ActivityType;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  description: string;
  changes?: {
    field: string;
    oldValue: string | number | boolean;
    newValue: string | number | boolean;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
  timestamp: Date;
  duration?: number; // in milliseconds
  metadata?: Record<string, any>;
}

export interface AuditSummary {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByResource: Record<ResourceType, number>;
  activitiesByUser: Record<string, number>;
  successRate: number;
  failureCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Activity Tracking Manager
 * Handles logging, querying, and reporting of user activities
 */
export class ActivityTracker {
  private logs: ActivityLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory
  private listeners: Array<(log: ActivityLog) => void> = [];

  /**
   * Log a user activity
   */
  logActivity(activity: Omit<ActivityLog, "id" | "timestamp">): ActivityLog {
    const log: ActivityLog = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Add to logs
    this.logs.push(log);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(log));

    // Persist to localStorage
    this.persistLog(log);

    return log;
  }

  /**
   * Get all activity logs
   */
  getAllLogs(): ActivityLog[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by criteria
   */
  getLogs(filters: {
    userId?: string;
    activityType?: ActivityType;
    resourceType?: ResourceType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): ActivityLog[] {
    let result = [...this.logs];

    if (filters.userId) {
      result = result.filter((log) => log.userId === filters.userId);
    }

    if (filters.activityType) {
      result = result.filter((log) => log.activityType === filters.activityType);
    }

    if (filters.resourceType) {
      result = result.filter((log) => log.resourceType === filters.resourceType);
    }

    if (filters.startDate) {
      result = result.filter((log) => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter((log) => log.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    return result.slice(offset, offset + limit);
  }

  /**
   * Get audit summary
   */
  getAuditSummary(startDate?: Date, endDate?: Date): AuditSummary {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate || new Date();

    const filtered = this.logs.filter((log) => log.timestamp >= start && log.timestamp <= end);

    const summary: AuditSummary = {
      totalActivities: filtered.length,
      activitiesByType: {} as Record<ActivityType, number>,
      activitiesByResource: {} as Record<ResourceType, number>,
      activitiesByUser: {} as Record<string, number>,
      successRate: 0,
      failureCount: 0,
      dateRange: { start, end },
    };

    filtered.forEach((log) => {
      // Count by type
      summary.activitiesByType[log.activityType] = (summary.activitiesByType[log.activityType] || 0) + 1;

      // Count by resource
      summary.activitiesByResource[log.resourceType] = (summary.activitiesByResource[log.resourceType] || 0) + 1;

      // Count by user
      summary.activitiesByUser[log.userName] = (summary.activitiesByUser[log.userName] || 0) + 1;

      // Count failures
      if (log.status === "failure") {
        summary.failureCount += 1;
      }
    });

    // Calculate success rate
    summary.successRate = filtered.length > 0 ? ((filtered.length - summary.failureCount) / filtered.length) * 100 : 0;

    return summary;
  }

  /**
   * Get user activity history
   */
  getUserActivityHistory(userId: string, limit = 100): ActivityLog[] {
    return this.getLogs({ userId, limit });
  }

  /**
   * Get resource change history
   */
  getResourceHistory(resourceType: ResourceType, resourceId: string): ActivityLog[] {
    return this.logs
      .filter((log) => log.resourceType === resourceType && log.resourceId === resourceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Subscribe to activity changes
   */
  subscribe(listener: (log: ActivityLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem("activity-logs");
  }

  /**
   * Export logs as JSON
   */
  exportLogs(filters?: Parameters<typeof this.getLogs>[0]): string {
    const logs = filters ? this.getLogs(filters) : this.logs;
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Persist log to localStorage
   */
  private persistLog(log: ActivityLog): void {
    try {
      const stored = localStorage.getItem("activity-logs") || "[]";
      const logs = JSON.parse(stored);
      logs.push(log);
      // Keep only last 1000 logs in localStorage
      const trimmed = logs.slice(-1000);
      localStorage.setItem("activity-logs", JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to persist activity log:", error);
    }
  }

  /**
   * Load persisted logs from localStorage
   */
  loadPersistedLogs(): void {
    try {
      const stored = localStorage.getItem("activity-logs");
      if (stored) {
        const logs = JSON.parse(stored);
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load persisted activity logs:", error);
    }
  }
}

/**
 * Global activity tracker instance
 */
export const globalActivityTracker = new ActivityTracker();

/**
 * Helper function to log activity
 */
export function logActivity(
  activityType: ActivityType,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  description: string,
  options?: {
    changes?: ActivityLog["changes"];
    status?: "success" | "failure";
    errorMessage?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }
): ActivityLog {
  // Get current user info (would come from auth context in real app)
  const currentUser = {
    id: "user-123",
    name: "Md. Sohel Sikder",
    email: "sohel@sustech.com",
  };

  return globalActivityTracker.logActivity({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    activityType,
    resourceType,
    resourceId,
    resourceName,
    description,
    status: options?.status || "success",
    changes: options?.changes,
    errorMessage: options?.errorMessage,
    duration: options?.duration,
    metadata: options?.metadata,
    ipAddress: "192.168.1.1", // Would get from server
    userAgent: navigator.userAgent,
  });
}

/**
 * Activity logging hooks for common operations
 */
export const ActivityHooks = {
  /**
   * Log view activity
   */
  logView: (resourceType: ResourceType, resourceId: string, resourceName: string) => {
    logActivity("VIEW", resourceType, resourceId, resourceName, `Viewed ${resourceName}`);
  },

  /**
   * Log create activity
   */
  logCreate: (resourceType: ResourceType, resourceId: string, resourceName: string, metadata?: any) => {
    logActivity("CREATE", resourceType, resourceId, resourceName, `Created ${resourceName}`, { metadata });
  },

  /**
   * Log update activity
   */
  logUpdate: (
    resourceType: ResourceType,
    resourceId: string,
    resourceName: string,
    changes?: ActivityLog["changes"]
  ) => {
    logActivity("UPDATE", resourceType, resourceId, resourceName, `Updated ${resourceName}`, { changes });
  },

  /**
   * Log delete activity
   */
  logDelete: (resourceType: ResourceType, resourceId: string, resourceName: string) => {
    logActivity("DELETE", resourceType, resourceId, resourceName, `Deleted ${resourceName}`);
  },

  /**
   * Log export activity
   */
  logExport: (resourceType: ResourceType, format: string, count: number) => {
    logActivity(
      "EXPORT",
      resourceType,
      `export-${Date.now()}`,
      `${resourceType} Export`,
      `Exported ${count} records as ${format}`
    );
  },

  /**
   * Log navigation activity
   */
  logNavigation: (fromModule: string, toModule: string) => {
    logActivity(
      "NAVIGATE",
      "Dashboard" as ResourceType,
      `nav-${Date.now()}`,
      `${fromModule} → ${toModule}`,
      `Navigated from ${fromModule} to ${toModule}`
    );
  },

  /**
   * Log search activity
   */
  logSearch: (resourceType: ResourceType, query: string, resultCount: number) => {
    logActivity(
      "SEARCH",
      resourceType,
      `search-${Date.now()}`,
      `Search: ${query}`,
      `Searched for "${query}" in ${resourceType} (${resultCount} results)`
    );
  },

  /**
   * Log approval activity
   */
  logApproval: (resourceType: ResourceType, resourceId: string, resourceName: string, comment?: string) => {
    logActivity("APPROVE", resourceType, resourceId, resourceName, `Approved ${resourceName}`, {
      metadata: { comment },
    });
  },

  /**
   * Log rejection activity
   */
  logRejection: (resourceType: ResourceType, resourceId: string, resourceName: string, reason?: string) => {
    logActivity("REJECT", resourceType, resourceId, resourceName, `Rejected ${resourceName}`, {
      metadata: { reason },
    });
  },
};

// Load persisted logs on initialization
globalActivityTracker.loadPersistedLogs();

export default ActivityTracker;
