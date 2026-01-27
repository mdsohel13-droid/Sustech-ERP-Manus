import React from "react";
import { handleHyperlinkClick, createHyperlinkContext } from "@/lib/hyperlinkUtils";

interface HyperlinkCellWithAnalyticsProps {
  /**
   * The text to display as a hyperlink
   */
  label: string;

  /**
   * Callback function when the hyperlink is clicked
   */
  onClick: () => void;

  /**
   * Module name for analytics tracking
   */
  moduleFrom: string;

  /**
   * Field name for analytics tracking
   */
  fieldName: string;

  /**
   * Record ID for analytics tracking
   */
  recordId: string | number;

  /**
   * Record name for analytics tracking
   */
  recordName?: string;

  /**
   * Optional CSS class for additional styling
   */
  className?: string;

  /**
   * Whether to stop event propagation (useful in tables/cards)
   */
  stopPropagation?: boolean;

  /**
   * Optional tooltip text
   */
  title?: string;

  /**
   * Whether the link is disabled
   */
  disabled?: boolean;

  /**
   * Action type (edit, view, navigate)
   */
  action?: "edit" | "view" | "navigate";

  /**
   * Optional callback for navigation
   */
  onNavigate?: (route: string) => void;
}

/**
 * Enhanced hyperlink cell component with analytics tracking
 * Automatically tracks hyperlink clicks for analytics
 */
export function HyperlinkCellWithAnalytics({
  label,
  onClick,
  moduleFrom,
  fieldName,
  recordId,
  recordName = label,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
  action = "edit",
  onNavigate,
}: HyperlinkCellWithAnalyticsProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }

    if (!disabled) {
      // Track the click with analytics
      const context = createHyperlinkContext(moduleFrom, fieldName, recordId, recordName, action);
      handleHyperlinkClick(context, onNavigate);

      // Call the provided onClick handler
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title || label}
      className={`
        text-blue-600 hover:text-blue-800 
        hover:underline 
        cursor-pointer 
        text-left 
        w-full 
        font-medium 
        transition-colors 
        disabled:text-gray-400 
        disabled:cursor-not-allowed 
        disabled:no-underline
        ${className}
      `}
    >
      {label}
    </button>
  );
}

/**
 * Variant for table cells - includes padding and text sizing
 */
export function HyperlinkTableCellWithAnalytics({
  label,
  onClick,
  moduleFrom,
  fieldName,
  recordId,
  recordName,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
  action = "edit",
  onNavigate,
  size = "sm",
}: HyperlinkCellWithAnalyticsProps & { size?: "xs" | "sm" | "base" }) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
  };

  return (
    <HyperlinkCellWithAnalytics
      label={label}
      onClick={onClick}
      moduleFrom={moduleFrom}
      fieldName={fieldName}
      recordId={recordId}
      recordName={recordName}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      action={action}
      onNavigate={onNavigate}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Variant for kanban cards - compact styling
 */
export function HyperlinkCardCellWithAnalytics({
  label,
  onClick,
  moduleFrom,
  fieldName,
  recordId,
  recordName,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
  action = "edit",
  onNavigate,
}: HyperlinkCellWithAnalyticsProps) {
  return (
    <HyperlinkCellWithAnalytics
      label={label}
      onClick={onClick}
      moduleFrom={moduleFrom}
      fieldName={fieldName}
      recordId={recordId}
      recordName={recordName}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      action={action}
      onNavigate={onNavigate}
      className={`text-sm font-semibold ${className}`}
    />
  );
}

/**
 * Variant for list items
 */
export function HyperlinkListItemWithAnalytics({
  label,
  onClick,
  moduleFrom,
  fieldName,
  recordId,
  recordName,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
  action = "edit",
  onNavigate,
}: HyperlinkCellWithAnalyticsProps) {
  return (
    <HyperlinkCellWithAnalytics
      label={label}
      onClick={onClick}
      moduleFrom={moduleFrom}
      fieldName={fieldName}
      recordId={recordId}
      recordName={recordName}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      action={action}
      onNavigate={onNavigate}
      className={`text-base font-medium ${className}`}
    />
  );
}
