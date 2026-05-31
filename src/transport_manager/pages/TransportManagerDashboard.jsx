// src/transport_manager/pages/TransportManagerDashboard.jsx
// Role: TRANSPORT_MANAGER

import { useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { Bus, Users, MapPin, AlertTriangle, Navigation, CheckCircle } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}><Icon size={20} className={`text-${color}-600`} /></div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>  
  </div>
);

export default function TransportManagerDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Transport Manager";

  const vehicles = [
    { bus: "KA-01-AB-1234", route: "Route A — Koramangala",  driver: "Ramesh Kumar",  students: 38, status: "Active"    },
    { bus: "KA-01-AB-5678", route: "Route B — Whitefield",   driver: "Suresh Nair",   students: 42, status: "Active"    },
    { bus: "KA-01-AB-9012", route: "Route C — JP Nagar",     driver: "Mahesh Singh",  students: 35, status: "Breakdown" },
    { bus: "KA-01-AB-3456", route: "Route D — Indiranagar",  driver: "Naresh Rao",    students: 40, status: "Active"    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Transport Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={Bus}          label="Total Vehicles"     value="8"    color="blue"   />
            <StatCard icon={CheckCircle}  label="Active Today"       value="7"    color="green"  />
            <StatCard icon={AlertTriangle}label="Breakdowns"         value="1"    color="red"    />
            <StatCard icon={Users}        label="Students on Bus"    value="318"  color="yellow" />
          </div>

          {/* Fleet status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Fleet Status</h2>
              <a href="/transport-manager/vehicles" className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                Manage fleet →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Vehicle No.", "Route", "Driver", "Students", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.bus} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800 text-xs">{v.bus}</td>
                    <td className="py-2.5 text-gray-700">{v.route}</td>
                    <td className="py-2.5 text-gray-600">{v.driver}</td>
                    <td className="py-2.5 text-gray-700 font-medium">{v.students}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        v.status === "Active"    ? "bg-green-100 text-green-700" :
                        v.status === "Breakdown" ? "bg-red-100 text-red-600"    :
                                                   "bg-gray-100 text-gray-500"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Manage Routes",   href: "/transport-manager/routes" },
                { label: "Add Vehicle",     href: "/transport-manager/vehicles" },
                { label: "Assign Driver",   href: "/transport-manager/drivers" },
                { label: "Live Tracking",   href: "/transport-manager/tracking" },
                { label: "Student List",    href: "/transport-manager/students" },
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