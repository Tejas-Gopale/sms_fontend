// src/cashier/pages/CashierDashboard.jsx
// Role: CASHIER — fee collection only (no payroll, no reports)

import { useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { IndianRupee, Receipt, Search, CheckCircle } from "lucide-react";

export default function CashierDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Cashier";

  const [searchQuery, setSearchQuery] = useState("");

  const todayCollections = [
    { id: "TXN201", student: "Aditya Kumar", class: "10-A", amount: "₹12,000", time: "9:12 AM" },
    { id: "TXN202", student: "Priya Sharma", class: "9-B",  amount: "₹8,500",  time: "9:45 AM" },
    { id: "TXN203", student: "Arjun Nair",   class: "11-C", amount: "₹5,000",  time: "10:20 AM"},
    { id: "TXN204", student: "Kavya Rao",    class: "8-A",  amount: "₹7,200",  time: "11:05 AM"},
  ];

  const todayTotal = "₹32,700";
  const receiptCount = todayCollections.length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Fee Collection</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName} · Today's collections</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50"><IndianRupee size={20} className="text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Collected Today</p>
                <p className="text-2xl font-bold text-gray-800">{todayTotal}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50"><Receipt size={20} className="text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Receipts Issued</p>
                <p className="text-2xl font-bold text-gray-800">{receiptCount}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-50"><CheckCircle size={20} className="text-yellow-600" /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Shift Status</p>
                <p className="text-2xl font-bold text-gray-800">Active</p>
              </div>
            </div>
          </div>

          {/* Search student for collection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Collect Fee</h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400"
                />
              </div>
              <a href="/cashier/collect-fees"
                 className="px-5 py-2.5 text-sm bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                Collect →
              </a>
            </div>
          </div>

          {/* Today's collections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Today's Receipts</h2>
              <a href="/cashier/receipts" className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                View all →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Receipt #", "Student", "Class", "Amount", "Time"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayCollections.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-400 text-xs">{t.id}</td>
                    <td className="py-2.5 font-medium text-gray-800">{t.student}</td>
                    <td className="py-2.5 text-gray-500">{t.class}</td>
                    <td className="py-2.5 font-semibold text-green-600">{t.amount}</td>
                    <td className="py-2.5 text-gray-400">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}