import React from "react";

interface HyperlinkCellProps {
  /**
   * The text to display as a hyperlink
   */
  label: string;
  
  /**
   * Callback function when the hyperlink is clicked
   */
  onClick: () => void;
  
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
}

/**
 * Universal hyperlink cell component for consistent styling across all modules
 * Features:
 * - Blue hyperlink color with hover effects
 * - Consistent left alignment
 * - Full width button for better click target
 * - Proper event handling
 * - Accessibility support
 */
export function HyperlinkCell({
  label,
  onClick,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
}: HyperlinkCellProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (!disabled) {
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
export function HyperlinkTableCell({
  label,
  onClick,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
  size = "sm",
}: HyperlinkCellProps & { size?: "xs" | "sm" | "base" }) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
  };

  return (
    <HyperlinkCell
      label={label}
      onClick={onClick}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Variant for kanban cards - compact styling
 */
export function HyperlinkCardCell({
  label,
  onClick,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
}: HyperlinkCellProps) {
  return (
    <HyperlinkCell
      label={label}
      onClick={onClick}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      className={`text-sm font-semibold ${className}`}
    />
  );
}

/**
 * Variant for list items
 */
export function HyperlinkListItem({
  label,
  onClick,
  className = "",
  stopPropagation = false,
  title,
  disabled = false,
}: HyperlinkCellProps) {
  return (
    <HyperlinkCell
      label={label}
      onClick={onClick}
      stopPropagation={stopPropagation}
      title={title}
      disabled={disabled}
      className={`text-base font-medium ${className}`}
    />
  );
}
