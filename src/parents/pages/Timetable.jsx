import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, CalendarDays, Coffee } from "lucide-react";
import { getStudentTimetable } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const toDateStr = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const TYPE_STYLE = {
  break:    { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700",   label: "Break"    },
  lunch:    { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", label: "Lunch"    },
  activity: { bg: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700", label: "Activity" },
  lecture:  { bg: "bg-white border-slate-100",       badge: "bg-indigo-100 text-indigo-700", label: "Lecture"  },
};

export default function ParentTimeTable() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [timetable,   setTimetable]   = useState(null);
  const [activeTab,   setActiveTab]   = useState("TODAY");
  const [customDate,  setCustomDate]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const fetchTimetable = (tab, date) => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    const d = tab === "TODAY" ? toDateStr(0) : tab === "TOMORROW" ? toDateStr(1) : date;
    getStudentTimetable(studentId, d)
      .then((res) => setTimetable(res.data))
      .catch(() => setError("Could not load timetable."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (studentId) fetchTimetable(activeTab, customDate);
  }, [studentId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCustomDate("");
    fetchTimetable(tab, "");
  };

  const handleDaySelect = (e) => {
    const day = e.target.value;
    if (!day) return;
    // Map day name to nearest date
    const dayIndex = DAYS.indexOf(day); // 0=Mon...
    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun,1=Mon...
    const diff = ((dayIndex + 1) - todayDay + 7) % 7 || 7;
    const target = new Date();
    target.setDate(today.getDate() + diff);
    const dateStr = target.toISOString().split("T")[0];
    setActiveTab(day);
    setCustomDate(dateStr);
    fetchTimetable(day, dateStr);
  };

  const heading = timetable
    ? `${timetable.dayOfWeek || activeTab} — ${timetable.date || ""}`
    : activeTab;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">

        <h1 className="text-3xl font-bold mb-5 text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-indigo-600" size={28} />
          Timetable 📅
          <span className="text-lg font-normal text-slate-400">({heading})</span>
        </h1>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["TODAY", "TOMORROW"].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === t ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
          <select
            onChange={handleDaySelect}
            value={DAYS.includes(activeTab) ? activeTab : ""}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600"
          >
            <option value="">Select Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        )}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}

        {!loading && !sidLoading && !error && !sidError && (
          timetable?.periods?.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Class badge */}
              {timetable.className && (
                <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-700">Class: {timetable.className}</span>
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {timetable.periods.map((p, i) => {
                  const typeKey = p.type?.toLowerCase() || "lecture";
                  const style   = TYPE_STYLE[typeKey] ?? TYPE_STYLE.lecture;
                  const isBreak = typeKey === "break" || typeKey === "lunch";
                  return (
                    <div key={i} className={`px-6 py-4 flex items-center gap-4 ${style.bg} border-l-4`}>
                      {/* Period number */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {isBreak
                          ? <Coffee size={16} className="text-amber-500" />
                          : <span className="text-sm font-bold text-slate-600">{p.periodNumber}</span>
                        }
                      </div>
                      {/* Time */}
                      <div className="w-28 flex-shrink-0">
                        <p className="text-xs text-slate-400 font-medium">
                          {p.startTime} – {p.endTime}
                        </p>
                      </div>
                      {/* Subject / Teacher */}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {isBreak ? style.label : p.subjectName}
                        </p>
                        {!isBreak && p.teacherName && (
                          <p className="text-xs text-slate-500 mt-0.5">👨‍🏫 {p.teacherName}</p>
                        )}
                      </div>
                      {/* Room */}
                      {p.room && !isBreak && (
                        <span className="text-xs text-slate-400 flex-shrink-0">{p.room}</span>
                      )}
                      {/* Type badge */}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No timetable available for this day</p>
              <p className="text-sm text-slate-400 mt-1">Try selecting another day from the options above.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
