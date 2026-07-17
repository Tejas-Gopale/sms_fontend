// src/nurse/pages/NurseVisits.jsx
// Role: NURSE — sick visit / infirmary incident log

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import { getUserData } from "../../common/utils/tokenStorage";
import { healthService, HEALTH_VISIT_STATUS } from "../../common/services/healthService";
import { Plus, X, Loader, RefreshCw, Trash2 } from "lucide-react";

const STATUS_COLOR = {
  REPORTED: "bg-yellow-100 text-yellow-700",
  TREATED: "bg-blue-100 text-blue-700",
  REFERRED: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const emptyLogForm = {
  studentId: null, symptoms: "", temperatureF: "", treatmentGiven: "", medicineGiven: "",
  referredToHospital: false, parentNotified: false, followUpNeeded: false, followUpDate: "", remarks: "",
};

export default function NurseVisits() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));
  const isAdmin = (userData?.roles || []).includes("SCHOOL_ADMIN") || (userData?.roles || []).includes("SUPER_ADMIN");

  const [tab, setTab] = useState("today");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState(emptyLogForm);
  const [editVisit, setEditVisit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = tab === "today"
        ? await healthService.getTodayVisits(schoolId)
        : await healthService.getPendingFollowUps(schoolId);
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Visits load nahi ho paayi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchVisits(); }, [schoolId, tab]);

  const handleLogVisit = async () => {
    if (!logForm.studentId || !logForm.symptoms.trim()) {
      showToast("error", "Student aur symptoms required hain");
      return;
    }
    setSubmitting(true);
    try {
      await healthService.logVisit(schoolId, {
        ...logForm,
        temperatureF: logForm.temperatureF === "" ? null : Number(logForm.temperatureF),
        followUpDate: logForm.followUpDate || null,
      });
      showToast("success", "Visit logged");
      setShowLogModal(false);
      setLogForm(emptyLogForm);
      fetchVisits();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Visit log nahi ho paayi");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (v) => {
    setEditVisit(v);
    setEditForm({
      treatmentGiven: v.treatmentGiven || "", medicineGiven: v.medicineGiven || "",
      referredToHospital: !!v.referredToHospital, parentNotified: !!v.parentNotified,
      followUpNeeded: !!v.followUpNeeded, followUpDate: v.followUpDate || "",
      status: v.status, remarks: v.remarks || "",
    });
  };

  const handleEditSave = async () => {
    setSubmitting(true);
    try {
      await healthService.updateVisit(schoolId, editVisit.id, {
        ...editForm,
        followUpDate: editForm.followUpDate || null,
      });
      showToast("success", "Visit updated");
      setEditVisit(null);
      fetchVisits();
    } catch {
      showToast("error", "Update nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this visit record?")) return;
    try {
      await healthService.deleteVisit(schoolId, id);
      showToast("success", "Visit deleted");
      fetchVisits();
    } catch {
      showToast("error", "Delete nahi ho paaya");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Health Incidents</h1>
            <p className="text-sm text-gray-400 mt-0.5">Infirmary sick-visit log</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchVisits} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400"
            >
              <Plus size={16} /> Log Visit
            </button>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setTab("today")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "today" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Today's Visits
            </button>
            <button onClick={() => setTab("pending")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "pending" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Pending Follow-ups
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
            ) : visits.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400">No visits</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student", "Time", "Symptoms", "Treatment", "Status", ""].map((h) => (
                      <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{v.studentName}</td>
                      <td className="py-3 px-4 text-gray-600">{v.visitTime ? new Date(v.visitTime).toLocaleString() : "-"}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{v.symptoms}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{v.treatmentGiven || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[v.status] || "bg-gray-100 text-gray-600"}`}>{v.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right flex gap-3 justify-end">
                        <button onClick={() => openEdit(v)} className="text-xs text-yellow-600 font-medium hover:underline">Update</button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Log Visit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Log Sick Visit</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setShowLogModal(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Student</label>
                <StudentPicker value={logForm.studentId} onChange={(id) => setLogForm((f) => ({ ...f, studentId: id }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Symptoms</label>
                <textarea rows={2} value={logForm.symptoms} onChange={(e) => setLogForm((f) => ({ ...f, symptoms: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Temperature (°F)</label>
                <input type="number" value={logForm.temperatureF} onChange={(e) => setLogForm((f) => ({ ...f, temperatureF: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Treatment Given</label>
                <input value={logForm.treatmentGiven} onChange={(e) => setLogForm((f) => ({ ...f, treatmentGiven: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Medicine Given</label>
                <input value={logForm.medicineGiven} onChange={(e) => setLogForm((f) => ({ ...f, medicineGiven: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex flex-wrap gap-4">
                {[["referredToHospital", "Referred to Hospital"], ["parentNotified", "Parent Notified"], ["followUpNeeded", "Follow-up Needed"]].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={logForm[key]} onChange={(e) => setLogForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-yellow-500" />
                    {label}
                  </label>
                ))}
              </div>
              {logForm.followUpNeeded && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Follow-up Date</label>
                  <input type="date" value={logForm.followUpDate} onChange={(e) => setLogForm((f) => ({ ...f, followUpDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500">Remarks</label>
                <textarea rows={2} value={logForm.remarks} onChange={(e) => setLogForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowLogModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={submitting} onClick={handleLogVisit} className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60">
                {submitting ? "Saving..." : "Log Visit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Visit Modal */}
      {editVisit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Update Visit — {editVisit.studentName}</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setEditVisit(null)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1">
                  {HEALTH_VISIT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Treatment Given</label>
                <input value={editForm.treatmentGiven} onChange={(e) => setEditForm((f) => ({ ...f, treatmentGiven: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Medicine Given</label>
                <input value={editForm.medicineGiven} onChange={(e) => setEditForm((f) => ({ ...f, medicineGiven: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex flex-wrap gap-4">
                {[["referredToHospital", "Referred to Hospital"], ["parentNotified", "Parent Notified"], ["followUpNeeded", "Follow-up Needed"]].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={!!editForm[key]} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-yellow-500" />
                    {label}
                  </label>
                ))}
              </div>
              {editForm.followUpNeeded && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Follow-up Date</label>
                  <input type="date" value={editForm.followUpDate || ""} onChange={(e) => setEditForm((f) => ({ ...f, followUpDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500">Remarks</label>
                <textarea rows={2} value={editForm.remarks} onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditVisit(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button disabled={submitting} onClick={handleEditSave} className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60">
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
