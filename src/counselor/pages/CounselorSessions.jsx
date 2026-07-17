// src/counselor/pages/CounselorSessions.jsx
// Role: COUNSELOR — log sessions, view upcoming schedule, student session history

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import { getUserData } from "../../common/utils/tokenStorage";
import { counselingService, SESSION_STATUS } from "../../common/services/counselingService";
import { Plus, X, Loader, Calendar, Search } from "lucide-react";

const STATUS_COLOR = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  NO_SHOW: "bg-red-100 text-red-700",
};

export default function CounselorSessions() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  const [historyStudentId, setHistoryStudentId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({ studentId: null, sessionDate: "", reasonForSession: "", sessionNotes: "", followUpDate: "" });
  const [editSession, setEditSession] = useState(null);
  const [editForm, setEditForm] = useState({ status: "SCHEDULED", sessionNotes: "", followUpDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchUpcoming = async () => {
    setLoadingUpcoming(true);
    try {
      const res = await counselingService.getUpcomingSessions(schoolId);
      setUpcoming(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Upcoming sessions load nahi ho paayi");
    } finally {
      setLoadingUpcoming(false);
    }
  };

  useEffect(() => { if (schoolId) fetchUpcoming(); }, [schoolId]);

  useEffect(() => {
    if (!historyStudentId) { setHistory([]); return; }
    setLoadingHistory(true);
    counselingService.getStudentSessions(schoolId, historyStudentId)
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast("error", "History load nahi ho paayi"))
      .finally(() => setLoadingHistory(false));
  }, [historyStudentId]);

  const handleLogSession = async () => {
    if (!logForm.studentId || !logForm.sessionDate) {
      showToast("error", "Student aur session date required hain");
      return;
    }
    setSubmitting(true);
    try {
      await counselingService.logSession(schoolId, {
        studentId: logForm.studentId,
        sessionDate: logForm.sessionDate,
        reasonForSession: logForm.reasonForSession,
        sessionNotes: logForm.sessionNotes,
        followUpDate: logForm.followUpDate || null,
      });
      showToast("success", "Session logged");
      setShowLogModal(false);
      setLogForm({ studentId: null, sessionDate: "", reasonForSession: "", sessionNotes: "", followUpDate: "" });
      fetchUpcoming();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Session log nahi ho paayi");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (s) => {
    setEditSession(s);
    setEditForm({ status: s.status, sessionNotes: s.sessionNotes || "", followUpDate: s.followUpDate || "" });
  };

  const handleEditSave = async () => {
    setSubmitting(true);
    try {
      await counselingService.updateSession(schoolId, editSession.id, {
        ...editForm,
        followUpDate: editForm.followUpDate || null,
      });
      showToast("success", "Session updated");
      setEditSession(null);
      fetchUpcoming();
      if (historyStudentId) {
        const res = await counselingService.getStudentSessions(schoolId, historyStudentId);
        setHistory(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      showToast("error", "Update nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const SessionRow = ({ s }) => (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-800">{s.studentName}</td>
      <td className="py-3 px-4 text-gray-600">{s.sessionDate ? new Date(s.sessionDate).toLocaleString() : "-"}</td>
      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{s.reasonForSession || "-"}</td>
      <td className="py-3 px-4 text-gray-500">{s.followUpDate || "-"}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[s.status] || "bg-gray-100 text-gray-600"}`}>
          {s.status?.replace("_", " ")}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <button onClick={() => openEdit(s)} className="text-xs text-yellow-600 font-medium hover:underline">Update</button>
      </td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Session Records</h1>
            <p className="text-sm text-gray-400 mt-0.5">Confidential — counselor & principal only</p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400"
          >
            <Plus size={16} /> Log Session
          </button>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setTab("upcoming")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "upcoming" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Upcoming Schedule
            </button>
            <button onClick={() => setTab("history")} className={`px-3 py-1.5 text-xs font-medium rounded-full ${tab === "history" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              Student History
            </button>
          </div>

          {tab === "upcoming" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loadingUpcoming ? (
                <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
              ) : upcoming.length === 0 ? (
                <p className="p-10 text-center text-sm text-gray-400">No upcoming sessions</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Student", "Session Date", "Reason", "Follow-up", "Status", ""].map((h) => (
                        <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{upcoming.map((s) => <SessionRow key={s.id} s={s} />)}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-md">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Search size={12} /> Select Student</label>
                <StudentPicker value={historyStudentId} onChange={setHistoryStudentId} />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {!historyStudentId ? (
                  <p className="p-10 text-center text-sm text-gray-400">Select a student to view session history</p>
                ) : loadingHistory ? (
                  <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
                ) : history.length === 0 ? (
                  <p className="p-10 text-center text-sm text-gray-400">No sessions logged for this student</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {["Student", "Session Date", "Reason", "Follow-up", "Status", ""].map((h) => (
                          <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{history.map((s) => <SessionRow key={s.id} s={s} />)}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Log Counseling Session</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setShowLogModal(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Student</label>
                <StudentPicker value={logForm.studentId} onChange={(id) => setLogForm((f) => ({ ...f, studentId: id }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Session Date & Time</label>
                <input
                  type="datetime-local"
                  value={logForm.sessionDate}
                  onChange={(e) => setLogForm((f) => ({ ...f, sessionDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Reason for Session</label>
                <input
                  value={logForm.reasonForSession}
                  onChange={(e) => setLogForm((f) => ({ ...f, reasonForSession: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Session Notes</label>
                <textarea
                  rows={3}
                  value={logForm.sessionNotes}
                  onChange={(e) => setLogForm((f) => ({ ...f, sessionNotes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Follow-up Date (optional)</label>
                <input
                  type="date"
                  value={logForm.followUpDate}
                  onChange={(e) => setLogForm((f) => ({ ...f, followUpDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowLogModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                disabled={submitting}
                onClick={handleLogSession}
                className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Log Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Update Session — {editSession.studentName}</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setEditSession(null)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {SESSION_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Session Notes</label>
                <textarea
                  rows={3}
                  value={editForm.sessionNotes}
                  onChange={(e) => setEditForm((f) => ({ ...f, sessionNotes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Follow-up Date</label>
                <input
                  type="date"
                  value={editForm.followUpDate || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, followUpDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditSession(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                disabled={submitting}
                onClick={handleEditSave}
                className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
