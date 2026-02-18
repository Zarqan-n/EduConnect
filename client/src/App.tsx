import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { Login, Register } from "@/pages/auth";
import TutorsPage from "@/pages/tutors";
import JobsPage from "@/pages/jobs";
import BooksPage from "@/pages/books";
import Dashboard from "@/pages/dashboard";
import ChatbotPage from "@/pages/chatbot";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/tutors" component={TutorsPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/books" component={BooksPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chatbot" component={ChatbotPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
