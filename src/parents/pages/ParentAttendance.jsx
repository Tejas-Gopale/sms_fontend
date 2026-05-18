import { useState, useEffect } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { getStudentAttendance } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";
import { Loader2, AlertCircle } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const STATUS_STYLE = {
  PRESENT: { bg: "bg-emerald-500 text-white", dot: "bg-emerald-500", label: "Present" },
  ABSENT:  { bg: "bg-rose-500 text-white",    dot: "bg-rose-500",    label: "Absent"  },
  LEAVE:   { bg: "bg-amber-400 text-gray-900",dot: "bg-amber-400",   label: "Leave"   },
};

export default function ParentAttendance() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    getStudentAttendance(studentId, year, month)
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load attendance data."))
      .finally(() => setLoading(false));
  }, [studentId, year, month]);

  // Build day → status map from API data
  const dayStatusMap = {};
  if (data?.attendanceData) {
    data.attendanceData.forEach((a) => {
      const d = new Date(a.date).getDate();
      dayStatusMap[d] = a.status;
    });
  }

  const summary = data?.summary;
  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">📅 Attendance</h1>
        <p className="text-sm text-slate-500 mb-6">Select month and year to see attendance</p>

        {/* Month / Year picker */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {[2024,2025,2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Loading */}
        {(loading || sidLoading) && (
          <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>
        )}

        {/* Error */}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle size={18} />{error || sidError}
          </div>
        )}

        {/* Summary cards */}
        {summary && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Lectures", value: summary.totalLectures, border: "border-slate-400",   icon: "📚" },
              { label: "Present",        value: summary.present,        border: "border-emerald-500", icon: "✅" },
              { label: "Absent",         value: summary.absent,         border: "border-rose-500",    icon: "❌" },
              { label: "Leave",          value: summary.leave,          border: "border-amber-400",   icon: "🟡" },
            ].map((card) => (
              <div key={card.label} className={`bg-white rounded-2xl shadow-sm border-l-4 ${card.border} p-4`}>
                <div className="text-xl mb-1">{card.icon}</div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="flex gap-4 mb-4">
            {Object.entries(STATUS_STYLE).map(([s, cfg]) => (
              <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className={`w-3 h-3 rounded-full ${cfg.dot}`}/>{cfg.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-200"/>No data
            </div>
          </div>
        )}

        {/* Calendar grid */}
        {!loading && !sidLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="grid grid-cols-7 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isFuture = new Date(dateStr) > new Date();
                const status = dayStatusMap[day];
                const style  = status ? STATUS_STYLE[status] : null;
                return (
                  <div
                    key={day}
                    className={`h-14 rounded-xl flex items-center justify-center font-semibold text-sm
                      shadow-sm transition-transform hover:scale-105
                      ${isFuture ? "bg-slate-50 text-slate-300"
                        : style ? style.bg
                        : "bg-slate-100 text-slate-500"}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
