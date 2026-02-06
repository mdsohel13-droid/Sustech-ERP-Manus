import { useHomeDashboardData } from "./home/useHomeDashboardData";
import { useFeedActions } from "./home/useFeedActions";
import WelcomeHeader from "./home/WelcomeHeader";
import KPIOverviewRow from "./home/KPIOverviewRow";
import RevenueCard from "./home/RevenueCard";
import RunningProjectsTable from "./home/RunningProjectsTable";
import TenderQuotationTable from "./home/TenderQuotationTable";
import ProjectCardsGrid from "./home/ProjectCardsGrid";
import TeamWorkload from "./home/TeamWorkload";
import SalesFunnel from "./home/SalesFunnel";
import RecentActivityFeed from "./home/RecentActivityFeed";
import CalendarWidget from "./home/CalendarWidget";
import AIAssistantWidget from "./home/AIAssistantWidget";
import StockAlerts from "./home/StockAlerts";
import QuickActionsPanel from "./home/QuickActionsPanel";
import SocialFeed from "./home/SocialFeed";

export default function Home() {
  const data = useHomeDashboardData();
  const feed = useFeedActions();

  const weeklyTarget = data.projectMetrics.total > 0
    ? Math.min(100, Math.round((data.projectMetrics.completed / data.projectMetrics.total) * 100))
    : 85;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto space-y-5">

        <WelcomeHeader
          pendingApprovals={data.financeMetrics.pendingApprovals}
          lowStockCount={data.inventoryMetrics.lowStockCount}
          overdueActions={data.actionMetrics.overdue}
          weeklyTarget={weeklyTarget}
        />

        <KPIOverviewRow
          totalRevenue={data.formatCurrency(data.financeMetrics.totalIncome)}
          totalSales={data.formatCurrency(data.financeMetrics.totalSales)}
          projectsTotal={data.projectMetrics.total}
          projectsRunning={data.projectMetrics.running}
          tendersTotal={data.tenderMetrics.total}
          tendersWon={data.tenderMetrics.won}
          totalLeads={data.crmMetrics.totalLeads}
          totalEmployees={data.hrmMetrics.totalEmployees}
          totalStock={data.inventoryMetrics.totalStock}
          lowStockCount={data.inventoryMetrics.lowStockCount}
          transactionCount={data.incomeExpData?.length || 0}
        />

        <RevenueCard
          totalRevenue={data.formatCurrency(data.financeMetrics.totalIncome)}
          growthPercent="+12.5%"
          pendingActions={data.actionMetrics.pending}
          itemsToReorder={data.inventoryMetrics.lowStockCount}
          transactionCount={data.incomeExpData?.length || 0}
          invoiceCount={(data.arData?.length || 0) + (data.apData?.length || 0)}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RunningProjectsTable
            projects={data.runningProjects}
            totalProjects={data.projects?.length || 0}
            formatCurrency={data.formatCurrency}
          />
          <TenderQuotationTable
            tenders={data.activeTenders}
            totalTenders={data.tenderData?.filter(t => !t.archivedAt).length || 0}
            pipelineValue={data.formatCurrency(data.tenderMetrics.pipelineValue)}
            wonValue={data.formatCurrency(data.tenderMetrics.wonValue)}
            formatCurrency={data.formatCurrency}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <ProjectCardsGrid
              projects={data.runningProjects}
              formatCurrency={data.formatCurrency}
            />

            <SalesFunnel
              totalLeads={data.crmMetrics.totalLeads}
              qualified={data.crmMetrics.qualified}
              proposal={data.crmMetrics.proposal}
              negotiation={data.crmMetrics.negotiation}
              closedWon={data.crmMetrics.closedWon}
              pipelineValue={data.formatCurrency(data.crmMetrics.pipelineValue)}
              conversionRate={data.crmMetrics.conversionRate}
            />

            <SocialFeed feed={feed} />
          </div>

          <div className="space-y-5">
            <TeamWorkload
              departments={data.hrmMetrics.departments}
              totalEmployees={data.hrmMetrics.totalEmployees}
            />

            <QuickActionsPanel />

            <RecentActivityFeed
              actionItems={data.actionItems || []}
              tenders={data.activeTenders}
              users={data.users}
            />

            <CalendarWidget
              actionItems={data.actionItems || []}
              users={data.users}
            />

            <StockAlerts
              lowStockItems={data.inventoryMetrics.lowStockItems || []}
              outOfStock={data.inventoryMetrics.outOfStock}
            />

            <AIAssistantWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
