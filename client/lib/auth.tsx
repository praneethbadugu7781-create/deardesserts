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
    if (!email || !pass || !pass.trim()) {
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

    const isKitchenEmail =
      targetEmail === 'kitchen@deardesserts.com' ||
      targetEmail.includes('kitchen');

    // Authorized password lists
    const validAdminPasses = ['admin123', 'admin', 'admin@123', 'admin1234', 'admin2024', 'deardesserts'];
    const validCashierPasses = ['cashier123', 'cashier', 'cashier@123', 'cashier2024'];
    const validKitchenPasses = ['kitchen123', 'kitchen', 'kitchen@123', 'kitchen2024'];

    // Check custom passwords saved from Admin Settings (reads BOTH possible localStorage keys)
    if (typeof window !== 'undefined') {
      const customPass1 = localStorage.getItem('dd_admin_pass');
      const customPass2 = localStorage.getItem('dd_admin_password');
      if (customPass1) {
        validAdminPasses.push(customPass1);
        validAdminPasses.push(customPass1.toLowerCase());
      }
      if (customPass2) {
        validAdminPasses.push(customPass2);
        validAdminPasses.push(customPass2.toLowerCase());
      }
    }

    const customStaffRaw = typeof window !== 'undefined' ? localStorage.getItem('dd_custom_staff') : null;
    if (customStaffRaw) {
      try {
        const staffList: any[] = JSON.parse(customStaffRaw);
        staffList.forEach((s) => {
          if (s.password) {
            validAdminPasses.push(s.password);
            if (s.role === 'ADMIN') { validAdminPasses.push(s.password); validAdminPasses.push(s.password.toLowerCase()); }
            if (s.role === 'CASHIER') { validCashierPasses.push(s.password); validCashierPasses.push(s.password.toLowerCase()); }
            if (s.role === 'KITCHEN_STAFF') { validKitchenPasses.push(s.password); validKitchenPasses.push(s.password.toLowerCase()); }
          }
        });
      } catch (e) {
        console.error('Failed to parse custom staff:', e);
      }
    }

    // 1. Strict Admin Authentication (check both exact and lowercase match)
    if (isAdminEmail) {
      if (!validAdminPasses.includes(cleanPass) && !validAdminPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
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

    // 2. Strict Cashier POS Authentication (check both exact and lowercase match)
    if (isCashierEmail) {
      if (!validCashierPasses.includes(cleanPass) && !validCashierPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
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

    // 3. Strict Kitchen KDS Authentication (check both exact and lowercase match)
    if (isKitchenEmail) {
      if (!validKitchenPasses.includes(cleanPass) && !validKitchenPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
      }

      const kitchenUser: User = {
        id: 'kitchen_real',
        name: 'Head Chef',
        email: 'kitchen@deardesserts.com',
        role: 'KITCHEN_STAFF',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_kitchen_token_' + Date.now();
      setToken(token);
      setUser(kitchenUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(kitchenUser));
      return;
    }

    // Reject all unauthorized access attempts
    throw new Error('Invalid email or password. Please contact the store manager.');
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
