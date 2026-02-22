import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import { AdminViewSwitcher } from './AdminViewSwitcher';
import { ViewAsBanner } from './ViewAsBanner';
import logoSignature from '@/assets/krs-logo.png';
import { Link } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* View-As Banner (only visible when admin is viewing as another role) */}
      <ViewAsBanner />
      
      {/* Header */}
      <header className="h-16 border-b border-primary-deep/30 bg-gradient-to-r from-primary-deep via-primary to-primary-light flex items-center justify-between px-4 lg:px-6 shadow-md">
        <Link to="/app" className="flex items-center gap-2">
          <img src={logoSignature} alt="KRS Signature" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <AdminViewSwitcher />
          <UserMenu />
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
