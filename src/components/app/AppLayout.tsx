import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import { AdminViewSwitcher } from './AdminViewSwitcher';
import { ViewAsBanner } from './ViewAsBanner';
import { ProfileCompletionDialog } from './ProfileCompletionDialog';
import logoSignature from '@/assets/krs-logo.png';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProfileCompletionDialog />
      <ViewAsBanner />
      
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-primary-deep/30 bg-gradient-to-r from-primary-deep via-primary to-primary-light flex items-center justify-between px-3 md:px-6 shadow-md">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <AppSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/app" className="flex items-center gap-2">
            <img src={logoSignature} alt="KRS Signature" className="h-7 md:h-8" />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <AdminViewSwitcher />
          <UserMenu />
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Content Area */}
        <main className="flex-1 p-3 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
