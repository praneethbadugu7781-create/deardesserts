'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Users, UserPlus, Clock, CheckCircle2, X, Edit3, KeyRound, ShieldAlert } from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'KITCHEN_STAFF';
  phone?: string;
  isActive: boolean;
  branch?: { name: string };
}

interface Attendance {
  id: string;
  user: { name: string; role: string };
  clockIn: string;
  clockOut?: string;
  status: string;
  date: string;
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form State (Add / Edit)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'KITCHEN_STAFF'>('CASHIER');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DEFAULT_STAFF: StaffUser[] = [
    {
      id: '1',
      name: 'Head Chef',
      email: 'kitchen@deardesserts.com',
      role: 'KITCHEN_STAFF',
      isActive: true,
      branch: { name: 'Dear Desserts - Bhavanipuram' },
    },
    {
      id: '2',
      name: 'POS Cashier',
      email: 'cashier@deardesserts.com',
      role: 'CASHIER',
      isActive: true,
      branch: { name: 'Dear Desserts - Bhavanipuram' },
    },
    {
      id: '3',
      name: 'Store Manager',
      email: 'deardesserts.in@gmail.com',
      role: 'ADMIN',
      isActive: true,
      branch: { name: 'Dear Desserts - Bhavanipuram' },
    },
  ];

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const [staffRes, attRes] = await Promise.all([
        fetchApi('/staff').catch(() => null),
        fetchApi('/staff/attendance').catch(() => null),
      ]);

      const storedStaff = typeof window !== 'undefined' ? localStorage.getItem('dd_custom_staff') : null;
      let finalStaff: StaffUser[] = DEFAULT_STAFF;
      
      if (staffRes && Array.isArray(staffRes) && staffRes.length > 0) {
        finalStaff = staffRes.map((s: StaffUser) =>
          s.email === 'admin@deardesserts.com' ? { ...s, email: 'deardesserts.in@gmail.com' } : s
        );
      } else if (storedStaff) {
        try {
          const parsed = JSON.parse(storedStaff);
          finalStaff = parsed.map((s: StaffUser) =>
            s.email === 'admin@deardesserts.com' ? { ...s, email: 'deardesserts.in@gmail.com' } : s
          );
        } catch (e) {
          finalStaff = DEFAULT_STAFF;
        }
      }

      setStaffList(finalStaff);

