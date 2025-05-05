import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { Database } from '../utils/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isRider: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any, user: User | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      setProfile(data);
    }
  }

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role || 'customer'
        }
      }
    });
    
    return { error, user: data?.user || null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    
    if (!error) {
      await fetchUserProfile(user.id);
    }
    
    return { error };
  };

  const isRider = profile?.role === 'rider';
  const isCustomer = profile?.role === 'customer';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      isRider, 
      isCustomer, 
      isAdmin,
      login, 
      signUp, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}