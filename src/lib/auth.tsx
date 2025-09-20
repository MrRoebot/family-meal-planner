'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Store auth token for tRPC
      if (user) {
        user.getIdToken().then(token => {
          try {
            localStorage.setItem('authToken', token);
          } catch (error) {
            console.error('Error storing auth token:', error);
          }
        });
      } else {
        try {
          localStorage.removeItem('authToken');
        } catch (error) {
          console.error('Error removing auth token:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

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
