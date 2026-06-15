import { useState, useEffect } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { getStudentAttendance } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";
import { Loader2, AlertCircle, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ✅ FIX 1: lowercase keys — backend "present"/"absent"/"leave" se match hoga
const STATUS_STYLE = {
  present:  { bg: "bg-emerald-500 text-white",    dot: "bg-emerald-500", label: "Present" },
  absent:   { bg: "bg-rose-500 text-white",       dot: "bg-rose-500",    label: "Absent"  },
  leave:    { bg: "bg-amber-400 text-gray-900",   dot: "bg-amber-400",   label: "Leave"   },
  "no-data":{ bg: "bg-slate-100 text-slate-400",  dot: "bg-slate-300",   label: "No Data" },
};

// ── Lecture Detail Modal ────────────────────────────────────────────────────
function LectureModal({ day, month, year, dayData, onClose }) {
  if (!dayData) return null;

  const dateLabel = `${String(day).padStart(2,"0")} ${MONTHS[month - 1]} ${year}`;
  const lectures  = dayData.lectures || [];
  const status    = dayData.status || "no-data";
  const style     = STATUS_STYLE[status] || STATUS_STYLE["no-data"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-0.5">
              Attendance Detail
            </p>
            <h2 className="text-lg font-bold text-slate-800">{dateLabel}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.bg}`}>
              {style.label}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lecture list */}
        <div className="px-5 py-4 max-h-80 overflow-y-auto">
          {lectures.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No lecture data for this day</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {lectures.map((lec, idx) => {
                const lecStyle = STATUS_STYLE[lec.status] || STATUS_STYLE["no-data"];
                return (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-6 text-center">
                        P{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {lec.subjectName || "—"}
                        </p>
                        {lec.teacherName && (
                          <p className="text-xs text-slate-400">{lec.teacherName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lecStyle.bg}`}>
                      {lecStyle.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
          Tap outside to close
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ParentAttendance() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const now = new Date();

  const [year,       setYear]       = useState(now.getFullYear());
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // for modal

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    setSelectedDay(null);
    getStudentAttendance(studentId, year, month)
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load attendance data."))
      .finally(() => setLoading(false));
  }, [studentId, year, month]);

  // ✅ FIX 2: use a.day (not new Date(a.date).getDate()) — backend sends { day, status, lectures }
  const dayMap = {}; // day number → { status, lectures }
  if (data?.attendanceData) {
    data.attendanceData.forEach((a) => {
      dayMap[a.day] = { status: a.status, lectures: a.lectures };
    });
  }

  const summary      = data?.summary;
  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  // Month navigation helpers
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const selectedDayData = selectedDay ? dayMap[selectedDay] : null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <ParentSidebar />

      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">📅 Attendance</h1>
        <p className="text-sm text-slate-500 mb-6">
          Tap any date to see lecture-wise details
        </p>

        {/* Month Navigator */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>

          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Loading */}
        {(loading || sidLoading) && (
          <div className="flex justify-center mt-10">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
          </div>
        )}

        {/* Error */}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle size={18} />
            {error || sidError}
          </div>
        )}

        {/* Summary cards */}
        {summary && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Lectures", value: summary.totalLectures,       border: "border-slate-400",   icon: "📚" },
              { label: "Present",        value: summary.present,              border: "border-emerald-500", icon: "✅" },
              { label: "Absent",         value: summary.absent,               border: "border-rose-500",    icon: "❌" },
              { label: "Leave",          value: summary.leave,                border: "border-amber-400",   icon: "🟡" },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${card.border} p-4`}
              >
                <div className="text-xl mb-1">{card.icon}</div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {card.value ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Attendance % bar */}
        {summary?.attendancePercentage != null && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span>Attendance</span>
              <span className={summary.attendancePercentage >= 75 ? "text-emerald-600" : "text-rose-600"}>
                {summary.attendancePercentage}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  summary.attendancePercentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(summary.attendancePercentage, 100)}%` }}
              />
            </div>
            {summary.attendancePercentage < 75 && (
              <p className="text-xs text-rose-500 mt-1.5">
                ⚠️ Below 75% — attendance is low
              </p>
            )}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(STATUS_STYLE)
              .filter(([s]) => s !== "no-data")
              .map(([s, cfg]) => (
                <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ))}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-200" />No data
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 ml-auto italic">
              Tap a date for details
            </div>
          </div>
        )}

        {/* Calendar grid */}
        {!loading && !sidLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="grid grid-cols-7 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty cells for first weekday offset */}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day     = i + 1;
                const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isFuture = new Date(dateStr) > now;
                const dayData  = dayMap[day];
                const status   = dayData?.status;
                // ✅ FIX 1 in effect: status is lowercase "present"/"absent"/"leave"/"no-data"
                const style    = status && STATUS_STYLE[status] ? STATUS_STYLE[status] : null;
                const hasData  = !!dayData && (dayData.lectures?.length > 0);

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && hasData && setSelectedDay(day)}
                    className={`h-14 rounded-xl flex flex-col items-center justify-center font-semibold text-sm
                      shadow-sm transition-all duration-150
                      ${isFuture
                        ? "bg-slate-50 text-slate-300 cursor-default"
                        : style
                          ? `${style.bg} ${hasData ? "hover:scale-105 hover:shadow-md cursor-pointer" : "cursor-default"}`
                          : "bg-slate-100 text-slate-500 cursor-default"
                      }`}
                  >
                    {day}
                    {hasData && !isFuture && (
                      <span className="w-1 h-1 rounded-full bg-white/70 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lecture Detail Modal */}
      {selectedDay && (
        <LectureModal
          day={selectedDay}
          month={month}
          year={year}
          dayData={selectedDayData}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";
// import ParentSidebar from "../components/ParentSidebar";
// import { getStudentAttendance } from "../../common/services/parentService";
// import useParentStudent from "../../common/hooks/useParentStudent";
// import { Loader2, AlertCircle } from "lucide-react";

// const MONTHS = ["January","February","March","April","May","June",
//                 "July","August","September","October","November","December"];

// const STATUS_STYLE = {
//   PRESENT: { bg: "bg-emerald-500 text-white", dot: "bg-emerald-500", label: "Present" },
//   ABSENT:  { bg: "bg-rose-500 text-white",    dot: "bg-rose-500",    label: "Absent"  },
//   LEAVE:   { bg: "bg-amber-400 text-gray-900",dot: "bg-amber-400",   label: "Leave"   },
// };

// export default function ParentAttendance() {
//   const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
//   const now = new Date();
//   const [year,    setYear]    = useState(now.getFullYear());
//   const [month,   setMonth]   = useState(now.getMonth() + 1);
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState(null);

//   useEffect(() => {
//     if (!studentId) return;
//     setLoading(true);
//     setError(null);
//     getStudentAttendance(studentId, year, month)
//       .then((res) => setData(res.data))
//       .catch(() => setError("Could not load attendance data."))
//       .finally(() => setLoading(false));
//   }, [studentId, year, month]);

//   // Build day → status map from API data
//   const dayStatusMap = {};
//   if (data?.attendanceData) {
//     data.attendanceData.forEach((a) => {
//       const d = new Date(a.date).getDate();
//       dayStatusMap[d] = a.status;
//     });
//   }

//   const summary = data?.summary;
//   const daysInMonth  = new Date(year, month, 0).getDate();
//   const firstWeekday = new Date(year, month - 1, 1).getDay();

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
//       <ParentSidebar />
//       <div className="flex-1 p-6 md:p-8">
//         <h1 className="text-2xl font-bold text-slate-800 mb-1">📅 Attendance</h1>
//         <p className="text-sm text-slate-500 mb-6">Select month and year to see attendance</p>

//         {/* Month / Year picker */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
//             className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
//             {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
//           </select>
//           <select value={year} onChange={(e) => setYear(Number(e.target.value))}
//             className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
//             {[2024,2025,2026].map((y) => <option key={y} value={y}>{y}</option>)}
//           </select>
//         </div>

//         {/* Loading */}
//         {(loading || sidLoading) && (
//           <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>
//         )}

//         {/* Error */}
//         {(error || sidError) && (
//           <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-4">
//             <AlertCircle size={18} />{error || sidError}
//           </div>
//         )}

//         {/* Summary cards */}
//         {summary && !loading && (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             {[
//               { label: "Total Lectures", value: summary.totalLectures, border: "border-slate-400",   icon: "📚" },
//               { label: "Present",        value: summary.present,        border: "border-emerald-500", icon: "✅" },
//               { label: "Absent",         value: summary.absent,         border: "border-rose-500",    icon: "❌" },
//               { label: "Leave",          value: summary.leave,          border: "border-amber-400",   icon: "🟡" },
//             ].map((card) => (
//               <div key={card.label} className={`bg-white rounded-2xl shadow-sm border-l-4 ${card.border} p-4`}>
//                 <div className="text-xl mb-1">{card.icon}</div>
//                 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{card.label}</p>
//                 <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value ?? 0}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Legend */}
//         {!loading && (
//           <div className="flex gap-4 mb-4">
//             {Object.entries(STATUS_STYLE).map(([s, cfg]) => (
//               <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
//                 <span className={`w-3 h-3 rounded-full ${cfg.dot}`}/>{cfg.label}
//               </div>
//             ))}
//             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
//               <span className="w-3 h-3 rounded-full bg-slate-200"/>No data
//             </div>
//           </div>
//         )}

//         {/* Calendar grid */}
//         {!loading && !sidLoading && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
//             <div className="grid grid-cols-7 mb-2">
//               {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
//                 <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
//               ))}
//             </div>
//             <div className="grid grid-cols-7 gap-1.5">
//               {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e-${i}`} />)}
//               {Array.from({ length: daysInMonth }, (_, i) => {
//                 const day = i + 1;
//                 const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
//                 const isFuture = new Date(dateStr) > new Date();
//                 const status = dayStatusMap[day];
//                 const style  = status ? STATUS_STYLE[status] : null;
//                 return (
//                   <div
//                     key={day}
//                     className={`h-14 rounded-xl flex items-center justify-center font-semibold text-sm
//                       shadow-sm transition-transform hover:scale-105
//                       ${isFuture ? "bg-slate-50 text-slate-300"
//                         : style ? style.bg
//                         : "bg-slate-100 text-slate-500"}`}
//                   >
//                     {day}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
