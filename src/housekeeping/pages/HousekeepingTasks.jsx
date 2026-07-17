// src/housekeeping/pages/HousekeepingTasks.jsx
// Role: HOUSEKEEPING — my assigned tasks, update status

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { housekeepingService, TASK_STATUS } from "../../common/services/housekeepingService";
import { Loader, RefreshCw, ClipboardList } from "lucide-react";

const PRIORITY_COLOR = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function HousekeepingTasks() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await housekeepingService.getMyTasks(schoolId);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Tasks load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchTasks(); }, [schoolId]);

  const handleStatusChange = async (taskId, status) => {
    setUpdating(taskId);
    try {
      await housekeepingService.updateTaskStatus(schoolId, taskId, { status });
      showToast("success", "Task updated");
      fetchTasks();
    } catch {
      showToast("error", "Update nahi ho paaya");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tasks assigned to you</p>
          </div>
          <button onClick={fetchTasks} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          {loading ? (
            <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <ClipboardList className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">No tasks assigned to you right now</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((t) => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800">{t.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_COLOR[t.priority] || "bg-gray-100 text-gray-600"}`}>{t.priority}</span>
                    </div>
                    <p className="text-sm text-gray-500">{t.location}</p>
                    {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                    {t.dueDate && <p className="text-xs text-gray-400 mt-1">Due: {t.dueDate}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[t.status] || "bg-gray-100 text-gray-600"}`}>
                      {t.status?.replace("_", " ")}
                    </span>
                    <select
                      disabled={updating === t.id}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                    >
                      {TASK_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
