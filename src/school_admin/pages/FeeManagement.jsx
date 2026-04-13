import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, Trash2, Search, CreditCard, IndianRupee, X, Banknote, TrendingUp, AlertCircle, CheckCircle2, Settings2, ShieldCheck, ShieldAlert, Zap } from "lucide-react";
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
  const [filterMode, setFilterMode] = useState("all");

  // New Fee Head Form State
  const [newFeeHead, setNewFeeHead] = useState({ name: "", isOptional: false });

  const [form, setForm] = useState({
    classRoomId: "",
    className: "",
    feeItems: []
  });

  const schoolId = Number(localStorage.getItem("schoolId")) || 1;
  
  // --- DATA LOADING ---
  const fetchFeeHeads = async () => {
    try {
      const res = await API.get(`/fees/school/${schoolId}`);
      setFeeHeads(res.data || []);
    } catch (err) {
      console.error("Error fetching fee heads:", err);
    }
  };

  const fetchLedger = async () => {
    try {
      const studentRes = await API.get(`/fees/students?schoolId=${schoolId}`);
      setStudents(studentRes.data || []);
    } catch (err) {
      console.error("Error fetching student ledger:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await API.get("/school-admin/getClassRoom");
        setClasses(classRes.data.content || []);
        await fetchFeeHeads();
        await fetchLedger();
      } catch (err) {
        console.error("Initialization Error:", err);
      }
    };
    fetchData();
  }, [schoolId]);

  // --- NEW FEE HEAD LOGIC ---
  const handleAddFeeHead = async () => {
    if (!newFeeHead.name.trim()) return alert("Please enter a fee head name");
    try {
      setLoading(true);
      await API.post("/fees/fee-head", {
        name: newFeeHead.name,
        isOptional: newFeeHead.isOptional,
        schoolId: schoolId
      });
      setNewFeeHead({ name: "", isOptional: false });
      await fetchFeeHeads(); // Refresh the list
      alert("Fee Head added successfully!");
    } catch (err) {
      alert("Error adding fee head");
    } finally {
      setLoading(false);
    }
  };

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
      // 1. Create parent structure
      const res = await API.post("/fees/structure", {
        schoolId,
        classRoomId: Number(form.classRoomId),
        className: form.className
      });
      const structureId = res.data.id;
      
      // 2. Add individual fee items
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

  // --- GENERATE CLASS FEES LOGIC ---
  const handleGenerateClassFees = async () => {
    if (!form.classRoomId) return alert("Please select a class first.");
    try {
      setLoading(true);
      await API.post(`/fees/generate/class/${form.classRoomId}/${schoolId}`);
      alert("Fees generated for all students in the class! 🚀");
      await fetchLedger(); // Refresh the table to show new dues
    } catch (err) {
      alert("Error generating class fees. Have you created a structure for this class yet?");
    } finally {
      setLoading(false);
    }
  };

  // --- PAYMENT LOGIC ---
  const handleProcessPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) return alert("Enter valid amount");
    // Make sure your DTO has studentFeeId mapped to the frontend!
    if (!selectedStudent.studentFeeId) return alert("Missing Student Fee ID. Check backend DTO.");
    
    try {
      setLoading(true);
      await API.post("/fees/pay", {
        studentFeeId: selectedStudent.studentFeeId,
        amount: Number(paymentAmount)
      });
      
      alert(`Payment of ₹${paymentAmount} processed successfully!`);
      setSelectedStudent(null);
      setPaymentAmount("");
      await fetchLedger(); // Refresh ledger
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── LEFT: STUDENT LEDGER ── */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Class</th>
                        <th className="px-6 py-3">Total Fees</th>
                        <th className="px-6 py-3 text-right">Balance Due</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No students found</td></tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.studentId} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => student.dueAmount > 0 && setSelectedStudent(student)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                                  {student.studentName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{student.studentName}</p>
                                  <p className="text-xs text-slate-400">ID #{1000 + student.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                                {student.grade} – {student.section}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">₹{student.totalAmount.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-semibold ${student.dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                ₹{student.dueAmount.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {student.dueAmount > 0 ? (
                                <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }} className="bg-blue-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition">
                                  Collect
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-emerald-600">Cleared</span>
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

            {/* ── RIGHT: CONFIGURATIONS ── */}
            <div className="space-y-6">
              
              {/* COMPONENT: FEE HEAD MASTER */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Settings2 size={15} className="text-slate-500" />
                    Fee Head Master
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Global Configuration</p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">New Fee Category Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Library, Laboratory"
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                      value={newFeeHead.name}
                      onChange={(e) => setNewFeeHead({ ...newFeeHead, name: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      {newFeeHead.isOptional ? <ShieldAlert size={14} className="text-amber-500" /> : <ShieldCheck size={14} className="text-blue-500" />}
                      <span className="text-xs font-medium text-slate-600">Optional for students?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={newFeeHead.isOptional}
                        onChange={(e) => setNewFeeHead({ ...newFeeHead, isOptional: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <button 
                    onClick={handleAddFeeHead}
                    disabled={loading}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>
              </div>

              {/* COMPONENT: FEE STRUCTURE */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Plus size={15} className="text-blue-600" />
                    Class Structure
                  </h2>
                  <button 
                    onClick={handleGenerateClassFees}
                    disabled={loading || !form.classRoomId}
                    title="Generate fees for the selected class"
                    className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition flex items-center gap-1 disabled:opacity-50"
                  >
                     <Zap size={12} /> Generate Fees
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Class</label>
                    <select
                      value={form.classRoomId}
                      onChange={(e) => {
                        const selected = classes.find(cls => cls.id === Number(e.target.value));
                        setForm({ ...form, classRoomId: Number(e.target.value), className: selected?.grade });
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-slate-50 outline-none"
                    >
                      <option value="">Select class…</option>
                      {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Assign Fee Heads</label>
                    <div className="space-y-3">
                      {form.feeItems.map((item, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Item #{index + 1}</span>
                            <button onClick={() => removeFeeItem(index)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={13} /></button>
                          </div>
                          <select
                            value={item.feeHeadId}
                            onChange={(e) => handleFormChange(index, "feeHeadId", e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
                          >
                            <option value="">Select fee type</option>
                            {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name} {fh.isOptional ? '(Optional)' : ''}</option>)}
                          </select>
                          <div className="grid grid-cols-5 gap-2">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) => handleFormChange(index, "amount", e.target.value)}
                              className="col-span-3 text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
                            />
                            <select
                              value={item.frequency}
                              onChange={(e) => handleFormChange(index, "frequency", e.target.value)}
                              className="col-span-2 text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
                            >
                              <option value="Monthly">/ Mo</option>
                              <option value="Yearly">/ Yr</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addFeeItem} className="w-full mt-3 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1.5">
                      <Plus size={13} /> Add Fee Item
                    </button>
                  </div>

                  {form.feeItems.length > 0 && (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Annual estimate</span>
                      <span className="text-sm font-semibold text-slate-700">₹{annualEstimate.toLocaleString("en-IN")}</span>
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
      </div>

      {/* ── PAYMENT MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold text-sm">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-base">{selectedStudent.studentName}</h2>
                  <p className="text-slate-400 text-xs">Class {selectedStudent.grade} – Section {selectedStudent.section}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedStudent(null); setPaymentAmount(""); }} className="text-slate-400 hover:text-white transition"><X size={18} /></button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Total</p>
                  <p className="text-lg font-semibold text-slate-800">₹{selectedStudent.totalAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                  <p className="text-xs text-red-400 font-medium uppercase mb-1">Due</p>
                  <p className="text-lg font-semibold text-red-600">₹{selectedStudent.dueAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Amount to Collect</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="number" autoFocus placeholder="0"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-2xl font-semibold outline-none transition"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  /> 
                </div>
                <button onClick={() => setPaymentAmount(String(selectedStudent.dueAmount))} className="mt-2 text-xs text-blue-600 hover:underline">
                  Fill full due amount
                </button>
              </div>

              {/* Confirm Payment Button */}
              <button 
                onClick={handleProcessPayment} 
                disabled={loading || !paymentAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Process Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}