import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { KundeDashboard } from '@/components/dashboard/KundeDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

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
  const isEffectiveStaff = effectiveRole && ['mitarbeiter', 'teamleiter', 'geschaeftsfuehrung', 'admin'].includes(effectiveRole);

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      <div className="min-w-0">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">
          {getGreeting()}, {getName()}!
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {effectiveRole && `${ROLE_LABELS[effectiveRole]}`}
          {isViewingAs && ' · Admin-Ansicht'}
        </p>
      </div>

      {isEffectiveAdmin && <AdminDashboard {...dashboardData} />}
      {!isEffectiveAdmin && isEffectiveStaff && <StaffDashboard {...dashboardData} />}
      {!isEffectiveStaff && <KundeDashboard />}
    </div>
  );
}
