// src/teachers/pages/TeacherLeave.jsx
// Leave Apply + Balance + History — exact backend APIs se connected
// Endpoints verified from LeaveController.java + LeaveApplicationRequest.java

import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { teacherLeaveService } from "../services/teacherService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  PenLine, CheckCircle, XCircle, Clock, AlertCircle,
  Loader, Plus, X, CalendarDays, RefreshCw, Info,
} from "lucide-react";

// ── Exact enum values from LeaveType.java ──────────────────────────
const LEAVE_TYPES = [
  { value: "CASUAL_LEAVE",       label: "Casual Leave (CL)"       },
  { value: "SICK_LEAVE",         label: "Sick Leave (SL)"          },
  { value: "EARNED_LEAVE",       label: "Earned Leave (EL)"        },
  { value: "LEAVE_WITHOUT_PAY",  label: "Leave Without Pay (LWP)"  },
  { value: "MATERNITY_LEAVE",    label: "Maternity Leave"          },
  { value: "PATERNITY_LEAVE",    label: "Paternity Leave"          },
];

// ── LeaveStatus.java: PENDING | APPROVED | REJECTED | CANCELLED | REVOKED ──
const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", icon: Clock        },
  APPROVED:  { label: "Approved",  color: "bg-green-100 text-green-700",   icon: CheckCircle  },
  REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-700",       icon: XCircle      },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600",     icon: X            },
  REVOKED:   { label: "Revoked",   color: "bg-orange-100 text-orange-700", icon: AlertCircle  },
};

const LEAVE_LABEL = Object.fromEntries(LEAVE_TYPES.map(({ value, label }) => [value, label]));

