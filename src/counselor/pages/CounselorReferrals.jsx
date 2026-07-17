// src/counselor/pages/CounselorReferrals.jsx
// Role: COUNSELOR — triage referral queue + raise a new referral

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import { getUserData } from "../../common/utils/tokenStorage";
import { counselingService, REFERRAL_URGENCY, REFERRAL_STATUS } from "../../common/services/counselingService";
import { Plus, X, Loader, AlertTriangle, RefreshCw, Calendar } from "lucide-react";

const URGENCY_COLOR = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  CLOSED: "bg-green-100 text-green-700",
};

export default function CounselorReferrals() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [triageId, setTriageId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const [newForm, setNewForm] = useState({ studentId: null, reason: "", urgency: "MEDIUM" });
  const [triageForm, setTriageForm] = useState({ status: "IN_PROGRESS", counselorNotes: "" });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await counselingService.getAllReferrals(schoolId);
      setReferrals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", "Referrals load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchReferrals(); }, [schoolId]);

  const handleRaise = async () => {
    if (!newForm.studentId || !newForm.reason.trim()) {
      showToast("error", "Student aur reason dono required hain");
      return;
    }
    setSubmitting(true);
    try {
      await counselingService.raiseReferral(schoolId, {
        studentId: newForm.studentId,
        reason: newForm.reason,
        urgency: newForm.urgency,
      });
      showToast("success", "Referral raised successfully");
      setShowNewModal(false);
      setNewForm({ studentId: null, reason: "", urgency: "MEDIUM" });
      fetchReferrals();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Referral raise nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const openTriage = (r) => {
    setTriageId(r.id);
    setTriageForm({ status: r.status === "PENDING" ? "IN_PROGRESS" : r.status, counselorNotes: r.counselorNotes || "" });
  };

  const handleTriageSave = async () => {
    setSubmitting(true);
    try {
      await counselingService.updateReferralStatus(schoolId, triageId, triageForm);
      showToast("success", "Referral updated");
      setTriageId(null);
      fetchReferrals();
    } catch (err) {
      showToast("error", "Update nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const visible = filter === "ALL" ? referrals : referrals.filter((r) => r.status === filter);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Referrals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Triage queue & new referrals</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchReferrals} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400"
            >
              <Plus size={16} /> Raise Referral
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
            {["ALL", ...REFERRAL_STATUS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${filter === s ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
            ) : visible.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400">No referrals</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student", "Referred By", "Reason", "Urgency", "Status", ""].map((h) => (
                      <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{r.studentName}</td>
                      <td className="py-3 px-4 text-gray-600">{r.referredByName} <span className="text-xs text-gray-400">({r.referredByRole})</span></td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{r.reason}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${URGENCY_COLOR[r.urgency] || "bg-gray-100 text-gray-600"}`}>
                          {r.urgency === "CRITICAL" && <AlertTriangle size={10} className="inline mr-1" />}
                          {r.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => openTriage(r)} className="text-xs text-yellow-600 font-medium hover:underline">
                          Triage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* New Referral Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Raise Referral</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setShowNewModal(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Student</label>
                <StudentPicker value={newForm.studentId} onChange={(id) => setNewForm((f) => ({ ...f, studentId: id }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Urgency</label>
                <select
                  value={newForm.urgency}
                  onChange={(e) => setNewForm((f) => ({ ...f, urgency: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {REFERRAL_URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Reason</label>
                <textarea
                  rows={3}
                  value={newForm.reason}
                  onChange={(e) => setNewForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="Describe the concern..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                disabled={submitting}
                onClick={handleRaise}
                className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Raise Referral"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Triage Modal */}
      {triageId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Triage Referral</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setTriageId(null)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <select
                  value={triageForm.status}
                  onChange={(e) => setTriageForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {REFERRAL_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Counselor Notes</label>
                <textarea
                  rows={3}
                  value={triageForm.counselorNotes}
                  onChange={(e) => setTriageForm((f) => ({ ...f, counselorNotes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setTriageId(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                disabled={submitting}
                onClick={handleTriageSave}
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
