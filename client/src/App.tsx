import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Financial from "./pages/Financial";
import Projects from "./pages/Projects";
import CRM from "./pages/CRM";
import Team from "./pages/Team";
import Ideas from "./pages/Ideas";
import SalesEnhanced from "./pages/SalesEnhanced";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import AdminSettings from "./pages/AdminSettings";
import Accounting from "./pages/Accounting";
import ActionTracker from "@/pages/ActionTracker";
import HumanResource from "@/pages/HumanResource";
import TenderQuotation from "./pages/TenderQuotationEnhanced";
import Reports from "./pages/Reports";
import Products from "./pages/Products";
import Contacts from "./pages/Contacts";
import Inventory from "./pages/Inventory";
import Procurement from "./pages/Procurement";
import Finance from "./pages/Finance";
import AccessDenied from "./pages/AccessDenied";
import { HyperlinkAnalyticsDashboard } from "./pages/HyperlinkAnalyticsDashboard";
import AIAssistant from "./pages/AIAssistant";
import AISettings from "./pages/AISettings";
import Analytics from "./pages/Analytics";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastProvider } from "./components/Toast";
import { BreadcrumbProvider, BreadcrumbNavigation } from "./components/BreadcrumbNavigation";

function Router() {
  return (
    <>
      <BreadcrumbNavigation />
      <Switch>
      <Route path={"/"}>
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path={"/financial"}>
        <DashboardLayout>
          <ProtectedRoute module="financial">
            <Financial />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/finance"}>
        <ProtectedRoute module="financial">
          <Finance />
        </ProtectedRoute>
      </Route>
      <Route path={"/projects"}>
        <DashboardLayout>
          <Projects />
        </DashboardLayout>
      </Route>
      <Route path={"/crm"}>
        <DashboardLayout>
          <CRM />
        </DashboardLayout>
      </Route>
      <Route path={"/team"}>
        <DashboardLayout>
          <Team />
        </DashboardLayout>
      </Route>
      <Route path={"/ideas"}>
        <DashboardLayout>
          <Ideas />
        </DashboardLayout>
      </Route>
      <Route path={"/sales"}>
        <DashboardLayout>
          <ProtectedRoute module="sales">
            <SalesEnhanced />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/users"}>
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </Route>
      <Route path={"/settings"}>
        <DashboardLayout>
          <ProtectedRoute module="settings">
            <Settings />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/admin-settings"}>
        <DashboardLayout>
          <AdminSettings />
        </DashboardLayout>
      </Route>
      <Route path={"/accounting"}>
        <DashboardLayout>
          <Accounting />
        </DashboardLayout>
      </Route>
      <Route path={"/action-tracker"}>
        <DashboardLayout>
          <ActionTracker />
        </DashboardLayout>
      </Route>
      <Route path={"/tender-quotation"}>
        <DashboardLayout>
          <TenderQuotation />
        </DashboardLayout>
      </Route>
      <Route path={"/hr"}>
        <DashboardLayout>
          <ProtectedRoute module="hr">
            <HumanResource />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/reports"}>
        <Reports />
      </Route>
      <Route path={"/products"}>
        <Products />
      </Route>
      <Route path={"/contacts"}>
        <Contacts />
      </Route>
      <Route path={"/inventory"}>
        <Inventory />
      </Route>
      <Route path={"/procurement"}>
        <Procurement />
      </Route>
      <Route path={"/access-denied"}>
        <AccessDenied />
      </Route>
      <Route path={"/hyperlink-analytics"}>
        <DashboardLayout>
          <ProtectedRoute module="admin">
            <HyperlinkAnalyticsDashboard />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/ai-assistant"}>
        <DashboardLayout>
          <AIAssistant />
        </DashboardLayout>
      </Route>
      <Route path={"/ai-settings"}>
        <DashboardLayout>
          <ProtectedRoute module="admin">
            <AISettings />
          </ProtectedRoute>
        </DashboardLayout>
      </Route>
      <Route path={"/analytics"}>
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CurrencyProvider>
          <TooltipProvider>
            <ToastProvider>
              <BreadcrumbProvider>
                <Toaster />
                <Router />
              </BreadcrumbProvider>
            </ToastProvider>
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
