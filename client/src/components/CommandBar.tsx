import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Command, 
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  Warehouse,
  DollarSign,
  Briefcase,
  Target,
  FileText,
  BarChart3,
  Lightbulb,
  Sparkles,
  Settings,
  Plus,
  ArrowRight,
  Calculator,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: "navigation" | "action" | "search" | "ai";
  keywords?: string[];
}

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
}

// Fuzzy search implementation
function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact substring match
  if (textLower.includes(queryLower)) return true;
  
  // Fuzzy character match
  let queryIdx = 0;
  for (let i = 0; i < textLower.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIdx]) {
      queryIdx++;
    }
  }
  return queryIdx === queryLower.length;
}

export function CommandBar({ open, onClose }: CommandBarProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiMode, setAiMode] = useState(false);

  // Fetch data for search
  const { data: customers } = trpc.customers.getAll.useQuery(undefined, { enabled: open });
  const { data: projects } = trpc.projects.getAll.useQuery(undefined, { enabled: open });
  // Sales search disabled - no getAll query available

  // Navigation items
  const navigationItems: CommandItem[] = useMemo(() => [
    { id: "nav-home", label: "Home Dashboard", icon: LayoutDashboard, action: () => setLocation("/"), category: "navigation", keywords: ["dashboard", "home", "main"] },
    { id: "nav-sales", label: "Sell / POS", icon: ShoppingCart, action: () => setLocation("/sales"), category: "navigation", keywords: ["sales", "pos", "sell", "invoice"] },
    { id: "nav-products", label: "Products", icon: Package, action: () => setLocation("/products"), category: "navigation", keywords: ["products", "items", "inventory"] },
    { id: "nav-contacts", label: "CRM", icon: Users, action: () => setLocation("/crm"), category: "navigation", keywords: ["crm", "contacts", "customers", "clients", "leads"] },
    { id: "nav-procurement", label: "Procurement", icon: Receipt, action: () => setLocation("/procurement"), category: "navigation", keywords: ["procurement", "purchases", "buy", "vendor", "supply"] },
    { id: "nav-inventory", label: "Inventory", icon: Warehouse, action: () => setLocation("/inventory"), category: "navigation", keywords: ["inventory", "stock", "warehouse"] },
    { id: "nav-accounts", label: "Accounts", icon: DollarSign, action: () => setLocation("/financial"), category: "navigation", keywords: ["accounts", "finance", "money"] },
    { id: "nav-expenses", label: "Expenses", icon: Receipt, action: () => setLocation("/income-expenditure"), category: "navigation", keywords: ["expenses", "costs", "spending"] },
    { id: "nav-projects", label: "Projects", icon: Briefcase, action: () => setLocation("/projects"), category: "navigation", keywords: ["projects", "work", "tasks"] },
    { id: "nav-action-tracker", label: "Action Tracker", icon: Target, action: () => setLocation("/action-tracker"), category: "navigation", keywords: ["actions", "tracker", "tasks"] },
    { id: "nav-hrm", label: "Human Resources", icon: Users, action: () => setLocation("/hr"), category: "navigation", keywords: ["hr", "hrm", "employees", "staff"] },
    { id: "nav-tenders", label: "Tenders & Quotations", icon: FileText, action: () => setLocation("/tender-quotation"), category: "navigation", keywords: ["tenders", "quotations", "bids"] },
    { id: "nav-reports", label: "Reports", icon: BarChart3, action: () => setLocation("/reports"), category: "navigation", keywords: ["reports", "analytics", "charts"] },
    { id: "nav-ideas", label: "Ideas", icon: Lightbulb, action: () => setLocation("/ideas"), category: "navigation", keywords: ["ideas", "suggestions", "innovation"] },
    { id: "nav-settings", label: "Settings", icon: Settings, action: () => setLocation("/settings"), category: "navigation", keywords: ["settings", "config", "preferences"] },
  ], [setLocation]);

  // Quick actions
  const actionItems: CommandItem[] = useMemo(() => [
    { id: "action-new-sale", label: "Create New Sale", description: "Start a new sales transaction", icon: Plus, action: () => { setLocation("/sales"); alert("New sale form - coming soon"); }, category: "action", keywords: ["new", "create", "sale", "invoice"] },
    { id: "action-add-product", label: "Add Product", description: "Add a new product to inventory", icon: Plus, action: () => { setLocation("/products"); alert("Add product form - coming soon"); }, category: "action", keywords: ["new", "add", "product", "item"] },
    { id: "action-new-customer", label: "New Customer", description: "Register a new customer", icon: Plus, action: () => { setLocation("/customers"); alert("New customer form - coming soon"); }, category: "action", keywords: ["new", "customer", "client", "contact"] },
    { id: "action-record-expense", label: "Record Expense", description: "Log a new expense", icon: Plus, action: () => { setLocation("/income-expenditure"); }, category: "action", keywords: ["expense", "cost", "record", "log"] },
    { id: "action-new-project", label: "New Project", description: "Create a new project", icon: Plus, action: () => { setLocation("/projects"); }, category: "action", keywords: ["new", "project", "create"] },
    { id: "action-new-tender", label: "New Tender/Quote", description: "Create a new tender or quotation", icon: Plus, action: () => { setLocation("/tender-quotation"); }, category: "action", keywords: ["tender", "quote", "quotation", "bid"] },
  ], [setLocation]);

  // AI commands (natural language)
  const aiCommands: CommandItem[] = useMemo(() => [
    { id: "ai-sales-report", label: "Show me this month's sales", icon: TrendingUp, action: () => { setLocation("/reports"); alert("AI: Generating sales report..."); }, category: "ai", keywords: ["sales", "report", "month", "revenue"] },
    { id: "ai-overdue", label: "What invoices are overdue?", icon: AlertCircle, action: () => { setLocation("/financial"); alert("AI: Finding overdue invoices..."); }, category: "ai", keywords: ["overdue", "invoice", "late", "unpaid"] },
    { id: "ai-top-customers", label: "Who are my top customers?", icon: Users, action: () => { setLocation("/customers"); alert("AI: Analyzing customer data..."); }, category: "ai", keywords: ["top", "best", "customers", "clients"] },
    { id: "ai-cash-flow", label: "Forecast cash flow", icon: Calculator, action: () => { setLocation("/financial"); alert("AI: Generating cash flow forecast..."); }, category: "ai", keywords: ["cash", "flow", "forecast", "predict"] },
    { id: "ai-schedule", label: "What's on my schedule today?", icon: Calendar, action: () => { alert("AI: Checking your schedule..."); }, category: "ai", keywords: ["schedule", "today", "calendar", "appointments"] },
  ], [setLocation]);

  // Search results from data
  const searchResults: CommandItem[] = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const results: CommandItem[] = [];
    
    // Search customers
    customers?.forEach((customer: { id: number; name: string; email?: string | null }) => {
      if (fuzzyMatch(customer.name, query) || (customer.email && fuzzyMatch(customer.email, query))) {
        results.push({
          id: `customer-${customer.id}`,
          label: customer.name,
          description: customer.email || "Customer",
          icon: Users,
          action: () => { setLocation("/customers"); },
          category: "search",
          keywords: []
        });
      }
    });

    // Search projects
    projects?.forEach((project: { id: number; name: string; stage: string }) => {
      if (fuzzyMatch(project.name, query)) {
        results.push({
          id: `project-${project.id}`,
          label: project.name,
          description: `Project - ${project.stage}`,
          icon: Briefcase,
          action: () => { setLocation("/projects"); },
          category: "search",
          keywords: []
        });
      }
    });

    // Sales search - would require adding getAll query to sales router

    return results.slice(0, 5);
  }, [query, customers, projects, setLocation]);

  // Filter all items based on query
  const filteredItems = useMemo(() => {
    if (!query) {
      return [...actionItems.slice(0, 4), ...navigationItems.slice(0, 6)];
    }

    const allItems = [...navigationItems, ...actionItems, ...aiCommands, ...searchResults];
    
    return allItems.filter(item => {
      if (fuzzyMatch(item.label, query)) return true;
      if (item.description && fuzzyMatch(item.description, query)) return true;
      if (item.keywords?.some(kw => fuzzyMatch(kw, query))) return true;
      return false;
    }).slice(0, 10);
  }, [query, navigationItems, actionItems, aiCommands, searchResults]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
            onClose();
            setQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          setQuery("");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={() => { onClose(); setQuery(""); }}
    >
      <div 
        className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search modules, records, or ask AI..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2">
              {/* Group by category */}
              {query && searchResults.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Search Results</div>
                  {searchResults.map((item, idx) => {
                    const globalIdx = filteredItems.findIndex(i => i.id === item.id);
                    return (
                      <CommandItem 
                        key={item.id} 
                        item={item} 
                        selected={selectedIndex === globalIdx}
                        onSelect={() => { item.action(); onClose(); setQuery(""); }}
                      />
                    );
                  })}
                </div>
              )}

              {!query && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Quick Actions</div>
                  {actionItems.slice(0, 4).map((item, idx) => (
                    <CommandItem 
                      key={item.id} 
                      item={item} 
                      selected={selectedIndex === idx}
                      onSelect={() => { item.action(); onClose(); setQuery(""); }}
                    />
                  ))}
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground mt-2">Navigation</div>
                  {navigationItems.slice(0, 6).map((item, idx) => (
                    <CommandItem 
                      key={item.id} 
                      item={item} 
                      selected={selectedIndex === idx + 4}
                      onSelect={() => { item.action(); onClose(); setQuery(""); }}
                    />
                  ))}
                </>
              )}

              {query && filteredItems.filter(i => i.category !== "search").map((item, idx) => {
                const globalIdx = searchResults.length + idx;
                return (
                  <CommandItem 
                    key={item.id} 
                    item={item} 
                    selected={selectedIndex === globalIdx}
                    onSelect={() => { item.action(); onClose(); setQuery(""); }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term or ask AI</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K to open
          </span>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI-powered search
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandItem({ 
  item, 
  selected, 
  onSelect 
}: { 
  item: CommandItem; 
  selected: boolean; 
  onSelect: () => void;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        selected ? "bg-accent" : "hover:bg-accent/50"
      }`}
      onClick={onSelect}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        item.category === "action" ? "bg-primary/10 text-primary" :
        item.category === "ai" ? "bg-purple-100 text-purple-600" :
        item.category === "search" ? "bg-green-100 text-green-600" :
        "bg-muted text-muted-foreground"
      }`}>
        <item.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.label}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
