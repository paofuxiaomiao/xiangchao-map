import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import FeatureModules from "./pages/FeatureModules";
import H5Experience from "./pages/H5Experience";
import { routePath } from "./lib/sitePaths";

function Router() {
  return (
    <Switch>
      <Route path={routePath("/")} component={Landing} />
      <Route path={routePath("/map")} component={Home} />
      <Route path={routePath("/modules")} component={FeatureModules} />
      <Route path={routePath("/h5")} component={H5Experience} />
      <Route path={routePath("/404")} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
