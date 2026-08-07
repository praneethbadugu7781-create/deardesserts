'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import {
  Settings,
  Shield,
  Key,
  Mail,
  Store,
  MapPin,
  Phone,
  Receipt,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [adminEmail, setAdminEmail] = useState('deardesserts.in@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gstin, setGstin] = useState('37AAACD1234F1Z9');
  const [address, setAddress] = useState('Swathi Theatre Road, Opposite Sri Balaji Sweets, Bhavanipuram, Vijayawada, AP 520012');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');

    if (!newPassword) {
      alert('Please enter a new password!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match! Please verify.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long for production security!');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Dispatch 6-Digit OTP to Store Manager email
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail }),
      });

      const otp = prompt(`🔐 SECURITY AUTHORIZATION REQUIRED\n\nA 6-Digit Security OTP verification code has been sent to ${adminEmail}!\n\nPlease enter the 6-Digit OTP code from your email to confirm updating your Admin Password:`);

      if (!otp || !otp.trim()) {
        alert('Admin password update cancelled. Security OTP verification is required.');
        setIsSubmitting(false);
        return;
      }

      // 2. Send request to MongoDB Atlas backend API (must complete successfully)
      const resData = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          otpCode: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      setStatusMessage(`✅ ${resData.message || 'Admin Password updated successfully in MongoDB Atlas! Use your new password on any device to log in.'}`);
      setNewPassword('');
      setConfirmPassword('');
      alert('🎉 Password updated successfully in MongoDB database! You can now log in using your new password on any device.');
    } catch (err: any) {
      console.error('Password change error:', err);
      alert(`❌ Password Update Failed: ${err.message || 'Invalid OTP code or server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-gold-400" /> Admin & Store Security Settings
          </h1>
          <p className="text-sm text-gold-600 font-medium mt-1">
            Manage Store Manager credentials, Admin login password, and outlet location details
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Change Store Manager Admin Password */}
        <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-cream-200 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-cocoa-900 text-gold-300 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-cocoa-900">Change Admin Password</h2>
              <p className="text-xs text-cocoa-500">Update password for store manager (deardesserts.in@gmail.com)</p>
            </div>
          </div>

          <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                Admin Login Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={adminEmail}
                  className="w-full pl-10 pr-4 py-3 bg-cream-100/60 border border-cream-300 rounded-xl text-sm font-medium text-cocoa-800 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                New Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter new admin password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm font-medium text-cocoa-900 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new admin password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm font-medium text-cocoa-900 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-accent uppercase tracking-wider font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Admin Password...' : '🔒 UPDATE ADMIN PASSWORD'}
            </button>
          </form>
        </div>

        {/* Card 2: Outlet Information */}
        <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-cream-200 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-cream-200 text-cocoa-900 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-cocoa-900">Outlet Profile Details</h2>
              <p className="text-xs text-cocoa-500">Dear Desserts Bhavanipuram store identity</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                Store Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm font-medium text-cocoa-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                GSTIN Number
              </label>
              <div className="relative">
                <Receipt className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm font-medium text-cocoa-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-accent text-cocoa-700 uppercase tracking-wider mb-2">
                Store Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cocoa-400 absolute left-3 top-3.5" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm font-medium text-cocoa-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
