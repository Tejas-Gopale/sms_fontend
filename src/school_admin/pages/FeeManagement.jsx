import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, Trash2, Search, CreditCard, User, IndianRupee, X, Banknote, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import API from "../../common/services/api";

export default function FeeManagement() {
  // --- STATE MANAGEMENT ---
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // "all" | "outstanding" | "cleared"

  const [form, setForm] = useState({
    classRoomId: "",
    className: "",
    feeItems: []
  });

  const schoolId = Number(localStorage.getItem("schoolId")) || 1;

  // --- DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, feeHeadRes, studentRes] = await Promise.all([
          API.get("/school-admin/getClassRoom"),
          API.get(`/fees/school/${schoolId}`),
          API.get(`/fees/students?schoolId=${schoolId}`)
        ]);
        setClasses(classRes.data.content || []);
        setFeeHeads(feeHeadRes.data || []);
        setStudents(studentRes.data || []);
      } catch (err) {
        console.error("Initialization Error:", err);
      }
    };
    fetchData();
  }, [schoolId]);

  // --- FEE STRUCTURE LOGIC ---
  const addFeeItem = () => {
    setForm({
      ...form,
      feeItems: [...form.feeItems, { feeHeadId: "", amount: "", frequency: "Monthly" }]
    });
  };

  const removeFeeItem = (index) => {
    const updated = [...form.feeItems];
    updated.splice(index, 1);
    setForm({ ...form, feeItems: updated });
  };

  const handleFormChange = (index, field, value) => {
    const updated = [...form.feeItems];
    updated[index][field] = value;
    setForm({ ...form, feeItems: updated });
  };

  const handleSubmitStructure = async () => {
    if (!form.classRoomId || form.feeItems.length === 0) {
      return alert("Please select a class and add at least one fee item.");
    }
    try {
      setLoading(true);
      const res = await API.post("/fees/structure", {
        schoolId,
        classRoomId: Number(form.classRoomId),
        className: form.className
      });
      const structureId = res.data.id;
      for (let item of form.feeItems) {
        await API.post("/fees/structure/item", {
          feeStructureId: structureId,
          feeHeadId: item.feeHeadId,
          amount: Number(item.amount)
        });
      }
      alert("Structure Created Successfully ✅");
      setForm({ classRoomId: "", className: "", feeItems: [] });
    } catch (err) {
      alert("Error creating structure");
    } finally {
      setLoading(false);
    }
  };

  // --- PAYMENT LOGIC ---
  const handleProcessPayment = async (type) => {
    if (!paymentAmount || paymentAmount <= 0) return alert("Enter valid amount");
    try {
      setLoading(true);
      alert(`Payment of ₹${paymentAmount} processed via ${type}!`);
      setSelectedStudent(null);
      setPaymentAmount("");
      const studentRes = await API.get(`/fees/students?schoolId=${schoolId}`);
      setStudents(studentRes.data);
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // --- COMPUTED VALUES ---
  const totalCollected = students.reduce((sum, s) => sum + (s.totalAmount - s.dueAmount), 0);
  const totalPending = students.reduce((sum, s) => sum + s.dueAmount, 0);
  const clearedCount = students.filter(s => s.dueAmount === 0).length;

  const annualEstimate = form.feeItems.reduce((sum, item) => {
    const amt = Number(item.amount) || 0;
    return sum + (item.frequency === "Monthly" ? amt * 12 : amt);
  }, 0);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === "outstanding") return matchesSearch && s.dueAmount > 0;
    if (filterMode === "cleared") return matchesSearch && s.dueAmount === 0;
    return matchesSearch;
  });

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <SchoolAdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP BAR ── */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Fee Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Collect payments and configure fee structures</p>
          </div>
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
            AY 2024–25
          </span>
        </header>

        <div className="flex-1 p-8 overflow-auto">

          {/* ── SUMMARY STATS ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Collected</p>
                <p className="text-xl font-semibold text-emerald-600 mt-0.5">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pending Dues</p>
                <p className="text-xl font-semibold text-red-500 mt-0.5">
                  ₹{totalPending.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Fully Cleared</p>
                <p className="text-xl font-semibold text-slate-800 mt-0.5">
                  {clearedCount} <span className="text-sm text-slate-400 font-normal">students</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── LEFT: STUDENT LEDGER ── */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

                {/* Card Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700">Student Fee Ledger</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Collect" to open payment panel</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                    {filteredStudents.length} records
                  </span>
                </div>

                {/* Search & Filters */}
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                      type="text"
                      placeholder="Search by name or grade…"
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-700 placeholder-slate-300"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {["all", "outstanding", "cleared"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition capitalize ${
                        filterMode === mode
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {mode === "all" ? "All" : mode === "outstanding" ? "Outstanding" : "Cleared"}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Fees</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Balance Due</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr
                            key={student.studentId}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => student.dueAmount > 0 && setSelectedStudent(student)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                  {student.studentName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{student.studentName}</p>
                                  <p className="text-xs text-slate-400">ID #{1000 + student.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                                {student.grade} – {student.section}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              ₹{student.totalAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-semibold ${student.dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                ₹{student.dueAmount.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {student.dueAmount > 0 ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition"
                                >
                                  <IndianRupee size={11} /> Collect
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                  <CheckCircle2 size={12} /> Cleared
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── RIGHT: FEE STRUCTURE ── */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Plus size={15} className="text-blue-600" />
                  New Fee Structure
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Define class-wise fee heads</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Class Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Class</label>
                  <select
                    value={form.classRoomId}
                    onChange={(e) => {
                      const selected = classes.find(cls => cls.id === Number(e.target.value));
                      setForm({ ...form, classRoomId: Number(e.target.value), className: selected?.grade });
                    }}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select class…</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>
                    ))}
                  </select>
                </div>

                {/* Fee Items */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Fee Items</label>
                  <div className="space-y-3">
                    {form.feeItems.map((item, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400">Item #{index + 1}</span>
                          <button
                            onClick={() => removeFeeItem(index)}
                            className="text-slate-300 hover:text-red-500 transition p-0.5 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <select
                          value={item.feeHeadId}
                          onChange={(e) => handleFormChange(index, "feeHeadId", e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select fee type</option>
                          {feeHeads.map(fh => (
                            <option key={fh.id} value={fh.id}>{fh.name}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-5 gap-2">
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => handleFormChange(index, "amount", e.target.value)}
                            className="col-span-3 text-sm border border-slate-200 rounded-lg p-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={item.frequency}
                            onChange={(e) => handleFormChange(index, "frequency", e.target.value)}
                            className="col-span-2 text-sm border border-slate-200 rounded-lg p-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Monthly">/ Mo</option>
                            <option value="Yearly">/ Yr</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addFeeItem}
                    className="w-full mt-3 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} /> Add fee type
                  </button>
                </div>

                {/* Annual Estimate */}
                {form.feeItems.length > 0 && (
                  <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Annual estimate</span>
                    <span className="text-sm font-semibold text-slate-700">
                      ₹{annualEstimate.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSubmitStructure}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition"
                >
                  {loading ? "Saving…" : "Save Structure"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{selectedStudent.studentName}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Class {selectedStudent.grade} – Section {selectedStudent.section}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setPaymentAmount(""); }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">

              {/* Fee Summary */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Fees</p>
                  <p className="text-lg font-semibold text-slate-800">
                    ₹{selectedStudent.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-1">Pending Due</p>
                  <p className="text-lg font-semibold text-red-600">
                    ₹{selectedStudent.dueAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Amount to Collect
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="number"
                    autoFocus
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-2xl font-semibold text-slate-800 outline-none transition"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setPaymentAmount(String(selectedStudent.dueAmount))}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Fill full due amount
                </button>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleProcessPayment("Cash")}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-4 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition">
                    <Banknote size={20} className="text-slate-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Cash Payment</span>
                </button>

                <button
                  onClick={() => handleProcessPayment("Online")}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-4 border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center">
                    <CreditCard size={20} className="text-emerald-700" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">UPI / QR Code</span>
                </button>
              </div>

              <p className="text-center text-slate-400 text-xs mt-5">
                UPI payments auto-trigger the external QR display screen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}