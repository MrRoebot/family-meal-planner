'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './trpc';

interface AuthContextType {
  user: (User & { householdId?: string; role?: string }) | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { householdId?: string; role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Create a tRPC client that doesn't require authentication for the initialize call
  const initializeUser = api.users.initializeUser.useMutation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Store auth token for tRPC
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', token);

          // Initialize/fetch user profile and household
          const { user: userData, household } = await initializeUser.mutateAsync({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined,
          });

          // Create extended user object with profile data
          const extendedUser = firebaseUser as User & { householdId?: string; role?: string };
          extendedUser.householdId = userData.householdId;
          extendedUser.role = userData.role;
          
          setUser(extendedUser);
        } catch (error) {
          console.error('Error initializing user:', error);
          // Fallback to basic user object
          const extendedUser = firebaseUser as User & { householdId?: string; role?: string };
          extendedUser.householdId = `household-${firebaseUser.uid}`;
          extendedUser.role = 'parent';
          setUser(extendedUser);
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('authToken');
        } catch (error) {
          console.error('Error removing auth token:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [initializeUser]);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
