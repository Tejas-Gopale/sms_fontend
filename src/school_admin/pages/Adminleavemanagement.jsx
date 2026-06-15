
import { useState, useEffect, useCallback } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  ClipboardList, CheckCircle, XCircle, Clock, AlertCircle,
  Plus, Settings, RefreshCw, Loader, X, Save, ChevronDown,
  Users, CalendarDays, Info, Search, Pencil, Trash2,
} from "lucide-react";    

// ── Constants from backend enums ──────────────────────────────────────────
const LEAVE_TYPES = [
  { value: "CASUAL_LEAVE",      label: "Casual Leave (CL)"      },
  { value: "SICK_LEAVE",        label: "Sick Leave (SL)"         },
  { value: "EARNED_LEAVE",      label: "Earned Leave (EL)"       },
  { value: "MATERNITY_LEAVE",   label: "Maternity Leave"         },
  { value: "PATERNITY_LEAVE",   label: "Paternity Leave"         },
];
// LEAVE_WITHOUT_PAY is intentionally excluded from policy creation (no balance)

const LEAVE_LABEL = Object.fromEntries(LEAVE_TYPES.map(({ value, label }) => [value, label]));
LEAVE_LABEL["LEAVE_WITHOUT_PAY"] = "Leave Without Pay (LWP)";

const EMP_CATEGORIES = [
  { value: "TEACHER", label: "Teacher" },
  { value: "STAFF",   label: "Staff"   },
];

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock        },
  APPROVED:  { label: "Approved",  color: "bg-green-100 text-green-700 border-green-300",    icon: CheckCircle  },
  REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-700 border-red-300",          icon: XCircle      },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500 border-gray-300",       icon: X            },
  REVOKED:   { label: "Revoked",   color: "bg-orange-100 text-orange-700 border-orange-300", icon: AlertCircle  },
};

