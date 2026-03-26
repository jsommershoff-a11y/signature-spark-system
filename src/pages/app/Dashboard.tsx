import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { KundeDashboard } from '@/components/dashboard/KundeDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { profile, effectiveRole, isViewingAs } = useAuth();
  const dashboardData = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const getName = () => {
    if (profile?.first_name) return profile.first_name;
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    return 'Benutzer';
  };

  const isEffectiveAdmin = effectiveRole === 'admin';
  const isEffectiveStaff = effectiveRole && ['vertriebspartner', 'gruppenbetreuer', 'admin'].includes(effectiveRole);

  return (
    <div className="space-y-5 md:space-y-8 max-w-full">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight truncate">
          {getGreeting()}, {getName()}!
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          {effectiveRole && (
            <Badge variant="secondary" className="text-xs font-medium">
              {ROLE_LABELS[effectiveRole]}
            </Badge>
          )}
          {isViewingAs && (
            <Badge variant="outline" className="text-xs">Admin-Ansicht</Badge>
          )}
        </div>
      </div>

      {isEffectiveAdmin && <AdminDashboard {...dashboardData} />}
      {!isEffectiveAdmin && isEffectiveStaff && <StaffDashboard {...dashboardData} />}
      {!isEffectiveStaff && <KundeDashboard />}
    </div>
  );
}
