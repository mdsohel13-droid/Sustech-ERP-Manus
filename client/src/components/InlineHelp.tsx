import { useState, ReactNode } from "react";
import { HelpCircle, Info, Lightbulb } from "lucide-react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-normal">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}

interface HelpIconProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "md";
}

export function HelpIcon({ content, position = "top", size = "sm" }: HelpIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  return (
    <Tooltip content={content} position={position}>
      <HelpCircle className={`${sizeClasses[size]} text-muted-foreground cursor-help hover:text-foreground transition-colors`} />
    </Tooltip>
  );
}

interface InfoBannerProps {
  title?: string;
  children: ReactNode;
  type?: "info" | "tip" | "warning";
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function InfoBanner({ title, children, type = "info", dismissible, onDismiss }: InfoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const typeStyles = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Info className="w-5 h-5 text-blue-500" />,
      title: "text-blue-800",
      text: "text-blue-700",
    },
    tip: {
      bg: "bg-amber-50 border-amber-200",
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      title: "text-amber-800",
      text: "text-amber-700",
    },
    warning: {
      bg: "bg-red-50 border-red-200",
      icon: <Info className="w-5 h-5 text-red-500" />,
      title: "text-red-800",
      text: "text-red-700",
    },
  };

  const styles = typeStyles[type];

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg}`}>
      <div className="shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        {title && <p className={`font-medium text-sm ${styles.title}`}>{title}</p>}
        <div className={`text-sm ${styles.text} ${title ? "mt-1" : ""}`}>{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface FieldLabelProps {
  label: string;
  help?: string;
  required?: boolean;
  htmlFor?: string;
}

export function FieldLabel({ label, help, required, htmlFor }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
      {label}
      {required && <span className="text-red-500">*</span>}
      {help && <HelpIcon content={help} size="sm" />}
    </label>
  );
}

interface ActionButtonProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({ 
  label, 
  description, 
  icon, 
  onClick, 
  variant = "primary",
  disabled,
  loading 
}: ActionButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
        ${variantStyles[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${loading ? "animate-pulse" : ""}
      `}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="text-left">
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs opacity-80">{description}</p>}
      </div>
      {loading && (
        <div className="ml-auto">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-medium text-lg text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
