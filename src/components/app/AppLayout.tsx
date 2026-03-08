import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import { AdminViewSwitcher } from './AdminViewSwitcher';
import { ViewAsBanner } from './ViewAsBanner';
import { ProfileCompletionDialog } from './ProfileCompletionDialog';
import { IncomingCallPopup } from '@/components/calls/IncomingCallPopup';
import logoSignature from '@/assets/krs-logo.png';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <ProfileCompletionDialog />
      <ViewAsBanner />
      <IncomingCallPopup />
      
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-primary-deep/30 bg-gradient-to-r from-primary-deep via-primary to-primary-light flex items-center justify-between px-3 md:px-6 shadow-md flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile hamburger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20 flex-shrink-0 h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <AppSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoSignature} alt="KRS Signature" className="h-7 md:h-8" />
          </Link>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <AdminViewSwitcher />
          <UserMenu />
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <AppSidebar />
        </div>
        
        {/* Content Area */}
        <main className="flex-1 p-3 md:p-6 overflow-x-hidden overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
