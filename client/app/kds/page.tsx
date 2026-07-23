'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { ChefHat, Clock, Play, CheckCircle2, ArrowRight, Volume2, RefreshCw } from 'lucide-react';

interface KdsItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KdsOrder {
  id: string;
  orderNumber: string;
  tokenNumber?: string;
  status: string;
  createdAt: string;
  items: KdsItem[];
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await fetchApi('/orders/tokens/live');
      const preparing = Array.isArray(data.preparing) ? data.preparing : [];
      const ready = Array.isArray(data.ready) ? data.ready : [];
      const newOrds = Array.isArray(data.new) ? data.new : [];
      const combined = [...newOrds, ...preparing, ...ready].map((o: any) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
      }));
      setOrders(combined);
    } catch (err) {
      console.error('KDS fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const playChime = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);

    const socket = getSocket();
    socket.on('order_created', () => {
      playChime();
      fetchOrders();
    });
    socket.on('order_status_updated', () => fetchOrders());

    return () => {
      clearInterval(interval);
      socket.off('order_created');
      socket.off('order_status_updated');
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetchApi(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getElapsed = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return mins;
  };

  const statusConfig: Record<string, { bg: string; badge: string; text: string }> = {
    NEW: { bg: 'bg-blue-50/50', badge: 'bg-blue-100 text-blue-800 border border-blue-200', text: 'NEW ORDER' },
    PREPARING: { bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-800 border border-amber-200', text: 'PREPARING' },
    READY: { bg: 'bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', text: 'READY' },
  };

  const newOrders = orders.filter((o) => o.status === 'NEW');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-cream-100 text-cocoa-900 p-4 sm:p-6 font-sans">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white/80 p-5 rounded-3xl border border-cream-300/80 shadow-lg backdrop-blur-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full p-2.5 bg-gradient-to-br from-cocoa-800 to-cocoa-950 shadow-md flex items-center justify-center text-gold-300">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-cocoa-900 tracking-tight">Kitchen Display System</h1>
            <p className="text-xs font-accent text-gold-500 font-bold tracking-widest uppercase mt-0.5">Live Prep Queue</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-display font-black text-cocoa-900">{orders.length}</div>
            <div className="text-[10px] font-accent text-cocoa-500 font-bold tracking-widest uppercase">Active Orders</div>
          </div>
          <button onClick={fetchOrders} className="p-3 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 transition-colors shadow-sm text-cocoa-600">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Summary Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-display font-bold text-blue-900">{newOrders.length}</div>
          <div className="text-[10px] font-accent font-bold text-blue-600 tracking-wider mt-1">NEW</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-display font-bold text-amber-900">{preparingOrders.length}</div>
          <div className="text-[10px] font-accent font-bold text-amber-600 tracking-wider mt-1">PREPARING</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-display font-bold text-emerald-900">{readyOrders.length}</div>
          <div className="text-[10px] font-accent font-bold text-emerald-600 tracking-wider mt-1">READY</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-cocoa-500">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-gold-400" />
          <p className="text-xl font-display font-medium">Loading Kitchen Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white/60 backdrop-blur-xl border border-cream-300/60 rounded-3xl shadow-sm">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-cream-400" />
          <p className="text-2xl font-display font-bold text-cocoa-900">No Active Orders</p>
          <p className="text-sm mt-2 text-cocoa-500">Waiting for new orders from POS...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig['NEW'];
            const elapsed = getElapsed(order.createdAt);
            const isUrgent = elapsed > 10 && order.status !== 'READY';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border bg-white/90 shadow-md p-5 transition-all backdrop-blur-xl ${cfg.bg} ${isUrgent ? 'animate-pulse ring-2 ring-red-400 ring-offset-2 ring-offset-cream-100 border-red-300' : 'border-cream-300'}`}
              >
                {/* Token & Status */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-cream-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-cocoa-500">Token</span>
                    <span className="text-4xl font-display font-bold text-cocoa-900">{order.tokenNumber || '—'}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>{cfg.text}</span>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 mb-5 text-sm">
                  <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-cocoa-400'}`} />
                  <span className={`font-medium ${isUrgent ? 'text-red-600 font-bold' : 'text-cocoa-600'}`}>
                    {elapsed} min ago
                  </span>
                  {isUrgent && <span className="text-[10px] text-red-600 font-bold animate-bounce bg-red-100 px-2 py-0.5 rounded-full ml-auto">⚠ DELAYED</span>}
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6 bg-cream-50/50 rounded-xl p-4 border border-cream-200/50">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-cream-200/50 last:border-0 pb-2 last:pb-0">
                      <span className="text-cocoa-800 font-medium">{item.name}</span>
                      <span className="text-lg font-bold text-gold-500 bg-gold-50 px-2 py-0.5 rounded-md">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  {order.status === 'NEW' && (
                    <button
                      onClick={() => updateStatus(order.id, 'PREPARING')}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Play className="w-4 h-4" fill="currentColor" /> Start Prep
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'READY')}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-emerald-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateStatus(order.id, 'COMPLETED')}
                      className="flex-1 py-3 bg-gradient-to-r from-cocoa-800 to-cocoa-900 hover:from-cocoa-900 hover:to-black text-gold-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <ArrowRight className="w-5 h-5" /> Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