export default function TeacherLeave() {
  const [activeTab, setActiveTab] = useState("apply");

  // User info from localStorage
  const userData  = getUserData();
  const teacherId = userData?.teacherId;
  const schoolId  = userData?.schoolId
    ? Number(userData.schoolId)
    : Number(localStorage.getItem("schoolId"));
  const currentYear = new Date().getFullYear();

  // State
  const [balance,        setBalance]        = useState(null);
  const [history,        setHistory]        = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [toast,          setToast]          = useState(null);

  const [form, setForm] = useState({
    leaveType: "CASUAL_LEAVE",
    fromDate:  "",
    toDate:    "",
    reason:    "",
    forceAsLWP: false,
  });

  useEffect(() => { if (teacherId) fetchBalance(); }, [teacherId]);
  useEffect(() => { if (activeTab === "history" && teacherId) fetchHistory(); }, [activeTab, teacherId]);

  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const res = await teacherLeaveService.getTeacherBalance(teacherId, currentYear);
      setBalance(res.data);
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await teacherLeaveService.getTeacherHistory(teacherId);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("History fetch error:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      showToast("error", "Saari required fields fill karo — dates aur reason dono chahiye");
      return;
    }
    if (new Date(form.fromDate) > new Date(form.toDate)) {
      showToast("error", "From date, to date se pehle honi chahiye");
      return;
    }
    if (!teacherId || !schoolId) {
      showToast("error", "Teacher ID ya School ID nahi mili — dobara login karo");
      return;
    }
    setSubmitting(true);
    try {
      // Exact fields from LeaveApplicationRequest.java
      await teacherLeaveService.applyLeave({
        teacherId:  Number(teacherId),
        schoolId:   Number(schoolId),
        leaveType:  form.leaveType,         // enum: CASUAL_LEAVE, SICK_LEAVE, etc.
        fromDate:   form.fromDate,           // "YYYY-MM-DD"
        toDate:     form.toDate,
        reason:     form.reason,
        forceAsLWP: form.forceAsLWP || null,
      });
      showToast("success", "Leave application submit ho gayi! Principal ko email bhi jaayegi ✅");
      setForm({ leaveType: "CASUAL_LEAVE", fromDate: "", toDate: "", reason: "", forceAsLWP: false });
      fetchBalance();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Leave apply nahi ho payi ❌";
      showToast("error", String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm("Is leave ko cancel karna chahte ho?")) return;
    try {
      await teacherLeaveService.cancelLeave(leaveId, teacherId);
      showToast("success", "Leave cancel ho gayi ✅");
      fetchHistory();
      fetchBalance();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Cancel nahi ho payi ❌");
    }
  };

  // Build balance cards from balances[] array
  const balanceCards = balance?.balances
    ? balance.balances.map((b) => ({
        label:     LEAVE_LABEL[b.leaveType] || b.leaveType,
        allocated: b.totalAllocated,
        used:      b.usedDays,
        pending:   b.pendingDays,
        remaining: b.remainingDays,
        isPaid:    b.isPaid,
      }))
    : [];

  const colorForType = (leaveType) => {
    const map = {
      CASUAL_LEAVE:      "border-blue-400",
      SICK_LEAVE:        "border-red-400",
      EARNED_LEAVE:      "border-green-400",
      LEAVE_WITHOUT_PAY: "border-gray-400",
      MATERNITY_LEAVE:   "border-pink-400",
      PATERNITY_LEAVE:   "border-purple-400",
    };
    return map[leaveType] || "border-gray-300";
  };

  // Count days selected
  const dayCount = form.fromDate && form.toDate
    ? Math.ceil((new Date(form.toDate) - new Date(form.fromDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
            ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <PenLine size={28} className="text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
            <p className="text-sm text-gray-500">
              {balance?.employeeName && <span className="font-medium text-gray-700">{balance.employeeName} · </span>}
              {currentYear} leave balance
            </p>
          </div>
          <button onClick={fetchBalance} className="ml-auto text-gray-400 hover:text-purple-500 transition" title="Refresh balance">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Balance Cards */}
        {loadingBalance ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white p-4 rounded-xl shadow border-l-4 border-gray-200 animate-pulse h-24" />)}
          </div>
        ) : balanceCards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {balanceCards.map((card, i) => (
              <div key={i} className={`bg-white p-4 rounded-xl shadow border-l-4 ${colorForType(
                balance.balances[i]?.leaveType
              )}`}>
                <p className="text-gray-500 text-xs font-medium mb-1">{card.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-800">{card.remaining}</p>
                  <p className="text-xs text-gray-400 mb-0.5">/ {card.allocated} remaining</p>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>Used: <b className="text-gray-600">{card.used}</b></span>
                  {card.pending > 0 && <span>Pending: <b className="text-yellow-600">{card.pending}</b></span>}
                  {!card.isPaid && <span className="text-red-400 font-medium">Unpaid</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-2 text-sm text-yellow-800">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            Leave balance initialize nahi hua hai — admin se contact karo ya year start pe initialize karwao.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {["apply", "history"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition
                ${activeTab === tab ? "bg-purple-600 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
              {tab === "apply" ? "Leave Apply Karo" : "Leave History"}
            </button>
          ))}
        </div>

        {/* ── Apply Tab ─────────────────────────────────────── */}
        {activeTab === "apply" && (
          <div className="bg-white rounded-xl shadow p-6 max-w-lg">
            <h3 className="font-semibold text-gray-700 mb-5 flex items-center gap-2">
              <Plus size={18} className="text-purple-500" />
              New Leave Application
            </h3>

            <div className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Leave Type *</label>
                <select name="leaveType" value={form.leaveType} onChange={handleChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {LEAVE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">From Date *</label>
                  <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">To Date *</label>
                  <input type="date" name="toDate" value={form.toDate} onChange={handleChange}
                    min={form.fromDate || new Date().toISOString().split("T")[0]}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              {/* Day count preview */}
              {dayCount > 0 && (
                <div className="bg-purple-50 text-purple-700 text-xs px-3 py-2 rounded-lg">
                  📅 <b>{dayCount} day{dayCount > 1 ? "s" : ""}</b> ki leave apply ho rahi hai
                </div>
              )}

              {/* Force LWP */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="forceAsLWP" name="forceAsLWP" checked={form.forceAsLWP}
                  onChange={handleChange} className="w-4 h-4 accent-purple-600" />
                <label htmlFor="forceAsLWP" className="text-sm text-gray-600">
                  Force as Leave Without Pay (balance nahi hai tab bhi)
                </label>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Reason *</label>
                <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
                  placeholder="Leave ka karan likhein..."
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                Leave apply karne ke baad principal ko approval email jaayegi. Approval ke baad attendance automatically ON_LEAVE mark ho jaayegi.
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition">
                {submitting ? <Loader size={16} className="animate-spin" /> : <PenLine size={16} />}
                {submitting ? "Submit ho raha hai..." : "Leave Apply Karo"}
              </button>
            </div>
          </div>
        )}

        {/* ── History Tab ─────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <CalendarDays size={18} className="text-purple-500" />
                Leave History
              </h3>
              <button onClick={fetchHistory} className="text-gray-400 hover:text-purple-500 transition" title="Refresh">
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Abhi tak koi leave apply nahi ki</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">From</th>
                      <th className="p-3">To</th>
                      <th className="p-3 text-center">Days</th>
                      <th className="p-3">LWP?</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Approved By</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((leave, i) => {
                      const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG["PENDING"];
                      const Icon = cfg.icon;
                      return (
                        <tr key={leave.id || i} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium whitespace-nowrap">
                            {LEAVE_LABEL[leave.leaveType] || leave.leaveType}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {leave.toDate ? new Date(leave.toDate).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td className="p-3 text-center">{leave.totalDays ?? "-"}</td>
                          <td className="p-3">
                            {leave.isLWP
                              ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">LWP</span>
                              : <span className="text-xs text-gray-400">No</span>}
                          </td>
                          <td className="p-3 max-w-[140px] truncate text-gray-500" title={leave.reason}>
                            {leave.reason || "-"}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                              <Icon size={11} />{cfg.label}
                            </span>
                            {leave.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1">{leave.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-3 text-xs text-gray-500">
                            {leave.approvedByName || "-"}
                          </td>
                          <td className="p-3">
                            {leave.status === "PENDING" && (
                              <button onClick={() => handleCancel(leave.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                                <X size={12} />Cancel
                              </button>
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
        )}
      </div>
    </div>
  );
}
