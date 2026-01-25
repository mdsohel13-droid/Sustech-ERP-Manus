import React, { ReactNode } from "react";
import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  getResponsiveGridClasses,
  getResponsivePadding,
  getResponsiveTextSize,
} from "@/lib/mobileOptimization";

/**
 * Mobile-Responsive Container
 * Auto-adjusts padding and width based on screen size
 */
export const ResponsiveContainer: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`${getResponsivePadding("px-3 py-2", "md:px-4 md:py-4", "lg:px-6 lg:py-6")} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile-Responsive Grid
 * Automatically adjusts columns based on screen size
 */
export const ResponsiveGrid: React.FC<{
  children: ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: string;
  className?: string;
}> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = "gap-4",
  className = "",
}) => {
  const gridClass = `grid grid-cols-${mobileColumns} md:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns} ${gap} ${className}`;

  return <div className={gridClass}>{children}</div>;
};

/**
 * Mobile-Responsive Card
 * Optimized for mobile viewing
 */
export const ResponsiveCard: React.FC<{
  children: ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className={`${getResponsivePadding("px-3 py-2", "md:px-4 md:py-3", "lg:px-6 lg:py-4")} border-b`}>
          <h3 className={`${getResponsiveTextSize("text-base", "md:text-lg", "lg:text-xl")} font-semibold`}>
            {title}
          </h3>
        </div>
      )}
      <div className={getResponsivePadding("p-3", "md:p-4", "lg:p-6")}>{children}</div>
    </div>
  );
};

/**
 * Mobile-Responsive Table
 * Stacks on mobile, displays as table on desktop
 */
export const ResponsiveTable: React.FC<{
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  className?: string;
}> = ({ headers, rows, className = "" }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white rounded-lg border p-3 space-y-2">
            {headers.map((header, colIndex) => (
              <div key={colIndex} className="flex justify-between items-start">
                <span className="font-medium text-sm">{header}</span>
                <span className="text-sm text-gray-600">{row[colIndex]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Mobile-Responsive Modal
 * Full screen on mobile, centered on desktop
 */
export const ResponsiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = "" }) => {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-t-lg md:rounded-lg shadow-lg ${
          isMobile ? "w-full max-h-[90vh]" : "w-full max-w-md max-h-[90vh]"
        } overflow-y-auto ${className}`}
      >
        {title && (
          <div className={`${getResponsivePadding("px-3 py-3", "md:px-4 md:py-4", "lg:px-6 lg:py-4")} border-b flex items-center justify-between`}>
            <h2 className={`${getResponsiveTextSize("text-lg", "md:text-xl", "lg:text-2xl")} font-semibold`}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className={getResponsivePadding("p-3", "md:p-4", "lg:p-6")}>{children}</div>
      </div>
    </div>
  );
};

/**
 * Mobile-Responsive Sidebar
 * Collapsible on mobile, visible on desktop
 */
export const ResponsiveSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}> = ({ isOpen, onClose, children, className = "" }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
        )}
        <div
          className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } ${className}`}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div className={`hidden md:block w-64 bg-white border-r ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile-Responsive Header
 * Stacks on mobile, horizontal on desktop
 */
export const ResponsiveHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, actions, className = "" }) => {
  return (
    <div className={`${getResponsivePadding("px-3 py-3", "md:px-4 md:py-4", "lg:px-6 lg:py-6")} border-b ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className={`${getResponsiveTextSize("text-2xl", "md:text-3xl", "lg:text-4xl")} font-bold`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`${getResponsiveTextSize("text-xs", "md:text-sm", "lg:text-base")} text-gray-600 mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};

/**
 * Mobile-Responsive Tabs
 * Scrollable on mobile, normal on desktop
 */
export const ResponsiveTabs: React.FC<{
  tabs: Array<{ label: string; content: ReactNode }>;
  className?: string;
}> = ({ tabs, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const isMobile = useIsMobile();

  return (
    <div className={className}>
      <div className={`${isMobile ? "overflow-x-auto" : ""} border-b`}>
        <div className="flex gap-2 md:gap-4 px-3 md:px-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-2 md:px-4 whitespace-nowrap text-sm md:text-base font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className={getResponsivePadding("p-3", "md:p-4", "lg:p-6")}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

/**
 * Mobile-Responsive List
 * Optimized for mobile viewing
 */
export const ResponsiveList: React.FC<{
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  }>;
  className?: string;
}> = ({ items, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border p-3 md:p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
            <div className="flex-1 min-w-0">
              <p className={`${getResponsiveTextSize("text-sm", "md:text-base", "lg:text-lg")} font-medium truncate`}>
                {item.title}
              </p>
              {item.subtitle && (
                <p className={`${getResponsiveTextSize("text-xs", "md:text-sm", "lg:text-base")} text-gray-600 truncate`}>
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
          {item.action && <div className="flex-shrink-0">{item.action}</div>}
        </div>
      ))}
    </div>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveTable,
  ResponsiveModal,
  ResponsiveSidebar,
  ResponsiveHeader,
  ResponsiveTabs,
  ResponsiveList,
};
