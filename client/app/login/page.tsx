'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, ShoppingCart, ChefHat, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Role = 'ADMIN' | 'CASHIER' | 'KITCHEN_STAFF';

const ROLES = [
  { id: 'ADMIN', label: 'Admin', icon: LayoutDashboard, email: 'admin@deardesserts.com', pass: 'admin123' },
  { id: 'CASHIER', label: 'Cashier POS', icon: ShoppingCart, email: 'cashier@deardesserts.com', pass: 'cashier123' },
  { id: 'KITCHEN_STAFF', label: 'Kitchen KDS', icon: ChefHat, email: 'kitchen@deardesserts.com', pass: 'kitchen123' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedRole = ROLES.find(r => r.id === role);
    if (selectedRole) {
      setEmail(selectedRole.email);
      setPassword(selectedRole.pass);
      setError('');
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'CASHIER') router.push('/pos');
      else if (role === 'KITCHEN_STAFF') router.push('/kds');
      
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cocoa-900/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl border border-cream-300/80 shadow-2xl p-8 md:p-12 relative z-10">
        
        {/* Logos */}
        <div className="flex flex-col items-center justify-center mb-10 space-y-4">
          <img src="/ddlogo.png" alt="Dear Desserts Logo" className="h-20 w-auto object-contain drop-shadow-md" />
          <img src="/ddtitle.png" alt="Dear Desserts" className="h-12 w-auto object-contain opacity-90" />
          <div className="flex items-center gap-2 text-cocoa-600 mt-2">
            <Shield className="w-4 h-4 text-gold-500" />
            <h1 className="font-display text-xl tracking-wide font-medium">Staff Authentication</h1>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as Role)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-cocoa-900 text-gold-300 border-cocoa-900 shadow-md scale-105' 
                    : 'bg-cream-200 text-cocoa-600 border-cream-300 hover:bg-cream-300/80'
                }`}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-gold-400' : 'text-cocoa-500'}`} />
                <span className="font-accent text-sm uppercase tracking-wider font-bold">{r.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cocoa-900 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-100 text-cocoa-900 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cocoa-900 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-100 text-cocoa-900 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 py-4 rounded-xl font-accent uppercase tracking-wider font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
            {!isLoading && <ArrowRight className="w-5 h-5 text-gold-400" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-cocoa-600 hover:text-cocoa-900 transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
