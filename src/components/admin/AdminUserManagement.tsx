import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_LABELS, ROLE_COLORS, ROLE_HIERARCHY, AppRole } from '@/lib/roles';
import { Users, Loader2 } from 'lucide-react';

interface UserWithRole {
  user_id: string;
  profile_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: AppRole;
  team_id: string | null;
  created_at: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, full_name, team_id, created_at');

    if (profilesError) {
      toast({ variant: 'destructive', title: 'Fehler beim Laden', description: profilesError.message });
      setIsLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase.from('user_roles').select('user_id, role');

    if (rolesError) {
      toast({ variant: 'destructive', title: 'Fehler beim Laden der Rollen', description: rolesError.message });
      setIsLoading(false);
      return;
    }

    const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
      const userRole = roles.find((r) => r.user_id === profile.user_id);
      return {
        user_id: profile.user_id,
        profile_id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: profile.full_name,
        role: (userRole?.role as AppRole) || 'kunde',
        team_id: profile.team_id,
        created_at: profile.created_at,
      };
    });

    setUsers(usersWithRoles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingUser(userId);

    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existingRole) {
      const result = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
      error = result.error;
    } else {
      const result = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
      error = result.error;
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler beim Aktualisieren', description: error.message });
    } else {
      toast({ title: 'Rolle aktualisiert', description: `Die Benutzerrolle wurde auf ${ROLE_LABELS[newRole]} geändert.` });
      await fetchUsers();
    }

    setUpdatingUser(null);
  };

  const handleTeamChange = async (profileId: string, teamId: string | null) => {
    setUpdatingUser(profileId);

    const { error } = await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', profileId);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler beim Team-Update', description: error.message });
    } else {
      toast({ title: 'Team aktualisiert', description: teamId ? 'Benutzer wurde einem Team zugewiesen.' : 'Team-Zuweisung entfernt.' });
      await fetchUsers();
    }

    setUpdatingUser(null);
  };

  const getDisplayName = (user: UserWithRole) => {
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.full_name) return user.full_name;
    return user.email || 'Unbekannt';
  };

  // Team leaders: users with role >= teamleiter
  const teamLeaderCandidates = users.filter(
    (u) => ROLE_HIERARCHY[u.role] >= ROLE_HIERARCHY['teamleiter']
  );

  const getTeamLeaderName = (teamId: string | null) => {
    if (!teamId) return '-';
    const leader = users.find((u) => u.profile_id === teamId);
    return leader ? getDisplayName(leader) : '-';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Benutzerverwaltung
        </CardTitle>
        <CardDescription>Verwalte Benutzerrollen, Teams und Berechtigungen</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Aktuelle Rolle</TableHead>
                <TableHead>Rolle ändern</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Registriert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{getDisplayName(user)}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`text-white ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                      disabled={updatingUser === user.user_id || updatingUser === user.profile_id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kunde">Kunde</SelectItem>
                        <SelectItem value="mitarbeiter">Mitarbeiter</SelectItem>
                        <SelectItem value="teamleiter">Teamleiter</SelectItem>
                        <SelectItem value="geschaeftsfuehrung">Geschäftsführung</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.team_id || '__none__'}
                      onValueChange={(value) =>
                        handleTeamChange(user.profile_id, value === '__none__' ? null : value)
                      }
                      disabled={updatingUser === user.user_id || updatingUser === user.profile_id}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="-">{getTeamLeaderName(user.team_id)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Kein Team</SelectItem>
                        {teamLeaderCandidates.map((leader) => (
                          <SelectItem key={leader.profile_id} value={leader.profile_id}>
                            {getDisplayName(leader)} ({ROLE_LABELS[leader.role]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}