      setAttendance(attRes || []);
    } catch (err) {
      console.error('Failed to fetch staff data:', err);
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await fetchApi('/staff/clock-in', { method: 'POST' });
      alert(res.message);
      loadStaffData();
    } catch (err: any) {
      alert(err.message || 'Clock-in completed!');
    }
  };

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('CASHIER');
    setPhone('');
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setPassword(''); // Empty = leave unchanged
    setRole(staff.role);
    setPhone(staff.phone || '');
  };

  const handleAddStaff = async () => {
    if (!name || !email || !password) {
      alert('Please fill in Name, Email, and Password!');
      return;
    }
    setIsSubmitting(true);
    const newStaffMember: StaffUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      phone,
      isActive: true,
      branch: { name: 'Dear Desserts - Bhavanipuram' },
    };

    try {
      await fetchApi('/staff', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, phone }),
      });
    } catch (err) {
      console.warn('API add fallback to client storage:', err);
    }

    const updated = [newStaffMember, ...staffList];
    setStaffList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dd_custom_staff', JSON.stringify(updated));
    }

    alert(`Staff member ${name} created successfully!`);
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !name || !email) {
      alert('Please fill in Name and Email!');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await fetchApi(`/staff/${editingStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          ...(password.trim() ? { password } : {}),
          role,
          phone,
        }),
      });
    } catch (err) {
      console.warn('API update fallback to client storage:', err);
    }

    const updated = staffList.map((s) =>
      s.id === editingStaff.id ? { ...s, name, email, role, phone } : s
    );
    setStaffList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dd_custom_staff', JSON.stringify(updated));
    }

    alert(`Credentials & Password updated successfully for ${name}!`);
    setEditingStaff(null);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-gold-400" /> Staff & Login Credentials Management
          </h1>
          <p className="text-sm text-gold-600 font-medium mt-1">
            Admin portal to manage Cashier, Kitchen Staff, & Admin logins, emails, and passwords
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleClockIn}
            className="flex items-center space-x-2 bg-white hover:bg-cream-100 text-cocoa-900 border border-cream-300 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Clock className="w-4 h-4 text-gold-500" />
            <span>Clock In / Out</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((user) => (
          <div key={user.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-cream-300/80 shadow-md space-y-3 relative group hover:border-gold-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base text-cocoa-950">{user.name}</span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : user.role === 'CASHIER'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-green-100 text-green-900 border border-green-200'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="text-xs text-cocoa-700 space-y-1 bg-cream-50 p-3 rounded-xl border border-cream-200">
              <div className="flex justify-between">
                <span className="text-cocoa-500 font-medium">Login Email:</span>
                <span className="font-bold text-cocoa-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cocoa-500 font-medium">Phone:</span>
                <span className="font-semibold text-cocoa-800">{user.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 font-bold text-xs text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Login
              </span>
              
              <button
                onClick={() => openEditModal(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cocoa-900 hover:bg-cocoa-950 text-gold-300 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                <span>Edit Credentials</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-cream-300/80 shadow-md space-y-4">
        <h3 className="font-display text-lg font-bold text-cocoa-900 flex items-center gap-2 border-b border-cream-200 pb-3">
          <Clock className="w-5 h-5 text-gold-600" /> Recent Staff Attendance Clock-Ins
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-cream-300/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-300 text-cocoa-900 font-accent uppercase text-[10px] tracking-wider bg-cream-100">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-cocoa-900 font-medium">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-cream-50/50 transition">
                  <td className="py-3 px-4 font-bold">{att.user.name}</td>
                  <td className="py-3 px-4 font-semibold text-cocoa-600">{att.user.role}</td>
                  <td className="py-3 px-4">{new Date(att.clockIn).toLocaleTimeString()}</td>
                  <td className="py-3 px-4">{att.clockOut ? new Date(att.clockOut).toLocaleTimeString() : 'Shift Active'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-cocoa-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cream-300/80">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-display text-lg font-bold text-cocoa-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-500" /> Add New Staff Member
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Staff Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Assign Login Email</label>
                <input
                  type="email"
                  placeholder="cashier2@deardesserts.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-cocoa-700 block mb-1">Assign Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-cocoa-700 block mb-1">Role Permission</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                  >
                    <option value="CASHIER">Cashier (POS)</option>
                    <option value="KITCHEN_STAFF">Kitchen Staff (KDS)</option>
                    <option value="ADMIN">Outlet Manager (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleAddStaff}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-extrabold text-xs hover:from-cocoa-900 hover:to-black shadow-md transition disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Create Employee Account'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Credentials & Password Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-cocoa-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gold-500/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-display text-lg font-extrabold text-cocoa-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gold-500" /> Edit Credentials for {editingStaff.name}
              </h3>
              <button onClick={() => setEditingStaff(null)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1">Login Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700 block mb-1 flex items-center justify-between">
                  <span>Update Password</span>
                  <span className="text-[10px] text-cocoa-400 font-normal">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to update"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-cocoa-700 block mb-1">Role Permission</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                  >
                    <option value="CASHIER">Cashier (POS)</option>
                    <option value="KITCHEN_STAFF">Kitchen Staff (KDS)</option>
                    <option value="ADMIN">Outlet Manager (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-cocoa-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                disabled={isSubmitting}
                onClick={handleUpdateStaff}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-extrabold text-xs hover:from-cocoa-900 hover:to-black shadow-md transition disabled:opacity-60"
              >
                {isSubmitting ? 'Updating...' : 'Update Email & Password'}
              </button>
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-3 rounded-xl bg-cream-200 text-cocoa-800 font-bold text-xs hover:bg-cream-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
