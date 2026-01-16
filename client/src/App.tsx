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
import Customers from "./pages/Customers";
import Team from "./pages/Team";
import Ideas from "./pages/Ideas";
import SalesEnhanced from "./pages/SalesEnhanced";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import IncomeExpenditure from "./pages/IncomeExpenditure";
import ActionTracker from "@/pages/ActionTracker";
import HumanResource from "@/pages/HumanResource";
import TenderQuotation from "./pages/TenderQuotation";

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path={"/financial"}>
        <DashboardLayout>
          <Financial />
        </DashboardLayout>
      </Route>
      <Route path={"/projects"}>
        <DashboardLayout>
          <Projects />
        </DashboardLayout>
      </Route>
      <Route path={"/customers"}>
        <DashboardLayout>
          <Customers />
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
          <SalesEnhanced />
        </DashboardLayout>
      </Route>
      <Route path={"/users"}>
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </Route>
      <Route path={"/settings"}>
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      <Route path={"/income-expenditure"}>
        <DashboardLayout>
          <IncomeExpenditure />
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
          <HumanResource />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
