/**
 * Hyperlink Utilities for Cross-Module Navigation and Analytics
 */

export interface HyperlinkClickEvent {
  moduleFrom: string;
  moduleTo: string;
  fieldName: string;
  recordId: string | number;
  recordName: string;
  timestamp: number;
  userId?: string;
}

export interface HyperlinkAnalytics {
  totalClicks: number;
  clicksByModule: Record<string, number>;
  clicksByField: Record<string, number>;
  navigationPaths: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  topHyperlinks: Array<{
    field: string;
    module: string;
    clicks: number;
  }>;
}

/**
 * Hyperlink Analytics Manager
 */
class HyperlinkAnalyticsManager {
  private events: HyperlinkClickEvent[] = [];
  private maxEvents = 10000; // Keep last 10000 events

  /**
   * Track a hyperlink click
   */
  trackClick(event: HyperlinkClickEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Persist to localStorage
    this.persistEvents();
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): HyperlinkAnalytics {
    const clicksByModule: Record<string, number> = {};
    const clicksByField: Record<string, number> = {};
    const navigationPaths: Record<string, number> = {};

    this.events.forEach((event) => {
      // Count clicks by module
      clicksByModule[event.moduleFrom] = (clicksByModule[event.moduleFrom] || 0) + 1;

      // Count clicks by field
      const fieldKey = `${event.moduleFrom}.${event.fieldName}`;
      clicksByField[fieldKey] = (clicksByField[fieldKey] || 0) + 1;

      // Count navigation paths
      const pathKey = `${event.moduleFrom} → ${event.moduleTo}`;
      navigationPaths[pathKey] = (navigationPaths[pathKey] || 0) + 1;
    });

    // Convert to arrays and sort
    const navigationPathsArray = Object.entries(navigationPaths)
      .map(([path, count]) => {
        const [from, to] = path.split(" → ");
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count);

    const topHyperlinks = Object.entries(clicksByField)
      .map(([key, clicks]) => {
        const [module, field] = key.split(".");
        return { field, module, clicks };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20); // Top 20

    return {
      totalClicks: this.events.length,
      clicksByModule,
      clicksByField,
      navigationPaths: navigationPathsArray,
      topHyperlinks,
    };
  }

  /**
   * Get events for a specific module
   */
  getModuleEvents(module: string): HyperlinkClickEvent[] {
    return this.events.filter((e) => e.moduleFrom === module);
  }

  /**
   * Get navigation paths from one module to another
   */
  getNavigationPaths(fromModule: string, toModule?: string): HyperlinkClickEvent[] {
    return this.events.filter((e) => {
      if (toModule) {
        return e.moduleFrom === fromModule && e.moduleTo === toModule;
      }
      return e.moduleFrom === fromModule;
    });
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem("hyperlinkAnalytics");
  }

  /**
   * Persist events to localStorage
   */
  private persistEvents(): void {
    try {
      localStorage.setItem("hyperlinkAnalytics", JSON.stringify(this.events));
    } catch (error) {
      console.warn("Failed to persist hyperlink analytics:", error);
    }
  }

  /**
   * Load events from localStorage
   */
  loadEvents(): void {
    try {
      const stored = localStorage.getItem("hyperlinkAnalytics");
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load hyperlink analytics:", error);
    }
  }

  /**
   * Export analytics as JSON
   */
  exportAnalytics(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        analytics: this.getAnalytics(),
        events: this.events.slice(-1000), // Last 1000 events
      },
      null,
      2
    );
  }
}

// Singleton instance
export const hyperlinkAnalytics = new HyperlinkAnalyticsManager();

/**
 * Cross-Module Navigation Routes
 */
export const crossModuleRoutes: Record<string, Record<string, string>> = {
  Sales: {
    customer: "/crm",
    product: "/products",
    project: "/projects",
  },
  Products: {
    supplier: "/procurement",
    category: "/products",
  },
  CRM: {
    sales: "/sales",
    projects: "/projects",
    company: "/crm",
    contact: "/crm",
  },
  Procurement: {
    vendor: "/crm",
    product: "/products",
    inventory: "/inventory",
  },
  Inventory: {
    warehouse: "/inventory",
    product: "/products",
    purchase: "/procurement",
  },
  Financial: {
    invoice: "/financial",
    vendor: "/crm",
    account: "/financial",
  },
  "Income & Expenditure": {
    account: "/financial",
    category: "/financial",
  },
  Budget: {
    department: "/hr",
    category: "/financial",
  },
  "Tender/Quotation": {
    vendor: "/crm",
    item: "/products",
  },
  Projects: {
    customer: "/crm",
    team: "/hr",
    financial: "/financial",
  },
  "Action Tracker": {
    assignee: "/hr",
    project: "/projects",
  },
  HR: {
    department: "/hr",
    employee: "/hr",
  },
  "Reporting & Analytics": {
    dashboard: "/dashboard",
    metric: "/dashboard",
  },
};

/**
 * Get navigation route for a hyperlink
 */
export function getNavigationRoute(
  fromModule: string,
  fieldType: string
): string | null {
  const routes = crossModuleRoutes[fromModule];
  if (routes && routes[fieldType.toLowerCase()]) {
    return routes[fieldType.toLowerCase()];
  }
  return null;
}

/**
 * Format module name for display
 */
export function formatModuleName(module: string): string {
  return module
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get module icon based on module name
 */
export function getModuleIcon(module: string): string {
  const icons: Record<string, string> = {
    Sales: "📊",
    Products: "📦",
    Customers: "👥",
    Purchases: "🛒",
    Inventory: "📦",
    Financial: "💰",
    "Income & Expenditure": "💵",
    Budget: "💳",
    "Tender/Quotation": "📋",
    Projects: "🏗️",
    CRM: "📞",
    "Action Tracker": "✅",
    HR: "👔",
    "Reporting & Analytics": "📈",
    Dashboard: "📊",
    "Alerts Dashboard": "🚨",
    "Workflow Execution": "⚙️",
    "Admin Settings": "⚙️",
    "Reports Export": "📄",
  };
  return icons[module] || "🔗";
}

/**
 * Hyperlink context helper
 */
export interface HyperlinkContext {
  moduleFrom: string;
  moduleTo?: string;
  fieldName: string;
  recordId: string | number;
  recordName: string;
  action?: "edit" | "view" | "navigate";
}

/**
 * Create hyperlink context
 */
export function createHyperlinkContext(
  moduleFrom: string,
  fieldName: string,
  recordId: string | number,
  recordName: string,
  action: "edit" | "view" | "navigate" = "edit"
): HyperlinkContext {
  return {
    moduleFrom,
    fieldName,
    recordId,
    recordName,
    action,
  };
}

/**
 * Handle hyperlink click with analytics
 */
export function handleHyperlinkClick(
  context: HyperlinkContext,
  onNavigate?: (route: string) => void
): void {
  // Determine target module
  const route = getNavigationRoute(context.moduleFrom, context.fieldName);
  const moduleTo = route?.split("/")[1] || context.moduleFrom;

  // Track the click
  hyperlinkAnalytics.trackClick({
    moduleFrom: context.moduleFrom,
    moduleTo,
    fieldName: context.fieldName,
    recordId: context.recordId,
    recordName: context.recordName,
    timestamp: Date.now(),
  });

  // Navigate if callback provided
  if (onNavigate && route) {
    onNavigate(route);
  }
}
