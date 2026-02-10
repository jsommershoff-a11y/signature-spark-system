import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/app/AppLayout";

// Public pages
import MasterHome from "./pages/landing/MasterHome";
import Handwerk from "./pages/landing/Handwerk";
import Praxen from "./pages/landing/Praxen";
import Dienstleister from "./pages/landing/Dienstleister";
import Immobilien from "./pages/landing/Immobilien";
import Kurzzeitvermietung from "./pages/landing/Kurzzeitvermietung";
import Qualifizierung from "./pages/landing/Qualifizierung";
import Thanks from "./pages/landing/Thanks";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PublicOffer from "./pages/Offer";

// Protected app pages
import Dashboard from "./pages/app/Dashboard";
import CRM from "./pages/app/CRM";
import Leads from "./pages/app/Leads";
import Pipeline from "./pages/app/Pipeline";
import Customers from "./pages/app/Customers";
import Tasks from "./pages/app/Tasks";
import Courses from "./pages/app/Courses";
import Members from "./pages/app/Members";
import Reports from "./pages/app/Reports";
import Settings from "./pages/app/Settings";
import Admin from "./pages/app/Admin";
import Unauthorized from "./pages/app/Unauthorized";
import Calls from "./pages/app/Calls";
import CallDetail from "./pages/app/CallDetail";
import Offers from "./pages/app/Offers";
import OfferDetail from "./pages/app/OfferDetail";
import MyContracts from "./pages/app/MyContracts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public landing routes */}
            <Route path="/" element={<MasterHome />} />
            <Route path="/handwerk" element={<Handwerk />} />
            <Route path="/praxen" element={<Praxen />} />
            <Route path="/dienstleister" element={<Dienstleister />} />
            <Route path="/immobilien" element={<Immobilien />} />
            <Route path="/kurzzeitvermietung" element={<Kurzzeitvermietung />} />
            <Route path="/qualifizierung" element={<Qualifizierung />} />
            <Route path="/danke" element={<Thanks />} />
            
            {/* Auth */}
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
              <Route path="pipeline" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Pipeline />
                </ProtectedRoute>
              } />
              <Route path="customers" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calls" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Calls />
                </ProtectedRoute>
              } />
              <Route path="calls/:callId" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <CallDetail />
                </ProtectedRoute>
              } />
              <Route path="offers" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Offers />
                </ProtectedRoute>
              } />
              <Route path="offers/:offerId" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <OfferDetail />
                </ProtectedRoute>
              } />
              <Route path="courses" element={<Courses />} />
              <Route path="contracts" element={<MyContracts />} />
              <Route path="members" element={
                <ProtectedRoute requireMinRole="mitarbeiter">
                  <Members />
                </ProtectedRoute>
              } />
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
            
            {/* Public offer page */}
            <Route path="/offer/:token" element={<PublicOffer />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
