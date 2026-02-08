import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserMenu } from './UserMenu';
import logoSignature from '@/assets/logo-signature.png';
import { Link } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
        <Link to="/app" className="flex items-center gap-2">
          <img src={logoSignature} alt="KRS Signature" className="h-8" />
        </Link>
        <UserMenu />
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
