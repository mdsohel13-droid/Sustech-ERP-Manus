import { useState, useEffect, useCallback } from "react";

/**
 * Mobile Responsive Optimization Utilities
 * Provides responsive design helpers and mobile-first utilities
 */

// Breakpoints
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("md");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.sm) setBreakpoint("xs");
      else if (width < BREAKPOINTS.md) setBreakpoint("sm");
      else if (width < BREAKPOINTS.lg) setBreakpoint("md");
      else if (width < BREAKPOINTS.xl) setBreakpoint("lg");
      else if (width < BREAKPOINTS["2xl"]) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if screen is mobile
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "xs" || breakpoint === "sm";
}

/**
 * Hook to check if screen is tablet
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "md" || breakpoint === "lg";
}

/**
 * Hook to check if screen is desktop
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "xl" || breakpoint === "2xl";
}

/**
 * Hook for responsive values
 */
export function useResponsive<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const breakpoint = useBreakpoint();
  return values[breakpoint];
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const isTouchDevice = () => {
      return (
        (typeof window !== "undefined" &&
          ("ontouchstart" in window ||
            (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0))) ||
        false
      );
    };

    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };

    handleOrientationChange();
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if device is in dark mode
 */
export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDark;
}

/**
 * Hook to detect if device has reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}

/**
 * Mobile-optimized table component configuration
 */
export const MOBILE_TABLE_CONFIG = {
  // Show only 3 columns on mobile
  mobileColumns: 3,
  // Show only 5 rows on mobile
  mobileRows: 5,
  // Stack table vertically on mobile
  stackOnMobile: true,
  // Use horizontal scroll on mobile
  horizontalScroll: true,
  // Reduce padding on mobile
  mobilePadding: "p-2",
  // Desktop padding
  desktopPadding: "p-4",
};

/**
 * Mobile-optimized dialog configuration
 */
export const MOBILE_DIALOG_CONFIG = {
  // Full screen on mobile
  mobileFullScreen: true,
  // Reduced height on mobile
  mobileHeight: "h-[90vh]",
  // Desktop height
  desktopHeight: "h-auto",
  // Reduced width on mobile
  mobileWidth: "w-[95vw]",
  // Desktop width
  desktopWidth: "w-auto",
};

/**
 * Mobile-optimized grid configuration
 */
export const MOBILE_GRID_CONFIG = {
  // 1 column on mobile
  mobileColumns: "grid-cols-1",
  // 2 columns on tablet
  tabletColumns: "grid-cols-2",
  // 3-4 columns on desktop
  desktopColumns: "grid-cols-3 lg:grid-cols-4",
};

/**
 * Utility to get responsive grid classes
 */
export function getResponsiveGridClasses(
  mobile = "grid-cols-1",
  tablet = "md:grid-cols-2",
  desktop = "lg:grid-cols-3"
): string {
  return `grid ${mobile} ${tablet} ${desktop} gap-4`;
}

/**
 * Utility to get responsive padding classes
 */
export function getResponsivePadding(
  mobile = "p-2",
  tablet = "md:p-4",
  desktop = "lg:p-6"
): string {
  return `${mobile} ${tablet} ${desktop}`;
}

/**
 * Utility to get responsive text size classes
 */
export function getResponsiveTextSize(
  mobile = "text-sm",
  tablet = "md:text-base",
  desktop = "lg:text-lg"
): string {
  return `${mobile} ${tablet} ${desktop}`;
}

/**
 * Utility to get responsive font weight classes
 */
export function getResponsiveFontWeight(
  mobile = "font-semibold",
  tablet = "md:font-bold",
  desktop = "lg:font-bold"
): string {
  return `${mobile} ${tablet} ${desktop}`;
}

/**
 * Mobile-optimized sidebar configuration
 */
export const MOBILE_SIDEBAR_CONFIG = {
  // Hidden on mobile
  mobileHidden: "hidden md:block",
  // Full width on mobile
  mobileFullWidth: "w-full md:w-64",
  // Overlay on mobile
  mobileOverlay: "fixed inset-0 z-40 md:relative",
  // Slide animation on mobile
  mobileAnimation: "transition-transform duration-300",
};

/**
 * Utility to handle touch events on mobile
 */
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setTouchEnd({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY });
  }, []);

  const getSwipeDirection = useCallback((): "left" | "right" | "up" | "down" | null => {
    if (!touchStart || !touchEnd) return null;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;

    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;

    if (isLeftSwipe) return "left";
    if (isRightSwipe) return "right";
    if (isUpSwipe) return "up";
    if (isDownSwipe) return "down";

    return null;
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
    touchStart,
    touchEnd,
  };
}

/**
 * Utility for mobile-friendly form input
 */
export const MOBILE_FORM_CONFIG = {
  // Larger input height on mobile for easier tapping
  mobileInputHeight: "h-12",
  // Standard input height on desktop
  desktopInputHeight: "h-10",
  // Larger button height on mobile
  mobileButtonHeight: "h-12",
  // Standard button height on desktop
  desktopButtonHeight: "h-10",
  // Increased spacing between form elements on mobile
  mobileSpacing: "space-y-4",
  // Standard spacing on desktop
  desktopSpacing: "space-y-2",
};

/**
 * Utility to get mobile-friendly input classes
 */
export function getMobileFormInputClasses(): string {
  return `${MOBILE_FORM_CONFIG.mobileInputHeight} md:${MOBILE_FORM_CONFIG.desktopInputHeight}`;
}

/**
 * Utility to get mobile-friendly button classes
 */
export function getMobileFormButtonClasses(): string {
  return `${MOBILE_FORM_CONFIG.mobileButtonHeight} md:${MOBILE_FORM_CONFIG.desktopButtonHeight}`;
}

export default {
  BREAKPOINTS,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useResponsive,
  useTouchDevice,
  useOrientation,
  useDarkMode,
  useReducedMotion,
  useViewport,
  useTouchGestures,
  getResponsiveGridClasses,
  getResponsivePadding,
  getResponsiveTextSize,
  getResponsiveFontWeight,
  getMobileFormInputClasses,
  getMobileFormButtonClasses,
};
