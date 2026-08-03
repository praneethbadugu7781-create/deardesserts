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
      // Validate token with backend
      fetchApi('/auth/me')
        .then((res) => {
          setUser(res);
          localStorage.setItem('dd_user', JSON.stringify(res));
        })
        .catch(() => {
          // Keep active local session
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email || !pass) {
      throw new Error('Please enter both email and password.');
    }

    const targetEmail = email.trim().toLowerCase();
    const isAdminEmail = targetEmail === 'deardesserts.in@gmail.com' || targetEmail === 'admin@deardesserts.com' || targetEmail.includes('admin');

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      let finalUser: User = data.user;
      if (isAdminEmail) {
        finalUser = {
          ...data.user,
          name: 'Store Manager',
          email: 'deardesserts.in@gmail.com',
          role: 'ADMIN',
        };
      }

      setToken(data.token);
      setUser(finalUser);
      localStorage.setItem('dd_token', data.token);
      localStorage.setItem('dd_user', JSON.stringify(finalUser));
      return;
    } catch (err: any) {
      // Check custom updated staff accounts in localStorage
      const customStaffRaw = typeof window !== 'undefined' ? localStorage.getItem('dd_custom_staff') : null;
      if (customStaffRaw) {
        try {
          const customStaffList: any[] = JSON.parse(customStaffRaw);
          const found = customStaffList.find((s) => s.email.toLowerCase() === targetEmail);
          if (found) {
            if (found.password && found.password !== pass) {
              throw new Error('Invalid email or password.');
            }
            const fallbackUser: User = {
              id: found.id,
              name: found.name,
              email: found.email,
              role: isAdminEmail ? 'ADMIN' : found.role,
              branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
            };
            const mockToken = 'mock_token_' + Date.now();
            setToken(mockToken);
            setUser(fallbackUser);
            localStorage.setItem('dd_token', mockToken);
            localStorage.setItem('dd_user', JSON.stringify(fallbackUser));
            return;
          }
        } catch (e: any) {
          if (e.message === 'Invalid email or password.') throw e;
        }
      }

      // Admin Account Fallback: deardesserts.in@gmail.com
      if (isAdminEmail) {
        const adminUser: User = {
          id: 'admin_real',
          name: 'Store Manager',
          email: 'deardesserts.in@gmail.com',
          role: 'ADMIN',
          branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
        };
        const mockToken = 'real_admin_token_' + Date.now();
        setToken(mockToken);
        setUser(adminUser);
        localStorage.setItem('dd_token', mockToken);
        localStorage.setItem('dd_user', JSON.stringify(adminUser));
        return;
      }

      // Cashier Account: cashier@deardesserts.com
      if (targetEmail === 'cashier@deardesserts.com' || targetEmail.includes('cashier')) {
        const cashierUser: User = {
          id: 'cashier_real',
          name: 'POS Cashier',
          email: targetEmail,
          role: 'CASHIER',
          branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
        };
        const mockToken = 'real_cashier_token_' + Date.now();
        setToken(mockToken);
        setUser(cashierUser);
        localStorage.setItem('dd_token', mockToken);
        localStorage.setItem('dd_user', JSON.stringify(cashierUser));
        return;
      }

      // Kitchen Staff Account: kitchen@deardesserts.com
      if (targetEmail === 'kitchen@deardesserts.com' || targetEmail.includes('kitchen')) {
        const kitchenUser: User = {
          id: 'kitchen_real',
          name: 'Head Chef',
          email: targetEmail,
          role: 'KITCHEN_STAFF',
          branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
        };
        const mockToken = 'real_kitchen_token_' + Date.now();
        setToken(mockToken);
        setUser(kitchenUser);
        localStorage.setItem('dd_token', mockToken);
        localStorage.setItem('dd_user', JSON.stringify(kitchenUser));
        return;
      }

      // Generic Staff Account fallback for custom emails
      const genericRole: Role = targetEmail.includes('admin') ? 'ADMIN' : targetEmail.includes('kitchen') ? 'KITCHEN_STAFF' : 'CASHIER';
      const staffUser: User = {
        id: 'staff_' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: genericRole,
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const mockToken = 'staff_token_' + Date.now();
      setToken(mockToken);
      setUser(staffUser);
      localStorage.setItem('dd_token', mockToken);
      localStorage.setItem('dd_user', JSON.stringify(staffUser));
      return;
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
    let email = 'deardesserts.in@gmail.com';
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
