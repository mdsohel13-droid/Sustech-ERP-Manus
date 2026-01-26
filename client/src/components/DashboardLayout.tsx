import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  Users, 
  DollarSign, 
  Briefcase, 
  Lightbulb, 
  TrendingUp, 
  Settings, 
  Receipt, 
  Target, 
  FileText,
  Search,
  Bell,
  Sparkles,
  Package,
  ShoppingCart,
  Warehouse,
  BarChart3,
  UserCircle,
  HelpCircle,
  Activity,
  Shield
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { usePermissions } from "@/hooks/usePermissions";

import { CommandBar } from "./CommandBar";
import { AIAssistant } from "./AIAssistant";

// World-class ERP module structure following Odoo/NetSuite/SAP patterns
const ALL_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Home", path: "/", module: "dashboard", group: "main" },
  { icon: ShoppingCart, label: "Sales", path: "/sales", module: "sales", group: "operations" },
  { icon: Package, label: "Products", path: "/products", module: "products", group: "operations" },
  { icon: Users, label: "Customers", path: "/customers", module: "customers", group: "operations" },
  { icon: Receipt, label: "Purchases", path: "/purchases", module: "purchases", group: "operations" },
  { icon: Warehouse, label: "Inventory", path: "/inventory", module: "inventory", group: "operations" },
  { icon: DollarSign, label: "Financial", path: "/financial", module: "financial", group: "finance" },
  { icon: Receipt, label: "Income & Expense", path: "/income-expenditure", module: "income_expenditure", group: "finance" },
  { icon: Briefcase, label: "Projects", path: "/projects", module: "projects", group: "business" },
  { icon: Target, label: "Action Tracker", path: "/action-tracker", module: "action_tracker", group: "business" },
  { icon: FileText, label: "Tender/Quotation", path: "/tender-quotation", module: "tender_quotation", group: "business" },
  { icon: Users, label: "Human Resource", path: "/hr", module: "hr", group: "business" },
  { icon: BarChart3, label: "Reports", path: "/reports", module: "reports", group: "analytics" },
  { icon: Lightbulb, label: "Ideas", path: "/ideas", module: "ideas", group: "tools" },
  { icon: Sparkles, label: "AI Assistant", path: "/ai-assistant", module: "ai_assistant", group: "tools" },
  { icon: Activity, label: "Hyperlink Analytics", path: "/hyperlink-analytics", module: "admin", group: "system" },
  { icon: Settings, label: "Settings", path: "/settings", module: "settings", group: "system" },
  { icon: Shield, label: "Admin Panel", path: "/admin-settings", module: "admin", group: "system" },
];

const MODULE_GROUPS = [
  { id: "main", label: "" },
  { id: "operations", label: "Operations" },
  { id: "finance", label: "Finance" },
  { id: "business", label: "Business" },
  { id: "analytics", label: "Analytics" },
  { id: "tools", label: "Tools" },
  { id: "system", label: "System" },
];

const getMenuItems = (userRole?: string, hasModuleAccess?: (module: string) => boolean) => {
  return ALL_MENU_ITEMS.filter(item => {
    if (item.module === 'dashboard') return true;
    if (item.module === 'settings' || item.module === 'admin') return userRole === 'admin';
    if (hasModuleAccess) {
      return hasModuleAccess(item.module);
    }
    return userRole === 'admin' || userRole === 'manager';
  });
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 320;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Global keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    const handleDemoLogin = () => {
      // Set demo mode cookie with proper attributes for cross-origin
      document.cookie = "erp-demo-mode=true; path=/; max-age=86400; SameSite=Lax";
      // Also store in localStorage as backup
      localStorage.setItem("erp-demo-mode", "true");
      // Force full page reload to ensure cookie is sent with next request
      window.location.href = window.location.origin + "/";
    };

    // Auto-login if localStorage has demo mode (handles cookie issues)
    if (typeof window !== 'undefined' && localStorage.getItem("erp-demo-mode") === "true") {
      // Ensure cookie is set
      if (!document.cookie.includes("erp-demo-mode=true")) {
        document.cookie = "erp-demo-mode=true; path=/; max-age=86400; SameSite=Lax";
        window.location.reload();
        return null;
      }
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-semibold">Welcome to Sustech ERP</h1>
            <p className="text-muted-foreground">
              Sign in to access your business dashboard, manage operations, and track performance.
            </p>
          </div>
          <div className="w-full space-y-3">
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              size="lg"
              className="w-full"
              data-testid="sign-in-btn"
            >
              Sign in to Continue
            </Button>
            <Button
              onClick={handleDemoLogin}
              variant="outline"
              size="lg"
              className="w-full"
              data-testid="demo-mode-btn"
            >
              Demo Mode (Admin Access)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent 
        setSidebarWidth={setSidebarWidth}
        commandOpen={commandOpen}
        setCommandOpen={setCommandOpen}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  commandOpen,
  setCommandOpen,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const { hasModuleAccess } = usePermissions();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuItems = getMenuItems(user?.role, hasModuleAccess);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Group menu items
  const groupedMenuItems = MODULE_GROUPS.map(group => ({
    ...group,
    items: menuItems.filter(item => item.group === group.id)
  })).filter(group => group.items.length > 0);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      {/* Command Bar (Ctrl+K) */}
      <CommandBar open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* AI Assistant Panel */}
      <AIAssistant open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border" disableTransition={isResizing}>
          <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-sidebar-foreground" />
              </button>
              {!isCollapsed && (
                <span className="font-semibold text-sidebar-foreground truncate">Sustech ERP</span>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-2">
            {groupedMenuItems.map((group, groupIdx) => (
              <div key={group.id}>
                {group.label && !isCollapsed && (
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </div>
                )}
                <SidebarMenu className="px-2">
                  {group.items.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-9 transition-all ${isActive ? 'bg-sidebar-accent font-medium' : ''}`}
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={isActive ? 'text-foreground' : ''}>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
                {groupIdx < groupedMenuItems.length - 1 && !isCollapsed && (
                  <div className="mx-4 my-2 border-t border-sidebar-border" />
                )}
              </div>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate">{user?.name || "-"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role || "User"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Help center coming soon')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
            onMouseDown={() => !isCollapsed && setIsResizing(true)}
            style={{ zIndex: 50 }}
          />
        )}
      </div>

      <SidebarInset className="flex flex-col">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {isMobile && <SidebarTrigger className="h-8 w-8" />}
            
            {/* Command Bar Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground w-64"
            >
              <Search className="w-4 h-4" />
              <span>Search or type command...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-background rounded border border-border">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* AI Assistant Toggle */}
            <Button 
              variant={aiPanelOpen ? "default" : "ghost"} 
              size="icon"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
