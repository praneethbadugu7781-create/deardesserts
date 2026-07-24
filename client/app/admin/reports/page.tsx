'use client';

// Force rebuild: 2026-07-23T22:54:30
import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { FileSpreadsheet, Download, Printer, Calendar, Filter, Receipt } from 'lucide-react';

interface ReportData {
  period: { start: string; end: string };
  summary: {
    totalOrders: number;
    completedOrdersCount: number;
    cancelledOrdersCount: number;
    totalNetRevenue: number;
    totalTaxCollected: number;
    totalDiscountsGiven: number;
    avgOrderValue: number;
  };
  ordersList: {
    orderNumber: string;
    billNumber: string;
    tokenNumber: string;
    date: string;
    customerName: string;
    paymentMethod: string;
    subtotal: number;
    tax: number;
    discount: number;
    netTotal: number;
    status: string;
  }[];
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-cream-300/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cocoa-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-gold-400" /> Business Reports & Tax Ledger
          </h1>
          <p className="text-sm text-gold-600 font-medium mt-1">Generate sales, revenue, GST tax reports and export to CSV or PDF</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 hover:from-cocoa-900 hover:to-black font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-2 bg-white hover:bg-cream-100 text-cocoa-900 border border-cream-300 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter Controls */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-cream-300/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gold-600" />
            <span className="font-bold text-cocoa-700">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-cocoa-700">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-cream-300 bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-medium text-cocoa-900"
            />
          </div>

          <button
            onClick={loadReport}
            className="px-5 py-2.5 bg-gradient-to-r from-cocoa-800 to-cocoa-950 text-gold-300 font-extrabold rounded-xl hover:from-cocoa-900 hover:to-black transition shadow-sm flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Apply
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setStartDate(today);
              setEndDate(today);
              loadReport();
            }}
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 font-extrabold text-cocoa-800 transition"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0];
              const today = new Date().toISOString().split('T')[0];
              setStartDate(d);
              setEndDate(today);
              loadReport();
            }}
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 font-extrabold text-cocoa-800 transition"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              const d = new Date(Date.now() - 30 * 86400 * 1000).toISOString().split('T')[0];
              const today = new Date().toISOString().split('T')[0];
              setStartDate(d);
              setEndDate(today);
              loadReport();
            }}
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 font-extrabold text-cocoa-800 transition"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-cream-300/80 shadow-md">
          <div className="text-xs font-accent font-bold text-cocoa-600 uppercase tracking-wider">Total Net Revenue</div>
          <div className="text-3xl font-display font-black text-cocoa-900 mt-2">₹{report?.summary.totalNetRevenue.toLocaleString() || 0}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-cream-300/80 shadow-md">
          <div className="text-xs font-accent font-bold text-cocoa-600 uppercase tracking-wider">GST Tax Collected</div>
          <div className="text-3xl font-display font-black text-gold-600 mt-2">₹{report?.summary.totalTaxCollected.toLocaleString() || 0}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-cream-300/80 shadow-md">
          <div className="text-xs font-accent font-bold text-cocoa-600 uppercase tracking-wider">Average Order Value</div>
          <div className="text-3xl font-display font-black text-cocoa-900 mt-2">₹{report?.summary.avgOrderValue || 0}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-cream-300/80 shadow-md">
          <div className="text-xs font-accent font-bold text-cocoa-600 uppercase tracking-wider">Total Orders</div>
          <div className="text-3xl font-display font-black text-cocoa-900 mt-2">{report?.summary.totalOrders || 0}</div>
        </div>
      </div>

      {/* Orders Detail Table */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-cream-300/80 shadow-md space-y-4">
        <h3 className="font-display text-lg font-bold text-cocoa-900 flex items-center gap-2 border-b border-cream-200 pb-3">
          <Receipt className="w-5 h-5 text-gold-600" /> Itemized Bill & Transaction Register
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-cream-300/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-300 text-cocoa-900 font-accent uppercase text-[10px] tracking-wider bg-cream-100">
                <th className="py-3 px-4">Bill No</th>
                <th className="py-3 px-4">Token No</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">GST (5%)</th>
                <th className="py-3 px-4 text-right">Net Total</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-cocoa-900 font-medium">
              {report?.ordersList.map((ord, idx) => (
                <tr key={idx} className="hover:bg-cream-50/50 transition">
                  <td className="py-3 px-4 font-bold text-gold-600">{ord.billNumber}</td>
                  <td className="py-3 px-4 font-extrabold">{ord.tokenNumber}</td>
                  <td className="py-3 px-4 text-cocoa-600">{new Date(ord.date).toLocaleString()}</td>
                  <td className="py-3 px-4">{ord.customerName}</td>
                  <td className="py-3 px-4 font-bold">{ord.paymentMethod}</td>
                  <td className="py-3 px-4 text-right">₹{ord.subtotal}</td>
                  <td className="py-3 px-4 text-right text-cocoa-600">₹{ord.tax}</td>
                  <td className="py-3 px-4 text-right font-black text-cocoa-900">₹{ord.netTotal}</td>
                  <td className="py-3 px-4 text-center">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
