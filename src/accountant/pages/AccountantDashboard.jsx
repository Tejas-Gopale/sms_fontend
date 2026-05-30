// src/accountant/pages/AccountantDashboard.jsx
// Role: ACCOUNTANT — full finance management
// APIs integrated: Centered around configured Axios API instance

import { useState, useEffect, useCallback } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import API from "../../common/services/api"; // <--- Tumhari central API.js ka path yahan check kar lena ek baar bhai
import { getUserData } from "../../common/utils/tokenStorage";
import {
  IndianRupee, TrendingUp, TrendingDown, Receipt,
  Users, AlertCircle, Loader2, RefreshCw,
  Clock, CheckCircle, XCircle, Search, Eye, Zap, X, Banknote,
} from "lucide-react";

// ─── API helpers using central Axios instance ────────────────────────────────
const fetchStats = (schoolId) =>
  API.get(`/accountant/dashboard/stats`, { params: { schoolId } }).then((r) => r.data);

const fetchRecentTransactions = (schoolId, limit = 10) =>
  API.get(`/accountant/dashboard/recent-transactions`, { params: { schoolId, limit } }).then((r) => r.data);

const fetchOverdueFees = (schoolId) =>
  API.get(`/accountant/dashboard/overdue-fees`, { params: { schoolId } }).then((r) => r.data);

const postSendReminders = (schoolId, body = {}) =>
  API.post(`/accountant/dashboard/send-reminders`, { reminderType: "ALL", ...body }, { params: { schoolId } }).then((r) => r.data);

const fetchPendingUpiApi = (schoolId) =>
  API.get(`/api/payments/pending-upi?schoolId=${schoolId}`).then((r) => r.data);

const verifyUpiApi = (paymentId, action) =>
  API.post(`/api/payments/verify-upi/${paymentId}?action=${action}`).then((r) => r.data);

const fetchFeeLedgerApi = (schoolId) =>
  API.get(`/fees/students?schoolId=${schoolId}`).then((r) => r.data);

const fetchStudentDetailApi = (studentId) =>
  API.get(`/fees/student-detail/${studentId}`).then((r) => r.data);

