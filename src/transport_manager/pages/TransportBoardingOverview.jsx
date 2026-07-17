// src/transport_manager/pages/TransportBoardingOverview.jsx
// Role: TRANSPORT_MANAGER — school-wide today's boarding activity + per-student lookup

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import { getUserData } from "../../common/utils/tokenStorage";
import { transportBoardingService } from "../../common/services/transportBoardingService";
import { Loader, RefreshCw, Search } from "lucide-react";

export default function TransportBoardingOverview() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [tab, setTab] = useState("today");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [studentId, setStudentId] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [studentStatus, setStudentStatus] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await transportBoardingService.getTodayLogsForSchool(schoolId);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Log load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchToday(); }, [schoolId]);

  useEffect(() => {
    if (!studentId) { setStudentHistory([]); setStudentStatus(null); return; }
    setLoadingStudent(true);
    Promise.all([
      transportBoardingService.getStudentHistory(schoolId, studentId),
      transportBoardingService.getStudentTodayStatus(schoolId, studentId),
    ])
      .then(([histRes, statusRes]) => {
        setStudentHistory(Array.isArray(histRes.data) ? histRes.data : []);
        setStudentStatus(statusRes.data);
      })
      .catch(() => showToast("error", "Student data load nahi ho paaya"))
      .finally(() => setLoadingStudent(false));
  }, [studentId]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Boarding Log</h1>
            <p className="text-sm text-gray-400 mt-0.5">School-wide bus boarding activity</p>
          </div>
          <button onClick={fetchToday} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setTab("today")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "today" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Today — School-wide
            </button>
            <button onClick={() => setTab("student")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "student" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Student Lookup
            </button>
          </div>

          {tab === "today" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
              ) : logs.length === 0 ? (
                <p className="p-10 text-center text-sm text-gray-400">No boarding activity today</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Student", "Route", "Type", "Time", "Marked By"].map((h) => (
                        <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{l.studentName}</td>
                        <td className="py-3 px-4 text-gray-600">{l.routeName} <span className="text-xs text-gray-400">({l.routeCode})</span></td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${l.boardingType === "BOARDED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {l.boardingType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{l.scanTime ? new Date(l.scanTime).toLocaleTimeString() : "-"}</td>
                        <td className="py-3 px-4 text-gray-500">{l.markedByName} <span className="text-xs text-gray-400">({l.markedByRole})</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-md">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Search size={12} /> Select Student</label>
                <StudentPicker value={studentId} onChange={setStudentId} />
              </div>

              {studentId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  {loadingStudent ? (
                    <div className="p-5 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        Current status today:{" "}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${studentStatus?.boardingType === "BOARDED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {studentStatus?.boardingType || "No activity yet"}
                        </span>
                      </p>
                      <h3 className="font-semibold text-gray-800 mb-2">Boarding History</h3>
                      {studentHistory.length === 0 ? (
                        <p className="text-sm text-gray-400">No history found</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              {["Route", "Type", "Time"].map((h) => (
                                <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {studentHistory.map((l) => (
                              <tr key={l.id} className="border-b border-gray-50">
                                <td className="py-2 text-gray-700">{l.routeName}</td>
                                <td className="py-2 text-gray-600">{l.boardingType}</td>
                                <td className="py-2 text-gray-500">{l.scanTime ? new Date(l.scanTime).toLocaleString() : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
