'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { Boxes, AlertTriangle, Plus, RefreshCw, Trash2, CheckCircle2, X } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'INGREDIENT' | 'PACKAGING';
  unit: string;
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'INGREDIENT' | 'PACKAGING'>('ALL');

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockNotes, setRestockNotes] = useState<string>('');

  // Add Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'INGREDIENT' | 'PACKAGING'>('INGREDIENT');
  const [newItemUnit, setNewItemUnit] = useState('Kg');
  const [newItemStock, setNewItemStock] = useState(20);
  const [newItemMinAlert, setNewItemMinAlert] = useState(5);
  const [newItemCost, setNewItemCost] = useState(100);

  useEffect(() => {
    loadInventory();

    const socket = getSocket();
    socket.on('inventory_alert', () => loadInventory());

    return () => {
      socket.off('inventory_alert');
    };
  }, []);

  const loadInventory = async () => {
    try {
      const data = await fetchApi('/inventory/items');
      setItems(data.items || []);
      setLowStockAlerts(data.lowStockItems || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const handleRestockSubmit = async () => {
    if (!selectedItem || restockQty <= 0) return;
    try {
      await fetchApi('/inventory/restock', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: selectedItem.id,
          quantity: restockQty,
          notes: restockNotes,
        }),
      });
      alert(`Restocked ${restockQty} ${selectedItem.unit} of ${selectedItem.name}`);
      setShowRestockModal(false);
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddItemSubmit = async () => {
    if (!newItemName) return;
    try {
      await fetchApi('/inventory/items', {
        method: 'POST',
        body: JSON.stringify({
          name: newItemName,
          category: newItemCategory,
          unit: newItemUnit,
          currentStock: newItemStock,
          minStockAlert: newItemMinAlert,
          unitCost: newItemCost,
        }),
      });
      setShowAddModal(false);
      setNewItemName('');
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter === 'ALL') return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-gold-400" /> Inventory & Stock Management
          </h1>
          <p className="text-sm text-gold-600 font-medium mt-1">Track raw dessert ingredients, packaging & low-stock alerts</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 shadow-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-red-700">Low Stock Alert ({lowStockAlerts.length} Items)</h4>
              <p className="text-xs font-semibold text-red-600">
                {lowStockAlerts.map((i) => `Only ${i.currentStock} ${i.unit} ${i.name} remaining`).join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-cream-300 pb-3 text-xs">
        {[
          { id: 'ALL', label: 'All Stock' },
          { id: 'INGREDIENT', label: 'Ingredients (Milk, Base, Cocoa)' },
          { id: 'PACKAGING', label: 'Packaging (Boxes, Cups, Tissues)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              categoryFilter === tab.id
                ? 'bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 shadow-md'
                : 'bg-white text-cocoa-700 hover:bg-cream-200 border border-cream-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stock Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.minStockAlert;
          return (
            <div
              key={item.id}
              className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 border shadow-md space-y-3 flex flex-col justify-between ${
                isLow ? 'border-red-400 bg-red-50/10' : 'border-cream-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cocoa-900">{item.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.category === 'INGREDIENT' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-2">
                  <span className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-cocoa-900'}`}>
                    {item.currentStock}
                  </span>
                  <span className="text-xs font-bold text-cocoa-600">{item.unit}</span>
                </div>

                <div className="text-[11px] text-cocoa-500 mt-1">
                  Min Alert threshold: <span className="font-bold">{item.minStockAlert} {item.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
                <span className="text-cocoa-600 font-semibold">Cost: ₹{item.unitCost}/{item.unit}</span>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRestockModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cocoa-800 hover:bg-gold-500 hover:text-cocoa-950 text-gold-300 font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cream-300/80">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Restock {selectedItem.name}</h3>
              <button onClick={() => setShowRestockModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-cocoa-700">Add Quantity ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700">Restock Notes / Vendor Invoice</label>
                <input
                  type="text"
                  placeholder="Invoice #1024 - Fresh Milk Vendor"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleRestockSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-extrabold text-xs hover:from-cocoa-900 hover:to-black shadow-md transition"
            >
              Confirm Restock
            </button>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cream-300/80">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-cocoa-700">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vanilla Bean Pods"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-cocoa-700">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                  >
                    <option value="INGREDIENT">Ingredient</option>
                    <option value="PACKAGING">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-cocoa-700">Unit</label>
                  <input
                    type="text"
                    placeholder="Litres, Kg, Pieces"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-cocoa-700">Current Stock</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-cocoa-700">Min Alert</label>
                  <input
                    type="number"
                    value={newItemMinAlert}
                    onChange={(e) => setNewItemMinAlert(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-cocoa-700">Cost (₹)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all font-medium text-cocoa-900"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddItemSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-extrabold text-xs hover:from-cocoa-900 hover:to-black shadow-md transition"
            >
              Save New Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
