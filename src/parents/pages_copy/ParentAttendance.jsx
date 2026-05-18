import { useState, useEffect } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { getDailyAttendance, getLectureAttendance, getMonthlyAttendance } from "../../common/services/attendanceService";
import { getUserData } from "../../common/utils/tokenStorage";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const STATUS_STYLE = {
  PRESENT: { bg: "bg-emerald-500 text-white", dot: "bg-emerald-500", label: "Present" },
  ABSENT:  { bg: "bg-rose-500 text-white",    dot: "bg-rose-500",    label: "Absent"  },
  LEAVE:   { bg: "bg-amber-400 text-gray-900",dot: "bg-amber-400",   label: "Leave"   },
};

export default function ParentAttendance() {
  const now = new Date();
  const [year,         setYear]         = useState(now.getFullYear());
  const [month,        setMonth]        = useState(now.getMonth() + 1);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [dailyMap,     setDailyMap]     = useState({});   // { "YYYY-MM-DD": [lecture records] }
  const [hoveredDay,   setHoveredDay]   = useState(null);
  const [tooltipPos,   setTooltipPos]   = useState({ x: 0, y: 0 });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [studentId,    setStudentId]    = useState(null);

  // Get studentId from stored user data (parent portal stores child's studentId)
  useEffect(() => {
    const userData = getUserData();
    // Parents have a linked studentId stored; adjust key to match your auth response
    const sid = userData?.studentId || userData?.childId || userData?.userId;
    setStudentId(sid);
  }, []);

  useEffect(() => {
    if (!studentId) return;
    fetchMonthlyData();
  }, [studentId, year, month]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMonthlyAttendance(studentId, year, month);
      setMonthlySummary(res.data);
      await fetchDailyDetails();
    } catch (e) {
      setError("Could not load attendance data.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fetch lecture details for every day that has a record
  const fetchDailyDetails = async () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const map = {};
    const promises = Array.from({ length: daysInMonth }, async (_, i) => {
      const d = i + 1;
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      // Only fetch past / today
      if (new Date(dateStr) > new Date()) return;
      try {
        const res = await getLectureAttendance(studentId, dateStr);
        const records = Array.isArray(res.data) ? res.data : [];
        if (records.length > 0) map[d] = records;
      } catch {
        // no record this day — skip
      }
    });
    await Promise.allSettled(promises);
    setDailyMap(map);
  };

  // Derive per-day overall status from lecture records
  const getDayStatus = (day) => {
    const records = dailyMap[day];
    if (!records || records.length === 0) return null;
    if (records.every((r) => r.status === "PRESENT")) return "PRESENT";
    if (records.every((r) => r.status === "ABSENT"))  return "ABSENT";
    if (records.every((r) => r.status === "LEAVE"))   return "LEAVE";
    return "PRESENT"; // mixed → treat as partial present
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=Sun

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <ParentSidebar />

      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">📅 Attendance</h1>
        <p className="text-sm text-slate-500 mb-6">Hover a day to see lecture-wise details</p>

        {/* Month/Year picker */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {[2024,2025,2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary cards */}
        {monthlySummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Lectures", value: monthlySummary.totalLectures, border: "border-slate-400", icon: "📚" },
              { label: "Present",        value: monthlySummary.present,        border: "border-emerald-500", icon: "✅" },
              { label: "Absent",         value: monthlySummary.absent,         border: "border-rose-500",    icon: "❌" },
              { label: "Leave",          value: monthlySummary.leave,          border: "border-amber-400",   icon: "🟡" },
            ].map((card) => (
              <div key={card.label} className={`bg-white rounded-2xl shadow-sm border-l-4 ${card.border} p-4`}>
                <div className="text-xl mb-1">{card.icon}</div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {loading ? "—" : card.value ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          {Object.entries(STATUS_STYLE).map(([s, cfg]) => (
            <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`}/>
              {cfg.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-200"/>No data
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const style = status ? STATUS_STYLE[status] : null;
              const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isFuture = new Date(dateStr) > new Date();

              return (
                <div
                  key={day}
                  onMouseEnter={(e) => {
                    if (dailyMap[day]) {
                      setHoveredDay({ day, records: dailyMap[day] });
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-14 rounded-xl flex items-center justify-center font-semibold text-sm
                    shadow-sm cursor-default transition-transform hover:scale-105
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

        {/* Tooltip */}
        {hoveredDay && (
          <div
            style={{ top: tooltipPos.y - 90, left: tooltipPos.x + 12 }}
            className="fixed bg-white shadow-2xl border border-slate-200 rounded-2xl p-4 z-50 w-52"
          >
            <p className="font-bold text-slate-800 mb-2 text-sm">
              {MONTHS[month-1]} {hoveredDay.day}
            </p>
            <div className="flex flex-col gap-1.5">
              {hoveredDay.records.map((r, i) => {
                const s = STATUS_STYLE[r.status] || STATUS_STYLE.PRESENT;
                return (
                  <div key={i} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${s.bg}`}>
                    Period {r.period ?? i+1}: {r.subject} — {s.label}
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
