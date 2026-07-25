'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from './api';

export type Role = 'ADMIN' | 'CASHIER' | 'KITCHEN_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch?: { id: string; name: string; code: string };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dd_token');
    const savedUser = localStorage.getItem('dd_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Refresh current user validation
      fetchApi('/auth/me')
        .then((res) => {
          setUser(res);
          localStorage.setItem('dd_user', JSON.stringify(res));
        })
        .catch(() => {
          // If offline or custom local user, keep current user
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dd_token', data.token);
      localStorage.setItem('dd_user', JSON.stringify(data.user));
    } catch (err: any) {
      // Fallback for custom updated staff credentials saved by Admin in localStorage
      const customStaffRaw = typeof window !== 'undefined' ? localStorage.getItem('dd_custom_staff') : null;
      if (customStaffRaw) {
        try {
          const customStaffList: any[] = JSON.parse(customStaffRaw);
          const found = customStaffList.find((s) => s.email.toLowerCase() === email.toLowerCase());
          if (found) {
            const fallbackUser: User = {
              id: found.id,
              name: found.name,
              email: found.email,
              role: found.role,
              branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
            };
            const mockToken = 'mock_token_' + Date.now();
            setToken(mockToken);
            setUser(fallbackUser);
            localStorage.setItem('dd_token', mockToken);
            localStorage.setItem('dd_user', JSON.stringify(fallbackUser));
            return;
          }
        } catch (e) {
          console.error('Failed to parse custom staff list:', e);
        }
      }

      // Check default fallback accounts
      let fallbackRole: Role | null = null;
      let fallbackName = 'Staff Member';

      if (email.toLowerCase() === 'admin@deardesserts.com') {
        fallbackRole = 'ADMIN';
        fallbackName = 'Store Manager';
      } else if (email.toLowerCase() === 'cashier@deardesserts.com') {
        fallbackRole = 'CASHIER';
        fallbackName = 'POS Cashier';
      } else if (email.toLowerCase() === 'kitchen@deardesserts.com') {
        fallbackRole = 'KITCHEN_STAFF';
        fallbackName = 'Head Chef';
      }

      if (fallbackRole) {
        const fallbackUser: User = {
          id: 'demo_' + fallbackRole.toLowerCase(),
          name: fallbackName,
          email,
          role: fallbackRole,
          branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
        };
        const mockToken = 'mock_token_' + Date.now();
        setToken(mockToken);
        setUser(fallbackUser);
        localStorage.setItem('dd_token', mockToken);
        localStorage.setItem('dd_user', JSON.stringify(fallbackUser));
        return;
      }

      throw new Error(err.message || 'Invalid email or password');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dd_token');
    localStorage.removeItem('dd_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const switchRoleDemo = async (role: Role) => {
    let email = 'admin@deardesserts.com';
    let pass = 'admin123';

    if (role === 'CASHIER') {
      email = 'cashier@deardesserts.com';
      pass = 'cashier123';
    } else if (role === 'KITCHEN_STAFF') {
      email = 'kitchen@deardesserts.com';
      pass = 'kitchen123';
    }

    try {
      await login(email, pass);
    } catch (err) {
      console.warn('Demo switch login failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRoleDemo }}>
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
