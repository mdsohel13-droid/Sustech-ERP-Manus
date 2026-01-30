import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { useMemo, useState } from "react";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  Target,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  Truck,
  Building2,
  UserCheck,
  UserX,
  Timer,
  Plus,
  Send,
  MessageCircle,
  MoreVertical,
  Heart,
  Edit,
  Trash2,
  Archive,
  MapPin,
  Phone,
  Play,
  Image,
  Paperclip,
  ChevronRight,
  RefreshCw,
  Zap,
  BarChart3,
  Receipt,
  Wallet,
  CircleDollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";

export default function Home() {
  const { currency } = useCurrency();
  const [, navigate] = useLocation();
  const { isAdmin } = usePermissions();
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostDialog, setShowPostDialog] = useState(false);

  // Fetch all data with real-time refresh
  const { data: projects } = trpc.projects.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: customers } = trpc.customers.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: salesData } = trpc.sales.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: arData } = trpc.financial.getAccountsReceivable.useQuery(undefined, { refetchInterval: 30000 });
  const { data: apData } = trpc.financial.getAccountsPayable.useQuery(undefined, { refetchInterval: 30000 });
  const { data: incomeExpData } = trpc.incomeExpenditure.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: tenderData } = trpc.tenderQuotation.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: actionItems } = trpc.actionTracker.getAll.useQuery(undefined, { refetchInterval: 30000 });
  const { data: teamMembers } = trpc.hr.getAllEmployees.useQuery(undefined, { refetchInterval: 30000 });
  const { data: productsData } = trpc.products.getActiveProducts.useQuery(undefined, { refetchInterval: 30000 });
  const { data: inventoryData } = trpc.products.getAllInventoryWithProducts.useQuery(undefined, { refetchInterval: 30000 });
  const { data: crmLeads } = trpc.crm.getLeads.useQuery(undefined, { refetchInterval: 30000 });
  const { data: feedPosts = [] } = trpc.feed.getAll.useQuery(undefined, { refetchInterval: 10000 });
  const { data: users = [] } = trpc.users.getAll.useQuery(undefined, { refetchInterval: 60000 });

  const utils = trpc.useUtils();

  const createPostMutation = trpc.feed.create.useMutation({
    onSuccess: () => {
      toast.success("Post shared successfully!");
      setNewPostContent("");
      setShowPostDialog(false);
      utils.feed.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create post: " + error.message);
    },
  });

  const archivePostMutation = trpc.feed.archive.useMutation({
    onSuccess: () => {
      toast.success("Post archived");
      utils.feed.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to archive post: " + error.message);
    },
  });

  const deletePostMutation = trpc.feed.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.feed.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete post: " + error.message);
    },
  });

  const toggleReactionMutation = trpc.feed.toggleReaction.useMutation({
    onSuccess: () => {
      utils.feed.getAll.invalidate();
    },
  });

  // Calculate HRM metrics
  const hrmMetrics = useMemo(() => {
    const totalEmployees = teamMembers?.length || 0;
    const presentToday = Math.round(totalEmployees * 0.92);
    const onLeave = Math.round(totalEmployees * 0.05);
    const absent = totalEmployees - presentToday - onLeave;
    return { totalEmployees, presentToday, onLeave, absent };
  }, [teamMembers]);

  // Calculate Project metrics
  const projectMetrics = useMemo(() => {
    if (!projects) return { running: 0, completed: 0, postponed: 0, cancelled: 0, total: 0, completionRate: 0 };
    const running = projects.filter(p => p.stage === "execution" || p.stage === "lead" || p.stage === "proposal").length;
    const completed = projects.filter(p => p.stage === "won").length;
    const postponed = projects.filter(p => p.stage === "testing").length;
    const cancelled = 0;
    const total = projects.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { running, completed, postponed, cancelled, total, completionRate };
  }, [projects]);

  // Calculate Sales & Finance metrics
  const financeMetrics = useMemo(() => {
    const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || "0"), 0) || 0;
    const totalAR = arData?.reduce((sum, ar) => sum + parseFloat(ar.amount || "0"), 0) || 0;
    const totalAP = apData?.reduce((sum, ap) => sum + parseFloat(ap.amount || "0"), 0) || 0;
    const totalIncome = incomeExpData?.filter(i => i.type === "income").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    const totalExpense = incomeExpData?.filter(i => i.type === "expenditure").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    return { totalSales, totalAR, totalAP, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
  }, [salesData, arData, apData, incomeExpData]);

  // Calculate Inventory metrics
  const inventoryMetrics = useMemo(() => {
    const totalProducts = productsData?.length || 0;
    if (!inventoryData || inventoryData.length === 0) {
      return { totalProducts, totalStock: 0, stockValue: 0, lowStockCount: 0, outOfStock: 0 };
    }
    const totalStock = inventoryData.reduce((sum, inv: any) => sum + (inv.quantity || 0), 0);
    const stockValue = inventoryData.reduce((sum, inv: any) => {
      const product = inv.product as any;
      const price = product ? parseFloat(product.sellingPrice || product.selling_price || "0") : 0;
      return sum + (inv.quantity || 0) * price;
    }, 0);
    const lowStockCount = inventoryData.filter((inv: any) => {
      const qty = inv.quantity || 0;
      const product = inv.product as any;
      const reorder = product?.reorderLevel || product?.reorder_level || 10;
      return qty > 0 && qty <= reorder;
    }).length;
    const outOfStock = inventoryData.filter((inv: any) => (inv.quantity || 0) === 0).length;
    return { totalProducts, totalStock, stockValue, lowStockCount, outOfStock };
  }, [productsData, inventoryData]);

  // Calculate Tender metrics
  const tenderMetrics = useMemo(() => {
    if (!tenderData) return { pending: 0, submitted: 0, won: 0, pipelineValue: 0, winRate: 0 };
    const activeTenders = tenderData.filter(t => !t.archivedAt);
    const pending = activeTenders.filter(t => t.status === "not_started" || t.status === "preparing").length;
    const submitted = activeTenders.filter(t => t.status === "submitted").length;
    const won = activeTenders.filter(t => t.status === "win" || t.status === "po_received").length;
    const total = activeTenders.length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const pipelineValue = activeTenders.reduce((sum, t) => sum + parseFloat(t.estimatedValue || "0"), 0);
    return { pending, submitted, won, pipelineValue, winRate, total };
  }, [tenderData]);

  // CRM metrics
  const crmMetrics = useMemo(() => {
    if (!crmLeads) return { totalLeads: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0 };
    return {
      totalLeads: crmLeads.length,
      hotLeads: crmLeads.filter(l => l.status === "qualified" || l.status === "proposal_sent").length,
      warmLeads: crmLeads.filter(l => l.status === "contacted" || l.status === "negotiation").length,
      coldLeads: crmLeads.filter(l => l.status === "new" || l.status === "lost").length,
    };
  }, [crmLeads]);

  // Action Tracker metrics
  const actionMetrics = useMemo(() => {
    if (!actionItems) return { pending: 0, overdue: 0, completed: 0, highPriority: 0 };
    const pending = actionItems.filter(a => a.status === "open" || a.status === "in_progress").length;
    const overdue = actionItems.filter(a => {
      if (a.status === "resolved" || a.status === "closed") return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < new Date();
    }).length;
    const completed = actionItems.filter(a => a.status === "resolved" || a.status === "closed").length;
    const highPriority = actionItems.filter(a => a.priority === "high" && a.status !== "resolved" && a.status !== "closed").length;
    return { pending, overdue, completed, highPriority };
  }, [actionItems]);

  // Running projects for display
  const runningProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => p.stage === "execution" || p.stage === "lead" || p.stage === "proposal").slice(0, 5);
  }, [projects]);

  // Follow-up data
  const followUpLeads = useMemo(() => {
    if (!crmLeads) return [];
    return crmLeads.filter(l => l.status === "qualified" || l.status === "proposal_sent" || l.status === "negotiation").slice(0, 3);
  }, [crmLeads]);

  const followUpTasks = useMemo(() => {
    if (!actionItems) return [];
    return actionItems.filter(a => a.status === "open" || a.status === "in_progress").slice(0, 3);
  }, [actionItems]);

  // Employee tracker data (simulated for now)
  const employeeTrackerData = useMemo(() => {
    if (!teamMembers) return [];
    return teamMembers.slice(0, 4).map((emp: any, idx) => ({
      id: emp.employee?.id || emp.id || idx,
      firstName: emp.employee?.firstName || emp.user?.name?.split(" ")[0] || "Employee",
      lastName: emp.employee?.lastName || emp.user?.name?.split(" ")[1] || "",
      position: emp.position?.title || ["CEO", "Manager", "Developer", "Sales Rep"][idx % 4],
      location: ["Head Office, Floor 12", "Conference Room A", "Remote - Home Office", "Sales Floor"][idx % 4],
      currentStatus: ["Board Meeting", "Team Standup", "Code Review", "Client Call"][idx % 4],
      tasks: [
        { title: "Q4 Strategy Review", priority: "high", dueDate: "Today, 3PM" },
        { title: "Sprint Planning", priority: "medium", dueDate: "Tomorrow" },
      ],
    }));
  }, [teamMembers]);

  const getUserById = (userId: number) => users.find(u => u.id === userId);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate({ content: newPostContent, status: "live" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-green-100 text-green-700 border-green-200";
      case "due": return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": case "critical": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "execution": return "bg-purple-100 text-purple-700";
      case "won": return "bg-green-100 text-green-700";
      case "proposal": return "bg-blue-100 text-blue-700";
      case "lead": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const quickActions = [
    { icon: UserCheck, label: "New Lead", path: "/crm", color: "bg-blue-500" },
    { icon: ClipboardList, label: "Create Task", path: "/action-tracker", color: "bg-purple-500" },
    { icon: FileText, label: "New Quote", path: "/tender-quotation", color: "bg-amber-500" },
    { icon: Receipt, label: "Add Invoice", path: "/accounting", color: "bg-green-500" },
    { icon: Calendar, label: "Schedule", path: "/hr", color: "bg-indigo-500" },
    { icon: ShoppingCart, label: "New Sale", path: "/sales", color: "bg-pink-500" },
    { icon: Package, label: "Add Stock", path: "/inventory", color: "bg-teal-500" },
    { icon: MessageCircle, label: "Announcement", onClick: () => setShowPostDialog(true), color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header with Last Updated */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Master Dashboard</h1>
            <p className="text-gray-500 text-sm">Last updated: {format(new Date(), "h:mm a")}</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hidden sm:flex">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            System Online
          </Badge>
        </div>

        {/* Section 1: Module Overview Cards - Scrollable */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {/* CRM */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/crm")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">+12%</Badge>
                </div>
                <p className="text-2xl font-bold">{crmMetrics.totalLeads || 0}</p>
                <p className="text-xs opacity-80">Active Leads</p>
                <p className="text-[10px] mt-1 opacity-60">CRM</p>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/projects")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">{projectMetrics.running} due</Badge>
                </div>
                <p className="text-2xl font-bold">{projectMetrics.total || 0}</p>
                <p className="text-xs opacity-80">Active Projects</p>
                <p className="text-[10px] mt-1 opacity-60">Projects</p>
              </CardContent>
            </Card>

            {/* Tender/Quote */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/tender-quotation")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">+8%</Badge>
                </div>
                <p className="text-2xl font-bold">{tenderMetrics.total || 0}</p>
                <p className="text-xs opacity-80">Open Quotations</p>
                <p className="text-[10px] mt-1 opacity-60">Tender/Quote</p>
              </CardContent>
            </Card>

            {/* Finance */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/financial")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CircleDollarSign className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">+18%</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(financeMetrics.totalIncome, currency)}</p>
                <p className="text-xs opacity-80">Monthly Revenue</p>
                <p className="text-[10px] mt-1 opacity-60">Finance</p>
              </CardContent>
            </Card>

            {/* Accounting */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/accounting")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Receipt className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">{incomeExpData?.length || 0} pending</Badge>
                </div>
                <p className="text-2xl font-bold">{incomeExpData?.length || 0}</p>
                <p className="text-xs opacity-80">Transactions</p>
                <p className="text-[10px] mt-1 opacity-60">Accounting</p>
              </CardContent>
            </Card>

            {/* Sales */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/sales")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">+23%</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(financeMetrics.totalSales, currency)}</p>
                <p className="text-xs opacity-80">This Month</p>
                <p className="text-[10px] mt-1 opacity-60">Sales</p>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/inventory")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">{inventoryMetrics.lowStockCount} low</Badge>
                </div>
                <p className="text-2xl font-bold">{inventoryMetrics.totalStock.toLocaleString()}</p>
                <p className="text-xs opacity-80">Total SKUs</p>
                <p className="text-[10px] mt-1 opacity-60">Inventory</p>
              </CardContent>
            </Card>

            {/* HR */}
            <Card className="w-48 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/hr")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 opacity-80" />
                  <Badge className="bg-white/20 text-white text-xs">{hrmMetrics.onLeave} leave</Badge>
                </div>
                <p className="text-2xl font-bold">{hrmMetrics.totalEmployees}</p>
                <p className="text-xs opacity-80">Active Employees</p>
                <p className="text-[10px] mt-1 opacity-60">Human Resource</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Customize</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex-shrink-0 flex flex-col items-center gap-2 h-auto py-3 px-4 hover:bg-slate-50"
                  onClick={() => action.onClick ? action.onClick() : navigate(action.path)}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Running Projects + Follow-ups */}
          <div className="lg:col-span-2 space-y-6">
            {/* Running Projects */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Running Projects
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-purple-600">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Project</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Status</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Progress</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Due Date</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runningProjects.length > 0 ? runningProjects.map((project) => (
                        <tr key={project.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => navigate("/projects")}>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <p className="text-xs text-gray-500">{project.customerName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={getStageColor(project.stage)}>{project.stage}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Progress value={project.stage === "execution" ? 60 : project.stage === "won" ? 100 : 30} className="h-2 w-20" />
                              <span className="text-xs text-gray-500">{project.stage === "execution" ? "60%" : project.stage === "won" ? "100%" : "30%"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {project.expectedCloseDate ? format(new Date(project.expectedCloseDate), "MMM d, yyyy") : "-"}
                          </td>
                          <td className="py-3 px-2 font-medium">{formatCurrency(parseFloat(project.value || "0"), currency)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">No running projects</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Follow-ups Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Follow-ups
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/action-tracker")} className="text-amber-600">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="leads" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="leads" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Leads
                      <Badge variant="secondary" className="ml-1 text-xs">{followUpLeads.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Clients
                      <Badge variant="secondary" className="ml-1 text-xs">{customers?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      Tasks
                      <Badge variant="secondary" className="ml-1 text-xs">{followUpTasks.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="leads">
                    <div className="space-y-2">
                      {followUpLeads.length > 0 ? followUpLeads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => navigate("/crm")}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{lead.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{lead.name}</p>
                              <p className="text-xs text-gray-500">{lead.company}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatCurrency(parseFloat((lead as any).budget || "0"), currency)}</p>
                            <Badge className={getPriorityColor(lead.status)}>{lead.status}</Badge>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-4">No leads to follow up</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="clients">
                    <div className="space-y-2">
                      {customers?.slice(0, 3).map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => navigate("/contacts")}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-green-100 text-green-700">{customer.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.company}</p>
                            </div>
                          </div>
                          <Badge className={customer.status === "hot" ? "bg-red-100 text-red-700" : customer.status === "warm" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>{customer.status}</Badge>
                        </div>
                      )) || <p className="text-center text-gray-500 py-4">No clients</p>}
                    </div>
                  </TabsContent>

                  <TabsContent value="tasks">
                    <div className="space-y-2">
                      {followUpTasks.length > 0 ? followUpTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => navigate("/action-tracker")}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${task.priority === "high" ? "bg-red-100" : "bg-amber-100"}`}>
                              <ClipboardList className={`h-4 w-4 ${task.priority === "high" ? "text-red-600" : "text-amber-600"}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-gray-500">{task.description?.slice(0, 50)}...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getPriorityColor(task.priority || "medium")}>{task.priority}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{task.dueDate ? format(new Date(task.dueDate), "MMM d") : "-"}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-4">No pending tasks</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* News & Events Feed */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    News & Events Feed
                    <Badge variant="outline" className="text-xs">Live updates</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Post Input */}
                <div className="flex gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input 
                      placeholder="Share a project update, task, or event..." 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Image className="h-4 w-4 mr-1" /> Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Paperclip className="h-4 w-4 mr-1" /> Attach
                        </Button>
                      </div>
                      <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                        <Send className="h-4 w-4 mr-1" /> Post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Feed Posts */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {feedPosts.length > 0 ? feedPosts.map((post) => {
                      const author = getUserById(post.userId);
                      return (
                        <div key={post.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {author?.name?.slice(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{author?.name || "User"}</p>
                                <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => archivePostMutation.mutate({ id: post.id })}>
                                    <Archive className="h-4 w-4 mr-2" /> Archive
                                  </DropdownMenuItem>
                                  {isAdmin && (
                                    <DropdownMenuItem className="text-red-600" onClick={() => deletePostMutation.mutate({ id: post.id })}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-red-500"
                              onClick={() => toggleReactionMutation.mutate({ feedId: post.id, reaction: "like" })}
                            >
                              <Heart className="h-4 w-4 mr-1" /> Like
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <MessageCircle className="h-4 w-4 mr-1" /> Comment
                            </Button>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No posts yet. Share an update!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Tracker, Action Tracker, AI Assistant */}
          <div className="space-y-6">
            {/* Live Tracker */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Live Tracker
                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      Live
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {employeeTrackerData.map((emp, idx) => (
                      <div key={emp.id || idx} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`text-white ${["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-green-500"][idx % 4]}`}>
                              {(emp.firstName?.slice(0, 1) || "") + (emp.lastName?.slice(0, 1) || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-500">{emp.position || ["CEO", "Manager", "Employee", "Employee"][idx % 4]}</p>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{emp.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{emp.currentStatus}</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {emp.tasks.map((task, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded">
                                <span>{task.title}</span>
                                <Badge className={getPriorityColor(task.priority)} variant="outline">{task.priority}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {employeeTrackerData.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No employees to track</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Action Tracker */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    Action Tracker
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/action-tracker")} className="text-amber-600">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-700">{actionMetrics.pending}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{actionMetrics.overdue}</p>
                    <p className="text-xs text-gray-600">Overdue</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{actionMetrics.completed}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-700">{actionMetrics.highPriority}</p>
                    <p className="text-xs text-gray-600">High Priority</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate("/action-tracker")}>
                  <Plus className="h-4 w-4 mr-2" /> Create Action Item
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant Widget */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Assistant
                  <Badge variant="outline" className="text-xs">Powered by AI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <p className="text-sm text-gray-600">
                    Hello! I'm your ERP AI Assistant. I can help you with reports, data analysis, task management, and more. What would you like to know?
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/ai-assistant")}>
                      Show today's sales summary
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/ai-assistant")}>
                      What are my pending tasks?
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/ai-assistant")}>
                      Generate inventory report
                    </Button>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => navigate("/ai-assistant")}>
                  <MessageCircle className="h-4 w-4 mr-2" /> Open AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share an Update</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="What would you like to share?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
              <Send className="h-4 w-4 mr-2" /> Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
