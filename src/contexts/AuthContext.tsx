import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserProfile = {
  id: string;
  school_id: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  full_name: string;
  email: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: any | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Local Storage for Multi-Tenant Login
    const localUserStr = localStorage.getItem('user');
    const localToken = localStorage.getItem('token');
    
    if (localUserStr && localToken) {
      try {
        const payload = JSON.parse(atob(localToken.split('.')[1]));
        const isExpired = Date.now() >= payload.exp * 1000;
        
        if (isExpired) {
          console.warn('Session expired, logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenantId');
          setLoading(false);
          return;
        }

        const localUser = JSON.parse(localUserStr);
        setUser(localUser);
        setProfile({
          id: localUser.id || localUser._id,
          role: localUser.role.toLowerCase(), // Force lowercase to match 'admin' | 'teacher' etc
          full_name: localUser.name,
          email: localUser.email,
          school_id: localStorage.getItem('tenantId') || 'unknown',
          avatar_url: null
        } as UserProfile);
      } catch (e) {
        console.error('Invalid token found', e);
        localStorage.removeItem('token');
      }
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile using setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(data as UserProfile | null);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data as UserProfile | null);
            setLoading(false);
          });
      } else {
        // If no supabase session, we already check local login above!
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
