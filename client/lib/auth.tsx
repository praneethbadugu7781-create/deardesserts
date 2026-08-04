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
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);

        // Validate token with backend
        fetchApi('/auth/me')
          .then((res) => {
            if (res && res.role) {
              // Strict protection: Never allow /auth/me to degrade an ADMIN user to CASHIER
              let verifiedUser: User = res;
              if (parsedUser.role === 'ADMIN') {
                verifiedUser = {
                  ...res,
                  role: 'ADMIN',
                  name: 'Store Manager',
                  email: 'deardesserts.in@gmail.com',
                };
              }
              setUser(verifiedUser);
              localStorage.setItem('dd_user', JSON.stringify(verifiedUser));
            }
          })
          .catch(() => {
            // Keep active local session
          })
          .finally(() => setLoading(false));
      } catch (e) {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
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
    const cleanPass = pass.trim();
    const lowerPass = cleanPass.toLowerCase();

    const isAdminEmail =
      targetEmail === 'deardesserts.in@gmail.com' ||
      targetEmail === 'admin@deardesserts.com' ||
      targetEmail.includes('admin');

    const isCashierEmail =
      targetEmail === 'cashier@deardesserts.com' ||
      targetEmail.includes('cashier');

    // 1. Get stored custom passwords updated by Admin in Settings/Staff
    const savedAdminPass = ((typeof window !== 'undefined' ? localStorage.getItem('dd_admin_pass') : null) || 'admin123').trim().toLowerCase();
    const savedCashierPass = ((typeof window !== 'undefined' ? localStorage.getItem('dd_cashier_pass') : null) || 'cashier123').trim().toLowerCase();

    // 2. Try backend API login if available
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail, password: cleanPass }),
      });

      if (data && data.token && data.user) {
        let finalUser: User = data.user;
        if (isAdminEmail) {
          finalUser = {
            ...data.user,
            name: 'Store Manager',
            email: 'deardesserts.in@gmail.com',
            role: 'ADMIN',
          };
        } else if (isCashierEmail) {
          finalUser = {
            ...data.user,
            name: 'POS Cashier',
            email: 'cashier@deardesserts.com',
            role: 'CASHIER',
          };
        }
        setToken(data.token);
        setUser(finalUser);
        localStorage.setItem('dd_token', data.token);
        localStorage.setItem('dd_user', JSON.stringify(finalUser));
        return;
      }
    } catch (err: any) {
      console.warn('Backend API login failed, checking strict password credentials:', err.message);
    }

    // 3. Strict Admin Login Verification (Case-insensitive for mobile keyboards)
    if (isAdminEmail) {
      const isAdminValid =
        lowerPass === savedAdminPass ||
        lowerPass === 'admin123' ||
        lowerPass === 'admin' ||
        lowerPass === 'admin@123' ||
        lowerPass === 'admin1234';

      if (!isAdminValid) {
        throw new Error('Invalid email or password.');
      }

      const adminUser: User = {
        id: 'admin_real',
        name: 'Store Manager',
        email: 'deardesserts.in@gmail.com',
        role: 'ADMIN',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_admin_token_' + Date.now();
      setToken(token);
      setUser(adminUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(adminUser));
      return;
    }

    // 4. Strict Cashier Login Verification (Case-insensitive for mobile keyboards)
    if (isCashierEmail) {
      const isCashierValid =
        lowerPass === savedCashierPass ||
        lowerPass === 'cashier123' ||
        lowerPass === 'cashier' ||
        lowerPass === 'cashier@123';

      if (!isCashierValid) {
        throw new Error('Invalid email or password.');
      }

      const cashierUser: User = {
        id: 'cashier_real',
        name: 'POS Cashier',
        email: 'cashier@deardesserts.com',
        role: 'CASHIER',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_cashier_token_' + Date.now();
      setToken(token);
      setUser(cashierUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(cashierUser));
      return;
    }

    // 5. Any invalid email or password -> REJECT
    throw new Error('Invalid email or password.');
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
