import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { ClipboardCheck, BookOpen, FileText, MapPin, Loader2, AlertCircle, User } from "lucide-react";
import { getParentDashboard, getDashboardStats } from "../../common/services/parentService";

export default function ParentDashboard() {
  const [dashData, setDashData] = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getParentDashboard()
      .then(async (res) => {
        const data = res.data;
        setDashData(data);
        const firstStudent = data?.defaultStudent || data?.students?.[0];
        if (firstStudent?.id) {
          const statsRes = await getDashboardStats(firstStudent.id);
          setStats(statsRes.data);
        }
      })
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Attendance %",     value: stats ? `${stats.attendancePercentage ?? 0}%` : "—", icon: ClipboardCheck, color: "border-blue-500",   iconColor: "text-blue-600",   bg: "bg-blue-50"   },
    { title: "Homework Pending", value: stats ? stats.homeworkPending ?? 0 : "—",             icon: BookOpen,        color: "border-green-500",  iconColor: "text-green-600",  bg: "bg-green-50"  },
    { title: "Tests Completed",  value: stats ? stats.testsCompleted  ?? 0 : "—",             icon: FileText,        color: "border-purple-500", iconColor: "text-purple-600", bg: "bg-purple-50" },
    { title: "Bus Status",       value: stats?.busStatus?.status ?? "—",                      icon: MapPin,          color: "border-yellow-500", iconColor: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Parent Dashboard</h1>

        {loading && (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600 mb-6">
            <AlertCircle size={20} />{error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Student Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                <User size={28} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Student Information</h2>
                <div className="flex flex-wrap gap-6 mt-2 text-sm text-slate-600">
                  <span><b>Name:</b> {stats?.studentName || dashData?.defaultStudent?.user?.fullName || "—"}</span>
                  <span><b>Class:</b> {stats?.className || "—"}</span>
                  <span><b>Roll Number:</b> {stats?.rollNumber ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${card.color}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">{card.title}</p>
                        <h2 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h2>
                      </div>
                      <div className={`p-2 rounded-xl ${card.bg}`}><Icon size={24} className={card.iconColor} /></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Latest Teacher Remarks */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Latest Teacher Remarks</h2>
              {stats?.latestRemarks?.length > 0 ? (
                <ul className="space-y-3">
                  {stats.latestRemarks.map((r) => (
                    <li key={r.id} className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                      <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.type === "positive" ? "bg-emerald-500" : r.type === "negative" ? "bg-rose-500" : "bg-amber-400"}`} />
                      <div>
                        <p className="text-slate-700">{r.remark}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.teacherName} · {r.subject} · {r.date}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">No remarks yet.</p>
              )}
            </div>

            {/* Bus Tracking Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-3 text-slate-800">Bus Tracking</h2>
              {stats?.busStatus ? (
                <div className="flex flex-wrap gap-6 text-sm text-slate-700">
                  <span>🚌 <b>Bus:</b> {stats.busStatus.busNumber}</span>
                  <span>📍 <b>Distance:</b> {stats.busStatus.distanceAway} away</span>
                  <span>⏱ <b>ETA:</b> {stats.busStatus.estimatedArrival}</span>
                  <span>🔵 <b>Status:</b> {stats.busStatus.status}</span>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">{stats?.busStatus?.message || "Bus tracking info unavailable."}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
