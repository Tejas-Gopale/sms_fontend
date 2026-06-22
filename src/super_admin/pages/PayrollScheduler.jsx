// src/super_admin/pages/PayrollScheduler.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SUPER_ADMIN ONLY — Manually trigger the payroll scheduler for all schools
// Backend: POST /api/v1/payroll/scheduler/trigger?month=X&year=Y
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { payrollSchedulerService } from "../../common/services/payrollService";
import {
  Zap,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Clock,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2024, 2025, 2026];

export default function PayrollScheduler() {
  const now = new Date();
  // Default: pichla mahina (auto-scheduler ka same behaviour)
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [month, setMonth]       = useState(prevMonth);
  const [year, setYear]         = useState(prevYear);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleTrigger = async () => {
    if (!confirmed) {
      setError("Please confirm before triggering. Ye sab active schools pe run hoga.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await payrollSchedulerService.triggerScheduler(month, year);
      setResult(res.data); // plain string message from backend
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Scheduler trigger failed. Check server logs.");
    } finally {
      setLoading(false);
      setConfirmed(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RoleSidebar />

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payroll Scheduler</h1>
            <p className="text-sm text-gray-500">Manually trigger monthly payroll job for all active schools</p>
          </div>
        </div>

        <div className="max-w-xl">
          {/* How it works */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              How it works
            </h3>
            <div className="space-y-3">
              {[
                { icon: Clock,       text: "Normally auto-runs on 1st of every month at 6:00 PM IST (pichle mahine ka payroll)." },
                { icon: Zap,         text: "Ye page se aap manually kisi bhi month/year ka payroll force-trigger kar sakte ho." },
                { icon: CalendarDays,text: "Sirf DRAFT banata hai — admin ko baad mein finalize + disburse karna hoga." },
                { icon: CheckCircle, text: "Already FINALIZED payroll pe dobara run hoga toh wo school skip ho jaayegi." },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <Icon size={15} className="flex-shrink-0 mt-0.5 text-blue-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-5">Trigger Payroll Run</h3>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Warning banner */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                <strong>Caution:</strong> Ye trigger saari active schools pe payroll create karega.
                Ek hi baar karo — double trigger se duplicate records ban sakte hain
                (already-finalized schools skip ho jaayengi, but naye DRAFT duplicate ho sakte hain).
              </span>
            </div>

            {/* Confirm checkbox */}
            <label className="flex items-center gap-3 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => { setConfirmed(e.target.checked); setError(""); }}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm text-gray-700 font-medium">
                Main samajhta hoon — <strong>{MONTHS[month - 1]} {year}</strong> ka payroll
                saari active schools pe trigger karna chahta hoon.
              </span>
            </label>

            <button
              onClick={handleTrigger}
              disabled={loading || !confirmed}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Triggering...</>
                : <><Zap size={16} /> Trigger Payroll — {MONTHS[month - 1]} {year}</>
              }
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mt-4">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-4">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <CheckCircle size={20} />
                Scheduler Triggered Successfully!
              </div>
              <p className="text-sm text-green-700">{result}</p>
              <p className="text-xs text-green-600 mt-2">
                Server logs check karo har school ka status dekhne ke liye.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
