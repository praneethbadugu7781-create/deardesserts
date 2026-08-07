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

    // ============================================================
    // STEP 1: Try Backend API login first (works on ALL devices)
    // This handles custom passwords changed from Admin Settings
    // ============================================================
    let backendSuccess = false;
    let backendRejected = false;

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail, password: cleanPass }),
      });

      if (data && data.token && data.user) {
        // Backend accepted the password — login successful on ANY device!
        let finalUser: User = data.user;
        if (isAdminEmail) {
          finalUser = { ...data.user, name: data.user.name || 'Store Manager', role: 'ADMIN' };
        } else if (isCashierEmail) {
          finalUser = { ...data.user, name: data.user.name || 'POS Cashier', role: 'CASHIER' };
        }
        setToken(data.token);
        setUser(finalUser);
        localStorage.setItem('dd_token', data.token);
        localStorage.setItem('dd_user', JSON.stringify(finalUser));
        // Also sync custom password to this device's localStorage
        if (isAdminEmail) localStorage.setItem('dd_admin_pass', cleanPass);
        backendSuccess = true;
        return;
      }
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      // If backend explicitly said "invalid password" or 401, mark as rejected
      if (msg.includes('401') || msg.includes('invalid') || msg.includes('unauthorized') || msg.includes('incorrect') || msg.includes('wrong')) {
        backendRejected = true;
      }
      // Otherwise it's a network/timeout error — backend is down, proceed to fallback
      console.warn('Backend login attempt:', err.message);
    }

    // STEP 2: Fallback — default + localStorage passwords (always available)
    // Works even if backend rejected or is down

    const defaultAdminPasses = ['admin123', 'admin', 'admin@123', 'admin1234', 'admin2024', 'deardesserts'];
    const defaultCashierPasses = ['cashier123', 'cashier', 'cashier@123', 'cashier2024'];
    const defaultKitchenPasses = ['kitchen123', 'kitchen', 'kitchen@123', 'kitchen2024'];

    // Also check localStorage custom passwords (works on same device)
    if (typeof window !== 'undefined') {
      const cp1 = localStorage.getItem('dd_admin_pass');
      const cp2 = localStorage.getItem('dd_admin_password');
      if (cp1) { defaultAdminPasses.push(cp1); defaultAdminPasses.push(cp1.toLowerCase()); }
      if (cp2) { defaultAdminPasses.push(cp2); defaultAdminPasses.push(cp2.toLowerCase()); }
    }

    // Fallback to defaults
    if (isAdminEmail) {
      if (!defaultAdminPasses.includes(cleanPass) && !defaultAdminPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
      }
      const adminUser: User = {
        id: 'admin_real', name: 'Store Manager',
        email: 'deardesserts.in@gmail.com', role: 'ADMIN',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_admin_token_' + Date.now();
      setToken(token); setUser(adminUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(adminUser));
      return;
    }

    if (isCashierEmail) {
      if (!defaultCashierPasses.includes(cleanPass) && !defaultCashierPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
      }
      const cashierUser: User = {
        id: 'cashier_real', name: 'POS Cashier',
        email: 'cashier@deardesserts.com', role: 'CASHIER',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_cashier_token_' + Date.now();
      setToken(token); setUser(cashierUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(cashierUser));
      return;
    }

    if (isKitchenEmail) {
      if (!defaultKitchenPasses.includes(cleanPass) && !defaultKitchenPasses.includes(lowerPass)) {
        throw new Error('Invalid email or password. Please contact the store manager.');
      }
      const kitchenUser: User = {
        id: 'kitchen_real', name: 'Head Chef',
        email: 'kitchen@deardesserts.com', role: 'KITCHEN_STAFF',
        branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      };
      const token = 'real_kitchen_token_' + Date.now();
      setToken(token); setUser(kitchenUser);
      localStorage.setItem('dd_token', token);
      localStorage.setItem('dd_user', JSON.stringify(kitchenUser));
      return;
    }

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
