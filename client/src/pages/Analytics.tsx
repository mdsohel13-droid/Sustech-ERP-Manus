import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
