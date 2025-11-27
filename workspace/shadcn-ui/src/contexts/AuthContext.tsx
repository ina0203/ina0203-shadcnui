import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getAuthState, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, updateProfile as authUpdateProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string, role: User['role']) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    const authState = getAuthState();
    setUser(authState.user);
    setIsAuthenticated(authState.isAuthenticated);
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = authSignIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const signUp = async (email: string, password: string, username: string, role: User['role']) => {
    const result = authSignUp(email, password, username, role);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const signOut = () => {
    authSignOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const result = authUpdateProfile(updates);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signIn, signUp, signOut, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};