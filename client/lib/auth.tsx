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

    const isAdminEmail =
      targetEmail === 'deardesserts.in@gmail.com' ||
      targetEmail === 'admin@deardesserts.com' ||
      targetEmail.includes('admin');

    const isCashierEmail =
      targetEmail === 'cashier@deardesserts.com' ||
      targetEmail.includes('cashier');

    // Allowed passwords for fallback verification
    let allowedAdminPasses = ['admin123'];
    let allowedCashierPasses = ['cashier123'];
    let allowedKitchenPasses = ['kitchen123'];

    const customAdminPass = typeof window !== 'undefined' ? localStorage.getItem('dd_admin_password') : null;
    if (customAdminPass) allowedAdminPasses.push(customAdminPass);

    const customStaffRaw = typeof window !== 'undefined' ? localStorage.getItem('dd_custom_staff') : null;
    if (customStaffRaw) {
      try {
        const staffList: any[] = JSON.parse(customStaffRaw);
        staffList.forEach((s) => {
          if (s.password) {
            if (s.role === 'ADMIN') allowedAdminPasses.push(s.password);
            if (s.role === 'CASHIER') allowedCashierPasses.push(s.password);
            if (s.role === 'KITCHEN_STAFF') allowedKitchenPasses.push(s.password);
          }
        });
      } catch (e) {
        console.error('Failed to parse custom staff:', e);
      }
    }

    // 1. Try backend API login if available
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
      console.warn('Backend API login response:', err.message);
      // If backend explicitly rejected credentials, throw error immediately!
      if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('password') || err.message.toLowerCase().includes('credential'))) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
    }

    // 2. Strict Password Verification
    if (isAdminEmail) {
      if (!allowedAdminPasses.includes(cleanPass)) {
        throw new Error('Incorrect password for Admin portal. Please enter the correct password.');
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

    if (isCashierEmail) {
      if (!allowedCashierPasses.includes(cleanPass)) {
        throw new Error('Incorrect password for Cashier POS. Please enter the correct password.');
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

    // Generic staff check
    if (!allowedCashierPasses.includes(cleanPass) && !allowedKitchenPasses.includes(cleanPass) && !allowedAdminPasses.includes(cleanPass)) {
      throw new Error('Invalid password. Please check your credentials.');
    }

    const genericUser: User = {
      id: 'staff_' + Date.now(),
      name: 'Staff Member',
      email: targetEmail,
      role: 'CASHIER',
      branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
    };
    const token = 'staff_token_' + Date.now();
    setToken(token);
    setUser(genericUser);
    localStorage.setItem('dd_token', token);
    localStorage.setItem('dd_user', JSON.stringify(genericUser));
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
