import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { CalendarDays, Clock, User, BadgeInfo } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const dayLabels = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export default function TeacherTimetable() {
  const todayDay = DAYS[new Date().getDay() - 1] || "MONDAY";

  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [timetableData, setTimetableData] = useState(null); // full response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/teacher/my-timetable");
      setTimetableData(res.data || null);
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("Failed to load timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t) => {
    if (!t) return "";
    // Handle LocalTime array [H, M] or string "HH:MM:SS"
    if (Array.isArray(t))
      return `${String(t[0]).padStart(2, "0")}:${String(t[1]).padStart(2, "0")}`;
    return String(t).substring(0, 5);
  };

  const now = new Date().toTimeString().slice(0, 5);

  // Get slots for the currently selected day
  const schedule =
    timetableData?.timetable?.[selectedDay] || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CalendarDays size={28} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">My Timetable</h2>
          </div>

          {/* Teacher info badge */}
          {timetableData && (
            <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 shadow-sm text-sm text-gray-600">
              <User size={15} className="text-blue-500" />
              <span className="font-semibold text-gray-800">
                {timetableData.teacherName}
              </span>
              {timetableData.employeeId && (
                <>
                  <span className="text-gray-300">|</span>
                  <BadgeInfo size={14} className="text-gray-400" />
                  <span>{timetableData.employeeId}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-6 flex-wrap mt-4">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm
                ${
                  selectedDay === day
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-50 border"
                }
                ${day === todayDay ? "ring-2 ring-blue-300" : ""}`}
            >
              {dayLabels[day]}
              {day === todayDay && (
                <span className="ml-1 text-xs opacity-80">(Today)</span>
              )}
            </button>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading schedule...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : schedule.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No classes scheduled for {dayLabels[selectedDay]}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-left text-gray-600">
                    <th className="p-4">Period</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((slot, i) => {
                    const start = formatTime(slot.startTime);
                    const end = formatTime(slot.endTime);
                    const isNow =
                      selectedDay === todayDay &&
                      now >= start &&
                      now <= end;
                    const isDone =
                      selectedDay === todayDay && now > end;

                    return (
                      <tr
                        key={i}
                        className={`border-t ${
                          isNow ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-4 font-medium">
                          {slot.isBreak ? (
                            <span className="text-gray-400 italic">Break</span>
                          ) : (
                            `P${slot.periodNumber || i + 1}`
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock size={14} />
                            {start} – {end}
                          </div>
                        </td>
                        <td className="p-4">
                          {slot.isBreak ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className="font-medium">
                              {slot.subjectName}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {slot.classRoom}
                          {slot.section ? ` - ${slot.section}` : ""}
                        </td>
                        <td className="p-4">
                          {slot.isBreak ? null : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${
                                  isNow
                                    ? "bg-green-100 text-green-700"
                                    : isDone
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {isNow ? "Ongoing" : isDone ? "Done" : "Upcoming"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}