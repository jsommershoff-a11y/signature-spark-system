import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import { AdminViewSwitcher } from './AdminViewSwitcher';
import { GitHubStatusBadge } from './GitHubStatusBadge';
import { ViewAsBanner } from './ViewAsBanner';
import { ProfileCompletionDialog } from './ProfileCompletionDialog';
import { NotificationsCenter } from './NotificationsCenter';
import { IncomingCallPopup } from '@/components/calls/IncomingCallPopup';
import logoSignature from '@/assets/ki-automationen-logo.svg';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AppFooter } from './AppFooter';
import { Breadcrumbs } from './Breadcrumbs';
import { TrialGuard } from '@/components/TrialGuard';
import { TrialTopBar } from './TrialTopBar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden app-scope">
      <ProfileCompletionDialog />
      <ViewAsBanner />
      <IncomingCallPopup />

      {/* Header — light cream surface, matches landing header rhythm */}
      <header className="h-14 md:h-16 border-b border-border/40 bg-background/95 backdrop-blur-md flex items-center justify-between px-3 md:px-6 flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile hamburger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground hover:bg-muted flex-shrink-0 h-10 w-10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <AppSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/app" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img src={logoSignature} alt="KI Automationen" className="h-8 w-8" />
            <span className="text-foreground font-semibold text-sm hidden sm:inline tracking-tight group-hover:text-primary transition-colors">
              KI Automationen
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <GitHubStatusBadge />
          <AdminViewSwitcher />
          <NotificationsCenter />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <AppSidebar />
        </div>

        {/* Content Area — landing container width + generous padding */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <Breadcrumbs />
            <TrialGuard>
              <Outlet />
            </TrialGuard>
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
