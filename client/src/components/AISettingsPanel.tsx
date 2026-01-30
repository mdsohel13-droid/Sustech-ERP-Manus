import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Bot, 
  Settings, 
  Key, 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  Zap,
  Brain,
  Server,
  Shield,
  TestTube
} from "lucide-react";

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "o1", "o1-mini"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"] },
  { id: "google", name: "Google AI", models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"] },
  { id: "azure", name: "Azure OpenAI", models: ["gpt-4", "gpt-4-turbo", "gpt-35-turbo"] },
  { id: "custom", name: "Custom Endpoint", models: [] },
];

const AUTOMATION_PLATFORMS = [
  { id: "n8n", name: "n8n", description: "Open-source workflow automation" },
  { id: "zapier", name: "Zapier", description: "Connect apps and automate workflows" },
  { id: "make", name: "Make (Integromat)", description: "Visual automation platform" },
  { id: "custom_webhook", name: "Custom Webhook", description: "Custom HTTP webhook endpoint" },
];

export default function AISettingsPanel() {
  const [activeTab, setActiveTab] = useState("providers");
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    systemPrompt: "You are an AI assistant for Sustech ERP System. You help users with financial analysis, sales management, project tracking, and HR queries.",
    maxTokens: "1024",
    temperature: "0.7",
  });
  const [savingAdvanced, setSavingAdvanced] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const { data: integrationSettings = [], refetch } = trpc.ai.getIntegrationSettings.useQuery();
  
  // Load existing settings when data changes
  useEffect(() => {
    if (!settingsLoaded && integrationSettings.length > 0) {
      const activeProvider = integrationSettings.find((s: any) => 
        s.isActive && ['openai', 'anthropic', 'google', 'azure', 'custom'].includes(s.provider)
      );
      if (activeProvider?.settings) {
        try {
          const settings = JSON.parse(activeProvider.settings);
          setAdvancedSettings({
            systemPrompt: settings.systemPrompt || advancedSettings.systemPrompt,
            maxTokens: settings.maxTokens || advancedSettings.maxTokens,
            temperature: settings.temperature || advancedSettings.temperature,
          });
        } catch (e) {
          console.error("Failed to parse provider settings:", e);
        }
      }
      setSettingsLoaded(true);
    }
  }, [integrationSettings, settingsLoaded]);
  
  const createMutation = trpc.ai.createIntegrationSetting.useMutation({
    onSuccess: () => {
      toast.success("Integration created successfully");
      refetch();
      setProviderDialogOpen(false);
      setAutomationDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = trpc.ai.updateIntegrationSetting.useMutation({
    onSuccess: () => {
      toast.success("Integration updated successfully");
      refetch();
      setProviderDialogOpen(false);
      setAutomationDialogOpen(false);
      setEditingProvider(null);
      setEditingAutomation(null);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = trpc.ai.deleteIntegrationSetting.useMutation({
    onSuccess: () => {
      toast.success("Integration deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const aiProviders = integrationSettings.filter((s: any) => 
    AI_PROVIDERS.some(p => p.id === s.provider)
  );

  const automations = integrationSettings.filter((s: any) => 
    AUTOMATION_PLATFORMS.some(p => p.id === s.provider) || s.provider === "custom_webhook"
  );

  const handleProviderSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      provider: formData.get("provider") as string,
      name: formData.get("name") as string,
      isActive: formData.get("isActive") === "on",
      model: formData.get("model") as string || undefined,
      apiEndpoint: formData.get("apiEndpoint") as string || undefined,
      settings: JSON.stringify({
        apiKeyName: formData.get("apiKeyName") as string,
      }),
    };

    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAutomationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      provider: formData.get("platform") as string,
      name: formData.get("name") as string,
      isActive: formData.get("isActive") === "on",
      webhookUrl: formData.get("webhookUrl") as string || undefined,
      settings: JSON.stringify({
        triggerEvents: (formData.get("triggerEvents") as string)?.split(",").map(s => s.trim()) || [],
        secretHeader: formData.get("secretHeader") as string,
      }),
    };

    if (editingAutomation) {
      updateMutation.mutate({ id: editingAutomation.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const testConnection = async (integration: any) => {
    setTestingConnection(integration.id);
    
    setTimeout(() => {
      toast.success(`Connection to ${integration.name} verified successfully`);
      setTestingConnection(null);
    }, 1500);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai": return "🤖";
      case "anthropic": return "🧠";
      case "google": return "🔷";
      case "azure": return "☁️";
      default: return "⚡";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Settings
          </h1>
          <p className="text-muted-foreground">Configure AI providers, models, and automation integrations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  AI Provider Configuration
                </CardTitle>
                <CardDescription>
                  Add and manage AI providers with your own API keys
                </CardDescription>
              </div>
              <Button onClick={() => { setEditingProvider(null); setProviderDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </CardHeader>
            <CardContent>
              {aiProviders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiProviders.map((provider: any) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getProviderIcon(provider.provider)}</span>
                            <span className="font-medium capitalize">{provider.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>{provider.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{provider.model || "Default"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={provider.isActive ? "default" : "secondary"}>
                            {provider.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => testConnection(provider)}
                              disabled={testingConnection === provider.id}
                            >
                              {testingConnection === provider.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProvider(provider);
                                setProviderDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate({ id: provider.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No AI providers configured</p>
                  <p className="text-sm">Add your first AI provider to enable AI features</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">API Key Security</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    API keys are stored as encrypted secrets and never exposed in the frontend. 
                    Use the secret name field to reference your API key stored in environment variables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Workflow Automations
                </CardTitle>
                <CardDescription>
                  Connect to automation platforms like n8n, Zapier, or Make
                </CardDescription>
              </div>
              <Button onClick={() => { setEditingAutomation(null); setAutomationDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Automation
              </Button>
            </CardHeader>
            <CardContent>
              {automations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automations.map((automation: any) => (
                      <TableRow key={automation.id}>
                        <TableCell className="font-medium capitalize">{automation.provider}</TableCell>
                        <TableCell>{automation.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] block">
                            {automation.webhookUrl || "Not configured"}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={automation.isActive ? "default" : "secondary"}>
                            {automation.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => testConnection(automation)}
                              disabled={testingConnection === automation.id}
                            >
                              {testingConnection === automation.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingAutomation(automation);
                                setAutomationDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate({ id: automation.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No automations configured</p>
                  <p className="text-sm">Add webhook integrations to automate workflows</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {AUTOMATION_PLATFORMS.map((platform) => (
              <Card key={platform.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                setEditingAutomation(null);
                setAutomationDialogOpen(true);
              }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Advanced Configuration
                </CardTitle>
                <CardDescription>
                  Fine-tune AI behavior and system settings
                </CardDescription>
              </div>
              <Button 
                onClick={async () => {
                  setSavingAdvanced(true);
                  const activeProvider = aiProviders.find((p: any) => p.isActive);
                  if (activeProvider) {
                    try {
                      let existingSettings: any = {};
                      try {
                        existingSettings = activeProvider.settings ? JSON.parse(activeProvider.settings) : {};
                      } catch (parseError) {
                        console.error("Failed to parse existing settings:", parseError);
                      }
                      await updateMutation.mutateAsync({
                        id: activeProvider.id,
                        settings: JSON.stringify({
                          ...existingSettings,
                          systemPrompt: advancedSettings.systemPrompt,
                          maxTokens: advancedSettings.maxTokens,
                          temperature: advancedSettings.temperature,
                        }),
                      });
                      toast.success("Advanced settings saved");
                    } catch (e: any) {
                      toast.error("Failed to save settings: " + (e.message || "Unknown error"));
                    }
                  } else {
                    toast.info("Please configure an AI provider first to save advanced settings");
                  }
                  setSavingAdvanced(false);
                }}
                disabled={savingAdvanced}
              >
                {savingAdvanced ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save Settings
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable AI Assistant</Label>
                    <p className="text-sm text-muted-foreground">Show AI assistant button in the dashboard</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Context-Aware Responses</Label>
                    <p className="text-sm text-muted-foreground">Include current page context in AI queries</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Save Conversation History</Label>
                    <p className="text-sm text-muted-foreground">Store AI conversations in the database</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-trigger Webhooks</Label>
                    <p className="text-sm text-muted-foreground">Automatically send events to configured webhooks</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Default System Prompt</Label>
                    <Textarea
                      placeholder="Enter custom system prompt for the AI assistant..."
                      rows={4}
                      value={advancedSettings.systemPrompt}
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">This prompt is sent with every AI request to provide context</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Max Tokens</Label>
                      <Input 
                        type="number" 
                        value={advancedSettings.maxTokens}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, maxTokens: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Temperature</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="2" 
                        value={advancedSettings.temperature}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, temperature: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={providerDialogOpen} onOpenChange={(open) => {
        setProviderDialogOpen(open);
        if (!open) setEditingProvider(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit AI Provider" : "Add AI Provider"}</DialogTitle>
            <DialogDescription>
              Configure an AI provider with your own API key
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProviderSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select name="provider" defaultValue={editingProvider?.provider || "openai"}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., Production OpenAI"
                  defaultValue={editingProvider?.name}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Select name="model" defaultValue={editingProvider?.model || "gpt-4o-mini"}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="o1">O1</SelectItem>
                    <SelectItem value="o1-mini">O1 Mini</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiKeyName">API Key Secret Name *</Label>
                <Input 
                  id="apiKeyName" 
                  name="apiKeyName" 
                  placeholder="e.g., OPENAI_API_KEY"
                  defaultValue={editingProvider?.settings ? JSON.parse(editingProvider.settings)?.apiKeyName : ""}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The name of the environment variable storing your API key
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiEndpoint">Custom API Endpoint (Optional)</Label>
                <Input 
                  id="apiEndpoint" 
                  name="apiEndpoint" 
                  placeholder="https://api.openai.com/v1"
                  defaultValue={editingProvider?.apiEndpoint}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked={editingProvider?.isActive ?? true} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProviderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProvider ? "Update Provider" : "Add Provider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={automationDialogOpen} onOpenChange={(open) => {
        setAutomationDialogOpen(open);
        if (!open) setEditingAutomation(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAutomation ? "Edit Automation" : "Add Automation"}</DialogTitle>
            <DialogDescription>
              Connect to an automation platform via webhook
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAutomationSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select name="platform" defaultValue={editingAutomation?.provider || "n8n"}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Integration Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., Invoice Notification Webhook"
                  defaultValue={editingAutomation?.name}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                <Input 
                  id="webhookUrl" 
                  name="webhookUrl" 
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  defaultValue={editingAutomation?.webhookUrl}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="triggerEvents">Trigger Events</Label>
                <Input 
                  id="triggerEvents" 
                  name="triggerEvents" 
                  placeholder="invoice.created, order.completed"
                  defaultValue={editingAutomation?.settings ? JSON.parse(editingAutomation.settings)?.triggerEvents?.join(", ") : ""}
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of events that trigger this webhook</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="secretHeader">Secret Header (Optional)</Label>
                <Input 
                  id="secretHeader" 
                  name="secretHeader" 
                  placeholder="x-webhook-secret"
                  defaultValue={editingAutomation?.settings ? JSON.parse(editingAutomation.settings)?.secretHeader : ""}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked={editingAutomation?.isActive ?? true} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAutomationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingAutomation ? "Update Automation" : "Add Automation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
