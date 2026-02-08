import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, getHighestRole, hasMinRole as checkMinRole } from '@/lib/roles';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  highestRole: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  hasMinRole: (minRole: AppRole) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Admin View-As Feature
  viewAsRole: AppRole | null;
  setViewAsRole: (role: AppRole | null) => void;
  effectiveRole: AppRole | null;
  isViewingAs: boolean;
  isRealAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null);

  // Computed values for Admin View-As feature
  const isRealAdmin = roles.includes('admin');
  const isViewingAs = isRealAdmin && viewAsRole !== null;
  const effectiveRole = isViewingAs ? viewAsRole : getHighestRole(roles);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    return data.map(r => r.role as AppRole);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (profileData) setProfile(profileData);
    const rolesData = await fetchRoles(user.id);
    setRoles(rolesData);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (currentSession?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            if (profileData) setProfile(profileData);
            const rolesData = await fetchRoles(currentSession.user.id);
            setRoles(rolesData);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        Promise.all([
          fetchProfile(existingSession.user.id),
          fetchRoles(existingSession.user.id)
        ]).then(([profileData, rolesData]) => {
          if (profileData) setProfile(profileData);
          setRoles(rolesData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string; last_name?: string }
  ) => {
    const redirectUrl = `${window.location.origin}/app`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: metadata?.first_name,
          last_name: metadata?.last_name,
          full_name: metadata?.first_name && metadata?.last_name 
            ? `${metadata.first_name} ${metadata.last_name}` 
            : undefined,
        }
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  // hasRole checks effective role for UI purposes, but real admin always has access
  const hasRoleCheck = (role: AppRole) => {
    if (isRealAdmin) return true; // Real admins always have all roles for access
    if (isViewingAs) {
      // When viewing as another role, check against effective role for UI
      return role === effectiveRole;
    }
    return roles.includes(role);
  };
  
  // hasMinRole uses effective role for UI, but real admin always passes
  const hasMinRoleCheck = (minRole: AppRole) => {
    if (isRealAdmin) return true; // Real admins always pass min role checks
    return checkMinRole(effectiveRole, minRole);
  };

  // For UI-only role checks (sidebar, dashboard rendering)
  const hasEffectiveRole = (role: AppRole) => role === effectiveRole;
  const hasEffectiveMinRole = (minRole: AppRole) => checkMinRole(effectiveRole, minRole);

  const value: AuthContextType = {
    user,
    session,
    profile,
    roles,
    highestRole: getHighestRole(roles),
    isLoading,
    isAuthenticated: !!user,
    hasRole: hasRoleCheck,
    hasMinRole: hasMinRoleCheck,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    // Admin View-As Feature
    viewAsRole,
    setViewAsRole,
    effectiveRole,
    isViewingAs,
    isRealAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
