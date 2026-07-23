'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { MonitorPlay, Sparkles, Volume2, Maximize, Clock, CheckCircle2 } from 'lucide-react';

interface TokenItem {
  id: string;
  tokenNumber: string;
  orderNumber: string;
  status: string;
}

export default function CustomerTokenDisplayPage() {
  const [preparing, setPreparing] = useState<TokenItem[]>([]);
  const [ready, setReady] = useState<TokenItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const fetchLiveTokens = useCallback(async () => {
    try {
      const data = await fetchApi('/orders/tokens/live');
      setPreparing(data.preparing || []);
      setReady(data.ready || []);
    } catch (err) {
      console.error('Token fetch error:', err);
    }
  }, []);

  const announceToken = (tokenStr: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // clear queue
      const text = `Token Number ${tokenStr.replace('-', ' ')} is ready for pickup.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  useEffect(() => {
    fetchLiveTokens();
    const tokenInterval = setInterval(fetchLiveTokens, 10000);

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const socket = getSocket();
    socket.on('token_updated', () => fetchLiveTokens());
    socket.on('token_ready', (data: { tokenNumber: string }) => {
      fetchLiveTokens();
      if (data?.tokenNumber) {
        announceToken(data.tokenNumber);
      }
    });

    return () => {
      clearInterval(tokenInterval);
      clearInterval(clockInterval);
      socket.off('token_updated');
      socket.off('token_ready');
    };
  }, [fetchLiveTokens, voiceEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-cocoa-950 text-cream-100 p-6 flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-cocoa-900/90 border border-gold-500/30 p-4 rounded-3xl shadow-2xl backdrop-blur">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-gold-300 to-caramel-500 shadow-xl overflow-hidden">
            <img src="/ddlogo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full bg-cream-100" />
          </div>
          <div>
            <img src="/ddtitle.jpeg" alt="Dear Desserts" className="h-10 object-contain filter brightness-200 contrast-125 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
            <p className="text-xs text-gold-400 font-bold tracking-widest uppercase mt-0.5">Live Order Token Monitor</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xl font-mono font-extrabold text-gold-400">{currentTime}</div>
            <div className="text-[10px] text-cream-400 font-bold">LIVE UPDATE</div>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-2xl border transition ${
              voiceEnabled ? 'bg-gold-500 text-cocoa-950 border-gold-400' : 'bg-cocoa-800 text-cream-400 border-cocoa-700'
            }`}
            title="Toggle Voice Announcements"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-cocoa-800 text-cream-300 hover:text-white border border-cocoa-700 transition"
            title="Toggle TV Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Split Grid (PREPARING vs READY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 flex-1">
        {/* LEFT: PREPARING TOKENS */}
        <div className="bg-cocoa-900/60 rounded-3xl border-2 border-amber-500/40 p-6 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-amber-500/30 pb-4">
            <Clock className="w-8 h-8 text-amber-400 animate-spin" />
            <div>
              <h2 className="text-2xl font-black text-amber-400 tracking-wide">PREPARING</h2>
              <p className="text-xs text-cream-400 font-semibold">Your delicious dessert is being crafted</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 align-content-start overflow-y-auto">
            {preparing.length === 0 ? (
              <div className="col-span-full py-16 text-center text-cream-500 font-bold text-lg">
                No orders preparing right now
              </div>
            ) : (
              preparing.map((t) => (
                <div
                  key={t.id || t.tokenNumber}
                  className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 text-center shadow-lg"
                >
                  <span className="text-3xl sm:text-4xl font-black tracking-wider text-amber-300">
                    {t.tokenNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: READY FOR PICKUP TOKENS */}
        <div className="bg-cocoa-900/60 rounded-3xl border-2 border-green-500/60 p-6 flex flex-col space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-green-500/30 pb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-green-400 tracking-wide">READY FOR PICKUP</h2>
              <p className="text-xs text-cream-400 font-semibold">Please collect your order at the counter</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 align-content-start overflow-y-auto">
            {ready.length === 0 ? (
              <div className="col-span-full py-16 text-center text-cream-500 font-bold text-lg">
                No orders waiting for pickup
              </div>
            ) : (
              ready.map((t) => (
                <div
                  key={t.id || t.tokenNumber}
                  className="bg-green-950/60 border-2 border-green-400 rounded-2xl p-4 text-center shadow-2xl animate-pulse-glow"
                >
                  <span className="text-4xl sm:text-5xl font-black tracking-wider text-green-300">
                    {t.tokenNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-cocoa-900 border border-cocoa-700 py-3 px-6 rounded-2xl text-center text-xs text-cream-400 font-medium">
        Thank you for choosing <span className="text-gold-400 font-bold">Dear Desserts</span>! Show your token number at the pickup counter.
      </div>
    </div>
  );
}
