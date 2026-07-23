'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { BarChart3, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ItemSalesAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [topItems, setTopItems] = useState<any[]>([]);
  const [leastItems, setLeastItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItemAnalytics();
  }, [timeframe]);

  const loadItemAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/analytics/item-sales?timeframe=${timeframe}`);
      setTopItems(data.topSelling || []);
      setLeastItems(data.leastSelling || []);
    } catch (err) {
      console.error('Failed to fetch item sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#D4AF37', '#C87D55', '#3B82F6', '#10B981', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gold-400" /> Item-Wise Sales Analytics
          </h1>
          <p className="text-sm text-gold-600 font-medium">Track best & least selling dessert products across timeframes</p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center space-x-1.5 bg-cocoa-950 p-1.5 rounded-2xl border border-cocoa-700 text-xs">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                timeframe === tab.id
                  ? 'bg-gold-500 text-cocoa-950 shadow-md'
                  : 'text-cream-400 hover:text-cream-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Products Bar Chart */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-600" /> Top 5 Selling Products (Quantity Volume)
          </h3>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topItems} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
              <XAxis dataKey="name" stroke="#7B3F00" fontSize={11} />
              <YAxis stroke="#7B3F00" fontSize={11} />
              <Tooltip formatter={(val: any) => [`${val} Units Sold`, 'Quantity']} />
              <Bar dataKey="qty" radius={[8, 8, 0, 0]}>
                {topItems.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables: Top Selling vs Least Selling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Table */}
        <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2 border-b border-cream-200 pb-2">
            <TrendingUp className="w-4 h-4 text-green-600" /> Top Performing Desserts
          </h3>

          <div className="divide-y divide-cream-200 text-xs">
            {topItems.map((item, idx) => (
              <div key={item.id || idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-gold-300 text-cocoa-950 font-black text-[11px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-cocoa-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-cocoa-900">{item.qty} units</div>
                  <div className="text-[10px] font-bold text-gold-600">₹{item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Selling Table */}
        <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2 border-b border-cream-200 pb-2">
            <TrendingDown className="w-4 h-4 text-amber-600" /> Slow Moving Desserts
          </h3>

          <div className="divide-y divide-cream-200 text-xs">
            {leastItems.map((item, idx) => (
              <div key={item.id || idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-cream-200 text-cocoa-700 font-bold text-[11px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-cocoa-800">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cocoa-800">{item.qty} units</div>
                  <div className="text-[10px] text-cocoa-500">₹{item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
