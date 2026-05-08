import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { CalendarDays, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { getUserData } from "../../common/utils/tokenStorage";

export default function TeacherMyAttendance() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    // Get teacher ID from stored user data
    const userData = getUserData();
    if (userData?.userId) {
      setTeacherId(userData.userId);
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchAttendance();
    }
  }, [teacherId, month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),
        API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
      ]);
      setRecords(recordsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    PRESENT: { label: "Present", color: "bg-green-100 text-green-700", icon: CheckCircle },
    ABSENT: { label: "Absent", color: "bg-red-100 text-red-700", icon: XCircle },
    LATE: { label: "Late", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    HALF_DAY: { label: "Half Day", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
    LEAVE: { label: "On Leave", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [2024, 2025, 2026];

  const formatTime = (t) => {
    if (!t) return "-";
    return t.toString().substring(0, 5);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <CalendarDays size={28} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
          </div>

          {/* Month/Year Picker */}
          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border px-3 py-2 rounded bg-white shadow-sm"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border px-3 py-2 rounded bg-white shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Working Days", value: summary.totalWorkingDays, color: "border-gray-400" },
              { label: "Days Present", value: summary.presentDays, color: "border-green-500" },
              { label: "Days Absent", value: summary.absentDays ?? (summary.totalWorkingDays - summary.presentDays), color: "border-red-500" },
              { label: "LOP Days", value: summary.lopDays ?? 0, color: "border-orange-500" },
            ].map((card, i) => (
              <div key={i} className={`bg-white p-4 rounded-xl shadow border-l-4 ${card.color}`}>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading attendance records...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No attendance records found for {months[month - 1]} {year}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="text-left text-gray-600">
                    <th className="p-3">Date</th>
                    <th className="p-3">Day</th>
                    <th className="p-3">Check-In</th>
                    <th className="p-3">Check-Out</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const cfg = statusConfig[r.status] || { label: r.status, color: "bg-gray-100 text-gray-700", icon: AlertCircle };
                    const Icon = cfg.icon;
                    const dateObj = new Date(r.date);
                    return (
                      <tr key={r.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{dateObj.toLocaleDateString("en-IN")}</td>
                        <td className="p-3 text-gray-500">
                          {dateObj.toLocaleDateString("en-IN", { weekday: "short" })}
                        </td>
                        <td className="p-3">{formatTime(r.checkInTime)}</td>
                        <td className="p-3">{formatTime(r.checkOutTime)}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{r.remarks || "-"}</td>
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