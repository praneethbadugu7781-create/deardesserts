'use client';

// Force rebuild: 2026-07-23T22:54:00
import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Flame, Clock, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PeakHoursPage() {
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [peakWindows, setPeakWindows] = useState<any[]>([]);

  useEffect(() => {
    loadPeakAnalysis();
  }, []);

  const loadPeakAnalysis = async () => {
    try {
      const data = await fetchApi('/analytics/peak-hours');
      setHourlyData(data.hourlyGraph || []);
      setPeakWindows(data.peakWindows || []);
    } catch (err) {
      console.error('Failed to fetch peak hours:', err);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-gold-500 animate-bounce" /> Peak Sales & Rush Hour Analysis
          </h1>
          <p className="text-sm text-gold-600 font-medium mt-1">Identify customer buying patterns & peak business windows</p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-gold-50 text-gold-700 border border-gold-300/50 px-3.5 py-2 rounded-2xl font-bold">
          <Zap className="w-4 h-4 text-gold-600" />
          <span>Rush Hours: 6 PM - 10 PM</span>
        </div>
      </div>

      {/* Rush Windows Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {peakWindows.map((pw, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all duration-300 shadow-md ${
              pw.window.includes('6 PM') || pw.window.includes('8 PM')
                ? 'bg-gradient-to-br from-gold-50 to-gold-100/50 border-gold-400'
                : 'bg-white/80 backdrop-blur-xl border-cream-300/80'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-accent text-cocoa-500 font-bold tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-600" /> {pw.window}
              </span>
              {(pw.window.includes('6 PM') || pw.window.includes('8 PM')) && (
                <span className="text-[9px] bg-cocoa-900 text-gold-300 font-black px-1.5 py-0.5 rounded-md">
                  PEAK
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-cocoa-700">{pw.label}</div>
            <div className="text-2xl font-display font-black text-cocoa-900 mt-2">{pw.orders} Orders</div>
            <div className="text-xs font-bold text-gold-600 mt-1">₹{pw.revenue.toLocaleString()} revenue</div>
          </div>
        ))}
      </div>

      {/* Hourly Sales Bar Chart */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-cream-300/80 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h3 className="font-display text-lg font-bold text-cocoa-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-600" /> 24-Hour Sales Distribution
          </h3>
          <span className="text-xs font-accent text-cocoa-500 font-bold uppercase tracking-wider">Hourly Order Volume</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADCC9" />
              <XAxis dataKey="label" stroke="#4A2E1B" fontSize={10} interval={1} />
              <YAxis stroke="#4A2E1B" fontSize={11} />
              <Tooltip formatter={(val: any) => [`${val} Orders`, 'Volume']} contentStyle={{ background: '#FAF3E8', borderColor: '#EADCC9', borderRadius: '12px', fontFamily: 'var(--font-sans)' }} />
              <Bar dataKey="ordersCount" radius={[6, 6, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hour >= 18 && entry.hour <= 22 ? '#D4AF37' : entry.hour >= 12 && entry.hour <= 15 ? '#C99A2E' : '#EADCC9'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
