import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/app/AppLayout";

// Public pages
import Home from "./pages/Home";
import Start from "./pages/Start";
import Growth from "./pages/Growth";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Protected app pages
import Dashboard from "./pages/app/Dashboard";
import CRM from "./pages/app/CRM";
import Leads from "./pages/app/Leads";
import Customers from "./pages/app/Customers";
import Tasks from "./pages/app/Tasks";
import Courses from "./pages/app/Courses";
import Reports from "./pages/app/Reports";
import Settings from "./pages/app/Settings";
import Admin from "./pages/app/Admin";
import Unauthorized from "./pages/app/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<Start />} />
            <Route path="/growth" element={<Growth />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected app routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="crm" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <CRM />
                </ProtectedRoute>
              } />
              <Route path="leads" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Leads />
                </ProtectedRoute>
              } />
              <Route path="customers" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="tasks" element={<Tasks />} />
              <Route path="courses" element={<Courses />} />
              <Route path="reports" element={
                <ProtectedRoute requireMinRole="teamleiter">
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
