// src/school_admin/pages/PayrollManagement.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL_ADMIN + ACCOUNTANT — Full payroll management
//
// Tabs:
//   1. Run Payroll     — entire school ka DRAFT payroll manually generate karo
//   2. Teacher Preview — single teacher ka salary calculate + leave breakdown
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { manualPayrollService } from "../../common/services/payrollService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  IndianRupee,
  Users,
  Play,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  CheckCircle,
  CalendarDays,
  Banknote,
  FileText,
  Info,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (v) =>
  v != null
    ? `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "—";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2024, 2025, 2026];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue:  "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red:   "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Tab 1: Run Payroll ───────────────────────────────────────────────────────

function RunPayrollTab({ schoolId }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [workingDays, setWorkingDays] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState("");

  const handleRun = async () => {
    if (!schoolId) { setError("School ID nahi mila. Please reload."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const wd = workingDays ? parseInt(workingDays) : null;
      const res = await manualPayrollService.calculateForSchool(schoolId, month, year, wd);
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Payroll run failed. Check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Banknote size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-800">Run School Payroll</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Poore school ka DRAFT payroll create karo. Admin baad mein finalize + disburse karega.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Working Days <span className="font-normal text-gray-400">(optional — blank = auto from holidays)</span>
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
            placeholder="e.g. 26"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            Ye DRAFT payroll create karega. Already FINALIZED payroll pe dobara run nahi hoga.
          </span>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? "Running..." : `Run Payroll — ${MONTHS[month - 1]} ${year}`}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
            <CheckCircle size={20} />
            Payroll DRAFT Created Successfully!
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Pay Period",       value: `${MONTHS[result.month - 1]} ${result.year}` },
              { label: "Status",           value: result.status },
              { label: "Total Employees",  value: result.totalEmployees },
              { label: "Total Working Days", value: result.totalWorkingDays },
              { label: "Total Gross",      value: fmt(result.totalGrossSalary) },
              { label: "Total Deductions", value: fmt(result.totalDeductions) },
              { label: "Total Net Payable", value: fmt(result.totalNetPayable) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Salary Slip Card ─────────────────────────────────────────────────────────

function SalarySlipCard({ slip }) {
  if (!slip) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-800">{slip.employeeName}</h4>
          <p className="text-sm text-gray-500">{slip.designation} · {slip.employeeCode}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {MONTHS[slip.payrollMonth - 1]} {slip.payrollYear}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          slip.slipStatus === "PAID"
            ? "bg-green-100 text-green-700"
            : slip.slipStatus === "GENERATED"
            ? "bg-blue-100 text-blue-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {slip.slipStatus}
        </span>
      </div>

      {/* Attendance row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { l: "Working Days", v: slip.totalWorkingDays },
          { l: "Present Days", v: slip.presentDays },
          { l: "LOP Days",     v: slip.lopDays },
        ].map(({ l, v }) => (
          <div key={l} className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{l}</p>
            <p className="text-lg font-bold text-gray-800">{v}</p>
          </div>
        ))}
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h5 className="text-sm font-semibold text-green-700 flex items-center gap-1 mb-2">
            <TrendingUp size={14} /> Earnings
          </h5>
          {[
            ["Basic Salary",      slip.basicSalary],
            ["HRA",               slip.hra],
            ["DA",                slip.da],
            ["TA",                slip.ta],
            ["Medical",           slip.medical],
            ["Special Allowance", slip.specialAllowance],
            ["Arrear",            slip.arrear],
          ].filter(([, v]) => v != null && v !== 0).map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs py-1 border-b border-gray-50">
              <span className="text-gray-600">{l}</span>
              <span className="font-medium">{fmt(v)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold mt-2 text-green-700">
            <span>Gross</span><span>{fmt(slip.grossEarnings)}</span>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-red-600 flex items-center gap-1 mb-2">
            <TrendingDown size={14} /> Deductions
          </h5>
          {[
            ["LOP Deduction",    slip.lopDeduction],
            ["PF (12%)",         slip.pfDeduction],
            ["ESI (0.75%)",      slip.esiDeduction],
            ["Professional Tax", slip.professionalTax],
            ["TDS",              slip.tdsDeduction],
          ].filter(([, v]) => v != null && v !== 0).map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs py-1 border-b border-gray-50">
              <span className="text-gray-600">{l}</span>
              <span className="font-medium text-red-500">- {fmt(v)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold mt-2 text-red-600">
            <span>Total Deductions</span><span>- {fmt(slip.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="mt-5 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
        <span className="font-bold text-gray-800">Net Payable</span>
        <span className="text-2xl font-bold text-green-600">{fmt(slip.netPayable)}</span>
      </div>
    </div>
  );
}

// ─── Leave Breakdown Card ─────────────────────────────────────────────────────

function LeaveBreakdownCard({ data }) {
  if (!data) return null;

  const leaveTypeLabels = {
    CASUAL_LEAVE:         "Casual Leave (CL)",
    SICK_LEAVE:           "Sick Leave (SL)",
    EARNED_LEAVE:         "Earned Leave (EL)",
    LEAVE_WITHOUT_PAY:    "Leave Without Pay (LWP)",
    MATERNITY_LEAVE:      "Maternity Leave",
    PATERNITY_LEAVE:      "Paternity Leave",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-blue-500" />
        Leave Breakdown — {MONTHS[data.month - 1]} {data.year}
      </h5>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { l: "Paid Leave Days",   v: data.paidLeaveDays,   c: "text-green-600" },
          { l: "LWP Days",          v: data.unpaidLeaveDays, c: "text-red-600"   },
          { l: "LOP (Absent/Half)", v: data.lopDays,         c: "text-amber-600" },
        ].map(({ l, v, c }) => (
          <div key={l} className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {data.annualBalances?.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Annual Balance Snapshot
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 rounded-l-lg">Leave Type</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Allocated</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Used</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 rounded-r-lg">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {data.annualBalances.map((b, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-gray-700">
                      {leaveTypeLabels[b.leaveType] || b.leaveType}
                      {!b.isPaid && (
                        <span className="ml-1 text-xs text-red-500">(Unpaid)</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-2 text-gray-600">{b.totalAllocated}</td>
                    <td className="text-center px-3 py-2 text-gray-600">{b.usedDays}</td>
                    <td className="text-center px-3 py-2 font-semibold text-green-600">{b.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab 2: Teacher Salary Preview ───────────────────────────────────────────

function TeacherPreviewTab({ schoolId }) {
  const now = new Date();
  const [teachers, setTeachers]     = useState([]);
  const [search, setSearch]         = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [month, setMonth]           = useState(now.getMonth() + 1);
  const [year, setYear]             = useState(now.getFullYear());
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [fetchingTeachers, setFetchingTeachers] = useState(false);

  // Fetch teachers list
  useEffect(() => {
      console.log("schoolId =", schoolId);
    if (!schoolId) return;
    setFetchingTeachers(true);
    console.log("Calling teacher API...");
    API.get("/teacher/getTeachersDetilas")
      .then((res) => {
        console.log("Teachers list:", res.data);
        // Response might be array or { teachers: [] }
        const list = Array.isArray(res.data) ? res.data : res.data?.teachers || [];
        setTeachers(list);
      })
      .catch((err) => {
         console.log("Full Error:", err);
         console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
      })
      .finally(() => setFetchingTeachers(false));
  }, [schoolId]);

  const filtered = teachers.filter((t) => {
    const name = t.fullName || t.name || t.user?.fullName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCalculate = async () => {
    if (!selectedTeacher) { setError("Pehle ek teacher select karo."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await manualPayrollService.calculateForTeacher(selectedTeacher.id, month, year);
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Salary calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  const teacherName = (t) =>
    t.fullName || t.name || t.user?.fullName || `Teacher #${t.id}`;

  return (
    <div className="flex gap-6 flex-wrap">
      {/* Left panel — controls */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            Select Teacher
          </h3>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {fetchingTeachers ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 size={18} className="animate-spin mr-2" /> Loading...
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No teachers found.</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTeacher(t); setResult(null); setError(""); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTeacher?.id === t.id
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {teacherName(t)}
                </button>
              ))
            )}
          </div>
        </div>

        {selectedTeacher && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Pay Period</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Calculating...</>
                : <><FileText size={14} /> Calculate Salary</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Right panel — results */}
      <div className="flex-1 min-w-0">
        {!selectedTeacher && !result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Left side se koi teacher select karo</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <SalarySlipCard slip={result.salarySlip} />
            <LeaveBreakdownCard data={result.leaveBreakdown} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState("run");
  const [schoolId, setSchoolId]   = useState(null);

  useEffect(() => {
    const userData = getUserData();
    if (userData?.schoolId) setSchoolId(userData.schoolId);
  }, []);

  const tabs = [
    { key: "run",     label: "Run Payroll",     icon: Play },
    { key: "preview", label: "Teacher Preview",  icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SchoolAdminSidebar />

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IndianRupee size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
            <p className="text-sm text-gray-500">Teacher salary calculation &amp; payroll processing</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "run"     && <RunPayrollTab     schoolId={schoolId} />}
        {activeTab === "preview" && <TeacherPreviewTab schoolId={schoolId} />}
      </div>
    </div>
  );
}
