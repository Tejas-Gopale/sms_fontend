import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { classTeacherService } from "../services/teacherService";
import {
  Wallet,
  ChevronLeft,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Search,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ClassTeacher_Fees() {
  const navigate = useNavigate();

  const [classroom, setClassroom]     = useState(null);
  const [fees, setFees]               = useState([]);
  const [structure, setStructure]     = useState(null);
  const [feeHeads, setFeeHeads]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilter]     = useState("ALL"); // ALL | PENDING | CLEAR
  const [expandedId, setExpandedId]   = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [crRes, feesRes, structRes, headsRes] = await Promise.allSettled([
        classTeacherService.getMyClassroom(),
        classTeacherService.getClassFees(),
        classTeacherService.getFeeStructure(),
        classTeacherService.getFeeHeads(),
      ]);
      if (crRes.status === "fulfilled")    setClassroom(crRes.value.data);
      if (feesRes.status === "fulfilled")  setFees(Array.isArray(feesRes.value.data) ? feesRes.value.data : []);
      if (structRes.status === "fulfilled") setStructure(structRes.value.data);
      if (headsRes.status === "fulfilled") setFeeHeads(headsRes.value.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Computed Totals ──────────────────────────────────────────
  const totalAmount  = fees.reduce((s, f) => s + (f.totalAmount  || 0), 0);
  const totalPaid    = fees.reduce((s, f) => s + (f.paidAmount   || 0), 0);
  const totalDue     = fees.reduce((s, f) => s + (f.dueAmount    || 0), 0);
  const defaulters   = fees.filter((f) => (f.dueAmount || 0) > 0);
  const cleared      = fees.filter((f) => (f.dueAmount || 0) <= 0);
  const collectionPct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // ── Filtered list ────────────────────────────────────────────
  const filtered = fees.filter((f) => {
    const name = (f.student
      ? `${f.student.firstName} ${f.student.lastName}`
      : f.studentName || ""
    ).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter =
      filterStatus === "ALL"
        ? true
        : filterStatus === "PENDING"
        ? (f.dueAmount || 0) > 0
        : (f.dueAmount || 0) <= 0;
    return matchSearch && matchFilter;
  });

  const getStudentName = (f) =>
    f.student
      ? `${f.student.firstName} ${f.student.lastName}`
      : f.studentName || "Unknown Student";

  return (
    <div className="flex">
      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/teachers/dashboard")}
            className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50 text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Overview</h1>
            {classroom && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <GraduationCap size={13} className="text-emerald-500" />
                Grade {classroom.grade} · Section {classroom.section}
              </p>
            )}
          </div>
        </div>

        {/* ── Summary Cards ──────────────────────────────────── */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Billed</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400 mt-1">{fees.length} students</p>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-emerald-500">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-1">
                <TrendingUp size={12} /> Collected
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                ₹{totalPaid.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${collectionPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{collectionPct}% collected</p>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-400">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-1">
                <TrendingDown size={12} /> Pending
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ₹{totalDue.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={11} />
                {defaulters.length} student{defaulters.length !== 1 ? "s" : ""} with dues
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-gray-300">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cleared</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{cleared.length}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-500" />
                Fully paid students
              </p>
            </div>
          </div>
        )}

        {/* Fee Structure info */}
        {structure && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <strong>Fee Structure:</strong> {structure.className} · Academic Year: {structure.academicYear}
            {structure.feeStructureItems?.length > 0 && (
              <span className="ml-2 text-blue-600">
                · {structure.feeStructureItems.length} fee line item{structure.feeStructureItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* ── Filter & Search ─────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "PENDING", "CLEAR"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors
                  ${filterStatus === f
                    ? f === "PENDING"
                      ? "bg-red-500 text-white"
                      : f === "CLEAR"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "ALL" ? `All (${fees.length})` : f === "PENDING" ? `Pending (${defaulters.length})` : `Clear (${cleared.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Student Fee Table ───────────────────────────────── */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading fee data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {fees.length === 0
                  ? "No fee records found for this classroom"
                  : "No students match this filter"}
              </p>
              {fees.length === 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  Fee records are created by the School Admin / Accountant.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((fee, i) => {
                  const hasDue  = (fee.dueAmount || 0) > 0;
                  const isOpen  = expandedId === (fee.studentFeeId || fee.id || i);

                  return (
                    <>
                      <tr key={i} className={`hover:bg-gray-50 transition-colors ${hasDue ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: hasDue ? "linear-gradient(135deg,#ef4444,#f87171)" : "linear-gradient(135deg,#059669,#10b981)" }}
                            >
                              {getStudentName(fee)[0]?.toUpperCase() || "S"}
                            </div>
                            <span className="font-semibold text-gray-800">{getStudentName(fee)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          ₹{(fee.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">
                          ₹{(fee.paidAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className={`px-4 py-3 font-bold ${hasDue ? "text-red-600" : "text-gray-400"}`}>
                          ₹{(fee.dueAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {hasDue ? (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-bold w-fit">
                              <AlertCircle size={11} /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full font-bold w-fit">
                              <CheckCircle2 size={11} /> Clear
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {fee.feeBreakdown?.length > 0 && (
                            <button
                              onClick={() => setExpandedId(isOpen ? null : (fee.studentFeeId || fee.id || i))}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                            >
                              Breakdown {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable fee breakdown */}
                      {isOpen && fee.feeBreakdown?.length > 0 && (
                        <tr key={`${i}-breakdown`}>
                          <td colSpan={6} className="px-4 pb-3 pt-0">
                            <div className="ml-10 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Fee Breakdown</p>
                              <div className="space-y-1.5">
                                {fee.feeBreakdown.map((item, j) => (
                                  <div key={j} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700 font-medium">{item.feeHeadName}</span>
                                    <div className="flex gap-4 text-right">
                                      <span className="text-gray-500">₹{(item.totalAmount || 0).toLocaleString("en-IN")}</span>
                                      <span className="text-emerald-600">₹{(item.paidAmount || 0).toLocaleString("en-IN")} paid</span>
                                      <span className={item.dueAmount > 0 ? "text-red-600 font-semibold" : "text-gray-400"}>
                                        ₹{(item.dueAmount || 0).toLocaleString("en-IN")} due
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Read-only note */}
        <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Note:</strong> Fee collection and structure management is handled by the School Admin / Accountant. This view is read-only.
        </div>
      </div>
    </div>
  );
}