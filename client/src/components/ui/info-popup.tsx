import * as React from "react";
import { cn } from "@/lib/utils";

interface InfoPopupProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoPopup({ trigger, children, className, side = "right" }: InfoPopupProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const sideStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-0 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-0 mr-2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      {isOpen && (
        <div 
          className={cn(
            "absolute z-[9999] w-80 rounded-md border bg-white dark:bg-slate-900 p-4 shadow-lg",
            sideStyles[side],
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </div>
      )}
    </div>
  );
}
