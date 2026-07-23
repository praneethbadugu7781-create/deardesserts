'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { UtensilsCrossed, Plus, Sparkles, Tag, Check, X, Pencil, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent: number;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isCombo: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Offer {
  id: string;
  title: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(180);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCombo, setIsCombo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsRes, itemsRes, offersRes] = await Promise.all([
        fetchApi('/menu/categories'),
        fetchApi('/menu/items'),
        fetchApi('/menu/offers'),
      ]);
      setCategories(catsRes);
      setItems(itemsRes);
      setOffers(offersRes);
      if (catsRes.length > 0) setCategoryId(catsRes[0].id);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  const handleToggleStock = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/menu/items/${itemId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isAvailable: !currentStatus } : it)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddItem = async () => {
    if (!name || !categoryId) return;
    try {
      await fetchApi('/menu/items', {
        method: 'POST',
        body: JSON.stringify({
          name,
          categoryId,
          price,
          description,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
          isCombo,
          preparationMinutes: 5,
        }),
      });
      setShowAddModal(false);
      setName('');
      setDescription('');
      setImageUrl('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter((it) => {
    if (selectedCat === 'ALL') return true;
    return it.category?.id === selectedCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cocoa-900 text-cream-100 p-6 rounded-3xl shadow-xl border border-cocoa-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-gold-400" /> Menu & Offers Management
          </h1>
          <p className="text-xs text-cream-300">Add/edit dessert menu items, update prices, mark stock availability & active offers</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gold-500 hover:bg-gold-400 text-cocoa-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Promotional Offers Banner */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 space-y-2">
        <h3 className="font-extrabold text-xs text-cocoa-900 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-caramel-500" /> Active Promotional Offers & Combo Discounts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {offers.map((off) => (
            <div key={off.id} className="bg-white p-3 rounded-xl border border-cream-300 flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-gold-600 bg-gold-100 px-2 py-0.5 rounded">
                  {off.code}
                </span>
                <div className="font-bold text-xs text-cocoa-900 mt-1">{off.title}</div>
                <div className="text-[10px] text-cocoa-600">{off.description}</div>
              </div>
              <div className="text-right">
                <span className="font-black text-sm text-cocoa-900">
                  {off.discountType === 'PERCENTAGE' ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            selectedCat === 'ALL'
              ? 'bg-cocoa-800 text-gold-300 shadow-md'
              : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              selectedCat === c.id
                ? 'bg-cocoa-800 text-gold-300 shadow-md'
                : 'bg-white text-cocoa-800 hover:bg-cream-200 border border-cream-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 border border-cream-300 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              {item.imageUrl && (
                <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-cream-200 relative">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  {item.isCombo && (
                    <span className="absolute top-2 left-2 bg-gold-500 text-cocoa-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> COMBO OFFER
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold text-sm text-cocoa-900">{item.name}</h4>
                <span className="font-black text-sm text-gold-600">₹{item.price}</span>
              </div>
              <p className="text-xs text-cocoa-600 mt-1 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
              <span className={`font-bold ${item.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {item.isAvailable ? 'In Stock' : 'Out of Stock'}
              </span>

              <button
                onClick={() => handleToggleStock(item.id, item.isAvailable)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition ${
                  item.isAvailable
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {item.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gold-500/40">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Add New Dessert Menu Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-cocoa-700">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Belgian Truffle Waffle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-cocoa-700">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-cocoa-700">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-cocoa-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Freshly baked dark chocolate waffle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="w-full py-3 rounded-xl bg-gold-500 text-cocoa-950 font-extrabold text-xs hover:bg-gold-400 transition"
            >
              Create Menu Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
