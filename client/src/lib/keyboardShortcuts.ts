import { useEffect, useCallback } from "react";

/**
 * Keyboard Shortcuts and Accessibility System
 * Provides keyboard navigation and accessibility features
 */

export type KeyboardShortcutModifier = "ctrl" | "shift" | "alt" | "meta";

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  modifiers?: KeyboardShortcutModifier[];
  action: () => void;
  enabled: boolean;
  category: "navigation" | "action" | "search" | "edit" | "view" | "help";
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigationOnly: boolean;
  focusIndicator: boolean;
}

/**
 * Keyboard Shortcuts Manager
 */
export class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Array<(shortcut: KeyboardShortcut) => void> = [];
  private accessibilitySettings: AccessibilitySettings = {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderMode: false,
    keyboardNavigationOnly: false,
    focusIndicator: true,
  };

  constructor() {
    this.registerDefaultShortcuts();
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * Register multiple shortcuts
   */
  registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach((shortcut) => this.registerShortcut(shortcut));
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: KeyboardShortcut["category"]): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.category === category);
  }

  /**
   * Execute shortcut by ID
   */
  executeShortcut(id: string): boolean {
    const shortcut = this.shortcuts.get(id);
    if (shortcut && shortcut.enabled) {
      shortcut.action();
      this.notifyListeners(shortcut);
      return true;
    }
    return false;
  }

  /**
   * Handle keyboard event
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue;

      const matchesKey = shortcut.keys.some((k) => k.toLowerCase() === key);
      const matchesModifiers =
        shortcut.modifiers?.length === 0 ||
        (shortcut.modifiers?.includes("ctrl") && ctrl) ||
        (shortcut.modifiers?.includes("shift") && shift) ||
        (shortcut.modifiers?.includes("alt") && alt);

      if (matchesKey && matchesModifiers) {
        event.preventDefault();
        shortcut.action();
        this.notifyListeners(shortcut);
        return true;
      }
    }

    return false;
  }

  /**
   * Update accessibility settings
   */
  updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    this.applyAccessibilitySettings();
  }

  /**
   * Get accessibility settings
   */
  getAccessibilitySettings(): AccessibilitySettings {
    return { ...this.accessibilitySettings };
  }

  /**
   * Apply accessibility settings to DOM
   */
  private applyAccessibilitySettings(): void {
    const root = document.documentElement;

    if (this.accessibilitySettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (this.accessibilitySettings.largeText) {
      root.classList.add("large-text");
      root.style.fontSize = "18px";
    } else {
      root.classList.remove("large-text");
      root.style.fontSize = "16px";
    }

    if (this.accessibilitySettings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (this.accessibilitySettings.focusIndicator) {
      root.classList.add("focus-visible");
    } else {
      root.classList.remove("focus-visible");
    }
  }

  /**
   * Subscribe to shortcut execution
   */
  subscribe(listener: (shortcut: KeyboardShortcut) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(shortcut: KeyboardShortcut): void {
    this.listeners.forEach((listener) => listener(shortcut));
  }

  /**
   * Register default shortcuts
   */
  private registerDefaultShortcuts(): void {
    const defaults: KeyboardShortcut[] = [
      // Navigation
      {
        id: "nav-home",
        name: "Go to Home",
        description: "Navigate to home page",
        keys: ["h"],
        modifiers: ["alt"],
        action: () => window.location.hash = "/",
        enabled: true,
        category: "navigation",
      },
      {
        id: "nav-dashboard",
        name: "Go to Dashboard",
        description: "Navigate to dashboard",
        keys: ["d"],
        modifiers: ["alt"],
        action: () => window.location.hash = "/dashboard",
        enabled: true,
        category: "navigation",
      },
      {
        id: "nav-sales",
        name: "Go to Sales",
        description: "Navigate to sales module",
        keys: ["s"],
        modifiers: ["alt"],
        action: () => window.location.hash = "/sales",
        enabled: true,
        category: "navigation",
      },
      {
        id: "nav-projects",
        name: "Go to Projects",
        description: "Navigate to projects module",
        keys: ["p"],
        modifiers: ["alt"],
        action: () => window.location.hash = "/projects",
        enabled: true,
        category: "navigation",
      },

      // Search & Filter
      {
        id: "search-focus",
        name: "Focus Search",
        description: "Focus on search input",
        keys: ["/"],
        action: () => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        },
        enabled: true,
        category: "search",
      },
      {
        id: "filter-toggle",
        name: "Toggle Filters",
        description: "Toggle advanced filters",
        keys: ["f"],
        modifiers: ["ctrl"],
        action: () => {
          const filterButton = document.querySelector('[data-filter-toggle]') as HTMLButtonElement;
          if (filterButton) filterButton.click();
        },
        enabled: true,
        category: "search",
      },

      // Actions
      {
        id: "action-create",
        name: "Create New",
        description: "Create new item",
        keys: ["n"],
        modifiers: ["ctrl"],
        action: () => {
          const createButton = document.querySelector('[data-action-create]') as HTMLButtonElement;
          if (createButton) createButton.click();
        },
        enabled: true,
        category: "action",
      },
      {
        id: "action-save",
        name: "Save",
        description: "Save current item",
        keys: ["s"],
        modifiers: ["ctrl"],
        action: () => {
          const saveButton = document.querySelector('[data-action-save]') as HTMLButtonElement;
          if (saveButton) saveButton.click();
        },
        enabled: true,
        category: "action",
      },
      {
        id: "action-delete",
        name: "Delete",
        description: "Delete current item",
        keys: ["Delete"],
        action: () => {
          const deleteButton = document.querySelector('[data-action-delete]') as HTMLButtonElement;
          if (deleteButton) deleteButton.click();
        },
        enabled: true,
        category: "action",
      },

      // Help
      {
        id: "help-shortcuts",
        name: "Show Shortcuts",
        description: "Display keyboard shortcuts",
        keys: ["?"],
        action: () => {
          const helpButton = document.querySelector('[data-help-shortcuts]') as HTMLButtonElement;
          if (helpButton) helpButton.click();
        },
        enabled: true,
        category: "help",
      },
    ];

    this.registerShortcuts(defaults);
  }
}

/**
 * Global keyboard shortcuts manager instance
 */
export const globalKeyboardManager = new KeyboardShortcutsManager();

/**
 * Hook to use keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      globalKeyboardManager.handleKeyboardEvent(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return globalKeyboardManager;
}

/**
 * Hook to register custom shortcut
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useEffect(() => {
    globalKeyboardManager.registerShortcut(shortcut);
    return () => {
      // Cleanup if needed
    };
  }, [shortcut]);
}

/**
 * Accessibility utilities
 */
export const AccessibilityUtils = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  },

  /**
   * Set focus trap for modal
   */
  setFocusTrap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => element.removeEventListener("keydown", handleKeyDown);
  },

  /**
   * Skip to main content
   */
  addSkipLink: () => {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className = "sr-only focus:not-sr-only";
    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  /**
   * Set ARIA labels
   */
  setAriaLabel: (element: HTMLElement, label: string) => {
    element.setAttribute("aria-label", label);
  },

  /**
   * Set ARIA description
   */
  setAriaDescription: (element: HTMLElement, description: string) => {
    const id = `aria-desc-${Math.random().toString(36).substr(2, 9)}`;
    const descElement = document.createElement("div");
    descElement.id = id;
    descElement.className = "sr-only";
    descElement.textContent = description;
    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute("aria-describedby", id);
  },
};

/**
 * Keyboard shortcut help dialog data
 */
export const KEYBOARD_SHORTCUTS_HELP = [
  {
    category: "Navigation",
    shortcuts: [
      { keys: "Alt + H", description: "Go to Home" },
      { keys: "Alt + D", description: "Go to Dashboard" },
      { keys: "Alt + S", description: "Go to Sales" },
      { keys: "Alt + P", description: "Go to Projects" },
    ],
  },
  {
    category: "Search & Filter",
    shortcuts: [
      { keys: "/", description: "Focus Search" },
      { keys: "Ctrl + F", description: "Toggle Filters" },
    ],
  },
  {
    category: "Actions",
    shortcuts: [
      { keys: "Ctrl + N", description: "Create New" },
      { keys: "Ctrl + S", description: "Save" },
      { keys: "Delete", description: "Delete Item" },
    ],
  },
  {
    category: "Help",
    shortcuts: [
      { keys: "?", description: "Show Shortcuts" },
    ],
  },
];

export default {
  KeyboardShortcutsManager,
  globalKeyboardManager,
  useKeyboardShortcuts,
  useKeyboardShortcut,
  AccessibilityUtils,
  KEYBOARD_SHORTCUTS_HELP,
};
