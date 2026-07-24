'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Sparkles,
  History,
  X,
  RefreshCw,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  UtensilsCrossed
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  taxPercent: number;
  imageUrl: string | null;
  description: string | null;
  isAvailable: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CreatedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  createdAt: string;
  token: { tokenNumber: string };
  bill: { billNumber: string; paymentMethod: string };
  items: { menuItem: { name: string }; quantity: number; itemPrice: number; totalPrice: number }[];
}

export default function PosBillingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Guest Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentOrder, setRecentOrder] = useState<CreatedOrder | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Mobile POS view state: 'MENU' or 'CART'
  const [mobileTab, setMobileTab] = useState<'MENU' | 'CART'>('MENU');
  const [showMobileCartDrawer, setShowMobileCartDrawer] = useState(false);

  // Today's orders & drawer history
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
    loadMenuItems();
    loadTodayOrders();

    const socket = getSocket();
    socket.on('order_created', () => {
      loadTodayOrders();
    });

    return () => {
      socket.off('order_created');
    };
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchApi('/menu/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMenuItems = async () => {
    try {
      const data = await fetchApi('/menu/items');
      setMenuItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTodayOrders = async () => {
    try {
      const data = await fetchApi('/orders');
      setTodayOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) => (ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountInput(0);
    setCustomerName('Guest Customer');
    setCustomerPhone('');
  };

  // Math totals
  const subtotal = cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const netTotal = Math.max(0, subtotal + taxAmount - discountInput);

  // Generate & Print Bill
  const handleGenerateBill = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim() || 'Guest Customer',
        customerPhone: customerPhone.trim(),
        paymentMethod,
        discountAmount: discountInput,
        items: cart.map((ci) => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
          notes: ci.notes || '',
        })),
      };

      const created: CreatedOrder = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setRecentOrder(created);
      setShowPrintModal(true);
      clearCart();
      loadTodayOrders();
    } catch (err: any) {
      alert(`Billing Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thermal printing handler
  const handlePrintThermal = () => {
    window.print();
  };

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this bill?')) return;
    try {
      await fetchApi(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Cancelled by cashier at POS' }),
      });
      alert('Bill & Order Cancelled!');
      loadTodayOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category?.id === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cream-100 font-sans text-cocoa-900 p-4 md:p-6 space-y-6">
      {/* POS Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-lg border border-cream-300/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight flex items-center gap-3 text-cocoa-900">
            <ShoppingCart className="w-8 h-8 text-gold-400" /> POS Billing Terminal
          </h1>
          <p className="text-sm text-cocoa-600 mt-1 font-medium">Fast QSR Checkout • GST Bill & Auto Token Generation</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 hover:from-cocoa-900 hover:to-black text-gold-300 px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all hover:scale-105"
          >
            <History className="w-4 h-4" />
            <span>Today&apos;s Bills: <span className="text-gold-400 ml-1">{todayOrders.length}</span></span>
          </button>
        </div>
      </div>
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden grid grid-cols-2 gap-2 bg-cream-200/80 p-1.5 rounded-2xl border border-cream-300">
        <button
          onClick={() => setMobileTab('MENU')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-accent text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'MENU'
              ? 'bg-cocoa-900 text-gold-300 shadow-md font-extrabold'
              : 'text-cocoa-700 hover:bg-cream-300'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> 🍰 Menu Items
        </button>
        <button
          onClick={() => setMobileTab('CART')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-accent text-xs font-bold uppercase tracking-wider transition-all relative ${
            mobileTab === 'CART'
              ? 'bg-cocoa-900 text-gold-300 shadow-md font-extrabold'
              : 'text-cocoa-700 hover:bg-cream-300'
          }`}
        >
          <Receipt className="w-4 h-4" /> 🧾 Bill & Checkout
          {cart.length > 0 && (
            <span className="bg-gold-400 text-cocoa-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Menu Picker Left (7 cols) + Cart & Bill Summary Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">
        {/* LEFT COLUMN: Search, Categories & Menu Grid */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'MENU' ? 'block' : 'hidden lg:block'}`}>
          {/* Search Bar & Category Filters */}
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-md border border-cream-300/80 space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-cocoa-600" />
              <input
                type="text"
                placeholder="Search warm brownie, waffles, shakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-sm font-medium text-cocoa-900 bg-cream-50 transition-all shadow-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === 'ALL'
                    ? 'bg-cocoa-900 text-gold-300 scale-105'
                    : 'bg-cream-200 text-cocoa-600 hover:bg-cream-300 hover:text-cocoa-800'
                }`}
              >
                All Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === cat.id
                      ? 'bg-cocoa-900 text-gold-300 scale-105'
                      : 'bg-cream-200 text-cocoa-600 hover:bg-cream-300 hover:text-cocoa-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className={`bg-white/90 backdrop-blur-md rounded-3xl p-4 border shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between group ${
                  !item.isAvailable
                    ? 'opacity-60 border-red-200/50 bg-red-50/30 cursor-not-allowed'
                    : 'border-cream-300/80 hover:border-gold-500/50'
                }`}
              >
                <div>
                  {item.imageUrl ? (
                    <div className="h-28 w-full rounded-2xl overflow-hidden mb-3 bg-cream-200 relative shadow-inner">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {!item.isAvailable && (
                        <span className="absolute inset-0 bg-black/60 backdrop-blur-sm text-white text-xs font-bold tracking-widest flex items-center justify-center">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  ) : null}

                  <h3 className="font-bold text-sm text-cocoa-900 line-clamp-2 group-hover:text-gold-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-cocoa-600 line-clamp-1 mt-1 font-medium">{item.description}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200/60">
                  <span className="text-base font-extrabold text-cocoa-900">₹{item.price}</span>
                  <button
                    disabled={!item.isAvailable}
                    className="w-8 h-8 rounded-full bg-cocoa-900 text-gold-400 hover:bg-gold-500 hover:text-cocoa-950 flex items-center justify-center transition-all shadow-md font-bold hover:scale-110"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart Builder & Bill Checkout (5 cols) */}
        <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'CART' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-cream-300/80 p-5 md:p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-cream-200/80 pb-4">
              <h2 className="font-display font-bold text-xl text-cocoa-900 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-gold-500" /> Current Order
                <span className="bg-cocoa-100 text-cocoa-800 text-xs py-1 px-2.5 rounded-full ml-2 font-bold shadow-inner">
                  {cart.length}
                </span>
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cocoa-600 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 font-semibold bg-cream-50 shadow-sm transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cocoa-600 uppercase tracking-wider">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 font-semibold bg-cream-50 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-cream-200/80 pr-2 scrollbar-thin scrollbar-thumb-cream-300 scrollbar-track-transparent">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-cocoa-400 space-y-3">
                  <div className="bg-cream-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-8 h-8 text-cocoa-300" />
                  </div>
                  <p className="text-sm font-bold text-cocoa-600">Cart is empty</p>
                  <p className="text-xs font-medium">Select delicious desserts from the menu</p>
                </div>
              ) : (
                cart.map((ci) => (
                  <div key={ci.menuItem.id} className="py-3 flex items-center justify-between text-sm group">
                    <div className="flex-1 pr-3">
                      <div className="font-bold text-cocoa-900 group-hover:text-gold-600 transition-colors">{ci.menuItem.name}</div>
                      <div className="text-xs font-medium text-cocoa-500">₹{ci.menuItem.price} each</div>
                    </div>

                    <div className="flex items-center space-x-2 bg-cream-100 rounded-full p-1 shadow-inner">
                      <button
                        onClick={() => updateQuantity(ci.menuItem.id, -1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-cocoa-100 text-cocoa-900 font-bold flex items-center justify-center shadow-sm transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-cocoa-900 w-5 text-center text-xs">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.menuItem.id, 1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-cocoa-100 text-cocoa-900 font-bold flex items-center justify-center shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-black text-cocoa-900 w-16 text-right pl-2">
                      ₹{ci.menuItem.price * ci.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-4 border-t border-cream-200/80">
              <label className="text-xs font-bold text-cocoa-600 uppercase tracking-wider">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI QR', icon: QrCode },
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-cocoa-900 text-gold-300 border-cocoa-900 shadow-md scale-105'
                          : 'bg-cream-50 border-cream-300 text-cocoa-600 hover:bg-cream-100 hover:border-cocoa-300 hover:text-cocoa-800 shadow-sm'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tax & Discount Calculations */}
            <div className="bg-gradient-to-br from-cream-100 to-cream-200 p-4 rounded-2xl border border-cream-300 shadow-inner space-y-2.5 text-sm font-semibold">
              <div className="flex justify-between text-cocoa-700">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cocoa-700">
                <span>GST Tax (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between items-center text-cocoa-700 pt-2 border-t border-cream-300/50">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discountInput || ''}
                  onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-1 text-right rounded-lg border border-cream-300 focus:ring-2 focus:ring-gold-500/50 font-bold bg-white shadow-sm transition-all"
                />
              </div>

              <div className="flex justify-between items-center text-lg md:text-xl font-black text-cocoa-900 pt-3 border-t border-cream-300 mt-2">
                <span>Net Total</span>
                <span className="text-cocoa-900 bg-gold-300/30 px-3 py-1 rounded-xl">₹{netTotal}</span>
              </div>
            </div>

            {/* Generate Bill Button */}
            <button
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleGenerateBill}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 hover:from-cocoa-900 hover:to-black text-gold-300 font-extrabold text-base md:text-lg tracking-wide shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" /> 
                  <span className="font-accent tracking-widest uppercase text-sm">Checkout & Print</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bill & Token Receipt Print Modal */}
      {showPrintModal && recentOrder && (
        <div className="fixed inset-0 z-50 bg-cocoa-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 border border-gold-500/30 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <h3 className="font-display font-extrabold text-xl text-cocoa-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" /> Order Completed
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-cocoa-400 hover:text-cocoa-900 bg-cream-100 hover:bg-cream-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div id="thermal-receipt" className="bg-white p-5 rounded-xl border border-cream-300 font-mono text-sm space-y-3 shadow-inner relative overflow-hidden">
              {/* Receipt zig-zag edge top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==')] transform rotate-180 -mt-2"></div>
              
              <div className="text-center space-y-1.5 flex flex-col items-center pt-2">
                <img src="/ddlogo.jpeg" alt="Logo" className="w-14 h-14 rounded-full object-contain mx-auto mb-2 border-2 border-cream-300 p-0.5" />
                <img src="/ddtitle.jpeg" alt="Dear Desserts" className="h-8 object-contain mx-auto mb-2" />
                <p className="text-xs text-cocoa-600 font-semibold">QSR Outlet #DD-01 • Park Street Flagship</p>
                <p className="text-[10px] text-cocoa-500">GSTIN: 19AAACD1234F1Z9</p>
                
                <div className="w-full my-3 border-b-2 border-dashed border-cream-300" />
                
                <div className="text-xl font-black text-cocoa-900 bg-gold-100 py-2 px-6 rounded-2xl inline-block border border-gold-300 shadow-sm">
                  TOKEN: {recentOrder.token?.tokenNumber}
                </div>
                
                <div className="flex justify-between w-full text-xs text-cocoa-600 mt-4 font-semibold">
                  <div>BILL NO: {recentOrder.bill?.billNumber}</div>
                  <div>{new Date(recentOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>

              <div className="my-3 border-b-2 border-dashed border-cream-300" />

              <div className="space-y-2 font-medium">
                {recentOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="flex gap-2 text-cocoa-800">
                      <span className="font-bold">{it.quantity}x</span> {it.menuItem.name}
                    </span>
                    <span className="font-bold text-cocoa-900">₹{it.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="my-3 border-b-2 border-dashed border-cream-300" />

              <div className="space-y-1.5 text-right text-xs">
                <div className="flex justify-between text-cocoa-600 font-medium">
                  <span>Subtotal:</span>
                  <span>₹{recentOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-cocoa-600 font-medium">
                  <span>GST (5%):</span>
                  <span>₹{recentOrder.taxAmount}</span>
                </div>
                {recentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{recentOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-cocoa-900 border-t-2 border-cream-300 pt-2 mt-2">
                  <span>TOTAL PAID ({recentOrder.bill?.paymentMethod}):</span>
                  <span>₹{recentOrder.netAmount}</span>
                </div>
              </div>

              <div className="text-center pt-5 pb-2 text-[10px] text-cocoa-500 font-medium space-y-1">
                <p>Thank you for visiting Dear Desserts! 🍰</p>
                <p>Please wait for your Token number on the Display</p>
              </div>
              
              {/* Receipt zig-zag edge bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==')] -mb-2"></div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handlePrintThermal}
                className="flex-1 py-3.5 bg-cocoa-900 hover:bg-gold-600 text-gold-300 hover:text-cocoa-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-6 py-3.5 bg-cream-200 hover:bg-cream-300 text-cocoa-900 font-bold rounded-2xl text-sm transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-cocoa-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-cream-50 w-full max-w-md h-full p-6 shadow-2xl space-y-6 overflow-y-auto transform transition-transform translate-x-0 animate-in slide-in-from-right duration-300 border-l border-cream-300">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4 sticky top-0 bg-cream-50 z-10">
              <h3 className="font-display font-extrabold text-xl text-cocoa-900 flex items-center gap-2">
                <History className="w-6 h-6 text-gold-500" /> Today&apos;s History
              </h3>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-cocoa-500 hover:text-cocoa-900 bg-cream-200 hover:bg-cream-300 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {todayOrders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-cocoa-900 bg-cream-100 px-2 py-0.5 rounded-lg">
                        {ord.token?.tokenNumber}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        ord.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gold-100 text-cocoa-900 border border-gold-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-sm text-cocoa-700 flex justify-between font-medium">
                    <span>Bill: <span className="font-mono text-cocoa-500">{ord.bill?.billNumber}</span></span>
                    <span className="font-black text-cocoa-900">₹{ord.netAmount}</span>
                  </div>

                  <div className="text-xs text-cocoa-500 font-medium">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.bill?.paymentMethod}
                  </div>

                  {ord.status !== 'CANCELLED' && (
                    <div className="flex justify-end space-x-3 pt-3 border-t border-cream-100">
                      <button
                        onClick={() => {
                          setRecentOrder(ord);
                          setShowPrintModal(true);
                        }}
                        className="text-xs font-bold text-cocoa-800 hover:text-gold-600 bg-cream-100 hover:bg-cream-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Re-Print
                      </button>
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {todayOrders.length === 0 && (
                <div className="text-center py-10 text-cocoa-400">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No orders yet today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Bottom Cart Bar for Mobile */}
      {cart.length > 0 && mobileTab === 'MENU' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setMobileTab('CART')}
            className="w-full bg-gradient-to-r from-cocoa-900 via-cocoa-950 to-black text-gold-300 p-4 rounded-3xl shadow-2xl border-2 border-gold-400/40 flex items-center justify-between transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-2xl bg-gold-500/20 text-gold-400">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-gold-400 text-cocoa-950 font-black text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <div className="font-accent text-[10px] font-extrabold uppercase tracking-wider text-gold-400">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Selected
                </div>
                <div className="font-display text-lg font-black text-white">
                  Total: ₹{netTotal}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gold-400 text-cocoa-950 font-accent text-xs font-black uppercase tracking-wider shadow-md">
              View Bill <Receipt className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

