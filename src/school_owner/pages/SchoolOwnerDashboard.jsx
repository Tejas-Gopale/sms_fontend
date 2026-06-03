// src/owner/pages/OwnerRevenueDashboard.jsx
// Role: SCHOOL_OWNER / SCHOOL_ADMIN / PRINCIPAL  (read-only financial view)
//
// API consumed:
//   GET /expenses/school/{schoolId}/financial-summary?academicYear=2025-2026
//
// Response shape (SchoolFinancialSummaryResponse):
//   totalFeeCollected    Double  — cumulative fee paid by students (all years*)
//   totalFeePending      Double  — fee still owed by students
//   totalExpenses        Double  — sum of APPROVED operational expenses (selected year)
//   expenseByCategory    Map<String,Double> — per-category approved totals
//   totalSalaryPaid      Double  — finalized payroll net payable (selected year)
//   netBalance           Double  — totalFeeCollected − totalExpenses − totalSalaryPaid
//   netBalanceLabel      String  — "PROFIT" or "LOSS"
//   pendingApprovalCount Integer — PENDING expenses awaiting admin review
//   totalExpenseEntries  Integer — all expense records for the selected year
//
// *Note: The backend currently sums totalFeeCollected across ALL academic years.
//        totalExpenses and totalSalaryPaid are filtered to the selected year.
//        This is by design in the backend; a banner below informs the owner.
//
// Live calculation (example):
//   Fee Income:      ₹5,00,000
//   Less: Salaries:  ₹3,00,000   ← from finalized payroll records
//   Less: Expenses:  ₹50,000     ← from APPROVED school expenses only
//   ──────────────────────────
//   Net Revenue:     ₹1,50,000   ← PROFIT
//
//   When a new ₹20,000 expense is added and approved:
//   totalExpenses becomes ₹70,000 → netBalance drops to ₹1,30,000 (auto-refreshed)

import { useState, useEffect, useCallback } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  TrendingUp, TrendingDown, IndianRupee, Users, Receipt,
  Clock, RefreshCw, Loader2, AlertCircle, AlertTriangle,
  ChevronDown, CheckCircle, BarChart3, Wallet, Building2,
  ArrowRight, Info,
} from "lucide-react";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchFinancialSummary = (schoolId, academicYear) =>
  API.get(`/expenses/school/${schoolId}/financial-summary`, {
    params: { academicYear },
  }).then((r) => r.data);

// ─── Academic Year Helpers ────────────────────────────────────────────────────

/** Current Indian academic year (Apr–Mar). June 2026 → "2026-2027". */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

