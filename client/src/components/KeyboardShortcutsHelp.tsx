import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS_HELP, AccessibilityUtils } from "@/lib/keyboardShortcuts";

/**
 * Keyboard Shortcuts Help Dialog
 */
export const KeyboardShortcutsHelp: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      AccessibilityUtils.announce("Keyboard shortcuts help dialog opened");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-6 h-6" />
            <div>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Quick reference for keyboard shortcuts</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="Navigation" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {KEYBOARD_SHORTCUTS_HELP.map((group) => (
                <TabsTrigger key={group.category} value={group.category} className="text-xs md:text-sm">
                  {group.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {KEYBOARD_SHORTCUTS_HELP.map((group) => (
              <TabsContent key={group.category} value={group.category} className="space-y-3 mt-4">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm text-gray-700">{shortcut.description}</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.keys}
                    </Badge>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Tips:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Press <kbd className="px-2 py-1 bg-white rounded border text-xs">?</kbd> anytime to open this help</li>
              <li>Use <kbd className="px-2 py-1 bg-white rounded border text-xs">/</kbd> to quickly focus search</li>
              <li>Press <kbd className="px-2 py-1 bg-white rounded border text-xs">Tab</kbd> to navigate between elements</li>
              <li>Press <kbd className="px-2 py-1 bg-white rounded border text-xs">Enter</kbd> to activate buttons</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Accessibility Settings Panel
 */
export const AccessibilitySettings: React.FC<{
  onSettingsChange?: (settings: any) => void;
}> = ({ onSettingsChange }) => {
  const [settings, setSettings] = React.useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderMode: false,
    focusIndicator: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
    AccessibilityUtils.announce(`${key} ${value ? "enabled" : "disabled"}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
        <CardDescription>Customize your viewing experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Contrast */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-sm">High Contrast</p>
            <p className="text-xs text-gray-600">Increase color contrast for better readability</p>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => handleSettingChange("highContrast", e.target.checked)}
            className="w-5 h-5"
            aria-label="High contrast mode"
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-sm">Large Text</p>
            <p className="text-xs text-gray-600">Increase font size for easier reading</p>
          </div>
          <input
            type="checkbox"
            checked={settings.largeText}
            onChange={(e) => handleSettingChange("largeText", e.target.checked)}
            className="w-5 h-5"
            aria-label="Large text mode"
          />
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-sm">Reduce Motion</p>
            <p className="text-xs text-gray-600">Minimize animations and transitions</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => handleSettingChange("reduceMotion", e.target.checked)}
            className="w-5 h-5"
            aria-label="Reduce motion mode"
          />
        </div>

        {/* Screen Reader Mode */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-sm">Screen Reader Mode</p>
            <p className="text-xs text-gray-600">Optimize for screen reader compatibility</p>
          </div>
          <input
            type="checkbox"
            checked={settings.screenReaderMode}
            onChange={(e) => handleSettingChange("screenReaderMode", e.target.checked)}
            className="w-5 h-5"
            aria-label="Screen reader mode"
          />
        </div>

        {/* Focus Indicator */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-sm">Focus Indicator</p>
            <p className="text-xs text-gray-600">Show focus outline on interactive elements</p>
          </div>
          <input
            type="checkbox"
            checked={settings.focusIndicator}
            onChange={(e) => handleSettingChange("focusIndicator", e.target.checked)}
            className="w-5 h-5"
            aria-label="Focus indicator"
          />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Keyboard Navigation Guide
 */
export const KeyboardNavigationGuide: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard Navigation</CardTitle>
        <CardDescription>Learn how to navigate using your keyboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            { key: "Tab", description: "Move to next interactive element" },
            { key: "Shift + Tab", description: "Move to previous interactive element" },
            { key: "Enter", description: "Activate button or link" },
            { key: "Space", description: "Toggle checkbox or button" },
            { key: "Arrow Keys", description: "Navigate within lists or menus" },
            { key: "Escape", description: "Close dialogs or menus" },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
              <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                {item.key}
              </Badge>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  KeyboardShortcutsHelp,
  AccessibilitySettings,
  KeyboardNavigationGuide,
};
