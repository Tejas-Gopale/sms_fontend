// src/accountant/pages/ExpensePage.jsx
// Role: ACCOUNTANT / CASHIER / RECEPTIONIST / SCHOOL_ADMIN / PRINCIPAL
// APIs: POST /expenses/school/{schoolId}
//       PUT  /expenses/{expenseId}
//       DELETE /expenses/{expenseId}
//       PUT  /expenses/{expenseId}/status
//       GET  /expenses/school/{schoolId}  (+ query filters)
//       GET  /expenses/{expenseId}

import { useState, useEffect, useCallback, useRef } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  Receipt, Plus, Search, Filter, RefreshCw, Loader2,
  Pencil, Trash2, CheckCircle, XCircle, Eye, X,
  TrendingDown, IndianRupee, Clock, AlertCircle,
  ChevronDown, Calendar, Tag, FileText, Banknote,
} from "lucide-react";

// ─── API helpers ──────────────────────────────────────────────────────────────
const getAllExpenses      = (schoolId, params = {}) =>
  API.get(`/expenses/school/${schoolId}`, { params }).then((r) => r.data);

const getExpenseById     = (expenseId) =>
  API.get(`/expenses/${expenseId}`).then((r) => r.data);

const addExpense         = (schoolId, body) =>
  API.post(`/expenses/school/${schoolId}`, body).then((r) => r.data);

const updateExpense      = (expenseId, body) =>
  API.put(`/expenses/${expenseId}`, body).then((r) => r.data);

const deleteExpense      = (expenseId) =>
  API.delete(`/expenses/${expenseId}`).then((r) => r.data);

const updateExpenseStatus = (expenseId, body) =>
  API.put(`/expenses/${expenseId}/status`, body).then((r) => r.data);

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "SALARY", "RENT", "UTILITIES", "STATIONERY", "MAINTENANCE",
  "TRANSPORT", "FOOD", "EVENTS", "TECHNOLOGY", "MISCELLANEOUS",
];

