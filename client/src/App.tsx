import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Financial from "./pages/Financial";
import Projects from "./pages/Projects";
import Customers from "./pages/Customers";
import Team from "./pages/Team";
import Ideas from "./pages/Ideas";
import Sales from "./pages/Sales";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

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
          <Sales />
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
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
