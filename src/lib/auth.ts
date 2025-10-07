import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AppRole } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole | null;
}

let cachedUser: AuthUser | null = null;
let cachedRole: AppRole | null = null;

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const authUser: AuthUser = {
      id: user.id,
      email: profile?.email || user.email || '',
      name: profile?.name || 'User',
      role: roleData?.role || null
    };

    cachedUser = authUser;
    cachedRole = roleData?.role || null;
    
    return authUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserRole = (): AppRole | null => {
  return cachedRole;
};

export const logout = async () => {
  await supabase.auth.signOut();
  cachedUser = null;
  cachedRole = null;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, name: string, role: AppRole) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${window.location.origin}/`
    }
  });

  if (error) throw error;
  
  // Create user role
  if (data.user) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role });
    
    if (roleError) throw roleError;
  }

  return data;
};
