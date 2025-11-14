import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Advanced from "./pages/Advanced";
import ApiDocs from "./pages/ApiDocs";
import Chat from "./pages/Chat";
import Sessions from "./pages/Sessions";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/chat/:sessionId" component={Chat} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/settings" component={Settings} />
      <Route path="/advanced" component={Advanced} />
      <Route path="/admin" component={Admin} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
