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
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-cream-100 text-cocoa-900 p-6 flex flex-col justify-between">
      {/* "Now Serving" Banner if any token is ready */}
      {ready.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 mb-6 shadow-lg flex items-center justify-center space-x-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          <h2 className="text-3xl font-display font-bold text-emerald-800 tracking-wide">
            NOW SERVING: <span className="text-gold-600">{ready.map(t => t.tokenNumber).join(', ')}</span>
          </h2>
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white/80 border border-cream-300/80 p-4 rounded-3xl shadow-lg backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-gold-300 to-gold-500 shadow-md overflow-hidden">
            <img src="/ddlogo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full bg-cream-100" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-cocoa-50 p-2 rounded-xl border border-cocoa-100">
              <MonitorPlay className="w-6 h-6 text-cocoa-800" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-cocoa-900">Live Token TV Display</h1>
              <p className="text-[10px] font-accent text-cocoa-600 font-bold tracking-widest uppercase mt-0.5">Dear Desserts</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xl font-mono font-extrabold text-cocoa-900">{currentTime}</div>
            <div className="text-[10px] text-cocoa-500 font-accent font-bold uppercase tracking-wider">LIVE UPDATE</div>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-3 rounded-full border transition flex items-center space-x-2 font-accent text-xs font-bold tracking-wider ${
              voiceEnabled 
                ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 border-transparent shadow-md hover:shadow-lg hover:scale-105' 
                : 'bg-cream-200 text-cocoa-500 border-cream-300 hover:bg-cream-300'
            }`}
            title="Toggle Voice Announcements"
          >
            <Volume2 className="w-4 h-4" />
            <span>{voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-cream-200 text-cocoa-700 hover:bg-cream-300 hover:text-cocoa-900 border border-cream-300 transition shadow-sm hover:shadow-md hover:scale-105"
            title="Toggle TV Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Split Grid (PREPARING vs READY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 flex-1">
        {/* LEFT: PREPARING TOKENS */}
        <div className="bg-white/80 rounded-3xl border border-cream-300/80 p-6 flex flex-col space-y-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center space-x-3 border-b border-cream-200 pb-4">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Clock className="w-8 h-8 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-amber-600 tracking-wide">🔥 NOW PREPARING</h2>
              <p className="text-xs text-cocoa-600 font-sans">Your delicious dessert is being crafted</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start overflow-y-auto">
            {preparing.length === 0 ? (
              <div className="col-span-full py-16 text-center text-cocoa-400 font-sans text-lg">
                No orders preparing right now
              </div>
            ) : (
              preparing.map((t) => (
                <div
                  key={t.id || t.tokenNumber}
                  className="bg-cream-50 border-2 border-amber-300 rounded-2xl p-4 text-center shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-amber-400/10 animate-pulse"></div>
                  <div className="absolute top-0 left-0 h-1 bg-amber-400/50 w-full">
                    <div className="h-full bg-amber-500 w-1/2 animate-bounce"></div>
                  </div>
                  <span className="text-4xl sm:text-5xl font-display font-bold text-amber-700 relative z-10">
                    {t.tokenNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: READY FOR PICKUP TOKENS */}
        <div className="bg-white/80 rounded-3xl border border-cream-300/80 p-6 flex flex-col space-y-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center space-x-3 border-b border-cream-200 pb-4">
            <div className="bg-emerald-100 p-2 rounded-xl shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-emerald-600 tracking-wide">✅ READY FOR PICKUP</h2>
              <p className="text-xs text-cocoa-600 font-sans">Please collect your order at the counter</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start overflow-y-auto">
            {ready.length === 0 ? (
              <div className="col-span-full py-16 text-center text-cocoa-400 font-sans text-lg">
                No orders waiting for pickup
              </div>
            ) : (
              ready.map((t) => (
                <div
                  key={t.id || t.tokenNumber}
                  className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center shadow-xl animate-pulse flex items-center justify-center transform transition-transform hover:scale-105"
                >
                  <span className="text-5xl sm:text-6xl font-display font-bold text-gold-500 drop-shadow-md">
                    {t.tokenNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-white/80 border border-cream-300/80 py-3 px-6 rounded-2xl text-center text-sm text-cocoa-600 font-sans shadow-md backdrop-blur-xl">
        Thank you for choosing <span className="text-gold-600 font-display font-bold text-lg">Dear Desserts</span>! Show your token number at the pickup counter.
      </div>
    </div>
  );
}
