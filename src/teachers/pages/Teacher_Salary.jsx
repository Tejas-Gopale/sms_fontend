// src/teachers/pages/Teacher_Salary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — My Salary page
//   Tab 1: Salary Slip    — existing slip by month/year
//   Tab 2: Leave Summary  — NEW: annual leave balance via new payroll API
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { manualPayrollService } from "../../common/services/payrollService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Mail,
  AlertCircle,
  CalendarDays,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const YEARS = [2024, 2025, 2026];

const fmt = (val) =>
  val != null
    ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "—";

const LEAVE_TYPE_LABELS = {
  CASUAL_LEAVE:      "Casual Leave (CL)",
  SICK_LEAVE:        "Sick Leave (SL)",
  EARNED_LEAVE:      "Earned Leave (EL)",
  LEAVE_WITHOUT_PAY: "Leave Without Pay (LWP)",
  MATERNITY_LEAVE:   "Maternity Leave",
  PATERNITY_LEAVE:   "Paternity Leave",
};

// ─── Tab 1: Salary Slip ────────────────────────────────────────────────────

function SalarySlipTab({ teacherId }) {
  const now = new Date();
  const [month, setMonth]           = useState(now.getMonth() + 1);
  const [year, setYear]             = useState(now.getFullYear());
  const [slip, setSlip]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (teacherId) fetchSlip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, month, year]);

  const fetchSlip = async () => {
    setLoading(true);
    setError("");
    setSlip(null);
    try {
      // Try new payroll API first, fallback to old endpoint
      const res = await manualPayrollService.getTeacherSlip(teacherId, month, year);
      setSlip(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No salary slip found for this period.");
      } else {
        // fallback: try old endpoint
        try {
          const res2 = await API.get(`/salary-slip/teacher/${teacherId}`, {
            params: { month, year },
          });
          setSlip(res2.data);
        } catch {
          setError("No salary slip found for this period.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSlip = async () => {
    if (!slip?.id) return;
    setEmailSending(true);
    try {
      await API.post(`/salary-slip/${slip.id}/email`);
      alert("Salary slip sent to your email ✅");
    } catch {
      alert("Failed to send email ❌");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <>
      {/* Period selectors */}
      <div className="flex gap-3 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading salary slip...
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {slip && !loading && (
        <div className="max-w-2xl">
          {/* Employee Info */}
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{slip.employeeName}</h3>
                <p className="text-gray-500 text-sm">
                  {slip.designation} · Emp Code: {slip.employeeCode}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Pay Period: {MONTHS[slip.payrollMonth - 1]} {slip.payrollYear}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                slip.slipStatus === "PAID"
                  ? "bg-green-100 text-green-700"
                  : slip.slipStatus === "GENERATED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {slip.slipStatus}
              </span>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Working Days", value: slip.totalWorkingDays },
              { label: "Present Days", value: slip.presentDays },
              { label: "LOP Days",     value: slip.lopDays },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Earnings & Deductions */}
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 flex items-center gap-1 mb-3">
                  <TrendingUp size={16} /> Earnings
                </h4>
                {[
                  ["Basic Salary",       slip.basicSalary],
                  ["HRA",                slip.hra],
                  ["DA",                 slip.da],
                  ["TA",                 slip.ta],
                  ["Medical",            slip.medical],
                  ["Special Allowance",  slip.specialAllowance],
                  ["Arrear",             slip.arrear],
                ].filter(([, v]) => v != null).map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-600">{l}</span>
                    <span className="font-medium">{fmt(v)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2 text-green-700">
                  <span>Gross Earnings</span>
                  <span>{fmt(slip.grossEarnings)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 flex items-center gap-1 mb-3">
                  <TrendingDown size={16} /> Deductions
                </h4>
                {[
                  ["LOP Deduction",   slip.lopDeduction],
                  ["PF (12%)",        slip.pfDeduction],
                  ["ESI (0.75%)",     slip.esiDeduction],
                  ["Professional Tax",slip.professionalTax],
                  ["TDS",             slip.tdsDeduction],
                ].filter(([, v]) => v != null).map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-600">{l}</span>
                    <span className="font-medium text-red-500">- {fmt(v)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2 text-red-600">
                  <span>Total Deductions</span>
                  <span>- {fmt(slip.totalDeductions)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Net Payable</span>
              <span className="text-2xl font-bold text-green-600">{fmt(slip.netPayable)}</span>
            </div>
          </div>

          {/* Bank Details */}
          {slip.bankName && (
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Bank Details</h4>
              <p className="text-sm text-gray-600">Bank: {slip.bankName}</p>
              <p className="text-sm text-gray-600">Account: {slip.bankAccountNumber}</p>
              <p className="text-sm text-gray-600">IFSC: {slip.bankIfscCode}</p>
            </div>
          )}

          <button
            onClick={handleEmailSlip}
            disabled={emailSending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            <Mail size={16} />
            {emailSending ? "Sending..." : "Email Salary Slip"}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Tab 2: Leave Summary ──────────────────────────────────────────────────

function LeaveSummaryTab({ teacherId }) {
  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (teacherId) fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, year]);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await manualPayrollService.getTeacherLeaveSummary(teacherId, year);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Leave summary load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Year selector */}
      <div className="flex gap-3 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading leave summary...
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="max-w-2xl space-y-4">
          {/* YTD Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Paid Leave Taken",    value: data.totalPaidLeaveTaken,    color: "text-green-600", bg: "bg-green-50"  },
              { label: "LWP Taken",           value: data.totalLwpTaken,          color: "text-red-600",   bg: "bg-red-50"    },
              { label: "Absent (No Leave)",   value: data.totalAbsentWithoutLeave,color: "text-amber-600", bg: "bg-amber-50"  },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${color} mt-1`}>{value ?? 0}</p>
                <p className="text-xs text-gray-400">days</p>
              </div>
            ))}
          </div>

          {/* Leave Balance Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-500" />
              Annual Leave Balance — {year}
            </h4>

            {data.leaveBalances?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-600 rounded-l-lg">Leave Type</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-600">Allocated</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-600">Used</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-600 rounded-r-lg">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaveBalances.map((b, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-gray-700">
                            {LEAVE_TYPE_LABELS[b.leaveType] || b.leaveType}
                          </span>
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                            b.isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {b.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5 text-gray-600">{b.totalAllocated}</td>
                        <td className="text-center px-3 py-2.5 text-gray-600">{b.usedDays}</td>
                        <td className="text-center px-3 py-2.5">
                          <span className={`font-bold ${b.remaining > 0 ? "text-green-600" : "text-red-500"}`}>
                            {b.remaining}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No leave balance data found for {year}.</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Leave Deduction Logic</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span><strong>Paid Leave (CL/SL/EL approved)</strong> — Salary pe koi effect nahi</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={12} className="text-red-500" />
                <span><strong>LWP / ABSENT</strong> — Per-day salary deduct hoti hai (LOP)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function TeacherSalary() {
  const [activeTab, setActiveTab] = useState("slip");
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    if (userData?.userId) setTeacherId(userData.userId);
  }, []);

  const tabs = [
    { key: "slip",  label: "Salary Slip",   icon: IndianRupee },
    { key: "leave", label: "Leave Summary",  icon: CalendarDays },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <IndianRupee size={28} className="text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">My Salary</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1 w-fit mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "slip"  && <SalarySlipTab  teacherId={teacherId} />}
        {activeTab === "leave" && <LeaveSummaryTab teacherId={teacherId} />}
      </div>
    </div>
  );
}
