// src/school_admin/pages/HousekeepingManagement.jsx
// Role: SCHOOL_ADMIN (also PRINCIPAL/VICE_PRINCIPAL on backend) — assign tasks, view/resolve complaints

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  housekeepingService, TASK_PRIORITY, TASK_STATUS, COMPLAINT_STATUS,
} from "../../common/services/housekeepingService";
import { Plus, X, Loader, RefreshCw, Trash2, ClipboardList, AlertCircle } from "lucide-react";

const PRIORITY_COLOR = {
  LOW: "bg-gray-100 text-gray-600", MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700", URGENT: "bg-red-100 text-red-700",
};
const TASK_STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700", IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700", CANCELLED: "bg-gray-100 text-gray-600",
};
const COMPLAINT_STATUS_COLOR = {
  OPEN: "bg-yellow-100 text-yellow-700", IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700",
};

const emptyTaskForm = { title: "", description: "", location: "", priority: "MEDIUM", assignedToId: "", dueDate: "" };

export default function HousekeepingManagement() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [tab, setTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);

  const [resolveComplaint, setResolveComplaint] = useState(null);
  const [resolveForm, setResolveForm] = useState({ status: "RESOLVED", resolutionNotes: "" });

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, complaintsRes] = await Promise.all([
        housekeepingService.getAllTasks(schoolId),
        housekeepingService.getAllComplaints(schoolId),
      ]);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
    } catch {
      showToast("error", "Data load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchData(); }, [schoolId]);

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.location.trim() || !taskForm.assignedToId) {
      showToast("error", "Title, location aur staff ID required hain");
      return;
    }
    setSubmitting(true);
    try {
      await housekeepingService.createTask(schoolId, {
        ...taskForm,
        assignedToId: Number(taskForm.assignedToId),
        dueDate: taskForm.dueDate || null,
      });
      showToast("success", "Task assigned");
      setShowTaskModal(false);
      setTaskForm(emptyTaskForm);
      fetchData();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Task create nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await housekeepingService.deleteTask(schoolId, id);
      showToast("success", "Task deleted");
      fetchData();
    } catch {
      showToast("error", "Delete nahi ho paaya");
    }
  };

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      await housekeepingService.resolveComplaint(schoolId, resolveComplaint.id, resolveForm);
      showToast("success", "Complaint updated");
      setResolveComplaint(null);
      fetchData();
    } catch {
      showToast("error", "Update nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Housekeeping</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tasks & facility complaints</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            {tab === "tasks" && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400"
              >
                <Plus size={16} /> Assign Task
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setTab("tasks")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${tab === "tasks" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              <ClipboardList size={12} /> Tasks
            </button>
            <button onClick={() => setTab("complaints")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${tab === "complaints" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              <AlertCircle size={12} /> Complaints
            </button>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
          ) : tab === "tasks" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {tasks.length === 0 ? (
                <p className="p-10 text-center text-sm text-gray-400">No tasks yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Title", "Location", "Assigned To", "Priority", "Due", "Status", ""].map((h) => (
                        <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{t.title}</td>
                        <td className="py-3 px-4 text-gray-600">{t.location}</td>
                        <td className="py-3 px-4 text-gray-600">{t.assignedToName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{t.dueDate || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TASK_STATUS_COLOR[t.status]}`}>{t.status?.replace("_", " ")}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleDeleteTask(t.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {complaints.length === 0 ? (
                <p className="p-10 text-center text-sm text-gray-400">No complaints yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Raised By", "Location", "Description", "Status", ""].map((h) => (
                        <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{c.raisedByName}</td>
                        <td className="py-3 px-4 text-gray-600">{c.location}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{c.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${COMPLAINT_STATUS_COLOR[c.status]}`}>{c.status?.replace("_", " ")}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => { setResolveComplaint(c); setResolveForm({ status: "RESOLVED", resolutionNotes: c.resolutionNotes || "" }); }}
                            className="text-xs text-yellow-600 font-medium hover:underline"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Assign Task</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setShowTaskModal(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Title</label>
                <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Location</label>
                <input value={taskForm.location} onChange={(e) => setTaskForm((f) => ({ ...f, location: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. Block A, 2nd Floor" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Assigned To — Staff User ID</label>
                <input type="number" value={taskForm.assignedToId} onChange={(e) => setTaskForm((f) => ({ ...f, assignedToId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" placeholder="Housekeeping staff user ID" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Priority</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1">
                  {TASK_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea rows={2} value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={submitting} onClick={handleCreateTask} className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60">
                {submitting ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      {resolveComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Update Complaint</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setResolveComplaint(null)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select value={resolveForm.status} onChange={(e) => setResolveForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1">
                  {COMPLAINT_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Resolution Notes</label>
                <textarea rows={3} value={resolveForm.resolutionNotes} onChange={(e) => setResolveForm((f) => ({ ...f, resolutionNotes: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setResolveComplaint(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={submitting} onClick={handleResolve} className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60">
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
