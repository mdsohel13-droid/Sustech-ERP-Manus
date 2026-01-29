import React, { createContext, useContext, useState, useCallback } from "react";
import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  addBreadcrumb: (item: BreadcrumbItem) => void;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
  navigateToBreadcrumb: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

/**
 * Breadcrumb Provider Component
 */
export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([
    { label: "Home", path: "/" },
  ]);
  const [, setLocation] = useLocation();

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbsState((prev) => {
      // Avoid duplicates
      if (prev.some((b) => b.path === item.path)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbsState(items);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbsState([{ label: "Home", path: "/" }]);
  }, []);

  const navigateToBreadcrumb = useCallback((path: string) => {
    setLocation(path);
    // Trim breadcrumbs to the clicked item
    setBreadcrumbsState((prev) => {
      const index = prev.findIndex((b) => b.path === path);
      if (index !== -1) {
        return prev.slice(0, index + 1);
      }
      return prev;
    });
  }, [setLocation]);

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        addBreadcrumb,
        setBreadcrumbs,
        clearBreadcrumbs,
        navigateToBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

/**
 * Hook to use breadcrumb context
 */
export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
}

/**
 * Breadcrumb Navigation Component
 */
export function BreadcrumbNavigation() {
  const { breadcrumbs, navigateToBreadcrumb } = useBreadcrumb();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if only home
  }

  return (
    <nav
      className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}

          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="flex items-center gap-1 text-gray-700 font-medium">
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </span>
          ) : (
            // Previous pages - clickable
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToBreadcrumb(item.path)}
              className="h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <span className="flex items-center gap-1">
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </span>
            </Button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Hook to set breadcrumbs for a specific page
 */
export function usePageBreadcrumbs(
  pageName: string,
  parentBreadcrumbs: BreadcrumbItem[] = []
) {
  const { setBreadcrumbs } = useBreadcrumb();

  React.useEffect(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", path: "/" },
      ...parentBreadcrumbs,
      { label: pageName, path: window.location.pathname },
    ];
    setBreadcrumbs(breadcrumbs);
  }, [pageName, parentBreadcrumbs, setBreadcrumbs]);
}

/**
 * Helper function to create breadcrumb items from module path
 */
export function createModuleBreadcrumb(
  moduleName: string,
  modulePath: string,
  icon?: React.ReactNode
): BreadcrumbItem {
  return {
    label: moduleName,
    path: modulePath,
    icon,
  };
}

/**
 * Predefined breadcrumb configurations for all modules
 */
export const MODULE_BREADCRUMBS: Record<string, BreadcrumbItem> = {
  sales: { label: "Sales", path: "/sales" },
  products: { label: "Products", path: "/products" },
  customers: { label: "CRM", path: "/crm" },
  purchases: { label: "Purchases", path: "/purchases" },
  inventory: { label: "Inventory", path: "/inventory" },
  financial: { label: "Financial", path: "/financial" },
  "income-expenditure": { label: "Income & Expenditure", path: "/income-expenditure" },
  budget: { label: "Budget", path: "/budget" },
  "tender-quotation": { label: "Tender/Quotation", path: "/tender-quotation" },
  projects: { label: "Projects", path: "/projects" },
  crm: { label: "CRM", path: "/crm" },
  "action-tracker": { label: "Action Tracker", path: "/action-tracker" },
  hr: { label: "Human Resource", path: "/hr" },
  reports: { label: "Reports", path: "/reports" },
  settings: { label: "Settings", path: "/settings" },
  "hyperlink-analytics": { label: "Hyperlink Analytics", path: "/hyperlink-analytics" },
};

/**
 * Get breadcrumb item by module name
 */
export function getModuleBreadcrumb(moduleName: string): BreadcrumbItem | undefined {
  return MODULE_BREADCRUMBS[moduleName.toLowerCase()];
}
