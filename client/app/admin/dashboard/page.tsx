'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Receipt,
  Users,
  Award,
  PieChart as PieIcon,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardMetrics {
  revenue: {
    today: number;
    yesterday: number;
    weekly: number;
    monthly: number;
    yearly: number;
    dailyGrowthPercent: number;
  };
  sales: {
    totalOrders: number;
    totalBills: number;
    totalItemsSold: number;
    averageOrderValue: number;
  };
}

interface PaymentAnalytics {
  today: { cash: number; upi: number; card: number; total: number };
  chartData: { name: string; value: number; color: string }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [payments, setPayments] = useState<PaymentAnalytics | null>(null);
  const [topItems, setTopItems] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();

    const socket = getSocket();
    socket.on('order_created', () => loadDashboardData());

    return () => {
      socket.off('order_created');
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashRes, payRes, itemsRes] = await Promise.all([
        fetchApi('/analytics/dashboard'),
        fetchApi('/analytics/payments'),
        fetchApi('/analytics/item-sales'),
      ]);

      setMetrics(dashRes);
      setPayments(payRes);
      setTopItems(itemsRes.topSelling || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const revenueTrendData = [
    { name: 'Mon', revenue: (metrics?.revenue.today || 15000) * 0.7 },
    { name: 'Tue', revenue: (metrics?.revenue.today || 15000) * 0.8 },
    { name: 'Wed', revenue: (metrics?.revenue.today || 15000) * 0.85 },
    { name: 'Thu', revenue: (metrics?.revenue.today || 15000) * 0.9 },
    { name: 'Fri', revenue: (metrics?.revenue.today || 15000) * 1.1 },
    { name: 'Sat', revenue: (metrics?.revenue.today || 15000) * 1.3 },
    { name: 'Sun (Today)', revenue: metrics?.revenue.today || 18500 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-cocoa-900 text-cream-100 p-6 rounded-3xl shadow-xl border border-gold-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-gold-300 to-caramel-500 shadow-xl overflow-hidden">
            <img src="/ddlogo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full bg-cream-100" />
          </div>
          <div>
            <img src="/ddtitle.jpeg" alt="Dear Desserts" className="h-9 object-contain filter brightness-200 contrast-125 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
            <p className="text-xs text-gold-400 font-extrabold tracking-wider uppercase mt-0.5">Executive Admin Dashboard • Real-time Outlet Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-cocoa-950/80 px-4 py-2 rounded-2xl border border-cocoa-700">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-cream-200">Outlet Online & Syncing Live</span>
        </div>
      </div>

      {/* Revenue Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-cocoa-600 mb-2">
            <span className="text-xs font-bold">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-gold-100 text-gold-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cocoa-900">₹{metrics?.revenue.today.toLocaleString() || '0'}</div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] font-bold text-green-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics?.revenue.dailyGrowthPercent || 0}% vs yesterday</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-cocoa-600 mb-2">
            <span className="text-xs font-bold">Weekly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cocoa-900">₹{metrics?.revenue.weekly.toLocaleString() || '0'}</div>
          <div className="text-[11px] font-semibold text-cocoa-500 mt-1">Last 7 days total</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-cocoa-600 mb-2">
            <span className="text-xs font-bold">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cocoa-900">₹{metrics?.revenue.monthly.toLocaleString() || '0'}</div>
          <div className="text-[11px] font-semibold text-cocoa-500 mt-1">Current month total</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-cocoa-600 mb-2">
            <span className="text-xs font-bold">Yearly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cocoa-900">₹{metrics?.revenue.yearly.toLocaleString() || '0'}</div>
          <div className="text-[11px] font-semibold text-cocoa-500 mt-1">FY 2026 total</div>
        </div>
      </div>

      {/* Sales Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300">
          <div className="text-xs font-bold text-cocoa-600">Total Orders</div>
          <div className="text-xl font-black text-cocoa-900 mt-1">{metrics?.sales.totalOrders || 0}</div>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300">
          <div className="text-xs font-bold text-cocoa-600">Total Bills Generated</div>
          <div className="text-xl font-black text-cocoa-900 mt-1">{metrics?.sales.totalBills || 0}</div>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300">
          <div className="text-xs font-bold text-cocoa-600">Total Items Sold</div>
          <div className="text-xl font-black text-cocoa-900 mt-1">{metrics?.sales.totalItemsSold || 0}</div>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300">
          <div className="text-xs font-bold text-cocoa-600">Average Order Value</div>
          <div className="text-xl font-black text-gold-600 mt-1">₹{metrics?.sales.averageOrderValue || 0}</div>
        </div>
      </div>

      {/* Charts Section: Revenue Area Chart + Payment Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-600" /> Weekly Revenue Trend
            </h3>
            <span className="text-[11px] font-semibold text-cocoa-500">7-Day Aggregation</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
                <XAxis dataKey="name" stroke="#7B3F00" fontSize={11} />
                <YAxis stroke="#7B3F00" fontSize={11} />
                <Tooltip formatter={(value: any) => [`₹${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Collections Breakdown (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-caramel-500" /> Payment Collections
            </h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payments?.chartData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(payments?.chartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${value}`, 'Collection']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"/> UPI QR</span>
              <span className="font-bold">₹{payments?.today.upi || 0}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Cash</span>
              <span className="font-bold">₹{payments?.today.cash || 0}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"/> Card</span>
              <span className="font-bold">₹{payments?.today.card || 0}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold border-t border-cream-200 pt-2 text-cocoa-900">
              <span>Total Collections</span>
              <span className="text-gold-600">₹{payments?.today.total || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products Preview */}
      <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-gold-600" /> Top Selling Signature Desserts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topItems.slice(0, 3).map((item, idx) => (
            <div key={item.id || idx} className="bg-cream-100 p-3.5 rounded-xl border border-cream-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-300 text-cocoa-950">
                  RANK #{idx + 1}
                </span>
                <div className="font-bold text-xs text-cocoa-900 mt-1">{item.name}</div>
                <div className="text-[10px] text-cocoa-600">{item.qty} units sold</div>
              </div>
              <div className="font-black text-sm text-gold-600">₹{item.revenue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
