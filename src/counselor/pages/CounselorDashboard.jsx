// src/counselor/pages/CounselorDashboard.jsx
// Role: COUNSELOR

import { useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { Users, MessageSquare, ClipboardList, AlertTriangle, HeartPulse, Calendar } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}>
      <Icon size={20} className={`text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

export default function CounselorDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Counselor";

  const recentSessions = [
    { student: "Ananya Verma",  class: "10-B", date: "24 May", issue: "Academic stress",   status: "Ongoing" },
    { student: "Rohan Das",     class: "9-A",  date: "23 May", issue: "Peer conflict",      status: "Resolved" },
    { student: "Sana Sheikh",   class: "11-C", date: "22 May", issue: "Anxiety",            status: "Follow-up" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Counselor Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={Users}        label="Students Assigned"   value="284"   color="blue" />
            <StatCard icon={MessageSquare}label="Sessions This Month" value="18"    color="green" />
            <StatCard icon={AlertTriangle}label="High-Risk Students"  value="5"     color="red" />
            <StatCard icon={ClipboardList}label="Pending Follow-ups"  value="8"     color="yellow" />
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Recent Counseling Sessions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student", "Class", "Date", "Issue", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{s.student}</td>
                    <td className="py-2.5 text-gray-600">{s.class}</td>
                    <td className="py-2.5 text-gray-600">{s.date}</td>
                    <td className="py-2.5 text-gray-600">{s.issue}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        s.status === "Resolved"   ? "bg-green-100 text-green-700" :
                        s.status === "Ongoing"    ? "bg-blue-100 text-blue-700"   :
                                                    "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upcoming sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Today's Schedule</h2>
            <div className="space-y-2">
              {[
                { time: "10:00 AM", student: "Meera Joshi",   class: "8-A", type: "Initial Session" },
                { time: "11:30 AM", student: "Arjun Nair",    class: "12-B",type: "Follow-up" },
                { time: "02:00 PM", student: "Kavya Rao",     class: "9-C", type: "Group Session" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={14} className="text-yellow-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 w-20">{s.time}</span>
                  <span className="text-sm text-gray-800 font-medium">{s.student}</span>
                  <span className="text-xs text-gray-500">{s.class}</span>
                  <span className="ml-auto text-xs text-blue-600 font-medium">{s.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}