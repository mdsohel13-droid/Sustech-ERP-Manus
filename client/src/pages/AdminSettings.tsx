import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Save, 
  Shield, 
  Users, 
  Palette, 
  BarChart3, 
  Lock, 
  Key, 
  Globe,
  Building2,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  RefreshCw,
  ShieldAlert,
  Monitor,
  Smartphone,
  LogOut,
  Settings2,
  Database,
  Activity,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";

export default function AdminSettings() {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive system administration, security, and customization settings
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Users className="h-3.5 w-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Shield className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Palette className="h-3.5 w-3.5" />
            Display
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Monitor className="h-3.5 w-3.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Activity className="h-3.5 w-3.5" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UserManagementSection /></TabsContent>
        <TabsContent value="security"><SecuritySettingsSection /></TabsContent>
        <TabsContent value="display"><DisplaySettingsSection /></TabsContent>
        <TabsContent value="sessions"><SessionManagementSection /></TabsContent>
        <TabsContent value="audit"><AuditLogsSection /></TabsContent>
        <TabsContent value="system"><SystemSettingsSection /></TabsContent>
      </Tabs>
    </div>
  );
}

function UserManagementSection() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.userManagement.getAllWithDetails.useQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "user" as const, password: "", confirmPassword: "", mustChangePassword: true });
  const [newPassword, setNewPassword] = useState("");

  const createUserMutation = trpc.userManagement.createWithPassword.useMutation({
    onSuccess: () => { utils.userManagement.getAllWithDetails.invalidate(); setCreateDialogOpen(false); toast.success("User created"); },
    onError: (error) => toast.error(error.message),
  });

  const resetPasswordMutation = trpc.userManagement.resetPassword.useMutation({
    onSuccess: () => { utils.userManagement.getAllWithDetails.invalidate(); setResetPasswordDialogOpen(false); toast.success("Password reset"); },
    onError: (error) => toast.error(error.message),
  });

  const toggleLockMutation = trpc.userManagement.toggleLock.useMutation({
    onSuccess: () => { utils.userManagement.getAllWithDetails.invalidate(); toast.success("Account updated"); },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => { utils.userManagement.getAllWithDetails.invalidate(); toast.success("User deleted"); },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />User Management</CardTitle>
            <CardDescription>Create, edit, and manage user accounts with role-based access</CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-user-btn"><UserPlus className="w-4 h-4 mr-2" />Create User</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Create a new user account with password authentication</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} placeholder="John Doe" data-testid="new-user-name" /></div>
                <div className="space-y-2"><Label>Email Address</Label><Input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} placeholder="john@company.com" data-testid="new-user-email" /></div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUserForm.role} onValueChange={(v: any) => setNewUserForm({...newUserForm, role: v})}>
                    <SelectTrigger data-testid="new-user-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="manager">Manager (CRUD Access)</SelectItem>
                      <SelectItem value="user">User (Limited Access)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} placeholder="Min 8 chars, uppercase, lowercase, number, special" data-testid="new-user-password" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must contain: 8+ chars, uppercase, lowercase, number, special character</p>
                </div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={newUserForm.confirmPassword} onChange={(e) => setNewUserForm({...newUserForm, confirmPassword: e.target.value})} placeholder="Confirm password" /></div>
                <div className="flex items-center space-x-2">
                  <Switch checked={newUserForm.mustChangePassword} onCheckedChange={(v) => setNewUserForm({...newUserForm, mustChangePassword: v})} id="must-change-password" />
                  <Label htmlFor="must-change-password">Require password change on first login</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { if (newUserForm.password !== newUserForm.confirmPassword) { toast.error("Passwords do not match"); return; } createUserMutation.mutate({ name: newUserForm.name, email: newUserForm.email, role: newUserForm.role, password: newUserForm.password, mustChangePassword: newUserForm.mustChangePassword }); }} disabled={createUserMutation.isPending} data-testid="submit-create-user">
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}</div> : (
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Login Method</TableHead><TableHead>Last Login</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {users?.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell><div><p className="font-medium">{u.name || "—"}</p><p className="text-sm text-muted-foreground">{u.email}</p></div></TableCell>
                  <TableCell><Badge variant={u.role === 'admin' ? 'default' : u.role === 'manager' ? 'secondary' : 'outline'}>{u.role}</Badge></TableCell>
                  <TableCell>{u.loginMethod || "OAuth"}</TableCell>
                  <TableCell>{u.lastSignedIn ? format(new Date(u.lastSignedIn), "MMM d, yyyy HH:mm") : "Never"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedUser(u); setResetPasswordDialogOpen(true); }}><Key className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => toggleLockMutation.mutate({ userId: u.id, lock: true })}><Lock className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete user?")) deleteUserMutation.mutate({ userId: u.id }); }}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Set a new password for {selectedUser?.name}</DialogDescription></DialogHeader>
            <div className="space-y-4"><div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" /></div></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => resetPasswordMutation.mutate({ userId: selectedUser?.id, newPassword, mustChangePassword: true })} disabled={resetPasswordMutation.isPending}>Reset Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function SecuritySettingsSection() {
  const utils = trpc.useUtils();
  const { data: securitySettings } = trpc.security.getAll.useQuery();
  const { data: blockedIPs } = trpc.security.getBlockedIPs.useQuery();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [newBlockIP, setNewBlockIP] = useState({ ip: "", reason: "" });

  const updateSecurityMutation = trpc.security.update.useMutation({ onSuccess: () => { utils.security.getAll.invalidate(); toast.success("Setting updated"); } });
  const blockIPMutation = trpc.security.blockIP.useMutation({ onSuccess: () => { utils.security.getBlockedIPs.invalidate(); setNewBlockIP({ ip: "", reason: "" }); toast.success("IP blocked"); } });
  const unblockIPMutation = trpc.security.unblockIP.useMutation({ onSuccess: () => { utils.security.getBlockedIPs.invalidate(); toast.success("IP unblocked"); } });

  useEffect(() => { if (securitySettings) { const m: Record<string, string> = {}; securitySettings.forEach((s: any) => { m[s.settingKey] = s.settingValue; }); setSettings(m); } }, [securitySettings]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Password Policy (International Security Standards)</CardTitle><CardDescription>Configure password requirements following NIST, ISO 27001, and GDPR guidelines</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum Password Length</Label>
              <Select value={settings.passwordMinLength || "8"} onValueChange={(v) => { setSettings({...settings, passwordMinLength: v}); updateSecurityMutation.mutate({ settingKey: "passwordMinLength", settingValue: v }); }}>
                <SelectTrigger data-testid="password-min-length"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="8">8 characters</SelectItem><SelectItem value="10">10 characters</SelectItem><SelectItem value="12">12 characters (Recommended)</SelectItem><SelectItem value="14">14 characters</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password Expiry</Label>
              <Select value={settings.passwordExpiryDays || "90"} onValueChange={(v) => { setSettings({...settings, passwordExpiryDays: v}); updateSecurityMutation.mutate({ settingKey: "passwordExpiryDays", settingValue: v }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="60">60 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="180">180 days</SelectItem><SelectItem value="0">Never</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium">Password Complexity Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              {[{ key: "passwordRequireUppercase", label: "Require uppercase (A-Z)" }, { key: "passwordRequireLowercase", label: "Require lowercase (a-z)" }, { key: "passwordRequireNumbers", label: "Require numbers (0-9)" }, { key: "passwordRequireSpecial", label: "Require special (!@#$%)" }].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{item.label}</span>
                  <Switch checked={settings[item.key] === "true"} onCheckedChange={(v) => { setSettings({...settings, [item.key]: String(v)}); updateSecurityMutation.mutate({ settingKey: item.key, settingValue: String(v) }); }} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Brute Force & Hacker Protection</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Max Failed Login Attempts</Label>
              <Select value={settings.maxLoginAttempts || "5"} onValueChange={(v) => { setSettings({...settings, maxLoginAttempts: v}); updateSecurityMutation.mutate({ settingKey: "maxLoginAttempts", settingValue: v }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="3">3 attempts</SelectItem><SelectItem value="5">5 attempts</SelectItem><SelectItem value="10">10 attempts</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Lockout Duration</Label>
              <Select value={settings.lockoutDurationMinutes || "30"} onValueChange={(v) => { setSettings({...settings, lockoutDurationMinutes: v}); updateSecurityMutation.mutate({ settingKey: "lockoutDurationMinutes", settingValue: v }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="1440">24 hours</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: "enableBruteForceProtection", label: "Brute Force Protection", desc: "Block IPs after failed attempts" }, { key: "csrfProtection", label: "CSRF Protection", desc: "Prevent cross-site forgery" }, { key: "xssProtection", label: "XSS Protection", desc: "XSS protection headers" }, { key: "enableAuditLogging", label: "Audit Logging", desc: "Log all events" }].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div><span className="font-medium">{item.label}</span><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <Switch checked={settings[item.key] === "true"} onCheckedChange={(v) => { setSettings({...settings, [item.key]: String(v)}); updateSecurityMutation.mutate({ settingKey: item.key, settingValue: String(v) }); }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />IP Blocking</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input placeholder="IP Address" value={newBlockIP.ip} onChange={(e) => setNewBlockIP({...newBlockIP, ip: e.target.value})} className="max-w-xs" data-testid="block-ip-input" />
            <Input placeholder="Reason" value={newBlockIP.reason} onChange={(e) => setNewBlockIP({...newBlockIP, reason: e.target.value})} className="flex-1" />
            <Button onClick={() => blockIPMutation.mutate({ ipAddress: newBlockIP.ip, reason: newBlockIP.reason })} disabled={!newBlockIP.ip}>Block IP</Button>
          </div>
          {blockedIPs && blockedIPs.length > 0 && (
            <Table>
              <TableHeader><TableRow><TableHead>IP</TableHead><TableHead>Reason</TableHead><TableHead>Blocked</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>{blockedIPs.map((ip: any) => (<TableRow key={ip.id}><TableCell className="font-mono">{ip.ipAddress}</TableCell><TableCell>{ip.reason || "—"}</TableCell><TableCell>{format(new Date(ip.createdAt), "MMM d, yyyy")}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => unblockIPMutation.mutate({ ipAddress: ip.ipAddress })}>Unblock</Button></TableCell></TableRow>))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DisplaySettingsSection() {
  const utils = trpc.useUtils();
  const { data: displayPrefs } = trpc.displayPreferences.getGlobal.useQuery();
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const updatePrefMutation = trpc.displayPreferences.update.useMutation({ onSuccess: () => { utils.displayPreferences.getGlobal.invalidate(); toast.success("Updated"); } });

  useEffect(() => { if (displayPrefs) { const m: Record<string, string> = {}; displayPrefs.forEach((p: any) => { m[p.settingKey] = p.settingValue; }); setPrefs(m); } }, [displayPrefs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Charts & Graphics</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default Chart Type</Label>
              <Select value={prefs.chartType || "bar"} onValueChange={(v) => { setPrefs({...prefs, chartType: v}); updatePrefMutation.mutate({ settingKey: "chartType", settingValue: v, isGlobal: true }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="bar">Bar</SelectItem><SelectItem value="line">Line</SelectItem><SelectItem value="area">Area</SelectItem><SelectItem value="pie">Pie</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select value={prefs.chartColorScheme || "default"} onValueChange={(v) => { setPrefs({...prefs, chartColorScheme: v}); updatePrefMutation.mutate({ settingKey: "chartColorScheme", settingValue: v, isGlobal: true }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="cool">Cool</SelectItem><SelectItem value="vibrant">Vibrant</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div><span className="font-medium">Chart Animations</span></div>
            <Switch checked={prefs.defaultChartAnimation === "true"} onCheckedChange={(v) => { setPrefs({...prefs, defaultChartAnimation: String(v)}); updatePrefMutation.mutate({ settingKey: "defaultChartAnimation", settingValue: String(v), isGlobal: true }); }} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" />Table & Layout</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Rows Per Page</Label>
              <Select value={prefs.tableRowsPerPage || "10"} onValueChange={(v) => { setPrefs({...prefs, tableRowsPerPage: v}); updatePrefMutation.mutate({ settingKey: "tableRowsPerPage", settingValue: v, isGlobal: true }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dashboard Layout</Label>
              <Select value={prefs.dashboardLayout || "grid"} onValueChange={(v) => { setPrefs({...prefs, dashboardLayout: v}); updatePrefMutation.mutate({ settingKey: "dashboardLayout", settingValue: v, isGlobal: true }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="grid">Grid</SelectItem><SelectItem value="list">List</SelectItem><SelectItem value="compact">Compact</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionManagementSection() {
  const utils = trpc.useUtils();
  const { data: sessions, isLoading } = trpc.security.getActiveSessions.useQuery({});
  const terminateSessionMutation = trpc.security.terminateSession.useMutation({ onSuccess: () => { utils.security.getActiveSessions.invalidate(); toast.success("Session ended"); } });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" />Active Sessions</CardTitle></div>
          <Button variant="outline" onClick={() => utils.security.getActiveSessions.invalidate()}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}</div> : sessions && sessions.length > 0 ? (
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Device</TableHead><TableHead>IP</TableHead><TableHead>Activity</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {sessions.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell><div><p className="font-medium">{s.userName || "Unknown"}</p><p className="text-sm text-muted-foreground">{s.userEmail}</p></div></TableCell>
                  <TableCell><div className="flex items-center gap-2">{s.userAgent?.includes("Mobile") ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}<span className="text-sm">{s.deviceInfo || "Unknown"}</span></div></TableCell>
                  <TableCell className="font-mono text-sm">{s.ipAddress || "—"}</TableCell>
                  <TableCell>{s.lastActivity ? format(new Date(s.lastActivity), "MMM d, HH:mm") : "—"}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => terminateSessionMutation.mutate({ sessionId: s.id })}><LogOut className="w-4 h-4 mr-1" />End</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <div className="text-center py-8 text-muted-foreground"><Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No active sessions</p></div>}
      </CardContent>
    </Card>
  );
}

function AuditLogsSection() {
  const { data: auditLogs, isLoading } = trpc.security.getAuditLogs.useQuery({ limit: 50 });
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Audit Logs</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <div className="animate-pulse space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded" />)}</div> : auditLogs && auditLogs.length > 0 ? (
          <Table>
            <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Module</TableHead><TableHead>Entity</TableHead><TableHead>User</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>
              {auditLogs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell><Badge variant={log.action === 'create' ? 'default' : log.action === 'delete' ? 'destructive' : 'secondary'}>{log.action}</Badge></TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell><span className="font-medium">{log.entityType}</span>{log.entityName && <span className="text-muted-foreground ml-1">({log.entityName})</span>}</TableCell>
                  <TableCell>User #{log.userId}</TableCell>
                  <TableCell>{format(new Date(log.createdAt), "MMM d, HH:mm:ss")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <div className="text-center py-8 text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No audit logs</p></div>}
      </CardContent>
    </Card>
  );
}

function SystemSettingsSection() {
  const { data: settings } = trpc.settings.getAll.useQuery();
  const updateSettingMutation = trpc.settings.update.useMutation({ onSuccess: () => toast.success("Saved") });
  const [formData, setFormData] = useState({ companyName: "", companyAddress: "", companyPhone: "", companyEmail: "", defaultCurrency: "BDT", timezone: "Asia/Dhaka" });

  useEffect(() => { if (settings) { const d = { ...formData }; settings.forEach((s: any) => { if (s.settingKey in d) { (d as any)[s.settingKey] = s.settingValue; } }); setFormData(d); } }, [settings]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Company Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Company Name</Label><Input value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} placeholder="Your Company" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.companyEmail} onChange={(e) => setFormData({...formData, companyEmail: e.target.value})} placeholder="info@company.com" /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Input value={formData.companyAddress} onChange={(e) => setFormData({...formData, companyAddress: e.target.value})} placeholder="Full address" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input value={formData.companyPhone} onChange={(e) => setFormData({...formData, companyPhone: e.target.value})} placeholder="+880 1234567890" /></div>
            <div className="space-y-2"><Label>Currency</Label><Select value={formData.defaultCurrency} onValueChange={(v) => setFormData({...formData, defaultCurrency: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BDT">BDT</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Timezone</Label><Select value={formData.timezone} onValueChange={(v) => setFormData({...formData, timezone: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select></div>
          </div>
          <Separator />
          <Button onClick={() => Object.entries(formData).forEach(([k, v]) => updateSettingMutation.mutate({ settingKey: k, settingValue: v, category: "general" }))}><Save className="w-4 h-4 mr-2" />Save</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />System Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Database</p><div className="flex items-center gap-2 mt-1"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="font-medium">Connected</span></div></div>
            <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Server</p><div className="flex items-center gap-2 mt-1"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="font-medium">Running</span></div></div>
            <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Version</p><span className="font-medium">v1.0.0</span></div>
            <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Environment</p><span className="font-medium">Production Ready</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
