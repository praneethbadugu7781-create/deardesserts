'use client';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cocoa-900 text-cream-100 p-6 rounded-3xl shadow-xl border border-cocoa-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 animate-bounce" /> Peak Sales & Rush Hour Analysis
          </h1>
          <p className="text-xs text-cream-300">Identify customer buying patterns & peak business windows</p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-amber-500/20 text-amber-300 px-3.5 py-2 rounded-2xl border border-amber-500/40 font-bold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Rush Hours: 6 PM - 10 PM</span>
        </div>
      </div>

      {/* Rush Windows Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {peakWindows.map((pw, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition shadow-sm ${
              pw.window.includes('6 PM') || pw.window.includes('8 PM')
                ? 'bg-gradient-to-br from-amber-500/10 to-gold-500/20 border-gold-500/60'
                : 'bg-white border-cream-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-cocoa-600 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold-600" /> {pw.window}
              </span>
              {pw.window.includes('6 PM') || pw.window.includes('8 PM') ? (
                <span className="text-[10px] bg-amber-500 text-cocoa-950 font-black px-1.5 py-0.5 rounded">
                  PEAK
                </span>
              ) : null}
            </div>
            <div className="text-xs font-semibold text-cocoa-700">{pw.label}</div>
            <div className="text-lg font-black text-cocoa-900 mt-2">{pw.orders} Orders</div>
            <div className="text-xs font-bold text-gold-600">₹{pw.revenue.toLocaleString()} revenue</div>
          </div>
        ))}
      </div>

      {/* Hourly Sales Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-600" /> 24-Hour Sales Distribution
          </h3>
          <span className="text-[11px] font-semibold text-cocoa-500">Hourly Order Volume</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
              <XAxis dataKey="label" stroke="#7B3F00" fontSize={10} interval={1} />
              <YAxis stroke="#7B3F00" fontSize={11} />
              <Tooltip formatter={(val: any) => [`${val} Orders`, 'Volume']} />
              <Bar dataKey="ordersCount" radius={[6, 6, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hour >= 18 && entry.hour <= 22 ? '#D4AF37' : entry.hour >= 12 && entry.hour <= 15 ? '#C87D55' : '#E6D5C3'}
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
