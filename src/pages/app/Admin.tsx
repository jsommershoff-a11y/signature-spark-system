import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_LABELS, ROLE_COLORS, AppRole } from '@/lib/roles';
import { Shield, Users, Loader2 } from 'lucide-react';

interface UserWithRole {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Get all profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, full_name, created_at');
    
    if (profilesError) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Laden',
        description: profilesError.message,
      });
      setIsLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (rolesError) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Laden der Rollen',
        description: rolesError.message,
      });
      setIsLoading(false);
      return;
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = profiles.map(profile => {
      const userRole = roles.find(r => r.user_id === profile.user_id);
      return {
        ...profile,
        role: (userRole?.role as AppRole) || 'kunde',
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
    
    // Check if user already has a role entry
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let error;
    
    if (existingRole) {
      // Update existing role
      const result = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      error = result.error;
    } else {
      // Insert new role
      const result = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      error = result.error;
    }
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Aktualisieren',
        description: error.message,
      });
    } else {
      toast({
        title: 'Rolle aktualisiert',
        description: `Die Benutzerrolle wurde auf ${ROLE_LABELS[newRole]} geändert.`,
      });
      await fetchUsers();
    }
    
    setUpdatingUser(null);
  };

  const getDisplayName = (user: UserWithRole) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.full_name) return user.full_name;
    return user.email || 'Unbekannt';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
        <p className="text-muted-foreground">
          System-Administration und Benutzerverwaltung
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Benutzerverwaltung
          </CardTitle>
          <CardDescription>
            Verwalte Benutzerrollen und Berechtigungen
          </CardDescription>
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
                  <TableHead>Registriert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      {getDisplayName(user)}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge className={`text-white ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                        disabled={updatingUser === user.user_id}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System-Einstellungen
          </CardTitle>
          <CardDescription>
            Globale Konfiguration und Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Weitere Admin-Funktionen werden in Kürze verfügbar sein:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>System-Logs und Audit-Trail</li>
            <li>E-Mail-Templates verwalten</li>
            <li>Integrationen konfigurieren</li>
            <li>Backup und Export</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