/** Generate the last `count` academic year strings, most recent first. */
const generateAcademicYears = (count = 5) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const currentStart = month >= 4 ? year : year - 1;
  return Array.from({ length: count }, (_, i) => {
    const y = currentStart - i;
    return `${y}-${y + 1}`;
  });
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtINR = (val) => {
  if (val == null || isNaN(val)) return "—";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

/** Returns a short human-readable name for a backend ExpenseCategory enum value. */
const formatCategoryName = (enumVal) =>
  (enumVal || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Single KPI stat card.
 * @param {object} props
 * @param {React.ElementType} props.icon
 * @param {string}  props.label
 * @param {string}  props.value
 * @param {string}  [props.sub]
 * @param {string}  props.accent   — Tailwind color key ("yellow"|"blue"|"red"|"green")
 * @param {boolean} [props.loading]
 */
function KPICard({ icon: Icon, label, value, sub, accent, loading }) {
  const bg   = { yellow:"bg-yellow-50", blue:"bg-blue-50",  red:"bg-red-50",  green:"bg-green-50" };
  const text = { yellow:"text-yellow-600", blue:"text-blue-600", red:"text-red-600", green:"text-green-700" };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`p-2.5 rounded-xl ${bg[accent] || bg.blue}`}>
          <Icon size={18} className={text[accent] || text.blue} />
        </div>
      </div>
      {loading ? (
        <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-gray-800 tracking-tight leading-none">{value}</p>
      )}
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

/**
 * One row in the expense category breakdown.
 * Shows category name, a proportional fill bar, and the amount.
 */
function CategoryBar({ name, amount, totalExpenses, loading }) {
  const pct = totalExpenses > 0 ? Math.min(100, (amount / totalExpenses) * 100) : 0;
  const fmtPct = pct.toFixed(1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 truncate max-w-[60%]">{name}</span>
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <span className="text-xs text-gray-400">{fmtPct}%</span>
              <span className="font-semibold text-gray-800">{fmtINR(amount)}</span>
            </>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: loading ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * The key section: shows the net-revenue formula step-by-step.
 * Validates that the arithmetic matches the backend's netBalance.
 * This is the "source of truth" view the school owner needs.
 */
function NetRevenueCalculation({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const { totalFeeCollected, totalSalaryPaid, totalExpenses, netBalance, netBalanceLabel } = data;

  // Cross-validate: computed vs backend (both round to 2 decimal places)
  const computed = Math.round((totalFeeCollected - totalSalaryPaid - totalExpenses) * 100) / 100;
  const backend  = Math.round(netBalance * 100) / 100;
  const mismatch = Math.abs(computed - backend) > 0.01;

  const isProfit = netBalanceLabel === "PROFIT";

  const rows = [
    {
      icon: <IndianRupee size={15} className="text-green-600" />,
      label: "Total Fees Collected",
      sign:  "",
      value: totalFeeCollected,
      note:  "From student fee payments",
      color: "text-green-700",
    },
    {
      icon: <Users size={15} className="text-orange-500" />,
      label: "Salary Paid",
      sign:  "−",
      value: totalSalaryPaid,
      note:  "Finalized payroll (this year)",
      color: "text-gray-700",
    },
    {
      icon: <Receipt size={15} className="text-blue-500" />,
      label: "Other Expenses",
      sign:  "−",
      value: totalExpenses,
      note:  "Approved expenses (this year)",
      color: "text-gray-700",
    },
  ];

  return (
    <div className="space-y-1">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
              {row.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{row.label}</p>
              <p className="text-xs text-gray-400">{row.note}</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 shrink-0">
            {row.sign && (
              <span className="text-base font-bold text-red-400">{row.sign}</span>
            )}
            <span className={`text-base font-bold ${row.color}`}>{fmtINR(row.value)}</span>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-200 mx-4 my-2" />

      {/* Net result */}
      <div
        className={`flex items-center justify-between px-4 py-4 rounded-xl border-2 ${
          isProfit
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isProfit ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isProfit
              ? <TrendingUp size={15} className="text-green-600" />
              : <TrendingDown size={15} className="text-red-600" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Net Revenue</p>
            <p className="text-xs text-gray-400">= Fees − Salary − Expenses</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${isProfit ? "text-green-700" : "text-red-600"}`}>
            {isProfit ? "" : "−"}{fmtINR(Math.abs(netBalance))}
          </p>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              isProfit
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {netBalanceLabel}
          </span>
        </div>
      </div>

      {/* Warn if frontend compute ≠ backend figure (should never happen in prod) */}
      {mismatch && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
          <AlertTriangle size={13} />
          <span>
            Computed net ({fmtINR(computed)}) does not match server figure ({fmtINR(backend)}).
            Please refresh or contact support.
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Inline alert banner shown when the owner has pending expenses that
 * are NOT yet approved — these are excluded from the net calculation.
 */
function PendingAlert({ count, loading }) {
  if (loading || !count) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div className="mt-0.5 p-1.5 bg-yellow-100 rounded-lg shrink-0">
        <Clock size={14} className="text-yellow-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-yellow-800">
          {count} expense{count !== 1 ? "s" : ""} pending approval
        </p>
        <p className="text-xs text-yellow-700 mt-0.5">
          These are not yet included in the net revenue calculation. Ask the
          admin or principal to approve or reject them.
        </p>
      </div>
      <ArrowRight size={14} className="text-yellow-500 mt-0.5 shrink-0" />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function OwnerRevenueDashboard() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ?? localStorage.getItem("schoolId");

  const YEAR_OPTIONS = generateAcademicYears(6);

  const [academicYear,  setAcademicYear] = useState(getCurrentAcademicYear());
  const [data,          setData]         = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Fetch financial summary ─────────────────────────────────────────────────
  const loadSummary = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFinancialSummary(schoolId, academicYear);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Financial summary load nahi hua. Please retry.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [schoolId, academicYear]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // ── Derived values ──────────────────────────────────────────────────────────

  // Sort categories by amount descending for the breakdown chart
  const sortedCategories = data
    ? Object.entries(data.expenseByCategory || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // top 10 categories
    : [];

  const fmtRefresh = lastRefreshed
    ? lastRefreshed.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-yellow-500" />
                Revenue Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {data?.schoolName || "School"} — live financial overview
                {fmtRefresh && (
                  <span className="ml-2 text-gray-300">· Updated {fmtRefresh}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Academic Year selector */}
              <div className="relative">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Manual refresh */}
              <button
                onClick={loadSummary}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* ── Error state ───────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} />
              {error}
              <button onClick={loadSummary} className="ml-auto underline font-medium">
                Retry
              </button>
            </div>
          )}

          {/* ── Pending approval alert ─────────────────────────────────────── */}
          <PendingAlert
            count={data?.pendingApprovalCount}
            loading={loading}
          />

          {/* ── 4 KPI Cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              icon={IndianRupee}
              label="Fee Income"
              value={loading ? "—" : fmtINR(data?.totalFeeCollected)}
              sub="Collected from students"
              accent="green"
              loading={loading}
            />
            <KPICard
              icon={Users}
              label="Salary Paid"
              value={loading ? "—" : fmtINR(data?.totalSalaryPaid)}
              sub={`Payroll — ${academicYear}`}
              accent="yellow"
              loading={loading}
            />
            <KPICard
              icon={Receipt}
              label="Other Expenses"
              value={loading ? "—" : fmtINR(data?.totalExpenses)}
              sub={`Approved — ${academicYear}`}
              accent="blue"
              loading={loading}
            />
            <KPICard
              icon={data?.netBalanceLabel === "PROFIT" ? TrendingUp : TrendingDown}
              label="Net Revenue"
              value={loading ? "—" : fmtINR(data?.netBalance)}
              sub={loading ? "" : (data?.netBalanceLabel === "PROFIT" ? "▲ Profit" : "▼ Loss")}
              accent={data?.netBalanceLabel === "PROFIT" ? "green" : "red"}
              loading={loading}
            />
          </div>

          {/* ── Secondary metrics row ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Fee pending */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={15} className="text-orange-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fee Still Pending
                </span>
              </div>
              {loading ? (
                <div className="h-7 w-28 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-orange-600">{fmtINR(data?.totalFeePending)}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Outstanding from students</p>
            </div>

            {/* Total expense records */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={15} className="text-blue-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Expense Records
                </span>
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{data?.totalExpenseEntries ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {academicYear} — all statuses
              </p>
            </div>

            {/* Approved expense ratio */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="text-green-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Expense Ratio
                </span>
              </div>
              {loading || !data ? (
                <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  {/* (Expenses + Salary) / Fee Collected */}
                  {(() => {
                    const total = (data.totalExpenses || 0) + (data.totalSalaryPaid || 0);
                    const ratio = data.totalFeeCollected > 0
                      ? ((total / data.totalFeeCollected) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <>
                        <p className="text-2xl font-bold text-gray-800">{ratio}%</p>
                        <p className="text-xs text-gray-400 mt-1">of fee income spent</p>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>

          {/* ── Main two-column layout ────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left: Net Revenue Calculation (wider) */}
            <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Net Revenue Calculation</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Step-by-step breakdown — {academicYear}</p>
                </div>
                {/* Accuracy badge */}
                {!loading && data && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>

              {data || loading ? (
                <NetRevenueCalculation data={data || {}} loading={loading} />
              ) : null}

              {/* Disclaimer about fee collection spanning all years */}
              {!loading && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <Info size={13} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-600 leading-relaxed">
                    <span className="font-semibold">Note:</span> "Fee Income" reflects
                    cumulative payments across all years. "Salary" and "Other Expenses"
                    are filtered to <strong>{academicYear}</strong> only.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Expense Category Breakdown */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-800">Expense Breakdown</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Approved expenses by category — {academicYear}
                </p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : sortedCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <Receipt size={28} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No approved expenses</p>
                  <p className="text-xs mt-1">
                    Expenses appear here once approved for {academicYear}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCategories.map(([cat, amount]) => (
                    <CategoryBar
                      key={cat}
                      name={formatCategoryName(cat)}
                      amount={amount}
                      totalExpenses={data.totalExpenses || 1}
                      loading={false}
                    />
                  ))}
                  {Object.keys(data.expenseByCategory || {}).length > 10 && (
                    <p className="text-xs text-gray-400 text-center pt-2">
                      Showing top 10 categories
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Example Calculation Explainer ─────────────────────────────── */}
          {!loading && data && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">How the Calculation Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Start with Fee Income",
                    body: `Total fees collected from students: ${fmtINR(data.totalFeeCollected)}. This is all successful fee payments.`,
                    accent: "bg-green-50 border-green-200 text-green-800",
                    dot: "bg-green-500",
                  },
                  {
                    step: "2",
                    title: "Subtract Staff Costs",
                    body: `Deduct all finalized payroll: ${fmtINR(data.totalSalaryPaid)}. Only FINALIZED payroll records are counted.`,
                    accent: "bg-orange-50 border-orange-200 text-orange-800",
                    dot: "bg-orange-400",
                  },
                  {
                    step: "3",
                    title: "Subtract Operational Expenses",
                    body: `Deduct all APPROVED school expenses: ${fmtINR(data.totalExpenses)}. Pending / rejected expenses are excluded.`,
                    accent: "bg-blue-50 border-blue-200 text-blue-800",
                    dot: "bg-blue-500",
                  },
                ].map((item) => (
                  <div key={item.step} className={`p-4 rounded-xl border ${item.accent}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-5 h-5 rounded-full ${item.dot} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                        {item.step}
                      </span>
                      <p className="text-sm font-bold">{item.title}</p>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">{item.body}</p>
                  </div>
                ))}
              </div>

              {/* Formula recap */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-xs font-mono text-gray-600">
                  Net Revenue = Fee Collected (
                  <span className="text-green-700 font-semibold">{fmtINR(data.totalFeeCollected)}</span>
                  ) − Salary (
                  <span className="text-orange-600 font-semibold">{fmtINR(data.totalSalaryPaid)}</span>
                  ) − Other Expenses (
                  <span className="text-blue-600 font-semibold">{fmtINR(data.totalExpenses)}</span>
                  ) ={" "}
                  <span className={`font-bold ${data.netBalanceLabel === "PROFIT" ? "text-green-700" : "text-red-600"}`}>
                    {fmtINR(data.netBalance)} ({data.netBalanceLabel})
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}