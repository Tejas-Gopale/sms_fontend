// src/accountant/pages/AccountantDashboard.jsx
// Role: ACCOUNTANT — full finance management

import { useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { IndianRupee, TrendingUp, TrendingDown, Receipt, Users, AlertCircle, FileText } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color = "green" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-${color}-50`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default function AccountantDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Accountant";

  const recentTransactions = [
    { id: "TXN001", student: "Aditya Kumar",  class: "10-A", amount: "₹12,000", type: "Fee Payment",     date: "24 May", status: "Paid"    },
    { id: "TXN002", student: "Priya Sharma",  class: "9-B",  amount: "₹8,500",  type: "Quarterly Fee",   date: "24 May", status: "Paid"    },
    { id: "TXN003", student: "Raj Verma",     class: "11-C", amount: "₹15,000", type: "Annual Fee",      date: "23 May", status: "Partial" },
    { id: "TXN004", student: "Sneha Patel",   class: "8-A",  amount: "₹7,200",  type: "Fee Payment",     date: "23 May", status: "Pending" },
    { id: "TXN005", student: "Mohit Singh",   class: "12-B", amount: "₹10,000", type: "Sports Fee",      date: "22 May", status: "Paid"    },
  ];

  const pendingFees = [
    { student: "Rahul Shah",   class: "10-B", amount: "₹12,000", overdue: "15 days" },
    { student: "Anjali Roy",   class: "9-A",  amount: "₹8,500",  overdue: "8 days"  },
    { student: "Vikram Jain",  class: "11-C", amount: "₹4,000",  overdue: "3 days"  },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Finance Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName} · Full financial access</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard icon={IndianRupee}  label="Total Collected (May)"   value="₹9,45,000" sub="Target: ₹12,00,000"       color="green"  />
            <StatCard icon={TrendingUp}   label="Revenue (Annual)"        value="₹1.2 Cr"   sub="+8% vs last year"         color="blue"   />
            <StatCard icon={TrendingDown} label="Expenses (May)"          value="₹2,80,000" sub="Salaries + operations"    color="red"    />
            <StatCard icon={AlertCircle}  label="Pending Fees"            value="₹2,65,000" sub="From 34 students"         color="yellow" />
            <StatCard icon={Receipt}      label="Receipts Generated"      value="218"        sub="This month"               color="purple" />
            <StatCard icon={Users}        label="Defaulters (>30 days)"   value="12"         sub="Follow-up required"       color="red"    />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
                <a href="/accountant/fees" className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">View all →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["ID", "Student", "Class", "Amount", "Type", "Date", "Status"].map((h) => (
                        <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 text-gray-400 text-xs">{t.id}</td>
                        <td className="py-2.5 font-medium text-gray-800">{t.student}</td>
                        <td className="py-2.5 text-gray-500">{t.class}</td>
                        <td className="py-2.5 text-gray-800 font-medium">{t.amount}</td>
                        <td className="py-2.5 text-gray-600">{t.type}</td>
                        <td className="py-2.5 text-gray-500">{t.date}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            t.status === "Paid"    ? "bg-green-100 text-green-700"  :
                            t.status === "Partial" ? "bg-yellow-100 text-yellow-700":
                                                     "bg-red-100 text-red-600"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending fees panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" /> Overdue Fees
              </h2>
              <div className="space-y-3">
                {pendingFees.map((p, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">{p.student}</p>
                    <p className="text-xs text-gray-500">{p.class}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-bold text-red-600">{p.amount}</span>
                      <span className="text-xs text-red-400">Overdue: {p.overdue}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                Send Reminders
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Collect Fee",       href: "/accountant/fees" },
                { label: "Generate Report",   href: "/accountant/reports" },
                { label: "Manage Payroll",    href: "/accountant/payroll" },
                { label: "View Expenses",     href: "/accountant/expenses" },
                { label: "Revenue Analytics", href: "/accountant/revenue" },
              ].map((a) => (
                <a key={a.label} href={a.href}
                   className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}