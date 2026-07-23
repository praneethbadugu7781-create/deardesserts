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
    <div className="space-y-6">
      {/* POS Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cocoa-900 text-cream-100 p-4 rounded-2xl shadow-lg border border-cocoa-700">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" /> POS Billing Terminal
          </h1>
          <p className="text-xs text-cream-300">Fast QSR Checkout • GST Bill & Auto Token Generation</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="flex items-center space-x-2 bg-cocoa-800 hover:bg-cocoa-700 text-gold-300 border border-gold-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <History className="w-4 h-4" />
            <span>Today's Bills ({todayOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Menu Picker Left (7 cols) + Cart & Bill Summary Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Search, Categories & Menu Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar & Category Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-cream-300 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-cocoa-600" />
              <input
                type="text"
                placeholder="Search warm brownie, waffles, shakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm font-medium text-cocoa-900 bg-cream-100/50"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-cocoa-800 text-gold-300 shadow-md'
                    : 'bg-cream-200 text-cocoa-800 hover:bg-cream-300'
                }`}
              >
                All Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-cocoa-800 text-gold-300 shadow-md'
                      : 'bg-cream-200 text-cocoa-800 hover:bg-cream-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className={`bg-white rounded-2xl p-3 border shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between group ${
                  !item.isAvailable
                    ? 'opacity-50 border-red-200 bg-red-50/20 cursor-not-allowed'
                    : 'border-cream-300 hover:border-gold-500'
                }`}
              >
                <div>
                  {item.imageUrl ? (
                    <div className="h-24 w-full rounded-xl overflow-hidden mb-2 bg-cream-200 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {!item.isAvailable && (
                        <span className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  ) : null}

                  <h3 className="font-bold text-xs text-cocoa-900 line-clamp-1 group-hover:text-gold-600 transition">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-cocoa-600 line-clamp-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-200">
                  <span className="text-sm font-extrabold text-cocoa-900">₹{item.price}</span>
                  <button
                    disabled={!item.isAvailable}
                    className="w-7 h-7 rounded-lg bg-cocoa-900 text-gold-400 hover:bg-gold-500 hover:text-cocoa-900 flex items-center justify-center transition shadow-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart Builder & Bill Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-4 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h2 className="font-extrabold text-base text-cocoa-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-caramel-500" /> Current Order ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-cocoa-600">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 focus:ring-1 focus:ring-gold-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cocoa-600">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 focus:ring-1 focus:ring-gold-500 font-medium"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-cream-200 pr-1">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-cocoa-500 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-cream-400" />
                  <p className="text-xs font-semibold">Cart is empty</p>
                  <p className="text-[10px]">Select dessert items from the menu left</p>
                </div>
              ) : (
                cart.map((ci) => (
                  <div key={ci.menuItem.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-cocoa-900">{ci.menuItem.name}</div>
                      <div className="text-[10px] text-cocoa-600">₹{ci.menuItem.price} each</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(ci.menuItem.id, -1)}
                        className="w-6 h-6 rounded bg-cream-200 hover:bg-cream-300 text-cocoa-900 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-cocoa-900 w-4 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.menuItem.id, 1)}
                        className="w-6 h-6 rounded bg-cream-200 hover:bg-cream-300 text-cocoa-900 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="font-extrabold text-cocoa-900 w-12 text-right">
                        ₹{ci.menuItem.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-cream-200">
              <label className="text-[10px] font-bold text-cocoa-600">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? 'bg-cocoa-800 text-gold-300 border-gold-500 shadow-sm'
                          : 'bg-cream-100 border-cream-300 text-cocoa-700 hover:bg-cream-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tax & Discount Calculations */}
            <div className="bg-cream-100 p-3 rounded-xl border border-cream-300 space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-cocoa-700">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cocoa-700">
                <span>GST Tax (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between items-center text-cocoa-700 pt-1 border-t border-cream-200">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discountInput || ''}
                  onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 px-1.5 py-0.5 text-right rounded border border-cream-300 focus:ring-1 focus:ring-gold-500 font-bold"
                />
              </div>

              <div className="flex justify-between text-base font-extrabold text-cocoa-900 pt-2 border-t border-cream-300">
                <span>Net Total</span>
                <span className="text-gold-600">₹{netTotal}</span>
              </div>
            </div>

            {/* Generate Bill Button */}
            <button
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleGenerateBill}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cocoa-900 to-cocoa-800 hover:from-gold-600 hover:to-gold-500 text-gold-300 hover:text-cocoa-950 font-extrabold text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Generate & Print Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bill & Token Receipt Print Modal */}
      {showPrintModal && recentOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gold-500/40">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Bill Generated Successfully!
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div id="thermal-receipt" className="bg-cream-50 p-4 rounded-2xl border border-cream-300 font-mono text-xs space-y-2">
              <div className="text-center space-y-1 flex flex-col items-center">
                <img src="/ddlogo.jpeg" alt="Logo" className="w-12 h-12 rounded-full object-contain mx-auto mb-1 border border-amber-800/20" />
                <img src="/ddtitle.jpeg" alt="Dear Desserts" className="h-7 object-contain mx-auto" />
                <p className="text-[10px] text-cocoa-600 font-semibold">QSR Outlet #DD-01 • Park Street Flagship</p>
                <p className="text-[10px] text-cocoa-600">GSTIN: 19AAACD1234F1Z9</p>
                <div className="w-full my-2 border-b border-dashed border-cocoa-400" />
                <div className="text-lg font-black text-cocoa-900 bg-gold-300/40 py-1 px-4 rounded-full inline-block">
                  TOKEN: {recentOrder.token?.tokenNumber}
                </div>
                <div className="text-[10px] text-cocoa-700">BILL NO: {recentOrder.bill?.billNumber}</div>
                <div className="text-[10px] text-cocoa-700">DATE: {new Date(recentOrder.createdAt).toLocaleString()}</div>
              </div>

              <div className="my-2 border-b border-dashed border-cocoa-400" />

              <div className="space-y-1">
                {recentOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.menuItem.name}
                    </span>
                    <span>₹{it.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="my-2 border-b border-dashed border-cocoa-400" />

              <div className="space-y-0.5 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{recentOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>₹{recentOrder.taxAmount}</span>
                </div>
                {recentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₹{recentOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-cocoa-900 border-t border-cocoa-300 pt-1">
                  <span>TOTAL PAID ({recentOrder.bill?.paymentMethod}):</span>
                  <span>₹{recentOrder.netAmount}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-cocoa-600">
                <p>Thank you for visiting Dear Desserts! 🍰</p>
                <p>Please wait for your Token number on the Display</p>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handlePrintThermal}
                className="flex-1 py-3 bg-cocoa-900 hover:bg-gold-600 text-gold-300 hover:text-cocoa-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print Thermal Receipt
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-3 bg-cream-200 hover:bg-cream-300 text-cocoa-900 font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900 flex items-center gap-2">
                <History className="w-5 h-5 text-cocoa-700" /> Today's Bill History
              </h3>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {todayOrders.map((ord) => (
                <div key={ord.id} className="bg-cream-100 p-3.5 rounded-2xl border border-cream-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-cocoa-900">{ord.token?.tokenNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-xs text-cocoa-700 flex justify-between">
                    <span>Bill: {ord.bill?.billNumber}</span>
                    <span className="font-bold">₹{ord.netAmount}</span>
                  </div>

                  <div className="text-[10px] text-cocoa-600">{new Date(ord.createdAt).toLocaleTimeString()}</div>

                  {ord.status !== 'CANCELLED' && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-cream-200">
                      <button
                        onClick={() => {
                          setRecentOrder(ord);
                          setShowPrintModal(true);
                        }}
                        className="text-[10px] font-bold text-cocoa-800 hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Re-Print
                      </button>
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" /> Cancel Bill
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