const EXPENSE_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const ADMIN_ROLES = ["SCHOOL_ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"];
const STAFF_ROLES = ["ACCOUNTANT", "CASHIER", "RECEPTIONIST", "SCHOOL_ADMIN", "PRINCIPAL"];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtINR = (val) => {
  if (val == null) return "—";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusStyle = {
  PENDING:  "bg-yellow-100 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border border-green-200",
  REJECTED: "bg-red-100 text-red-600 border border-red-200",
};

const statusIcon = {
  PENDING:  <Clock size={11} />,
  APPROVED: <CheckCircle size={11} />,
  REJECTED: <XCircle size={11} />,
};

// ─── Small reusable components ────────────────────────────────────────────────

const Badge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyle[status] ?? "bg-gray-100 text-gray-600"}`}>
    {statusIcon[status]}
    {status}
  </span>
);

const FieldInput = ({ label, type = "text", value, onChange, required, placeholder, min, step, options, readOnly }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        readOnly={readOnly}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-300 read-only:bg-gray-50 read-only:text-gray-400"
      />
    )}
  </div>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div
      className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      {/* Modal body */}
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Add / Edit Expense Form ──────────────────────────────────────────────────
const blankForm = {
  title: "", category: "", amount: "", expenseDate: "",
  description: "", vendorName: "", invoiceNumber: "", paymentMode: "",
};

const PAYMENT_MODES = ["CASH", "UPI", "NEFT", "CHEQUE", "CARD", "OTHER"];

function ExpenseForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...blankForm, ...initial });

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.amount || !form.expenseDate) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldInput label="Expense Title" value={form.title} onChange={set("title")} required placeholder="e.g. Stationery purchase" />
        </div>
        <FieldInput label="Category" value={form.category} onChange={set("category")} options={EXPENSE_CATEGORIES} required />
        <FieldInput label="Amount (₹)" type="number" value={form.amount} onChange={set("amount")} required min="1" step="0.01" placeholder="0.00" />
        <FieldInput label="Expense Date" type="date" value={form.expenseDate} onChange={set("expenseDate")} required />
        <FieldInput label="Payment Mode" value={form.paymentMode} onChange={set("paymentMode")} options={PAYMENT_MODES} />
        <FieldInput label="Vendor Name" value={form.vendorName} onChange={set("vendorName")} placeholder="Optional" />
        <FieldInput label="Invoice Number" value={form.invoiceNumber} onChange={set("invoiceNumber")} placeholder="Optional" />
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-300 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.category || !form.amount || !form.expenseDate}
          className="flex-1 py-2.5 text-sm font-bold bg-yellow-500 text-gray-900 rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </div>
    </div>
  );
}

// ─── Expense Detail Modal ─────────────────────────────────────────────────────
function ExpenseDetail({ expense, onClose, onApprove, onReject, isAdmin, approving, rejecting }) {
  if (!expense) return null;
  const rows = [
    ["Category",       expense.category],
    ["Amount",         fmtINR(expense.amount)],
    ["Date",           fmtDate(expense.expenseDate)],
    ["Payment Mode",   expense.paymentMode || "—"],
    ["Vendor",         expense.vendorName || "—"],
    ["Invoice No.",    expense.invoiceNumber || "—"],
    ["Added By",       expense.addedBy || "—"],
    ["Approved By",    expense.approvedBy || "—"],
    ["Created At",     fmtDate(expense.createdAt)],
  ];

  return (
    <Modal title="Expense Details" onClose={onClose}>
      <div className="space-y-5">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-bold text-gray-800 leading-snug">{expense.title}</h4>
          <Badge status={expense.status} />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {rows.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{k}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {expense.description && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-700">{expense.description}</p>
          </div>
        )}

        {/* Approve / Reject actions for admins on PENDING */}
        {isAdmin && expense.status === "PENDING" && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onReject(expense.id)}
              disabled={rejecting}
              className="flex-1 py-2.5 text-sm font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {rejecting ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
            <button
              onClick={() => onApprove(expense.id)}
              disabled={approving}
              className="flex-1 py-2.5 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {approving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensePage() {
  const userData    = getUserData();
  const schoolId    = userData?.schoolId ?? localStorage.getItem("schoolId");
  const userRole    = userData?.role || "";
  const isAdmin     = ADMIN_ROLES.includes(userRole);
  const isStaff     = STAFF_ROLES.includes(userRole);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [expenses,  setExpenses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search,        setSearch]       = useState("");
  const [filterStatus,  setFilterStatus] = useState("");
  const [filterCat,     setFilterCat]    = useState("");
  const [filterYear,    setFilterYear]   = useState("");
  const [fromDate,      setFromDate]     = useState("");
  const [toDate,        setToDate]       = useState("");

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [editExpense,     setEditExpense]     = useState(null);   // expense obj to edit
  const [viewExpense,     setViewExpense]     = useState(null);   // expense obj for detail view
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Action loading flags ───────────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // ── Summary stats (derived) ────────────────────────────────────────────────
  const totalAmount   = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const pendingCount  = expenses.filter((e) => e.status === "PENDING").length;
  const approvedTotal = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((s, e) => s + (e.amount || 0), 0);

  // ── Fetch expenses ─────────────────────────────────────────────────────────
  const loadExpenses = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus) params.status   = filterStatus;
      if (filterCat)    params.category = filterCat;
      if (filterYear)   params.academicYear = filterYear;
      if (fromDate && toDate) { params.from = fromDate; params.to = toDate; }

      const data = await getAllExpenses(schoolId, params);
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      setError("Expenses load nahi ho sake. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterStatus, filterCat, filterYear, fromDate, toDate]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // ── Filtered by search ─────────────────────────────────────────────────────
  const filtered = expenses.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.title        || "").toLowerCase().includes(q) ||
      (e.vendorName   || "").toLowerCase().includes(q) ||
      (e.category     || "").toLowerCase().includes(q)
    );
  });

  // ── Add expense ────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addExpense(schoolId, form);
      setShowAddModal(false);
      loadExpenses();
    } catch {
      // TODO: show toast
    } finally {
      setSaving(false);
    }
  };

  // ── Edit expense ───────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    if (!editExpense) return;
    setSaving(true);
    try {
      await updateExpense(editExpense.id, form);
      setEditExpense(null);
      loadExpenses();
    } catch {
      // TODO: show toast
    } finally {
      setSaving(false);
    }
  };

  // ── Delete expense ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
      loadExpenses();
    } catch {
      // TODO: show toast
    } finally {
      setDeleting(false);
    }
  };

  // ── Approve / Reject ───────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setApproving(true);
    try {
      const updated = await updateExpenseStatus(id, { status: "APPROVED" });
      // update in list + detail
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setViewExpense(updated);
    } catch {
      // TODO: show toast
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id) => {
    setRejecting(true);
    try {
      const updated = await updateExpenseStatus(id, { status: "REJECTED" });
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setViewExpense(updated);
    } catch {
      // TODO: show toast
    } finally {
      setRejecting(false);
    }
  };

  // ── View single expense ────────────────────────────────────────────────────
  const handleView = async (id) => {
    try {
      const data = await getExpenseById(id);
      setViewExpense(data);
    } catch {
      // fallback: use local
      setViewExpense(expenses.find((e) => e.id === id) || null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt size={20} className="text-yellow-500" />
              Expense Management
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Track, add & approve school expenses</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadExpenses}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            {isStaff && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Plus size={14} />
                Add Expense
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* ── Summary Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Receipt,
                label: "Total Expenses",
                value: String(expenses.length),
                sub: "All recorded",
                color: "yellow",
              },
              {
                icon: IndianRupee,
                label: "Total Amount",
                value: fmtINR(totalAmount),
                sub: "Across all statuses",
                color: "blue",
              },
              {
                icon: CheckCircle,
                label: "Approved Amount",
                value: fmtINR(approvedTotal),
                sub: "Approved expenses",
                color: "green",
              },
              {
                icon: Clock,
                label: "Pending Approvals",
                value: String(pendingCount),
                sub: "Awaiting review",
                color: pendingCount > 0 ? "red" : "gray",
              },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{c.label}</p>
                    {loading ? (
                      <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-${c.color}-50 ml-3 shrink-0`}>
                    <c.icon size={20} className={`text-${c.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters Bar ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search</label>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Title, vendor, category..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="min-w-36">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
                >
                  <option value="">All Statuses</option>
                  {EXPENSE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category filter */}
              <div className="min-w-44">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
                >
                  <option value="">All Categories</option>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Academic Year */}
              <div className="min-w-36">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Academic Year</label>
                <input
                  type="text"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Date Range */}
              <div className="min-w-32">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="min-w-32">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Clear filters */}
              {(filterStatus || filterCat || filterYear || fromDate || toDate || search) && (
                <button
                  onClick={() => {
                    setSearch(""); setFilterStatus(""); setFilterCat("");
                    setFilterYear(""); setFromDate(""); setToDate("");
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors self-end"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Error */}
            {error && (
              <div className="p-4 m-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
                <button onClick={loadExpenses} className="ml-auto underline font-medium">Retry</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["#", "Title", "Category", "Amount", "Date", "Payment", "Vendor", "Added By", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {[...Array(10)].map((__, j) => (
                          <td key={j} className="px-5 py-3.5">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${40 + (j * 13) % 50}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-14 text-center text-gray-400">
                        <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Koi expenses nahi mili</p>
                        <p className="text-xs mt-1">Filters change karein ya naya expense add karein</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e, idx) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-yellow-50/30 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 max-w-40 truncate">{e.title}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-800">{fmtINR(e.amount)}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{fmtDate(e.expenseDate)}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{e.paymentMode || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs max-w-28 truncate">{e.vendorName || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs max-w-28 truncate">{e.addedBy || "—"}</td>
                        <td className="px-5 py-3.5"><Badge status={e.status} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <button
                              onClick={() => handleView(e.id)}
                              title="View"
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Edit — only PENDING and staff */}
                            {isStaff && e.status === "PENDING" && (
                              <button
                                onClick={() => setEditExpense(e)}
                                title="Edit"
                                className="p-1.5 rounded-lg hover:bg-yellow-100 text-gray-400 hover:text-yellow-600 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                            )}

                            {/* Quick Approve — admin on PENDING */}
                            {isAdmin && e.status === "PENDING" && (
                              <button
                                onClick={() => handleApprove(e.id)}
                                disabled={approving}
                                title="Approve"
                                className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-40"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}

                            {/* Delete — non-approved only for staff */}
                            {isStaff && e.status !== "APPROVED" && (
                              <button
                                onClick={() => setDeleteConfirmId(e.id)}
                                title="Delete"
                                className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Footer row count */}
              {!loading && filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{expenses.length}</span> expenses
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Add Expense */}
      {showAddModal && (
        <Modal title="Add New Expense" onClose={() => setShowAddModal(false)} wide>
          <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} loading={saving} />
        </Modal>
      )}

      {/* Edit Expense */}
      {editExpense && (
        <Modal title="Edit Expense" onClose={() => setEditExpense(null)} wide>
          <ExpenseForm
            initial={{
              title:         editExpense.title         || "",
              category:      editExpense.category      || "",
              amount:        editExpense.amount        || "",
              expenseDate:   editExpense.expenseDate   || "",
              description:   editExpense.description   || "",
              vendorName:    editExpense.vendorName    || "",
              invoiceNumber: editExpense.invoiceNumber || "",
              paymentMode:   editExpense.paymentMode   || "",
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditExpense(null)}
            loading={saving}
          />
        </Modal>
      )}

      {/* View Expense Detail */}
      {viewExpense && (
        <ExpenseDetail
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isAdmin={isAdmin}
          approving={approving}
          rejecting={rejecting}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <Modal title="Delete Expense?" onClose={() => setDeleteConfirmId(null)}>
          <p className="text-sm text-gray-600 mb-6">
            Kya aap sure hain? Yeh action undo nahi hogi.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}