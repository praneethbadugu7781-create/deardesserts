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

    // ============================================================
    // Authenticate ONLY through MongoDB backend API
    // Retry up to 3 times to handle Render cold starts
    // ============================================================
    const MAX_RETRIES = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: targetEmail, password: cleanPass }),
        });

        if (data && data.token && data.user) {
          // MongoDB authenticated successfully!
          const finalUser: User = {
            id: data.user.id,
            name: data.user.name || 'Staff Member',
            email: data.user.email || targetEmail,
            role: data.user.role || 'CASHIER',
            branch: data.user.branch || { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
          };
          setToken(data.token);
          setUser(finalUser);
          localStorage.setItem('dd_token', data.token);
          localStorage.setItem('dd_user', JSON.stringify(finalUser));
          return;
        }
      } catch (err: any) {
        lastError = err.message || 'Login failed';
        const msg = lastError.toLowerCase();

        // If backend explicitly rejected credentials (401/invalid), don't retry
        if (msg.includes('invalid') || msg.includes('unauthorized') || msg.includes('incorrect') || msg.includes('wrong') || msg.includes('401')) {
          throw new Error('Invalid email or password. Please contact the store manager.');
        }

        // Network/timeout error — server might be waking up (Render cold start)
        if (attempt < MAX_RETRIES) {
          // Wait before retrying (1s, then 2s)
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
      }
    }

    // All retries exhausted — server is unreachable
    throw new Error('Server is currently unavailable. Please try again in a few seconds.');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dd_token');
    localStorage.removeItem('dd_user');
    // Clean up old localStorage password keys (no longer used)
    localStorage.removeItem('dd_admin_pass');
    localStorage.removeItem('dd_admin_password');
    localStorage.removeItem('dd_custom_staff');
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
