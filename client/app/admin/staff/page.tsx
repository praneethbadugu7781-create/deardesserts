'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Users, UserPlus, Clock, ShieldCheck, CheckCircle2, X } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER' | 'KITCHEN_STAFF'>('CASHIER');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const [staffRes, attRes] = await Promise.all([
        fetchApi('/staff'),
        fetchApi('/staff/attendance'),
      ]);
      setStaffList(staffRes);
      setAttendance(attRes);
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
      alert(err.message);
    }
  };

  const handleAddStaff = async () => {
    if (!name || !email || !password) return;
    try {
      await fetchApi('/staff', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      loadStaffData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cocoa-900 text-cream-100 p-6 rounded-3xl shadow-xl border border-cocoa-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-gold-400" /> Staff Management & Shift Roster
          </h1>
          <p className="text-xs text-cream-300">Manage outlet cashiers, kitchen staff, role access & clock-in attendance</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleClockIn}
            className="flex items-center space-x-2 bg-cocoa-800 hover:bg-cocoa-700 text-gold-300 border border-gold-500/40 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gold-500 hover:bg-gold-400 text-cocoa-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-cocoa-900">{user.name}</span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-900'
                    : user.role === 'CASHIER'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-green-100 text-green-900'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="text-xs text-cocoa-600 space-y-0.5">
              <div>Email: <span className="font-semibold text-cocoa-800">{user.email}</span></div>
              <div>Phone: <span className="font-semibold text-cocoa-800">{user.phone || 'N/A'}</span></div>
            </div>

            <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-[11px]">
              <span className="text-cocoa-500 font-semibold">{user.branch?.name || 'Dear Desserts HQ'}</span>
              <span className="flex items-center gap-1 font-bold text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Account
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-cocoa-900 flex items-center gap-2 border-b border-cream-200 pb-2">
          <Clock className="w-4 h-4 text-gold-600" /> Recent Staff Attendance Clock-Ins
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-cocoa-600 font-bold bg-cream-100">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Clock In</th>
                <th className="py-2.5 px-3">Clock Out</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-cocoa-900">
              {attendance.map((att) => (
                <tr key={att.id}>
                  <td className="py-2.5 px-3 font-bold">{att.user.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-cocoa-600">{att.user.role}</td>
                  <td className="py-2.5 px-3">{new Date(att.clockIn).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3">{att.clockOut ? new Date(att.clockOut).toLocaleTimeString() : 'Shift Active'}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gold-500/40">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-base text-cocoa-900">Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cocoa-500 hover:text-cocoa-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-cocoa-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-cocoa-700">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@deardesserts.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-cocoa-700">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-cocoa-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                  >
                    <option value="CASHIER">Cashier (POS)</option>
                    <option value="KITCHEN_STAFF">Kitchen Staff (KDS)</option>
                    <option value="ADMIN">Outlet Manager (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-cocoa-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleAddStaff}
              className="w-full py-3 rounded-xl bg-gold-500 text-cocoa-950 font-extrabold text-xs hover:bg-gold-400 transition"
            >
              Save Employee Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