// ── Reusable small components ──────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
      ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminLeaveManagement() {
  const userData = getUserData();
  const schoolId = userData?.schoolId
    ? Number(userData.schoolId)
    : Number(localStorage.getItem("schoolId"));
  const currentYear = new Date().getFullYear();
  const adminUserId = userData?.userId ? Number(userData.userId) : null;

  const [activeTab, setActiveTab] = useState("pending");
  const [toast, setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  // ── 1. PENDING APPROVALS ──────────────────────────────────────────────────
  const [pending,        setPending]        = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actioningId,    setActioningId]    = useState(null); // which leave is being actioned
  const [rejectModal,    setRejectModal]    = useState(null); // { leaveId }
  const [rejectReason,   setRejectReason]   = useState("");

  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const res = await API.get(`/leave/pending/${schoolId}`);
      setPending(res.data?.applications || []);
    } catch (err) {
      console.error("Pending fetch error:", err);
    } finally {
      setLoadingPending(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === "pending") fetchPending();
  }, [activeTab, fetchPending]);

  const handleApprove = async (leaveId) => {
    setActioningId(leaveId);
    try {
      await API.post(`/leave/${leaveId}/approve`, {
        approvedByUserId: adminUserId,
        remarks: "Approved by admin",
      });
      showToast("success", "Leave approve ho gayi ✅ Attendance auto-mark ho jaayegi.");
      fetchPending();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Approve karne mein error ❌");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) { showToast("error", "Rejection reason likhna zaroori hai"); return; }
    setActioningId(rejectModal.leaveId);
    try {
      await API.post(`/leave/${rejectModal.leaveId}/reject`, {
        rejectedByUserId: adminUserId,
        rejectionReason: rejectReason,
      });
      showToast("success", "Leave reject ho gayi.");
      setRejectModal(null);
      setRejectReason("");
      fetchPending();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Reject karne mein error ❌");
    } finally {
      setActioningId(null);
    }
  };

  // ── 2. LEAVE POLICIES ─────────────────────────────────────────────────────
  const [policies,       setPolicies]       = useState([]);
  const [loadingPolicy,  setLoadingPolicy]  = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy,  setEditingPolicy]  = useState(null); // policy object or null
  const [savingPolicy,   setSavingPolicy]   = useState(false);

  const EMPTY_POLICY = {
    employeeCategory: "TEACHER",
    leaveType:        "CASUAL_LEAVE",
    annualQuota:      "",
    monthlyQuota:     "",
    isPaid:           true,
    carryForward:     false,
  };
  const [policyForm, setPolicyForm] = useState(EMPTY_POLICY);

  const fetchPolicies = useCallback(async () => {
    setLoadingPolicy(true);
    try {
      const res = await API.get(`/leave-policy/school/${schoolId}`);
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Policy fetch error:", err);
    } finally {
      setLoadingPolicy(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === "policies") fetchPolicies();
  }, [activeTab, fetchPolicies]);

  const openPolicyEdit = (p) => {
    setEditingPolicy(p);
    setPolicyForm({
      employeeCategory: p.employeeCategory,
      leaveType:        p.leaveType,
      annualQuota:      p.annualQuota ?? "",
      monthlyQuota:     p.monthlyQuota ?? "",
      isPaid:           p.isPaid ?? true,
      carryForward:     p.carryForward ?? false,
    });
    setShowPolicyForm(true);
  };

  const openPolicyCreate = () => {
    setEditingPolicy(null);
    setPolicyForm(EMPTY_POLICY);
    setShowPolicyForm(true);
  };

  const handleSavePolicy = async () => {
    if (!policyForm.annualQuota) { showToast("error", "Annual quota likhna zaroori hai"); return; }
    setSavingPolicy(true);
    try {
      const payload = {
        schoolId,
        employeeCategory: policyForm.employeeCategory,
        leaveType:        policyForm.leaveType,
        annualQuota:      Number(policyForm.annualQuota),
        monthlyQuota:     policyForm.monthlyQuota ? Number(policyForm.monthlyQuota) : null,
        isPaid:           policyForm.isPaid,
        carryForward:     policyForm.carryForward,
      };
      if (editingPolicy) {
        await API.put(`/leave-policy/${editingPolicy.id}`, payload);
        showToast("success", "Policy update ho gayi ✅");
      } else {
        await API.post("/leave-policy", payload);
        showToast("success", "Policy create ho gayi ✅");
      }
      setShowPolicyForm(false);
      fetchPolicies();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Policy save nahi ho payi ❌");
    } finally {
      setSavingPolicy(false);
    }
  };

  // ── 3. INITIALIZE BALANCES ────────────────────────────────────────────────
  const [initYear,     setInitYear]     = useState(currentYear);
  const [initializing, setInitializing] = useState(false);
  const [initDone,     setInitDone]     = useState(false);

  const handleInitBalances = async () => {
    if (!window.confirm(`${initYear} ke liye saare teachers + staff ke leave balances initialize karein?`)) return;
    setInitializing(true);
    setInitDone(false);
    try {
      await API.post(`/leave-policy/initialize-balances`, null, {
        params: { schoolId, year: initYear },
      });
      showToast("success", `${initYear} ke liye leave balances initialize ho gaye ✅`);
      setInitDone(true);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Initialize nahi ho payi ❌");
    } finally {
      setInitializing(false);
    }
  };

  // ── 4. ALL LEAVE HISTORY ──────────────────────────────────────────────────
  const [historyTeacherId, setHistoryTeacherId] = useState("");
  const [historyData,      setHistoryData]      = useState([]);
  const [loadingHistory,   setLoadingHistory]   = useState(false);
  const [historySearched,  setHistorySearched]  = useState(false);

  const fetchHistory = async () => {
    if (!historyTeacherId.trim()) { showToast("error", "Teacher ID dalo pehle"); return; }
    setLoadingHistory(true);
    setHistorySearched(true);
    try {
      const res = await API.get(`/leave/history/teacher/${historyTeacherId}`);
      setHistoryData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("error", err.response?.data?.message || "History fetch nahi ho payi");
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ── 5. TEACHER BALANCES ───────────────────────────────────────────────────
  const [balancesYear,       setBalancesYear]       = useState(currentYear);
  const [teacherBalances,    setTeacherBalances]    = useState([]);
  const [loadingBalances,    setLoadingBalances]    = useState(false);
  const [initMissingLoading, setInitMissingLoading] = useState(false);

  const fetchTeacherBalances = useCallback(async () => {
    setLoadingBalances(true);
    try {
      const res = await API.get(`/leave-policy/teacher-balances/${schoolId}`, {
        params: { year: balancesYear },
      });
      setTeacherBalances(res.data || []);
    } catch (err) {
      showToast("error", "Teacher balances fetch nahi hue");
    } finally {
      setLoadingBalances(false);
    }
  }, [schoolId, balancesYear]);

  useEffect(() => {
    if (activeTab === "teacher-balances") fetchTeacherBalances();
  }, [activeTab, fetchTeacherBalances]);

  const handleInitMissingBalances = async () => {
    if (!window.confirm(
      `${balancesYear} ke liye existing teachers ke missing leave balance rows fill karein?\n\nYeh safe hai — jo pehle se hain wo skip ho jaayenge.`
    )) return;
    setInitMissingLoading(true);
    try {
      await API.post("/leave-policy/initialize-teacher-balances", null, {
        params: { schoolId, year: balancesYear },
      });
      showToast("success", `Missing teacher balances fill ho gaye (${balancesYear}) ✅`);
      fetchTeacherBalances();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Initialize nahi ho paya ❌");
    } finally {
      setInitMissingLoading(false);
    }
  };

  // ── Tab definitions ────────────────────────────────────────────────────────
  const tabs = [
    { key: "pending",          label: "Pending Approvals",    icon: Clock,         badge: pending.length },
    { key: "policies",         label: "Leave Policies",        icon: Settings       },
    { key: "teacher-balances", label: "Teacher Balances",      icon: Users          },
    { key: "init",             label: "Initialize Balances",   icon: RefreshCw      },
    { key: "history",          label: "Leave History",         icon: CalendarDays   },
  ];

  // Delete (deactivate) a policy
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Is policy ko deactivate karein?")) return;
    try {
      await API.delete(`/leave-policy/${policyId}`);
      showToast("success", "Policy deactivate ho gayi ✅");
      fetchPolicies();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Delete nahi ho paya ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SchoolAdminSidebar />

      <div className="flex-1 p-6">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList size={28} className="text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
            <p className="text-sm text-gray-500">Policies set karo, approvals do, balances initialize karo</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(({ key, label, icon: Icon, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                ${activeTab === key ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
              <Icon size={15} />{label}
              {badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: PENDING APPROVALS ──────────────────────────────────────── */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Clock size={18} className="text-yellow-500" />
                Pending Leave Requests
                {pending.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {pending.length}
                  </span>
                )}
              </h3>
              <button onClick={fetchPending} className="text-gray-400 hover:text-indigo-500 transition">
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingPending ? (
              <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />Loading...
              </div>
            ) : pending.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Koi pending leave nahi hai 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">From</th>
                      <th className="p-3">To</th>
                      <th className="p-3 text-center">Days</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">LWP?</th>
                      <th className="p-3">Applied</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((leave) => (
                      <tr key={leave.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-semibold text-gray-800">{leave.employeeName || "—"}</p>
                          <p className="text-xs text-gray-400">{leave.employeeCode || (leave.teacherId ? `T-${leave.teacherId}` : `S-${leave.staffId}`)}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium">
                          {LEAVE_LABEL[leave.leaveType] || leave.leaveType}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {leave.toDate ? new Date(leave.toDate).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="p-3 text-center font-bold">{leave.totalDays ?? "—"}</td>
                        <td className="p-3 max-w-[160px] truncate text-gray-500" title={leave.reason}>
                          {leave.reason || "—"}
                        </td>
                        <td className="p-3">
                          {leave.isLWP
                            ? <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded border border-red-200">LWP</span>
                            : <span className="text-gray-400 text-xs">No</span>}
                        </td>
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                          {leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(leave.id)}
                              disabled={actioningId === leave.id}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              {actioningId === leave.id
                                ? <Loader size={12} className="animate-spin" />
                                : <CheckCircle size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejectModal({ leaveId: leave.id }); setRejectReason(""); }}
                              disabled={actioningId === leave.id}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              <XCircle size={12} />Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: LEAVE POLICIES ─────────────────────────────────────────── */}
        {activeTab === "policies" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-700">Leave Policies</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Har employee category ke liye kitni leave milegi per year — yahi se balances set hote hain
                </p>
              </div>
              <button onClick={openPolicyCreate}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                <Plus size={16} />New Policy
              </button>
            </div>

            {loadingPolicy ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />Loading policies...
              </div>
            ) : policies.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center">
                <Settings size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Koi policy nahi banai abhi tak</p>
                <p className="text-xs text-gray-400 mt-1">Pehle policies banao, phir balances initialize karo</p>
                <button onClick={openPolicyCreate}
                  className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                  Pehli Policy Banao
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Leave Type</th>
                      <th className="p-3 text-center">Annual Quota</th>
                      <th className="p-3 text-center">Monthly Cap</th>
                      <th className="p-3 text-center">Paid?</th>
                      <th className="p-3 text-center">Carry Forward?</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full
                            ${p.employeeCategory === "TEACHER"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"}`}>
                            {p.employeeCategory}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{LEAVE_LABEL[p.leaveType] || p.leaveType}</td>
                        <td className="p-3 text-center font-bold text-gray-800">{p.annualQuota ?? "—"}</td>
                        <td className="p-3 text-center text-gray-500">{p.monthlyQuota ?? "—"}</td>
                        <td className="p-3 text-center">
                          {p.isPaid
                            ? <span className="text-green-600 font-semibold text-xs">✅ Paid</span>
                            : <span className="text-red-500 text-xs">Unpaid</span>}
                        </td>
                        <td className="p-3 text-center">
                          {p.carryForward
                            ? <span className="text-blue-600 text-xs font-semibold">Yes</span>
                            : <span className="text-gray-400 text-xs">No</span>}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openPolicyEdit(p)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline">
                              Edit
                            </button>
                            <button onClick={() => handleDeletePolicy(p.id)}
                              className="text-red-400 hover:text-red-600 text-xs font-semibold underline">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: TEACHER BALANCES ──────────────────────────────────────── */}
        {activeTab === "teacher-balances" && (
          <div>
            <div className="flex flex-wrap items-end gap-4 mb-5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kis Year Ka Balance?</label>
                <select value={balancesYear} onChange={(e) => setBalancesYear(Number(e.target.value))}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm">
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={fetchTeacherBalances}
                className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline">
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={handleInitMissingBalances}
                disabled={initMissingLoading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition ml-auto"
              >
                {initMissingLoading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Missing Balances Fill Karo
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-xs text-blue-800">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <b>"Missing Balances Fill Karo"</b> — jab naya teacher add ho ya naya policy type add karo, toh yeh button dabo.
                Existing records safe rehte hain.
              </div>
            </div>

            {loadingBalances ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />Loading teacher balances...
              </div>
            ) : teacherBalances.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center">
                <Users size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {balancesYear} ke liye koi balance data nahi mila
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  "Initialize Balances" tab se pehle balances initialize karo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teacherBalances.map((teacher) => (
                  <div key={teacher.teacherId} className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{teacher.employeeName}</h3>
                        <p className="text-xs text-gray-400">
                          Teacher ID: {teacher.teacherId} · Year: {teacher.year}
                        </p>
                      </div>
                    </div>
                    {teacher.balances?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {teacher.balances.map((b) => (
                          <div key={b.leaveType}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-2">
                              {LEAVE_LABEL[b.leaveType] || b.leaveType}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total</span>
                                <span className="font-semibold text-gray-700">{b.totalAllocated}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Used</span>
                                <span className="font-semibold text-red-500">{b.usedDays}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Pending</span>
                                <span className="font-semibold text-yellow-500">{b.pendingDays}</span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                <span className="text-gray-500 font-medium">Baki</span>
                                <span className={`font-bold ${b.remainingDays > 0 ? "text-green-600" : "text-red-500"}`}>
                                  {b.remainingDays}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Is teacher ke liye {balancesYear} mein koi balance nahi mila —
                        <button onClick={handleInitMissingBalances}
                          className="text-indigo-600 hover:underline ml-1 font-medium">
                          Missing Balances Fill Karo
                        </button>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: INITIALIZE BALANCES ────────────────────────────────────── */}
        {activeTab === "init" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <RefreshCw size={18} className="text-indigo-500" />
                Initialize Leave Balances
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Yeh action saare active teachers + staff ke liye selected year ki leave balance rows create kar deta hai —
                already existing records skip ho jaate hain (safe to re-run).
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 flex items-start gap-2 text-sm text-blue-800">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Kab run karna chahiye?</p>
                  <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside">
                    <li>Har naye academic year ke start mein (Jan 1 ya school calendar ke hisaab se)</li>
                    <li>Jab koi naya teacher onboard ho — uske baad yeh run karo taaki uske balances bhi create ho jaayein</li>
                    <li>Agar policies update ki hain toh dobara run kar sakte ho</li>
                  </ul>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm text-gray-500 mb-1">Kis Year Ke Liye?</label>
                <select value={initYear} onChange={(e) => setInitYear(Number(e.target.value))}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleInitBalances} disabled={initializing}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold transition">
                {initializing ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {initializing ? "Initialize ho raha hai..." : `${initYear} Ka Balance Initialize Karo`}
              </button>

              {initDone && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Balance initialize ho gaye! Teachers aur staff ab apni leave dekh sakte hain.
                </div>
              )}
            </div>

            {/* Quick guide */}
            <div className="bg-white rounded-xl shadow p-5 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                📋 Leave Setup Checklist
              </h4>
              <ol className="space-y-3 text-sm text-gray-600">
                {[
                  { step: "1", text: "Leave Policies tab mein TEACHER category ke liye policies banao (CL, SL, EL)", done: policies.length > 0 },
                  { step: "2", text: "Teachers onboard karo (Teachers page se)", done: true },
                  { step: "3", text: "Yahan Initialize Balances run karo — ek baar per year kaafi hai", done: initDone },
                  { step: "4", text: "Teachers ab apni leave apply kar sakte hain aur tum yahan approve kar sakte ho", done: false },
                ].map(({ step, text, done }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                      ${done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {done ? "✓" : step}
                    </span>
                    <span className={done ? "text-gray-400 line-through" : ""}>{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* ── TAB: ALL LEAVE HISTORY ───────────────────────────────────────── */}
        {activeTab === "history" && (
          <div>
            {/* Search by teacher ID */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Search size={16} className="text-indigo-500" />
                Teacher Leave History Search
              </h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={historyTeacherId}
                  onChange={(e) => setHistoryTeacherId(e.target.value)}
                  placeholder="Teacher ID dalo (e.g. 42)"
                  className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                />
                <button onClick={fetchHistory} disabled={loadingHistory}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm transition">
                  {loadingHistory ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
                  Search
                </button>
              </div>
            </div>

            {historySearched && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {loadingHistory ? (
                  <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />Loading...
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Is teacher ke liye koi leave record nahi mila</div>
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
                          <th className="p-3">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.map((leave, i) => (
                          <tr key={leave.id || i} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium whitespace-nowrap">
                              {LEAVE_LABEL[leave.leaveType] || leave.leaveType}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {leave.toDate ? new Date(leave.toDate).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td className="p-3 text-center font-bold">{leave.totalDays ?? "—"}</td>
                            <td className="p-3">
                              {leave.isLWP
                                ? <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded border border-red-200">LWP</span>
                                : <span className="text-gray-400 text-xs">No</span>}
                            </td>
                            <td className="p-3 max-w-[140px] truncate text-gray-500" title={leave.reason}>
                              {leave.reason || "—"}
                            </td>
                            <td className="p-3"><StatusBadge status={leave.status} /></td>
                            <td className="p-3 text-xs text-gray-500">{leave.approvedByName || "—"}</td>
                            <td className="p-3 text-xs text-red-500">{leave.rejectionReason || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Policy Create/Edit Modal ────────────────────────────────────────── */}
      {showPolicyForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">
                {editingPolicy ? "Policy Edit Karo" : "Nayi Policy Banao"}
              </h3>
              <button onClick={() => setShowPolicyForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Employee Category *</label>
                <select value={policyForm.employeeCategory}
                  onChange={(e) => setPolicyForm(p => ({ ...p, employeeCategory: e.target.value }))}
                  disabled={!!editingPolicy}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50">
                  {EMP_CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Leave Type *</label>
                <select value={policyForm.leaveType}
                  onChange={(e) => setPolicyForm(p => ({ ...p, leaveType: e.target.value }))}
                  disabled={!!editingPolicy}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50">
                  {LEAVE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Annual Quota */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Annual Quota (days) *</label>
                <input type="number" min="0" value={policyForm.annualQuota}
                  onChange={(e) => setPolicyForm(p => ({ ...p, annualQuota: e.target.value }))}
                  placeholder="e.g. 12"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              {/* Monthly Cap */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Monthly Cap (optional)</label>
                <input type="number" min="0" value={policyForm.monthlyQuota}
                  onChange={(e) => setPolicyForm(p => ({ ...p, monthlyQuota: e.target.value }))}
                  placeholder="e.g. 1 (ek mahine mein max 1)"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>

              {/* Paid + Carry Forward */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={policyForm.isPaid}
                    onChange={(e) => setPolicyForm(p => ({ ...p, isPaid: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-600" />
                  Paid Leave
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={policyForm.carryForward}
                    onChange={(e) => setPolicyForm(p => ({ ...p, carryForward: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-600" />
                  Carry Forward
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => setShowPolicyForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium">
                Cancel
              </button>
              <button onClick={handleSavePolicy} disabled={savingPolicy}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                {savingPolicy ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {editingPolicy ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ─────────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">Leave Reject Karo</h3>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm text-gray-500 mb-2">Rejection Reason *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                rows={3} placeholder="Rejection ka karan likhein..."
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium">
                Cancel
              </button>
              <button onClick={handleRejectSubmit} disabled={actioningId === rejectModal?.leaveId}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                {actioningId === rejectModal?.leaveId ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject Karo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}