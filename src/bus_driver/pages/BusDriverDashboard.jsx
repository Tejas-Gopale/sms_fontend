// src/bus_driver/pages/BusDriverDashboard.jsx
// Roles: BUS_DRIVER, BUS_CONDUCTOR

import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { MapPin, Users, Clock, CheckCircle } from "lucide-react";

export default function BusDriverDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Driver";
  const role        = (userData?.roles || [])[0];
  const isDriver    = role === "BUS_DRIVER";

  const students = [
    { name: "Ananya Verma",  stop: "MG Road",      boarded: true  },
    { name: "Rohan Das",     stop: "KR Puram",     boarded: true  },
    { name: "Sana Sheikh",   stop: "Whitefield",   boarded: false },
    { name: "Arjun Kumar",   stop: "Marathahalli", boarded: true  },
    { name: "Meera Joshi",   stop: "Varthur",      boarded: false },
  ];

  const boarded    = students.filter((s) => s.boarded).length;
  const notBoarded = students.filter((s) => !s.boarded).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">
            {isDriver ? "Driver Dashboard" : "Conductor Dashboard"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName} · Route B — Whitefield</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { icon: Users,        label: "Total Students",  value: "42",        color: "blue"  },
              { icon: CheckCircle,  label: "Boarded",         value: boarded,     color: "green" },
              { icon: Clock,        label: "Not Boarded",     value: notBoarded,  color: "red"   },
              { icon: MapPin,       label: "Next Stop",       value: "MG Road",   color: "yellow"},
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${c.color}-50`}><c.icon size={18} className={`text-${c.color}-600`} /></div>
                <div>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Today's route progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Today's Route Progress</h2>
            <div className="space-y-2">
              {["School Pickup", "Koramangala", "Domlur", "MG Road", "KR Puram", "Whitefield ✓ (Last Stop)"].map((stop, i, arr) => (
                <div key={stop} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    i < arr.length - 1 ? "bg-green-400" : "bg-yellow-400"
                  }`} />
                  <span className={`text-sm ${i === arr.length - 1 ? "font-semibold text-yellow-600" : "text-gray-700"}`}>{stop}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student boarding list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Student Boarding Status</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student", "Stop", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{s.name}</td>
                    <td className="py-2.5 text-gray-600">{s.stop}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        s.boarded ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}>
                        {s.boarded ? "Boarded" : "Absent"}
                      </span>
                    </td>
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