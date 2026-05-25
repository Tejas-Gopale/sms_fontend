import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { getAllSchools, getExpenses, getFinancialSummary, updateExpenseStatus } from "../services/superAdminService";
import {
  Receipt, TrendingUp, TrendingDown, Wallet, ChevronDown,
  School, Loader2, IndianRupee, CheckCircle, XCircle,
  Clock, Filter, RefreshCw, Eye, BarChart3, ListFilter,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

const CURRENT_YEAR = "2025-2026";
const YEAR_OPTIONS = ["2025-2026", "2024-2025", "2023-2024"];

export default function SMS_Expenses() {
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab] = useState("summary"); // summary | expenses

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [approving, setApproving] = useState(null); // expenseId being approved

  useEffect(() => {
    getAllSchools()
      .then((r) => setSchools(r.data))
      .catch(console.error)
      .finally(() => setSchoolsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSchool) return;
    loadSummary();
    loadExpenses();
  }, [selectedSchool, academicYear]);

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const r = await getFinancialSummary(selectedSchool.id, academicYear);
      setSummary(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadExpenses = async () => {
    setExpLoading(true);
    try {
      const params = { academicYear };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const r = await getExpenses(selectedSchool.id, params);
      setExpenses(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setExpLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSchool) loadExpenses();
  }, [statusFilter]);

  const handleApproveReject = async (expenseId, status) => {
    setApproving(expenseId);
    try {
      await updateExpenseStatus(expenseId, { status });
      await loadExpenses();
      await loadSummary();
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(null);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="flex bg-[#0f1117] min-h-screen font-sans">
      <SuperAdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Receipt size={18} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">School Financials</h1>
          </div>
          <p className="text-gray-500 ml-12 text-sm">
            View income, expenses, salary and net balance for any school.
          </p>
        </div>

        {/* School + Year Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* School Dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1d27] border border-gray-800 rounded-xl text-sm text-gray-300 hover:border-emerald-500/40 transition-all"
            >
              {selectedSchool ? (
                <div className="flex items-center gap-2.5">
                  <School size={14} className="text-emerald-400" />
                  <span className="font-semibold text-white">{selectedSchool.schoolName}</span>
                  <span className="text-gray-600 text-xs">({selectedSchool.city})</span>
                </div>
              ) : (
                <span className="text-gray-600">Select a school to view financials…</span>
              )}
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-[#1a1d27] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {schoolsLoading ? (
                  <div className="py-6 text-center"><Loader2 size={16} className="animate-spin mx-auto text-gray-600" /></div>
                ) : schools.filter(s => s.active).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSchool(s); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0f1117] transition text-left"
                  >
                    <School size={14} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold">{s.schoolName}</p>
                      <p className="text-gray-600 text-xs">{s.city} · {s.boardType}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Selector */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-3 bg-[#1a1d27] border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/40 transition"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {selectedSchool && (
            <button
              onClick={() => { loadSummary(); loadExpenses(); }}
              className="px-4 py-3 bg-[#1a1d27] border border-gray-800 rounded-xl hover:border-emerald-500/40 transition text-gray-400 hover:text-emerald-400"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {!selectedSchool ? (
          <EmptyState />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#1a1d27] p-1 rounded-xl w-fit border border-gray-800">
              {[
                { id: "summary", icon: <BarChart3 size={14} />, label: "Financial Summary" },
                { id: "expenses", icon: <ListFilter size={14} />, label: "Expense Ledger" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-emerald-500 text-black"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── SUMMARY TAB ───────────────────────────── */}
            {activeTab === "summary" && (
              summaryLoading ? (
                <LoadingBlock />
              ) : summary ? (
                <div className="space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <FinCard
                      label="Fee Collected"
                      value={fmt(summary.totalFeeCollected)}
                      sub={`Pending: ${fmt(summary.totalFeePending)}`}
                      icon={<IndianRupee size={16} />}
                      color="emerald"
                      trend="up"
                    />
                    <FinCard
                      label="Total Expenses"
                      value={fmt(summary.totalExpenses)}
                      sub={`${summary.totalExpenseEntries} entries · ${summary.pendingApprovalCount} pending`}
                      icon={<Receipt size={16} />}
                      color="orange"
                      trend="down"
                    />
                    <FinCard
                      label="Salary Paid"
                      value={fmt(summary.totalSalaryPaid)}
                      sub="Finalized payroll"
                      icon={<Wallet size={16} />}
                      color="blue"
                      trend="neutral"
                    />
                    <FinCard
                      label={summary.netBalanceLabel}
                      value={fmt(Math.abs(summary.netBalance))}
                      sub="Net = Income − Expenses − Salary"
                      icon={summary.netBalanceLabel === "PROFIT" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      color={summary.netBalanceLabel === "PROFIT" ? "emerald" : "red"}
                      trend={summary.netBalanceLabel === "PROFIT" ? "up" : "down"}
                      highlight
                    />
                  </div>

                  {/* Net Balance Bar */}
                  <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">
                      Financial Flow — {academicYear}
                    </p>
                    <FlowBar summary={summary} fmt={fmt} />
                  </div>

                  {/* Category Breakdown */}
                  {summary.expenseByCategory && Object.keys(summary.expenseByCategory).length > 0 && (
                    <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">
                        Expense Breakdown by Category
                      </p>
                      <CategoryBreakdown data={summary.expenseByCategory} total={summary.totalExpenses} fmt={fmt} />
                    </div>
                  )}
                </div>
              ) : null
            )}

            {/* ── EXPENSE LEDGER TAB ────────────────────── */}
            {activeTab === "expenses" && (
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={14} className="text-gray-600" />
                  {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        statusFilter === s
                          ? statusColors[s].active
                          : "bg-[#1a1d27] text-gray-500 border border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Expense Table */}
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                  {expLoading ? (
                    <LoadingBlock />
                  ) : expenses.length === 0 ? (
                    <div className="py-16 text-center text-gray-600">
                      <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No expenses found for this filter.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            {["Title", "Category", "Amount", "Date", "Added By", "Status", "Actions"].map((h) => (
                              <th key={h} className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((exp) => (
                            <tr key={exp.id} className="border-b border-gray-800/50 hover:bg-[#0f1117] transition">
                              <td className="px-5 py-4">
                                <p className="text-white font-semibold">{exp.title}</p>
                                {exp.vendorName && <p className="text-gray-600 text-xs">{exp.vendorName}</p>}
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg font-mono">
                                  {exp.categoryDisplayName || exp.category}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-emerald-400 font-bold font-mono">
                                {fmt(exp.amount)}
                              </td>
                              <td className="px-5 py-4 text-gray-400 text-xs">
                                {exp.expenseDate}
                              </td>
                              <td className="px-5 py-4 text-gray-400 text-xs">
                                {exp.addedByName || "—"}
                              </td>
                              <td className="px-5 py-4">
                                <StatusBadge status={exp.status} />
                              </td>
                              <td className="px-5 py-4">
                                {exp.status === "PENDING" && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={approving === exp.id}
                                      onClick={() => handleApproveReject(exp.id, "APPROVED")}
                                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
                                      title="Approve"
                                    >
                                      {approving === exp.id ? (
                                        <Loader2 size={13} className="animate-spin" />
                                      ) : (
                                        <CheckCircle size={13} />
                                      )}
                                    </button>
                                    <button
                                      disabled={approving === exp.id}
                                      onClick={() => handleApproveReject(exp.id, "REJECTED")}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                      title="Reject"
                                    >
                                      <XCircle size={13} />
                                    </button>
                                  </div>
                                )}
                                {exp.status !== "PENDING" && (
                                  <button className="p-1.5 text-gray-600 hover:text-gray-300 transition" title="View">
                                    <Eye size={13} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FinCard({ label, value, sub, icon, color, highlight, trend }) {
  const palette = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", text: "text-emerald-400" },
    orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/20",  icon: "text-orange-400",  text: "text-orange-400" },
    blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: "text-blue-400",    text: "text-blue-400" },
    red:     { bg: "bg-red-500/10",     border: "border-red-500/20",     icon: "text-red-400",     text: "text-red-400" },
  };
  const p = palette[color] || palette.emerald;
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <div className={`bg-[#1a1d27] border ${highlight ? p.border : "border-gray-800"} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center ${p.icon}`}>{icon}</div>
        <TrendIcon size={14} className={p.text} />
      </div>
      <p className={`text-2xl font-black ${highlight ? p.text : "text-white"} tabular-nums`}>{value}</p>
      <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function FlowBar({ summary, fmt }) {
  const total = summary.totalFeeCollected || 1;
  const expPct = Math.min(100, ((summary.totalExpenses || 0) / total) * 100);
  const salPct = Math.min(100, ((summary.totalSalaryPaid || 0) / total) * 100);
  const netPct = Math.max(0, 100 - expPct - salPct);

  return (
    <div className="space-y-3">
      <BarRow label="Income (Fees)" value={fmt(summary.totalFeeCollected)} pct={100} color="bg-emerald-500" />
      <BarRow label="Expenses" value={fmt(summary.totalExpenses)} pct={expPct} color="bg-orange-500" />
      <BarRow label="Salary" value={fmt(summary.totalSalaryPaid)} pct={salPct} color="bg-blue-500" />
      <div className="border-t border-gray-800 pt-3">
        <BarRow
          label={`Net ${summary.netBalanceLabel}`}
          value={fmt(Math.abs(summary.netBalance))}
          pct={netPct}
          color={summary.netBalanceLabel === "PROFIT" ? "bg-emerald-400" : "bg-red-500"}
          highlight
        />
      </div>
    </div>
  );
}

function BarRow({ label, value, pct, color, highlight }) {
  return (
    <div className="flex items-center gap-4">
      <p className={`text-xs w-36 flex-shrink-0 ${highlight ? "text-white font-bold" : "text-gray-500"}`}>{label}</p>
      <div className="flex-1 bg-gray-800/60 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs w-28 text-right font-mono font-bold ${highlight ? "text-white" : "text-gray-400"}`}>{value}</p>
    </div>
  );
}

function CategoryBreakdown({ data, total, fmt }) {
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a);
  const colors = ["bg-emerald-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-yellow-500", "bg-red-500"];
  return (
    <div className="space-y-3">
      {sorted.map(([cat, amt], i) => (
        <div key={cat} className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
          <p className="text-gray-400 text-xs w-40 flex-shrink-0 capitalize">{cat.replace(/_/g, " ").toLowerCase()}</p>
          <div className="flex-1 bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${colors[i % colors.length]}`}
              style={{ width: `${Math.min(100, (amt / total) * 100)}%` }}
            />
          </div>
          <p className="text-gray-300 text-xs font-mono font-bold w-24 text-right">{fmt(amt)}</p>
        </div>
      ))}
    </div>
  );
}

const statusColors = {
  ALL:      { active: "bg-gray-700 text-white border border-gray-600" },
  PENDING:  { active: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  APPROVED: { active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  REJECTED: { active: "bg-red-500/20 text-red-400 border border-red-500/30" },
};

function StatusBadge({ status }) {
  const cfg = {
    PENDING:  { icon: <Clock size={10} />, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    APPROVED: { icon: <CheckCircle size={10} />, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    REJECTED: { icon: <XCircle size={10} />, cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  }[status] || { icon: null, cls: "bg-gray-800 text-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1d27] border border-gray-800 flex items-center justify-center mb-4">
        <BarChart3 size={24} className="text-gray-700" />
      </div>
      <p className="text-gray-400 font-semibold">Select a school to view financials</p>
      <p className="text-gray-600 text-sm mt-1">Income, expenses, salary and net balance will appear here.</p>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-emerald-500" />
    </div>
  );
}
