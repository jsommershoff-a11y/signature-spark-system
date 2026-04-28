import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/app/AppLayout";
import { GtagDebugOverlay } from "@/components/dev/GtagDebugOverlay";

// Public landing pages
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
import Datenschutz from "./pages/landing/Datenschutz";
import Community from "./pages/landing/Community";
import Automatisierungen from "./pages/landing/Automatisierungen";
import AutomatisierungDetail from "./pages/landing/AutomatisierungDetail";
import EigenerBot from "./pages/landing/EigenerBot";
import { StartBundlePage, GrowthBundlePage } from "./pages/landing/BundleLanding";
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

import Reports from "./pages/app/Reports";
import Settings from "./pages/app/Settings";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./pages/app/admin/AdminOverview";
import AdminUsers from "./pages/app/admin/AdminUsers";
import AdminLeads from "./pages/app/admin/AdminLeads";
import AdminCustomers from "./pages/app/admin/AdminCustomers";
import AdminSubscriptions from "./pages/app/admin/AdminSubscriptions";
import AdminTrials from "./pages/app/admin/AdminTrials";
import AdminSettings from "./pages/app/admin/AdminSettings";
import AdminUpgradeFunnel from "./pages/app/admin/AdminUpgradeFunnel";
import AdminWebhooks from "./pages/app/AdminWebhooks";
import Unauthorized from "./pages/app/Unauthorized";
import Calls from "./pages/app/Calls";
import CallDetail from "./pages/app/CallDetail";
import Offers from "./pages/app/Offers";
import OfferDetail from "./pages/app/OfferDetail";
import MyContracts from "./pages/app/MyContracts";
import MemberManagement from "./pages/app/MemberManagement";
import Goals from "./pages/app/Goals";
import SocialMedia from "./pages/app/SocialMedia";
import EmailHub from "./pages/app/EmailHub";
import InboxHub from "./pages/app/InboxHub";
import Pricing from "./pages/app/Pricing";
import Welcome from "./pages/app/Welcome";
import Upgrade from "./pages/app/Upgrade";
import CooCockpit from "./pages/app/CooCockpit";
import PromptLibrary from "./pages/app/PromptLibrary";
import ToolsDirectory from "./pages/app/ToolsDirectory";
import LiveCallsCalendar from "./pages/app/LiveCallsCalendar";
import AffiliateDashboard from "./pages/app/AffiliateDashboard";
import Katalog from "./pages/app/Katalog";
import ProductsHub from "./pages/app/ProductsHub";
import ProductWorkspace from "./pages/app/ProductWorkspace";
import { EmailConsentConfirm, EmailConsentRevoke } from "./pages/EmailConsent";
import { ReferralTracker } from "./components/affiliate/ReferralTracker";

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
      {import.meta.env.DEV && <GtagDebugOverlay />}
      <BrowserRouter>
        <AuthProvider>
          <ReferralTracker />
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
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/community" element={<Community />} />
            <Route path="/automatisierungen" element={<Automatisierungen />} />
            <Route path="/automatisierungen/:slug" element={<AutomatisierungDetail />} />
            <Route path="/eigener-bot" element={<EigenerBot />} />
            <Route path="/bot-bestellen" element={<Navigate to="/eigener-bot" replace />} />
            {/* Bundle-Pakete */}
            <Route path="/start" element={<StartBundlePage />} />
            <Route path="/growth" element={<GrowthBundlePage />} />
            {/* Aliase */}
            <Route path="/produkte" element={<Navigate to="/automatisierungen" replace />} />
            <Route path="/automationen" element={<Navigate to="/automatisierungen" replace />} />

            {/* Public consent (Double Opt-In) */}
            <Route path="/email-consent/confirm" element={<EmailConsentConfirm />} />
            <Route path="/email-consent/revoke" element={<EmailConsentRevoke />} />

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
              <Route path="katalog" element={<Katalog />} />
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
              {/* Email-Hub (vereint Kampagnen, Log, Consents) */}
              <Route path="email" element={
                <ProtectedRoute requireMinRole="vertriebspartner">
                  <EmailHub />
                </ProtectedRoute>
              } />
              {/* Legacy-Redirects auf neuen Hub */}
              <Route path="email-kampagnen" element={<Navigate to="/app/email?tab=kampagnen" replace />} />
              <Route path="email-log" element={<Navigate to="/app/email?tab=log" replace />} />
              <Route path="email-consents" element={<Navigate to="/app/email?tab=consents" replace />} />

              <Route path="courses" element={<Courses />} />
              <Route path="academy/*" element={<Academy />} />
              <Route path="contracts" element={<MyContracts />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="upgrade" element={<Upgrade />} />
              <Route path="prompts" element={<PromptLibrary />} />
              <Route path="tools" element={<ToolsDirectory />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="calendar" element={<LiveCallsCalendar />} />
              <Route path="affiliate" element={<AffiliateDashboard />} />
              <Route path="produkte" element={<ProductsHub />} />
              <Route path="produkte/:id" element={<ProductWorkspace />} />

              {/* Konsolidierung: members → customers */}
              <Route path="members" element={<Navigate to="/app/customers" replace />} />
              {/* Mitgliederverwaltung — eigene Admin-Route, kein Redirect */}
              <Route path="member-management" element={
                <ProtectedRoute requiredRole="admin">
                  <MemberManagement />
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
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="trials" element={<AdminTrials />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              {/* Webhooks jetzt unter Admin-Settings als Tab */}
              <Route path="webhooks" element={<Navigate to="/app/admin/settings" replace />} />

              {/* Inbox-Hub (vereint Posteingang, Outlook, Tickets) */}
              <Route path="inbox" element={
                <ProtectedRoute requiredRole="admin">
                  <InboxHub />
                </ProtectedRoute>
              } />
              <Route path="outlook" element={<Navigate to="/app/inbox?tab=outlook" replace />} />
              <Route path="tickets" element={<Navigate to="/app/inbox?tab=tickets" replace />} />
              <Route path="posteingang" element={<Navigate to="/app/inbox?tab=posteingang" replace />} />

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
