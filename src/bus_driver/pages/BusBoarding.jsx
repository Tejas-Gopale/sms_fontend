// src/bus_driver/pages/BusBoarding.jsx
// Roles: BUS_DRIVER, BUS_CONDUCTOR — mark student boarding/de-boarding, view today's log

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import { transportBoardingService } from "../../common/services/transportBoardingService";
import { Bus, CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";

export default function BusBoarding() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [routes, setRoutes] = useState([]);
  const [routeId, setRouteId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    if (!schoolId) return;
    API.get(`/schools/${schoolId}/transport/routes`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setRoutes(list);
        if (list.length === 1) setRouteId(list[0].id);
      })
      .catch(() => showToast("error", "Routes load nahi ho paayi"));
  }, [schoolId]);

  const fetchLogs = async () => {
    if (!routeId) return;
    setLoading(true);
    try {
      const res = await transportBoardingService.getTodayLogsForRoute(schoolId, routeId);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Log load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [routeId]);

  const mark = async (boardingType) => {
    if (!routeId) { showToast("error", "Route select karo"); return; }
    if (!studentId) { showToast("error", "Student select karo"); return; }
    setMarking(true);
    try {
      await transportBoardingService.markBoarding(schoolId, routeId, { studentId, boardingType });
      showToast("success", boardingType === "BOARDED" ? "Marked boarded" : "Marked de-boarded");
      setStudentId(null);
      fetchLogs();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Update nahi ho paaya");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Bus size={20} className="text-yellow-500" /> Boarding</h1>
            <p className="text-sm text-gray-400 mt-0.5">Mark students boarding / de-boarding</p>
          </div>
          <button onClick={fetchLogs} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-medium text-gray-500">Route</label>
              <select
                value={routeId || ""}
                onChange={(e) => setRouteId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="">Select route...</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.routeName} ({r.routeCode})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Student</label>
              <StudentPicker value={studentId} onChange={setStudentId} />
            </div>
            <div className="flex gap-3">
              <button
                disabled={marking}
                onClick={() => mark("BOARDED")}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-60"
              >
                <CheckCircle size={14} /> Mark Boarded
              </button>
              <button
                disabled={marking}
                onClick={() => mark("DEBOARDED")}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60"
              >
                <XCircle size={14} /> Mark De-boarded
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="font-semibold text-gray-800 p-5 pb-0">Today's Log</h2>
            {!routeId ? (
              <p className="p-10 text-center text-sm text-gray-400">Select a route to view today's log</p>
            ) : loading ? (
              <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
            ) : logs.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400">No entries yet today</p>
            ) : (
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student", "Type", "Time", "Marked By"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50">
                      <td className="py-2.5 px-4 font-medium text-gray-800">{l.studentName}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${l.boardingType === "BOARDED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {l.boardingType}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">{l.scanTime ? new Date(l.scanTime).toLocaleTimeString() : "-"}</td>
                      <td className="py-2.5 px-4 text-gray-500">{l.markedByName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
