import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

export function useHomeDashboardData() {
  const { currency } = useCurrency();
  const refetchOpts = { refetchInterval: 30000 };

  const { data: projects } = trpc.projects.getAll.useQuery(undefined, refetchOpts);
  const { data: customers } = trpc.customers.getAll.useQuery(undefined, refetchOpts);
  const { data: salesData } = trpc.sales.getAll.useQuery(undefined, refetchOpts);
  const { data: arData } = trpc.financial.getAccountsReceivable.useQuery(undefined, refetchOpts);
  const { data: apData } = trpc.financial.getAccountsPayable.useQuery(undefined, refetchOpts);
  const { data: incomeExpData } = trpc.incomeExpenditure.getAll.useQuery(undefined, refetchOpts);
  const { data: tenderData } = trpc.tenderQuotation.getAll.useQuery(undefined, refetchOpts);
  const { data: actionItems } = trpc.actionTracker.getAll.useQuery(undefined, refetchOpts);
  const { data: teamMembers } = trpc.hr.getAllEmployees.useQuery(undefined, refetchOpts);
  const { data: productsData } = trpc.products.getActiveProducts.useQuery(undefined, refetchOpts);
  const { data: inventoryData } = trpc.products.getAllInventoryWithProducts.useQuery(undefined, refetchOpts);
  const { data: crmLeads } = trpc.crm.getLeads.useQuery(undefined, refetchOpts);
  const { data: users = [] } = trpc.users.getAll.useQuery(undefined, { refetchInterval: 60000 });

  const projectMetrics = useMemo(() => {
    if (!projects) return { running: 0, completed: 0, total: 0, completionRate: 0 };
    const running = projects.filter(p => p.stage === "execution" || p.stage === "lead" || p.stage === "proposal").length;
    const completed = projects.filter(p => p.stage === "won").length;
    const total = projects.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { running, completed, total, completionRate };
  }, [projects]);

  const financeMetrics = useMemo(() => {
    const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || "0"), 0) || 0;
    const totalAR = arData?.reduce((sum, ar) => sum + parseFloat(ar.amount || "0"), 0) || 0;
    const totalAP = apData?.reduce((sum, ap) => sum + parseFloat(ap.amount || "0"), 0) || 0;
    const totalIncome = incomeExpData?.filter(i => i.type === "income").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    const totalExpense = incomeExpData?.filter(i => i.type === "expenditure").reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) || 0;
    const pendingApprovals = (arData?.filter((ar: any) => ar.approvalStatus === "pending_approval").length || 0) +
      (apData?.filter((ap: any) => ap.approvalStatus === "pending_approval").length || 0);
    return { totalSales, totalAR, totalAP, totalIncome, totalExpense, netProfit: totalIncome - totalExpense, pendingApprovals };
  }, [salesData, arData, apData, incomeExpData]);

  const inventoryMetrics = useMemo(() => {
    const totalProducts = productsData?.length || 0;
    if (!inventoryData || inventoryData.length === 0) {
      return { totalProducts, totalStock: 0, stockValue: 0, lowStockCount: 0, outOfStock: 0, lowStockItems: [] as any[] };
    }
    const totalStock = inventoryData.reduce((sum, inv: any) => sum + (inv.quantity || 0), 0);
    const stockValue = inventoryData.reduce((sum, inv: any) => {
      const product = inv.product as any;
      const price = product ? parseFloat(product.sellingPrice || product.selling_price || "0") : 0;
      return sum + (inv.quantity || 0) * price;
    }, 0);
    const lowStockItems = inventoryData.filter((inv: any) => {
      const qty = inv.quantity || 0;
      const product = inv.product as any;
      const reorder = product?.reorderLevel || product?.reorder_level || 10;
      return qty > 0 && qty <= reorder;
    }).map((inv: any) => {
      const product = inv.product as any;
      return {
        id: inv.id,
        name: product?.name || "Unknown",
        sku: product?.sku || inv.sku || "-",
        quantity: inv.quantity || 0,
        reorderLevel: product?.reorderLevel || product?.reorder_level || 10,
        critical: (inv.quantity || 0) <= (product?.reorderLevel || product?.reorder_level || 10) / 2,
      };
    });
    const lowStockCount = lowStockItems.length;
    const outOfStock = inventoryData.filter((inv: any) => (inv.quantity || 0) === 0).length;
    return { totalProducts, totalStock, stockValue, lowStockCount, outOfStock, lowStockItems };
  }, [productsData, inventoryData]);

  const tenderMetrics = useMemo(() => {
    if (!tenderData) return { pending: 0, submitted: 0, won: 0, pipelineValue: 0, winRate: 0, total: 0, wonValue: 0 };
    const activeTenders = tenderData.filter(t => !t.archivedAt);
    const pending = activeTenders.filter(t => t.status === "not_started" || t.status === "preparing").length;
    const submitted = activeTenders.filter(t => t.status === "submitted").length;
    const won = activeTenders.filter(t => t.status === "win" || t.status === "po_received").length;
    const total = activeTenders.length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const pipelineValue = activeTenders.reduce((sum, t) => sum + parseFloat(t.estimatedValue || "0"), 0);
    const wonValue = activeTenders.filter(t => t.status === "win" || t.status === "po_received")
      .reduce((sum, t) => sum + parseFloat(t.estimatedValue || "0"), 0);
    return { pending, submitted, won, pipelineValue, winRate, total, wonValue };
  }, [tenderData]);

  const crmMetrics = useMemo(() => {
    if (!crmLeads) return { totalLeads: 0, qualified: 0, proposal: 0, negotiation: 0, closedWon: 0, pipelineValue: 0, conversionRate: 0 };
    const totalLeads = crmLeads.length;
    const qualified = crmLeads.filter(l => l.status === "qualified").length;
    const proposal = crmLeads.filter(l => l.status === "proposal_sent").length;
    const negotiation = crmLeads.filter(l => l.status === "negotiation").length;
    const closedWon = crmLeads.filter(l => l.status === "won" || (l.status as string) === "closed_won").length;
    const pipelineValue = crmLeads.reduce((sum, l) => sum + parseFloat((l as any).budget || "0"), 0);
    const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100 * 10) / 10 : 0;
    return { totalLeads, qualified, proposal, negotiation, closedWon, pipelineValue, conversionRate };
  }, [crmLeads]);

  const actionMetrics = useMemo(() => {
    if (!actionItems) return { pending: 0, overdue: 0, completed: 0, highPriority: 0, thisWeek: 0 };
    const pending = actionItems.filter(a => a.status === "open" || a.status === "in_progress").length;
    const overdue = actionItems.filter(a => {
      if (a.status === "resolved" || a.status === "closed") return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < new Date();
    }).length;
    const completed = actionItems.filter(a => a.status === "resolved" || a.status === "closed").length;
    const highPriority = actionItems.filter(a => a.priority === "high" && a.status !== "resolved" && a.status !== "closed").length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = actionItems.filter(a => new Date(a.createdAt) >= oneWeekAgo).length;
    return { pending, overdue, completed, highPriority, thisWeek };
  }, [actionItems]);

  const hrmMetrics = useMemo(() => {
    const totalEmployees = teamMembers?.length || 0;
    const departments = new Map<string, number>();
    teamMembers?.forEach((emp: any) => {
      const dept = emp.department?.name || emp.position?.department || "General";
      departments.set(dept, (departments.get(dept) || 0) + 1);
    });
    return {
      totalEmployees,
      departments: Array.from(departments.entries()).map(([name, count]) => ({ name, count })),
    };
  }, [teamMembers]);

  const runningProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(p => p.stage === "execution" || p.stage === "lead" || p.stage === "proposal" || p.stage === "won")
      .slice(0, 10);
  }, [projects]);

  const activeTenders = useMemo(() => {
    if (!tenderData) return [];
    return tenderData.filter(t => !t.archivedAt).slice(0, 10);
  }, [tenderData]);

  return {
    projects, customers, salesData, arData, apData, incomeExpData,
    tenderData, actionItems, teamMembers, productsData, inventoryData,
    crmLeads, users,
    projectMetrics, financeMetrics, inventoryMetrics, tenderMetrics,
    crmMetrics, actionMetrics, hrmMetrics,
    runningProjects, activeTenders,
    currency, formatCurrency: (val: number) => formatCurrency(val, currency),
  };
}
