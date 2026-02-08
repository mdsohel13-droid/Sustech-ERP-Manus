import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Palette, Globe, Archive, Bell, Building2 } from "lucide-react";
import { useEffect } from "react";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery();
  
  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.getAll.invalidate();
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    // General Settings
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    
    // Currency & Format
    defaultCurrency: "BDT",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Dhaka",
    
    // Theme
    themeColor: "cream",
    themePattern: "editorial",
    
    // Archive
    archiveRetentionDays: "90",
    
    // Language
    defaultLanguage: "english",
    
    // Notifications
    emailNotifications: "enabled",
    reminderFrequency: "daily",
  });

  // Load existing settings from database
  useEffect(() => {
    if (settings && settings.length > 0) {
      const newFormData = { ...formData };
      settings.forEach((setting) => {
        if (setting.settingKey in newFormData) {
          (newFormData as any)[setting.settingKey] = setting.settingValue || (newFormData as any)[setting.settingKey];
        }
      });
      setFormData(newFormData);
    }
  }, [settings]);

  const handleSave = (category: string) => {
    Object.entries(formData).forEach(([key, value]) => {
      updateSettingMutation.mutate({
        settingKey: key,
        settingValue: value,
        category,
      });
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1>System Settings</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Configure system parameters, themes, and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="general" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Building2 className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Globe className="h-3.5 w-3.5" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Palette className="h-3.5 w-3.5" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Archive className="h-3.5 w-3.5" />
            Archive
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Globe className="h-3.5 w-3.5" />
            Language
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details displayed across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Sustech Energy Solutions"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  placeholder="Chittagong, Bangladesh"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    placeholder="+880 1234567890"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    placeholder="info@sustech.com"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("general")}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency & Format Settings */}
        <TabsContent value="currency">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Currency & Format Settings</CardTitle>
              <CardDescription>
                Configure default currency, date format, and timezone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={formData.defaultCurrency}
                  onValueChange={(value) => setFormData({ ...formData, defaultCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={formData.dateFormat}
                  onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (16/01/2026)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/16/2026)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-01-16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                    <SelectItem value="Asia/Shanghai">Asia/Shanghai (GMT+8)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("currency")}>
                <Save className="h-4 w-4 mr-2" />
                Save Currency Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Choose color schemes and visual patterns for the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="themeColor">Theme Color</Label>
                <Select
                  value={formData.themeColor}
                  onValueChange={(value) => setFormData({ ...formData, themeColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cream">Cream (Editorial)</SelectItem>
                    <SelectItem value="blue">Professional Blue</SelectItem>
                    <SelectItem value="green">Nature Green</SelectItem>
                    <SelectItem value="purple">Modern Purple</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="themePattern">Visual Pattern</Label>
                <Select
                  value={formData.themePattern}
                  onValueChange={(value) => setFormData({ ...formData, themePattern: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editorial">Editorial (Serif Headlines)</SelectItem>
                    <SelectItem value="modern">Modern (Sans-serif)</SelectItem>
                    <SelectItem value="minimal">Minimal (Clean)</SelectItem>
                    <SelectItem value="corporate">Corporate (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Theme changes will be applied after refreshing the page
                </p>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("theme")}>
                <Save className="h-4 w-4 mr-2" />
                Save Theme Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Settings */}
        <TabsContent value="archive">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Archive & Data Retention</CardTitle>
              <CardDescription>
                Configure how long deleted items are retained before permanent deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="archiveRetentionDays">Retention Period (Days)</Label>
                <Select
                  value={formData.archiveRetentionDays}
                  onValueChange={(value) => setFormData({ ...formData, archiveRetentionDays: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days (Recommended)</SelectItem>
                    <SelectItem value="180">180 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Deleted items will be moved to archive and permanently removed after this period
                </p>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("archive")}>
                <Save className="h-4 w-4 mr-2" />
                Save Archive Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Language Preferences</CardTitle>
              <CardDescription>
                Set default language for AI insights and system messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select
                  value={formData.defaultLanguage}
                  onValueChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="bangla">বাংলা (Bangla)</SelectItem>
                    <SelectItem value="both">Both (Bilingual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  AI insights and marketing content will be generated in the selected language
                </p>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("language")}>
                <Save className="h-4 w-4 mr-2" />
                Save Language Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="editorial-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure email notifications and reminder frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Select
                  value={formData.emailNotifications}
                  onValueChange={(value) => setFormData({ ...formData, emailNotifications: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="critical_only">Critical Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reminderFrequency">Client Follow-up Reminder Frequency</Label>
                <Select
                  value={formData.reminderFrequency}
                  onValueChange={(value) => setFormData({ ...formData, reminderFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Bi-weekly)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  AI will generate reminders for client follow-ups at this frequency
                </p>
              </div>
              <Separator className="my-4" />
              <Button onClick={() => handleSave("notifications")}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
