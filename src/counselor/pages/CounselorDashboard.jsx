// src/counselor/pages/CounselorDashboard.jsx
// Role: COUNSELOR

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { counselingService } from "../../common/services/counselingService";
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
  const schoolId     = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (!schoolId) return;
    counselingService.getStats(schoolId).then((res) => setStats(res.data)).catch(() => {});
    counselingService.getUpcomingSessions(schoolId)
      .then((res) => setUpcoming(Array.isArray(res.data) ? res.data.slice(0, 5) : []))
      .catch(() => {});
  }, [schoolId]);

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
            <StatCard icon={ClipboardList}label="Pending Referrals"   value={stats?.pendingReferrals ?? "-"}     color="yellow" />
            <StatCard icon={MessageSquare}label="Sessions This Month" value={stats?.sessionsThisMonth ?? "-"}    color="green" />
            <StatCard icon={Calendar}     label="Upcoming Sessions"   value={stats?.upcomingSessions ?? "-"}     color="blue" />
            <StatCard icon={AlertTriangle}label="Critical Referrals"  value={stats?.criticalReferralsOpen ?? "-"}color="red" />
          </div>

          {/* Upcoming sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-800">Upcoming Sessions</h2>
              <a href="/counselor/sessions" className="text-xs text-yellow-600 font-medium">View all →</a>
            </div>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No upcoming sessions scheduled</p>
              ) : (
                upcoming.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={14} className="text-yellow-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 w-40">
                      {s.sessionDate ? new Date(s.sessionDate).toLocaleString() : "-"}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{s.studentName}</span>
                    <span className="ml-auto text-xs text-blue-600 font-medium">{s.reasonForSession || "-"}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/counselor/referrals" className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors">
              View Referrals
            </a>
            <a href="/counselor/sessions" className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Session Records
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}