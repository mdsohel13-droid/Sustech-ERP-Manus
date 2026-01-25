import React from 'react';
import { useRouter } from 'wouter';
import { getNavigationUrl, getHyperlinkMetadata } from '@/lib/crossModuleNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CrossModuleHyperlinkProps {
  module: string;
  id: number | string;
  label: string;
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
  variant?: 'link' | 'button' | 'badge';
}

/**
 * Reusable Hyperlink component for cross-module navigation
 * Enables clicking on any data item to navigate to its detail view
 */
export function CrossModuleHyperlink({
  module,
  id,
  label,
  className = '',
  showIcon = true,
  onClick,
  variant = 'link'
}: CrossModuleHyperlinkProps) {
  const [, navigate] = useRouter();
  const metadata = getHyperlinkMetadata(module, id, label);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate(metadata.url);
  };

  if (variant === 'button') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="gap-2"
            >
              {label}
              {showIcon && <ExternalLink className="w-3 h-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View {module} details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        onClick={handleClick}
        className={`inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors ${className}`}
      >
        {label}
        {showIcon && <ExternalLink className="w-3 h-3 inline ml-1" />}
      </span>
    );
  }

  // Default: link variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onClick={handleClick}
            className={`text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold transition-colors ${className}`}
          >
            {label}
            {showIcon && <ExternalLink className="w-3 h-3 inline ml-1" />}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view {module} details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hyperlink Row component for table cells
 */
export function HyperlinkCell({
  module,
  id,
  label,
  subLabel
}: {
  module: string;
  id: number | string;
  label: string;
  subLabel?: string;
}): JSX.Element {
  return (
    <div className="flex flex-col">
      <CrossModuleHyperlink module={module} id={id} label={label} />
      {subLabel && <span className="text-sm text-gray-600">{subLabel}</span>}
    </div>
  );
}

/**
 * Breadcrumb navigation component
 */
export function CrossModuleBreadcrumb({
  breadcrumbs
}: {
  breadcrumbs: Array<{ label: string; href: string; module: string }>;
}): JSX.Element {
  const [, navigate] = useRouter();

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => navigate(crumb.href)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Related Records component showing linked records from other modules
 */
export function RelatedRecords({
  module,
  id,
  records
}: {
  module: string;
  id: number | string;
  records: Array<{ module: string; id: number | string; label: string; count?: number }>;
}): JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-700">Related Records</h3>
      <div className="grid grid-cols-2 gap-2">
        {records.map((record, index) => (
          <div key={index} className="p-2 border rounded hover:bg-gray-50">
            <CrossModuleHyperlink
              module={record.module}
              id={record.id}
              label={`${record.label}${record.count ? ` (${record.count})` : ''}`}
              variant="badge"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick Action Links component
 */
export function QuickActionLinks({
  module,
  id
}: {
  module: string;
  id: number | string;
}): JSX.Element {
  const [, navigate] = useRouter();
  const actions = [
    { label: 'View', action: 'view' },
    { label: 'Edit', action: 'edit' },
    { label: 'Print', action: 'print' },
    { label: 'Export', action: 'export' }
  ];

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <button
          key={action.action}
          onClick={() => navigate(`${getNavigationUrl({ module, id, label: '', type: 'detail' })}&action=${action.action}`)}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
