import { Switch, Route, Router } from "wouter"; // Added Router here
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Game from "@/pages/Game";

function NavigationRouter() {
  return (
    /* The 'base' prop tells the app that all routes start 
       after /LordOfTheSquares 
    */
    <Router base="/LordOfTheSquares">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/game" component={Game} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NavigationRouter />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;