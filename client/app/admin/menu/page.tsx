'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import {
  UtensilsCrossed,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
  Trash2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent?: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isCombo?: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ExtractedItem {
  id: string;
  name: string;
  price: number;
  categoryName: string;
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // AI Extractor State
  const [showAiModal, setShowAiModal] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [extractedList, setExtractedList] = useState<ExtractedItem[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(180);

  // Groq API Key
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('dd_groq_key') || '' : '';
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetchApi('/menu/categories').catch(() => []),
        fetchApi('/menu/items').catch(() => []),
      ]);

      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setCategories(catsRes);
        if (!categoryId) setCategoryId(catsRes[0].id);
      }
      if (Array.isArray(itemsRes)) {
        setItems(itemsRes);
      }
    } catch (err) {
      console.error('Failed to load menu data:', err);
    }
    setLoading(false);
  };

  const handleToggleStock = async (itemId: string) => {
    try {
      const updated = await fetchApi(`/menu/items/${itemId}/toggle-availability`, { method: 'PATCH' });
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isAvailable: updated.isAvailable } : it)));
    } catch (err: any) {
      alert(`Failed to toggle stock: ${err.message}`);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}" from the menu?`)) return;
    try {
      await fetchApi(`/menu/items/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((it) => it.id !== itemId));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm(`⚠️ Are you sure you want to REMOVE ALL ${items.length} items from the menu? This cannot be undone!`)) return;
    try {
      await fetchApi('/menu/items/all', { method: 'DELETE' });
      setItems([]);
    } catch (err: any) {
      alert(`Failed to remove all: ${err.message}`);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    try {
      const newItem = await fetchApi('/menu/items', {
        method: 'POST',
        body: JSON.stringify({
          name,
          categoryId,
          price: Number(price),
          taxPercent: 5,
        }),
      });
      setItems((prev) => [newItem, ...prev]);
      setName('');
      setShowAddModal(false);
    } catch (err: any) {
      alert(`Failed to add item: ${err.message}`);
    }
  };

  // AI Groq Menu Extractor
  const handleAiParseText = async () => {
    if (!rawText.trim()) {
      alert('Please paste menu text!');
      return;
    }

    setIsAiParsing(true);

    if (groqApiKey.trim()) {
      localStorage.setItem('dd_groq_key', groqApiKey.trim());
    }

    // Attempt 1: Groq Cloud API
    if (groqApiKey.trim()) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content:
                  'You are a restaurant menu parser. Extract all menu items, prices, and categories from text into a valid JSON array format: [{"name": "Item Name", "price": 180, "categoryName": "Category"}]. Output ONLY valid JSON array and nothing else.',
              },
              { role: 'user', content: rawText },
            ],
            temperature: 0.1,
          }),
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const jsonMatch = content.match(/\[.*\]/s);
          if (jsonMatch) {
            const parsed: any[] = JSON.parse(jsonMatch[0]);
            const results: ExtractedItem[] = parsed.map((it: any, i: number) => ({
              id: 'groq-' + i + '-' + Date.now(),
              name: it.name || 'Unnamed Item',
              price: Number(it.price) || 100,
              categoryName: it.categoryName || 'Specials',
            }));

            setExtractedList(results);
            setIsAiParsing(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Groq Cloud error, using local parser:', err);
      }
    }

    // Attempt 2: Local NLP fallback
    const lines = rawText.split('\n');
    let currentCategory = 'Specials';
    const results: ExtractedItem[] = [];

    lines.forEach((line, index) => {
      const clean = line.trim();
      if (!clean) return;

      const isHeader =
        !clean.match(/\d+/) &&
        (clean.toLowerCase().includes('waffle') ||
          clean.toLowerCase().includes('brownie') ||
          clean.toLowerCase().includes('cake') ||
          clean.toLowerCase().includes('bowl') ||
          clean.toLowerCase().includes('special') ||
          clean.toLowerCase().includes('savories') ||
          clean.toLowerCase().includes('corner') ||
          clean.toLowerCase().includes('fries') ||
          clean.toLowerCase().includes('chicken') ||
          clean.length < 25);

      if (isHeader && !clean.includes('₹') && !clean.match(/\s\d+$/)) {
        currentCategory = clean.replace(/[:\-]/g, '').trim();
        return;
      }

      const priceMatch = clean.match(/(?:₹\s*|\s)(\d{2,4})\s*$/) || clean.match(/(\d{2,4})/);
      if (priceMatch) {
        const itemPrice = parseInt(priceMatch[1], 10);
        let itemName = clean
          .replace(priceMatch[0], '')
          .replace(/^[-\–\—\s\d\.\:\*]+/, '')
          .replace(/[-\–\—\s\:\*]+$/, '')
          .trim();

        if (itemName.length > 2 && itemPrice >= 30 && itemPrice <= 2000) {
          results.push({
            id: 'ai-' + index + '-' + Date.now(),
            name: itemName,
            price: itemPrice,
            categoryName: currentCategory,
          });
        }
      }
    });

    setIsAiParsing(false);
    if (results.length === 0) {
      alert('Could not detect items. Try format: Item Name 180');
    } else {
      setExtractedList(results);
    }
  };

  const handleImportExtractedList = async () => {
    if (extractedList.length === 0) return;
    setIsImporting(true);

    try {
      // Map extracted items to DB items with proper categoryId
      const itemsToCreate = extractedList.map((ext) => {
        const matchedCat = categories.find((c) =>
          c.name.toLowerCase().includes(ext.categoryName.toLowerCase()) ||
          ext.categoryName.toLowerCase().includes(c.name.toLowerCase())
        ) || categories[0];

        return {
          name: ext.name,
          categoryId: matchedCat?.id || categories[0]?.id,
          price: ext.price,
          taxPercent: 5,
        };
      });

      const result = await fetchApi('/menu/items/bulk', {
        method: 'POST',
        body: JSON.stringify({ items: itemsToCreate }),
      });

      // Reload from DB
      await loadData();
      setShowAiModal(false);
      setRawText('');
      setExtractedList([]);
      alert(`🎉 Successfully imported ${result.items?.length || itemsToCreate.length} items into MongoDB!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
    setIsImporting(false);
  };

  const filteredItems = items.filter((it) => {
    if (selectedCat === 'ALL') return true;
    return it.category?.id === selectedCat;
  });

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" /> Outlet Menu & Stock Control
            </h1>
            <span className="px-3 py-1 rounded-full bg-gold-400/20 text-cocoa-900 font-extrabold text-xs border border-gold-300 shadow-sm">
              Total Items: {items.length}
            </span>
          </div>
          <p className="text-sm text-gold-600 font-medium mt-1">
            All items stored in MongoDB. Add via Groq AI or manually.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={loadData}
            className="flex items-center space-x-1 bg-cream-200 hover:bg-cream-300 text-cocoa-800 font-bold px-3 py-2.5 rounded-xl text-xs transition border border-cream-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-cocoa-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>🤖 GROQ AI EXTRACTOR</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={handleRemoveAll}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Remove All</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
            selectedCat === 'ALL'
              ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 shadow-md'
              : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCat === c.id
                ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 shadow-md'
                : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/80 rounded-3xl border border-cream-300/80 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-cocoa-700">Loading menu from MongoDB...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-cream-300/80 p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🍰</div>
          <h2 className="text-xl font-display font-bold text-cocoa-900 mb-2">No Menu Items Yet</h2>
          <p className="text-sm text-cocoa-600 mb-6 max-w-md mx-auto">
            Add your dessert menu using <strong>Groq AI Extractor</strong> (paste text from your menu) or add <strong>manually</strong>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-600 text-cocoa-950 font-black px-6 py-3 rounded-xl text-sm shadow-lg hover:scale-105 transition"
            >
              <Sparkles className="w-5 h-5" /> 🤖 GROQ AI EXTRACTOR
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-sm shadow-lg transition"
            >
              <Plus className="w-5 h-5" /> Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Menu Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/90 backdrop-blur-xl rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
                !item.isAvailable ? 'border-red-300 bg-red-50/20' : 'border-cream-300/80 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cream-200 text-cocoa-700">
                    {item.category?.name || 'Desserts'}
                  </span>
                  <span className="font-display font-extrabold text-lg text-cocoa-900">₹{item.price}</span>
                </div>
                <h3 className="font-display font-bold text-base text-cocoa-900 leading-snug">{item.name}</h3>
              </div>

              <div className="pt-3 mt-3 border-t border-cream-200 flex items-center justify-between gap-2">
                <span className={`text-xs font-black flex items-center gap-1 ${!item.isAvailable ? 'text-red-600' : 'text-emerald-600'}`}>
                  {!item.isAvailable ? (
                    <><AlertCircle className="w-3.5 h-3.5" /> Out of Stock</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> In Stock</>
                  )}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition border border-red-200"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleStock(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-sm ${
                      !item.isAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {!item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GROQ AI MENU EXTRACTOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-cream-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-extrabold text-lg text-cocoa-900">Groq AI Menu Extractor</h3>
              </div>
              <button onClick={() => { setShowAiModal(false); setExtractedList([]); }} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-cocoa-600 font-medium">
                Paste menu text or OCR text from a photo. Items will be saved directly to <strong>MongoDB database</strong>.
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-accent text-cocoa-700 uppercase tracking-wider font-bold">Groq API Key</label>
                  <span className="text-[10px] text-gold-600 font-bold">
                    {groqApiKey ? '⚡ Groq Cloud Llama-3.3 Active' : '✨ Built-in Parser Active'}
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="gsk_... (Leave blank for built-in parser)"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-cream-300 rounded-xl text-xs font-mono text-cocoa-900 bg-cream-50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-1 font-bold">Paste Menu Text</label>
                <textarea
                  rows={5}
                  placeholder={`Example:\nBubble Waffles\nTriple Trouble 180\nFruity Pebble 200\n\nBrownies\nTriple Chocolate Brownie 130`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3 border border-cream-300 rounded-xl text-xs font-mono text-cocoa-900 bg-cream-50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <button
                onClick={handleAiParseText}
                disabled={isAiParsing || !rawText.trim()}
                className="w-full py-3 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 text-gold-400" />
                <span>{isAiParsing ? 'Parsing with Groq AI...' : '⚡ PARSE MENU WITH GROQ AI'}</span>
              </button>

              {/* Extracted Preview */}
              {extractedList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cream-200 space-y-3">
                  <h4 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detected {extractedList.length} Items:
                  </h4>

                  <div className="max-h-56 overflow-y-auto space-y-2 border border-cream-200 p-2 rounded-xl bg-cream-50 text-xs">
                    {extractedList.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-cream-200 shadow-sm">
                        <div>
                          <span className="font-bold text-cocoa-900">{item.name}</span>
                          <span className="ml-2 text-[10px] bg-cream-200 text-cocoa-700 px-2 py-0.5 rounded font-medium">{item.categoryName}</span>
                        </div>
                        <span className="font-black text-gold-600 text-sm">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleImportExtractedList}
                    disabled={isImporting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isImporting ? '⏳ Saving to MongoDB...' : `🎉 IMPORT ALL ${extractedList.length} ITEMS INTO MONGODB`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cream-300">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Add New Menu Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ferrero Rocher Waffle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 font-medium text-cocoa-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-bold rounded-xl shadow hover:shadow-lg transition"
                >
                  ADD MENU ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
