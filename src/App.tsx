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
import AGB from "./pages/landing/AGB";
import Widerruf from "./pages/landing/Widerruf";
import Community from "./pages/landing/Community";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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
import Academy from "./pages/app/Academy";
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
import Goals from "./pages/app/Goals";
import SocialMedia from "./pages/app/SocialMedia";
import EmailCampaigns from "./pages/app/EmailCampaigns";
import MemberManagement from "./pages/app/MemberManagement";
import Pricing from "./pages/app/Pricing";
import Welcome from "./pages/app/Welcome";
import CooCockpit from "./pages/app/CooCockpit";
import PromptLibrary from "./pages/app/PromptLibrary";
import ToolsDirectory from "./pages/app/ToolsDirectory";
import LiveCallsCalendar from "./pages/app/LiveCallsCalendar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 5,    // 5 minutes garbage collection
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

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
            <Route path="/agb" element={<AGB />} />
            <Route path="/widerruf" element={<Widerruf />} />
            <Route path="/community" element={<Community />} />
            
            {/* Auth */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected app routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="crm" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <CRM />
                </ProtectedRoute>
              } />
              <Route path="leads" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Leads />
                </ProtectedRoute>
              } />
              <Route path="pipeline" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Pipeline />
                </ProtectedRoute>
              } />
              <Route path="customers" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calls" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Calls />
                </ProtectedRoute>
              } />
              <Route path="calls/:callId" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <CallDetail />
                </ProtectedRoute>
              } />
              <Route path="offers" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Offers />
                </ProtectedRoute>
              } />
              <Route path="offers/:offerId" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <OfferDetail />
                </ProtectedRoute>
              } />
              <Route path="goals" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="social-media" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <SocialMedia />
                </ProtectedRoute>
              } />
              <Route path="email-kampagnen" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <EmailCampaigns />
                </ProtectedRoute>
              } />
              <Route path="courses" element={<Courses />} />
              <Route path="academy/*" element={<Academy />} />
              <Route path="contracts" element={<MyContracts />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="prompts" element={<PromptLibrary />} />
              <Route path="tools" element={<ToolsDirectory />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="calendar" element={<LiveCallsCalendar />} />
              <Route path="member-management" element={
                <ProtectedRoute requireMinRole="gruppenbetreuer">
                  <MemberManagement />
                </ProtectedRoute>
              } />
              <Route path="members" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <Members />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute requireMinRole="gruppenbetreuer">
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="settings" element={<Settings />} />
              <Route path="coo-cockpit" element={
                <ProtectedRoute requiredRole="admin">
                  <CooCockpit />
                </ProtectedRoute>
              } />
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
