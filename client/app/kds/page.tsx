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
    NEW: { bg: 'border-blue-500 bg-blue-950/40', badge: 'bg-blue-500 text-white', text: '🆕 NEW ORDER' },
    PREPARING: { bg: 'border-amber-500 bg-amber-950/30', badge: 'bg-amber-500 text-black', text: '🔥 PREPARING' },
    READY: { bg: 'border-green-500 bg-green-950/30', badge: 'bg-green-500 text-black', text: '✅ READY' },
  };

  const newOrders = orders.filter((o) => o.status === 'NEW');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-cocoa-950 text-cream-100 p-4 sm:p-6">
      {/* KDS Header */}
      <div className="flex items-center justify-between mb-6 bg-cocoa-900/90 p-4 rounded-3xl border border-gold-500/30 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-gold-300 to-caramel-500 shadow-xl overflow-hidden">
            <img src="/ddlogo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full bg-cream-100" />
          </div>
          <div>
            <img src="/ddtitle.jpeg" alt="Dear Desserts" className="h-9 object-contain filter brightness-200 contrast-125 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
            <p className="text-xs text-gold-400 font-extrabold tracking-wider uppercase mt-0.5">Kitchen Display System • Live Prep Queue</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-black text-gold-400">{orders.length}</div>
            <div className="text-[10px] text-cream-400 font-semibold">ACTIVE ORDERS</div>
          </div>
          <button onClick={fetchOrders} className="p-3 rounded-xl bg-cocoa-800 hover:bg-cocoa-700 border border-cocoa-600 transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Summary Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-blue-400">{newOrders.length}</div>
          <div className="text-xs font-bold text-blue-300">NEW</div>
        </div>
        <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-amber-400">{preparingOrders.length}</div>
          <div className="text-xs font-bold text-amber-300">PREPARING</div>
        </div>
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-400">{readyOrders.length}</div>
          <div className="text-xs font-bold text-green-300">READY</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-cream-400">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold">Loading Kitchen Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-cream-400">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-2xl font-bold">No Active Orders</p>
          <p className="text-sm mt-2">Waiting for new orders from POS...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig['NEW'];
            const elapsed = getElapsed(order.createdAt);
            const isUrgent = elapsed > 10 && order.status !== 'READY';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 p-5 transition-all ${cfg.bg} ${isUrgent ? 'animate-pulse border-red-500' : ''}`}
              >
                {/* Token & Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black">{order.tokenNumber || '—'}</span>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.badge}`}>{cfg.text}</span>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-cream-400'}`} />
                  <span className={`font-bold ${isUrgent ? 'text-red-400' : 'text-cream-300'}`}>
                    {elapsed} min ago
                  </span>
                  {isUrgent && <span className="text-[10px] text-red-400 font-bold animate-bounce">⚠ DELAYED</span>}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-5 bg-black/20 rounded-xl p-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-cream-200 font-medium">{item.name}</span>
                      <span className="text-xl font-black text-gold-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === 'NEW' && (
                    <button
                      onClick={() => updateStatus(order.id, 'PREPARING')}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg"
                    >
                      <Play className="w-5 h-5" /> Start Preparing
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'READY')}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateStatus(order.id, 'COMPLETED')}
                      className="flex-1 py-3 bg-cream-200 hover:bg-cream-300 text-cocoa-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg"
                    >
                      <ArrowRight className="w-5 h-5" /> Complete & Clear
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
