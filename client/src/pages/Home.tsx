import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Briefcase, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: overview, isLoading } = trpc.dashboard.getOverview.useQuery();
  const { data: insights } = trpc.dashboard.getInsights.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-12 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const arTotal = Number(overview?.ar.total || 0);
  const arOverdue = Number(overview?.ar.overdue || 0);
  const apTotal = Number(overview?.ap.total || 0);
  const apOverdue = Number(overview?.ap.overdue || 0);
  const netPosition = arTotal - apTotal;

  const projectsByStage = overview?.projects || [];
  const totalProjects = projectsByStage.reduce((sum, p) => sum + Number(p.count), 0);
  const totalProjectValue = projectsByStage.reduce((sum, p) => sum + Number(p.totalValue), 0);

  const customersByStatus = overview?.customers || [];
  const totalCustomers = customersByStatus.reduce((sum, c) => sum + Number(c.count), 0);
  const hotCustomers = customersByStatus.find(c => c.status === 'hot')?.count || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Operations Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive view of business health, projects, and team performance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Financial Health */}
        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Net Position</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${netPosition.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-muted-foreground">AR: ${arTotal.toLocaleString()}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">AP: ${apTotal.toLocaleString()}</span>
            </div>
            {(arOverdue > 0 || apOverdue > 0) && (
              <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue items detected</span>
              </div>
            )}
            <Link href="/financial">
              <Button variant="link" size="sm" className="mt-2 px-0">
                View Details <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Active Projects</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProjects}</div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Total Value: ${totalProjectValue.toLocaleString()}</span>
            </div>
            <div className="mt-3 space-y-1">
              {projectsByStage.slice(0, 3).map((stage) => (
                <div key={stage.stage} className="flex justify-between text-xs">
                  <span className="capitalize text-muted-foreground">{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
              ))}
            </div>
            <Link href="/projects">
              <Button variant="link" size="sm" className="mt-2 px-0">
                View Pipeline <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="editorial-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium label-text">Total Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                {hotCustomers} Hot
              </span>
              <span className="text-muted-foreground text-xs">High priority leads</span>
            </div>
            <div className="mt-3 space-y-1">
              {customersByStatus.map((status) => (
                <div key={status.status} className="flex justify-between text-xs">
                  <span className="capitalize text-muted-foreground">{status.status}</span>
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
            <Link href="/customers">
              <Button variant="link" size="sm" className="mt-2 px-0">
                View CRM <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="editorial-card hover:shadow-lg transition-shadow bg-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium label-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Add New Project
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
            <Link href="/financial">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Transaction
              </Button>
            </Link>
            <Link href="/ideas">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                Capture Idea
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* LLM Insights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold">AI-Generated Insights</h2>
          <InsightActions />
        </div>
        {insights && insights.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <Card key={insight.id} className="insight-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="label-text mt-1">
                        {insight.insightType.toUpperCase()}
                      </CardDescription>
                    </div>
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {insight.summary}
                  </p>
                  {insight.recommendations && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs label-text mb-2">RECOMMENDATIONS</p>
                      <p className="text-sm text-muted-foreground">
                        {insight.recommendations}
                      </p>
                    </div>
                  )}
                </CardContent>              </Card>
            ))}
          </div>
        ) : (
          <Card className="editorial-card">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-center">No insights generated yet. Click "Generate AI Insights" above to analyze your data.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="editorial-card">
          <CardHeader>
            <CardTitle className="text-lg">Financial Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accounts Receivable</span>
              <span className="font-semibold">${arTotal.toLocaleString()}</span>
            </div>
            {arOverdue > 0 && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-sm flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  Overdue
                </span>
                <span className="font-semibold">${arOverdue.toLocaleString()}</span>
              </div>
            )}
            <div className="divider-line my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accounts Payable</span>
              <span className="font-semibold">${apTotal.toLocaleString()}</span>
            </div>
            {apOverdue > 0 && (
              <div className="flex justify-between items-center text-destructive">
                <span className="text-sm flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  Overdue
                </span>
                <span className="font-semibold">${apOverdue.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader>
            <CardTitle className="text-lg">Project Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsByStage.map((stage) => (
              <div key={stage.stage} className="flex justify-between items-center">
                <span className="text-sm capitalize text-muted-foreground">{stage.stage}</span>
                <div className="text-right">
                  <div className="font-semibold">{stage.count} projects</div>
                  <div className="text-xs text-muted-foreground">
                    ${Number(stage.totalValue).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="editorial-card">
          <CardHeader>
            <CardTitle className="text-lg">Customer Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customersByStatus.map((status) => (
              <div key={status.status} className="flex justify-between items-center">
                <span className={`text-sm capitalize px-3 py-1 rounded-full border status-${status.status}`}>
                  {status.status}
                </span>
                <span className="font-semibold">{status.count} customers</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Add insight generation button component
function InsightActions() {
  const utils = trpc.useUtils();
  const generateMutation = trpc.insights.generate.useMutation({
    onSuccess: (data) => {
      utils.dashboard.getInsights.invalidate();
      toast.success(`Generated ${data.count} new insights`);
    },
  });

  const notifyMutation = trpc.notifications.checkAndNotify.useMutation({
    onSuccess: (data) => {
      if (data.alertsSent > 0) {
        toast.success(`Sent ${data.alertsSent} alert notifications`);
      } else {
        toast.info("No alerts to send");
      }
    },
  });

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
      >
        {generateMutation.isPending ? "Generating..." : "Generate AI Insights"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => notifyMutation.mutate()}
        disabled={notifyMutation.isPending}
      >
        {notifyMutation.isPending ? "Checking..." : "Check & Notify"}
      </Button>
    </div>
  );
}