const processPaymentApi = (studentFeeId, amount) =>
  API.post("/fees/pay", { studentFeeId, amount }).then((r) => r.data);

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmtINR = (val) => {
  if (val == null) return "—";
  if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)} Cr`;
  if (val >= 1_00_000)    return `₹${(val / 1_00_000).toFixed(1)} L`;
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

const fmtPct = (val) =>
  val == null ? "" : `${val >= 0 ? "+" : ""}${val.toFixed(1)}% vs last year`;

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = "green", loading }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <div className="h-8 w-28 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value}</p>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
        {loading && <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-1.5" />}
      </div>
      <div className={`p-2.5 rounded-xl bg-${color}-50 ml-3 shrink-0`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AccountantDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Accountant";
  const schoolId    = userData?.schoolId ?? localStorage.getItem("schoolId");

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats,        setStats]        = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [overdueFees,  setOverdueFees]  = useState([]);

  const [loadingStats,  setLoadingStats]  = useState(true);
  const [loadingTxns,   setLoadingTxns]   = useState(true);
  const [loadingOverdue, setLoadingOverdue] = useState(true);

  const [errorStats,   setErrorStats]   = useState(null);
  const [errorTxns,    setErrorTxns]    = useState(null);
  const [errorOverdue, setErrorOverdue] = useState(null);

  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult,   setReminderResult]   = useState(null);

  // ── Pending UPI state ──────────────────────────────────────────────────────
  const [pendingUpi,        setPendingUpi]        = useState([]);
  const [pendingUpiLoading, setPendingUpiLoading] = useState(false);
  const [verifyingId,       setVerifyingId]       = useState(null);

  // ── Fee Ledger state ───────────────────────────────────────────────────────
  const [feeLedger,       setFeeLedger]       = useState([]);
  const [ledgerLoading,   setLedgerLoading]   = useState(false);
  const [ledgerSearch,    setLedgerSearch]    = useState("");
  const [ledgerFilter,    setLedgerFilter]    = useState("outstanding");
  const [feeDetail,       setFeeDetail]       = useState(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount,   setPaymentAmount]   = useState("");
  const [payingFee,       setPayingFee]       = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    if (!schoolId) return;
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const data = await fetchStats(schoolId);
      setStats(data);
    } catch (err) {
      setErrorStats("Stats load nahi ho sake.");
    } finally {
      setLoadingStats(false);
    }
  }, [schoolId]);

  const loadTransactions = useCallback(async () => {
    if (!schoolId) return;
    setLoadingTxns(true);
    setErrorTxns(null);
    try {
      const data = await fetchRecentTransactions(schoolId, 10);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorTxns("Transactions load nahi ho sake.");
    } finally {
      setLoadingTxns(false);
    }
  }, [schoolId]);

  const loadOverdueFees = useCallback(async () => {
    if (!schoolId) return;
    setLoadingOverdue(true);
    setErrorOverdue(null);
    try {
      const data = await fetchOverdueFees(schoolId);
      setOverdueFees(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorOverdue("Overdue fees load nahi ho sake.");
    } finally {
      setLoadingOverdue(false);
    }
  }, [schoolId]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadStats();
    loadTransactions();
    loadOverdueFees();
    loadPendingUpi();
    loadFeeLedger();
  }, [loadStats, loadTransactions, loadOverdueFees]);

  // ── Pending UPI ────────────────────────────────────────────────────────────
  const loadPendingUpi = async () => {
    if (!schoolId) return;
    setPendingUpiLoading(true);
    try {
      const data = await fetchPendingUpiApi(schoolId);
      setPendingUpi(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore
    } finally {
      setPendingUpiLoading(false);
    }
  };

  const handleVerifyUpi = async (paymentId, action) => {
    setVerifyingId(paymentId);
    try {
      await verifyUpiApi(paymentId, action);
      loadPendingUpi();
      loadFeeLedger();
    } catch {
      // silently ignore
    } finally {
      setVerifyingId(null);
    }
  };

  // ── Fee Ledger ─────────────────────────────────────────────────────────────
  const loadFeeLedger = async () => {
    if (!schoolId) return;
    setLedgerLoading(true);
    try {
      const data = await fetchFeeLedgerApi(schoolId);
      setFeeLedger(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore
    } finally {
      setLedgerLoading(false);
    }
  };

  const loadStudentDetail = async (studentId) => {
    setDetailLoading(true);
    try {
      const data = await fetchStudentDetailApi(studentId);
      setFeeDetail(data);
    } catch {
      // silently ignore
    } finally {
      setDetailLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0 || amt > selectedStudent.dueAmount) return;
    setPayingFee(true);
    try {
      await processPaymentApi(selectedStudent.studentFeeId, amt);
      setSelectedStudent(null);
      setPaymentAmount("");
      loadFeeLedger();
      loadStats();
    } catch {
      // silently ignore
    } finally {
      setPayingFee(false);
    }
  };

  // ── Send Reminders ─────────────────────────────────────────────────────────
  const handleSendReminders = async () => {
    if (!schoolId || sendingReminders) return;
    setSendingReminders(true);
    setReminderResult(null);
    try {
      const result = await postSendReminders(schoolId, { reminderType: "ALL" });
      setReminderResult(result);
    } catch (err) {
      setReminderResult({ error: "Reminders bhejne mein problem aayi." });
    } finally {
      setSendingReminders(false);
    }
  };

  // ── Stat card data mapping ─────────────────────────────────────────────────
  const statCards = [
    {
      icon: IndianRupee,
      label: "Total Collected (May)",
      value: fmtINR(stats?.totalCollectedThisMonth),
      sub: stats?.monthlyTarget ? `Target: ${fmtINR(stats.monthlyTarget)}` : "Target: —",
      color: "green",
    },
    {
      icon: TrendingUp,
      label: "Revenue (Annual)",
      value: fmtINR(stats?.totalAnnualRevenue),
      sub: fmtPct(stats?.annualRevenueChangePercent),
      color: "blue",
    },
    {
      icon: TrendingDown,
      label: "Expenses (May)",
      value: fmtINR(stats?.totalExpensesThisMonth),
      sub: stats?.expensesNote || "Salaries + operations",
      color: "red",
    },
    {
      icon: AlertCircle,
      label: "Pending Fees",
      value: fmtINR(stats?.totalPendingAmount),
      sub: stats?.pendingStudentCount != null ? `From ${stats.pendingStudentCount} students` : "—",
      color: "yellow",
    },
    {
      icon: Receipt,
      label: "Receipts Generated",
      value: stats?.receiptsThisMonth ?? "—",
      sub: "This month",
      color: "purple",
    },
    {
      icon: Users,
      label: "Defaulters (>30 days)",
      value: stats?.defaulterCount ?? "—",
      sub: "Follow-up required",
      color: "red",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Finance Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName} · Full financial access</p>
          </div>
          <button
            onClick={() => { loadStats(); loadTransactions(); loadOverdueFees(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Stat Cards Error */}
          {errorStats && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {errorStats}
              <button onClick={loadStats} className="ml-2 underline">Retry</button>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((c) => (
              <StatCard key={c.label} {...c} loading={loadingStats} />
            ))}
          </div>

          {/* Transactions + Overdue Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
                <a href="/accountant/fees" className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                  View all →
                </a>
              </div>

              {loadingTxns && (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {!loadingTxns && errorTxns && (
                <div className="text-sm text-red-500 py-4 text-center">
                  {errorTxns}
                  <button onClick={loadTransactions} className="ml-2 underline">Retry</button>
                </div>
              )}

              {!loadingTxns && !errorTxns && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["ID", "Student", "Class", "Amount", "Type", "Date", "Status"].map((h) => (
                          <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 text-sm">
                            Koi transactions nahi mili.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.txnId} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2.5 text-gray-400 text-xs">{t.txnId}</td>
                            <td className="py-2.5 font-medium text-gray-800">{t.studentName}</td>
                            <td className="py-2.5 text-gray-500">{t.className}</td>
                            <td className="py-2.5 text-gray-800 font-medium">{fmtINR(t.amount)}</td>
                            <td className="py-2.5 text-gray-600">{t.feeType}</td>
                            <td className="py-2.5 text-gray-500">{t.date}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                t.status === "Paid"    ? "bg-green-100 text-green-700"  :
                                t.status === "Partial" ? "bg-yellow-100 text-yellow-700":
                                                         "bg-red-100 text-red-600"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Overdue Fees Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" /> Overdue Fees
              </h2>

              {loadingOverdue && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {!loadingOverdue && errorOverdue && (
                <div className="text-sm text-red-500 py-4 text-center">
                  {errorOverdue}
                  <button onClick={loadOverdueFees} className="ml-2 underline">Retry</button>
                </div>
              )}

              {!loadingOverdue && !errorOverdue && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {overdueFees.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Koi overdue fees nahi!</p>
                  ) : (
                    overdueFees.map((p) => (
                      <div key={p.studentFeeId} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800">{p.studentName}</p>
                        <p className="text-xs text-gray-500">{p.className}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-bold text-red-600">{fmtINR(p.dueAmount)}</span>
                          <span className="text-xs text-red-400">Overdue: {p.overdueDays} days</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {reminderResult && !reminderResult.error && (
                <div className="mt-3 p-2.5 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                  ✓ {reminderResult.sentCount} sent
                  {reminderResult.failedCount > 0 && `, ${reminderResult.failedCount} failed`}
                </div>
              )}
              {reminderResult?.error && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  {reminderResult.error}
                </div>
              )}

              <button
                onClick={handleSendReminders}
                disabled={sendingReminders || loadingOverdue || overdueFees.length === 0}
                className="mt-4 w-full py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {sendingReminders ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reminders"
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Collect Fee",       href: "/accountant/fees"     },
                { label: "Generate Report",   href: "/accountant/reports"  },
                { label: "Manage Payroll",    href: "/accountant/payroll"  },
                { label: "View Expenses",     href: "/accountant/expenses" },
                { label: "Revenue Analytics", href: "/accountant/revenue"  },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}