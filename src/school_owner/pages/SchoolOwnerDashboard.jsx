// src/school_owner/pages/SchoolOwnerDashboard.jsx
// Role: SCHOOL_OWNER — read-only financial + enrollment overview

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import API from "../../common/services/api";
import { TrendingUp, Users, IndianRupee, GraduationCap, BarChart3, AlertCircle } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "yellow" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}>
      <Icon size={22} className={`text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

export default function SchoolOwnerDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "School Owner";

  // In a real app, fetch from API. Showing placeholder structure.
  const [stats] = useState({
    totalRevenue:   "₹12,45,000",
    feeCollected:   "₹9,80,000",
    pendingFees:    "₹2,65,000",
    totalStudents:  "842",
    totalTeachers:  "54",
    collectionRate: "78.7%",
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Owner Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {displayName} · Read-only financial view</p>
        </div>

        <div className="p-8">
          {/* Read-only notice */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
            <AlertCircle size={16} />
            <span>You have <strong>read-only access</strong>. Operations are managed by the School Admin.</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard icon={IndianRupee}  label="Total Revenue (Annual)"    value={stats.totalRevenue}   color="green" />
            <StatCard icon={TrendingUp}   label="Fees Collected (This Month)" value={stats.feeCollected}   color="blue" />
            <StatCard icon={AlertCircle}  label="Pending Fees"              value={stats.pendingFees}    color="red" />
            <StatCard icon={Users}        label="Total Students"            value={stats.totalStudents}  color="purple" />
            <StatCard icon={GraduationCap}label="Total Teachers"            value={stats.totalTeachers}  color="yellow" />
            <StatCard icon={BarChart3}    label="Fee Collection Rate"       value={stats.collectionRate} color="indigo" />
          </div>

          {/* Monthly summary table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Month</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Expected</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Collected</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "January 2025", expected: "₹1,20,000", collected: "₹95,000",  pending: "₹25,000" },
                    { month: "February 2025",expected: "₹1,20,000", collected: "₹1,10,000",pending: "₹10,000" },
                    { month: "March 2025",   expected: "₹1,20,000", collected: "₹85,000",  pending: "₹35,000" },
                  ].map((row) => (
                    <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-700">{row.month}</td>
                      <td className="py-3 text-right text-gray-700">{row.expected}</td>
                      <td className="py-3 text-right text-green-600 font-medium">{row.collected}</td>
                      <td className="py-3 text-right text-red-500">{row.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}