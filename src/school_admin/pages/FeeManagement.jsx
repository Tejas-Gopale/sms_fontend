import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import {
  Plus, Trash2, Search, IndianRupee, X, TrendingUp, AlertCircle,
  CheckCircle2, Settings2, ShieldCheck, ShieldAlert, Zap, Loader2,
  Banknote, Eye, Clock, CheckCircle, XCircle, RefreshCw
} from "lucide-react";
import API from "../../common/services/api";
import { toast, Toaster } from "react-hot-toast";

export default function FeeManagement() {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [classes, setClasses]               = useState([]);
  const [feeHeads, setFeeHeads]             = useState([]);
  const [students, setStudents]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount]   = useState("");
  const [filterMode, setFilterMode]         = useState("all");
  const [newFeeHead, setNewFeeHead]         = useState({ name: "", isOptional: false });
  const [form, setForm]                     = useState({ classRoomId: "", className: "", feeItems: [] });
  const [feeDetail, setFeeDetail]           = useState(null);
  const [detailLoading, setDetailLoading]   = useState(false);

  const schoolId = Number(localStorage.getItem("schoolId")) || 1;

  // Pending UPI verifications
  const [pendingUpi,        setPendingUpi]        = useState([]);
  const [pendingUpiLoading, setPendingUpiLoading] = useState(false);
  const [verifyingId,       setVerifyingId]       = useState(null);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchFeeHeads = async () => {
    try {
      const res = await API.get(`/fees/school/${schoolId}`);
      setFeeHeads(res.data || []);
    } catch (err) {
      toast.error("Fee categories load nahi ho paye" + errMsg(err));
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await API.get(`/fees/students?schoolId=${schoolId}`);
      setStudents(res.data || []);
    } catch (err) {
      toast.error("Student ledger fetch mein issue" + errMsg(err));
    }
  };

  const fetchStudentDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      const res = await API.get(`/fees/student-detail/${studentId}`);
      setFeeDetail(res.data);
    } catch (err) {
      toast.error("Fee detail load nahi ho paya" + errMsg(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const classRes = await API.get("/school-admin/getClassRoom");
        setClasses(classRes.data.content || []);
        await Promise.all([fetchFeeHeads(), fetchLedger(), fetchPendingUpi()]);
      } catch (err) {
        toast.error("Initialization failed" + errMsg(err));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [schoolId]);

  const fetchPendingUpi = async () => {
    try {
      setPendingUpiLoading(true);
      const res = await API.get(`/api/payments/pending-upi?schoolId=${schoolId}`);
      setPendingUpi(res.data || []);
    } catch (err) {
      // silently ignore — not critical
    } finally {
      setPendingUpiLoading(false);
    }
  };

  const handleVerifyUpi = async (paymentId, action) => {
    setVerifyingId(paymentId);
    try {
      const res = await API.post(`/api/payments/verify-upi/${paymentId}?action=${action}`);
      toast.success(res.data?.message || (action === "APPROVE" ? "Approved ✅" : "Rejected"));
      fetchPendingUpi();
      fetchLedger();
    } catch (err) {
      toast.error("Action failed" + errMsg(err));
    } finally {
      setVerifyingId(null);
    }
  };

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleAddFeeHead = async () => {
    if (!newFeeHead.name.trim()) return toast.error("Category name zaroori hai");
    try {
      setLoading(true);
      await API.post("/fees/fee-head", { ...newFeeHead, schoolId });
      setNewFeeHead({ name: "", isOptional: false });
      await fetchFeeHeads();
      toast.success("Fee category create ho gayi ✅");
    } catch (err) {
      toast.error("Category add nahi ho paya" + errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStructure = async () => {
    if (!form.classRoomId)          return toast.error("Class select karo pehle");
    if (form.feeItems.length === 0) return toast.error("Kam se kam ek fee item add karo");
    if (form.feeItems.some(i => !i.amount || !i.feeHeadId))
      return toast.error("Sab items mein fee type aur amount bharo");

    try {
      setLoading(true);
      const res = await API.post("/fees/structure", {
        schoolId,
        classRoomId: Number(form.classRoomId),
        className: form.className,
      });

      const structureId = res.data.id;

      await Promise.all(
        form.feeItems.map(item =>
          API.post("/fees/structure/item", {
            feeStructureId: structureId,
            feeHeadId: Number(item.feeHeadId),
            amount: Number(item.amount),
          })
        )
      );

      toast.success(`✅ ${form.className} ke liye structure save ho gaya!`);
      setForm({ classRoomId: "", className: "", feeItems: [] });
    } catch (err) {
      toast.error("Structure save nahi ho paya" + errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClassFees = async () => {
    if (!form.classRoomId) return toast.error("Pehle class select karo");
    try {
      setLoading(true);
      await API.post(`/fees/generate/class/${form.classRoomId}/${schoolId}`);
      toast.success("🚀 Sab students ke liye fees generate ho gayi!");
      await fetchLedger();
    } catch (err) {
      toast.error(errMsg(err, "Fees generate nahi ho paya. Structure create kiya hai?"));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0)                return toast.error("Valid amount enter karo");
    if (amt > selectedStudent.dueAmount) return toast.error("Amount due se zyada hai!");

    try {
      setLoading(true);
      await API.post("/fees/pay", {
        studentFeeId: selectedStudent.studentFeeId,
        amount: amt,
      });
      toast.success(`₹${amt.toLocaleString()} receive hua – ${selectedStudent.studentName} ✅`);
      setSelectedStudent(null);
      setPaymentAmount("");
      await fetchLedger();
    } catch (err) {
      toast.error("Payment process nahi ho paya" + errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── FORM HELPERS ─────────────────────────────────────────────────────────

  const addFeeItem = () =>
    setForm(f => ({ ...f, feeItems: [...f.feeItems, { feeHeadId: "", amount: "" }] }));

  const removeFeeItem = (idx) =>
    setForm(f => ({ ...f, feeItems: f.feeItems.filter((_, i) => i !== idx) }));

  const handleFormChange = (idx, field, value) => {
    const updated = [...form.feeItems];
    updated[idx][field] = value;
    setForm(f => ({ ...f, feeItems: updated }));
  };

  // ─── STATS ────────────────────────────────────────────────────────────────

  const stats = {
    collected: students.reduce((sum, s) => sum + ((s.totalAmount || 0) - (s.dueAmount || 0)), 0),
    pending:   students.reduce((sum, s) => sum + (s.dueAmount || 0), 0),
    cleared:   students.filter(s => s.dueAmount === 0).length,
  };

  const filteredStudents = students.filter(s => {
    const match = s.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === "outstanding") return match && s.dueAmount > 0;
    if (filterMode === "cleared")     return match && s.dueAmount === 0;
    return match;
  });

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans antialiased text-slate-900">
      <Toaster position="top-right" />
      <SchoolAdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ── TOP BAR ── */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Fee Ledger</h1>
            <p className="text-[11px] text-slate-400 font-medium">
              FINANCIAL OVERSIGHT • {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(loading || detailLoading) && <Loader2 className="animate-spin text-blue-600" size={20} />}
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100">
              TERM 1
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">

          {/* ── STATS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Collected" value={stats.collected} color="emerald" />
            <StatCard icon={<AlertCircle className="text-rose-500" />}   label="Pending"   value={stats.pending}   color="rose" />
            <StatCard icon={<CheckCircle2 className="text-blue-600" />}  label="Cleared"   value={stats.cleared}   suffix="Students" color="blue" />
          </div>

          {/* ── PENDING UPI VERIFICATIONS ── */}
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm mb-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                <h2 className="text-sm font-bold text-orange-800">
                  Pending UPI Verifications
                  {pendingUpi.length > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                      {pendingUpi.length}
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={fetchPendingUpi}
                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {pendingUpiLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-orange-400" size={24} />
              </div>
            ) : pendingUpi.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                ✅ Koi pending UPI verification nahi hai
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="px-5 py-3 text-left font-semibold">Student</th>
                    <th className="px-5 py-3 text-left font-semibold">UTR / Transaction ID</th>
                    <th className="px-5 py-3 text-left font-semibold">Amount</th>
                    <th className="px-5 py-3 text-left font-semibold">Submitted At</th>
                    <th className="px-5 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUpi.map((p) => (
                    <tr key={p.paymentId} className="border-b hover:bg-orange-50/40">
                      <td className="px-5 py-3 font-medium">{p.studentName}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.utrNumber}</td>
                      <td className="px-5 py-3 font-bold text-slate-800">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerifyUpi(p.paymentId, "APPROVE")}
                            disabled={verifyingId === p.paymentId}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            {verifyingId === p.paymentId
                              ? <Loader2 size={12} className="animate-spin" />
                              : <CheckCircle size={12} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyUpi(p.paymentId, "REJECT")}
                            disabled={verifyingId === p.paymentId}
                            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* ── LEDGER TABLE ── */}
            <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

              {/* Search + Filter */}
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Search student name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["all", "outstanding", "cleared"].map(m => (
                    <button
                      key={m}
                      onClick={() => setFilterMode(m)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                        filterMode === m
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Student Info</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Outstanding</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                          {students.length === 0
                            ? "Koi fee record nahi mila. Pehle fees generate karo."
                            : "No students match this filter."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr
                          key={student.studentId}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 transition-all">
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{student.studentName}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                  Class {student.grade} • Sec {student.section}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.dueAmount === 0 ? (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100">
                                PAID
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-rose-400"
                                    style={{
                                      width: `${student.totalAmount > 0
                                        ? (student.dueAmount / student.totalAmount) * 100
                                        : 0}%`
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase">Pending</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-slate-700">
                              ₹{(student.dueAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              of ₹{(student.totalAmount || 0).toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Fee Detail Button */}
                              <button
                                onClick={() => fetchStudentDetail(student.studentId)}
                                className="p-2 bg-white border border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600 rounded-lg shadow-sm transition-all"
                                title="Fee Breakdown"
                              >
                                <Eye size={16} />
                              </button>
                              {/* Payment Button */}
                              {student.dueAmount > 0 && (
                                <button
                                  onClick={() => { setSelectedStudent(student); setPaymentAmount(""); }}
                                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-lg shadow-sm transition-all"
                                  title="Collect Payment"
                                >
                                  <Zap size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── CONFIG SIDEBAR ── */}
            <div className="xl:col-span-4 space-y-6">

              {/* Category Master */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Settings2 size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Category Master</h3>
                </div>
                <input
                  className="w-full mb-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="E.g. Transport Fee, Library"
                  value={newFeeHead.name}
                  onChange={e => setNewFeeHead(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleAddFeeHead()}
                />
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    {newFeeHead.isOptional
                      ? <ShieldAlert size={14} className="text-amber-500" />
                      : <ShieldCheck  size={14} className="text-blue-500" />}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      Optional Fee
                    </span>
                  </div>
                  <Toggle
                    checked={newFeeHead.isOptional}
                    onChange={v => setNewFeeHead(p => ({ ...p, isOptional: v }))}
                  />
                </div>
                <button
                  onClick={handleAddFeeHead}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Create Category
                </button>
              </div>

              {/* Class Structure */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <Plus size={20} className="text-blue-400" /> Fee Structure
                  </h3>
                  <button
                    onClick={handleGenerateClassFees}
                    className="bg-emerald-500 hover:bg-emerald-400 p-2 rounded-lg transition-colors"
                    title="Generate fees for all students in selected class"
                    disabled={loading}
                  >
                    <Zap size={16} fill="white" />
                  </button>
                </div>

                <select
                  className="w-full bg-slate-800 border-none rounded-xl mb-4 p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.classRoomId}
                  onChange={e => {
                    const sel = classes.find(c => c.id === Number(e.target.value));
                    setForm(f => ({
                      ...f,
                      classRoomId: Number(e.target.value),
                      className: sel?.grade || "",
                    }));
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade}-{c.section}</option>
                  ))}
                </select>

                <div className="max-h-[300px] overflow-y-auto space-y-3 mb-6 pr-1">
                  {form.feeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 relative group"
                    >
                      <button
                        onClick={() => removeFeeItem(idx)}
                        className="absolute -top-1 -right-1 bg-rose-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                      <select
                        className="w-full bg-transparent border-none p-0 text-xs font-bold text-blue-400 mb-2 outline-none"
                        value={item.feeHeadId}
                        onChange={e => handleFormChange(idx, "feeHeadId", e.target.value)}
                      >
                        <option value="">Choose Fee Type</option>
                        {feeHeads.map(fh => (
                          <option key={fh.id} value={fh.id}>{fh.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={12} className="text-slate-500" />
                        <input
                          type="number"
                          min="0"
                          className="bg-transparent border-none p-0 text-lg font-black w-full outline-none placeholder:text-slate-700"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={e => handleFormChange(idx, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addFeeItem}
                  className="w-full py-3 mb-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-blue-400 hover:border-blue-400 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  + Add Fee Row
                </button>

                <button
                  onClick={handleSubmitStructure}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-blue-900/40 disabled:opacity-50"
                >
                  Deploy Structure
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FEE DETAIL MODAL ── */}
      {feeDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">

            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-violet-200 mb-4">
                    {feeDetail.studentName.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{feeDetail.studentName}</h2>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mt-1">
                    Class {feeDetail.grade} • Sec {feeDetail.section} • Fee Breakdown
                  </p>
                </div>
                <button
                  onClick={() => setFeeDetail(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total</p>
                  <p className="text-sm font-black text-slate-700">₹{(feeDetail.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Paid</p>
                  <p className="text-sm font-black text-emerald-600">₹{(feeDetail.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
                  <p className="text-[9px] font-bold text-rose-400 uppercase mb-1">Due</p>
                  <p className="text-sm font-black text-rose-600">₹{(feeDetail.dueAmount || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                  <span>Payment Progress</span>
                  <span>
                    {feeDetail.totalAmount > 0
                      ? Math.round((feeDetail.paidAmount / feeDetail.totalAmount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${feeDetail.totalAmount > 0
                        ? (feeDetail.paidAmount / feeDetail.totalAmount) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Breakdown label */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Fee Breakdown ({feeDetail.feeBreakdown?.length || 0} items)
              </p>
            </div>

            {/* Breakdown List */}
            <div className="px-8 max-h-[280px] overflow-y-auto space-y-2 pb-4">
              {feeDetail.feeBreakdown?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 font-black text-xs group-hover:bg-violet-100 transition-colors">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-700">{item.feeHeadName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-700">
                      ₹{(item.totalAmount || 0).toLocaleString()}
                    </p>
                    {item.dueAmount > 0 ? (
                      <p className="text-[10px] font-bold text-rose-400">
                        Due: ₹{item.dueAmount.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-emerald-500">✓ Paid</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 pt-4">
              <button
                onClick={() => setFeeDetail(null)}
                className="w-full py-4 bg-slate-900 hover:bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">

            <div className="p-8 pb-0">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <button
                  onClick={() => { setSelectedStudent(null); setPaymentAmount(""); }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-1">
                {selectedStudent.studentName}
              </h2>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-8">
                Class {selectedStudent.grade} • Payment Collection
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fixed</p>
                  <p className="text-lg font-black text-slate-700">
                    ₹{(selectedStudent.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Current Due</p>
                  <p className="text-lg font-black text-rose-600">
                    ₹{(selectedStudent.dueAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <IndianRupee size={28} />
                  </div>
                  <input
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[2rem] text-4xl font-black text-slate-800 outline-none transition-all placeholder:text-slate-200"
                    placeholder="0.00"
                    type="number"
                    min="1"
                    max={selectedStudent.dueAmount}
                    value={paymentAmount}
                    autoFocus
                    onChange={e => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-3 ml-2">
                  {[0.5, 1].map(mult => (
                    <button
                      key={mult}
                      onClick={() => setPaymentAmount(String(selectedStudent.dueAmount * mult))}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {mult === 1 ? "FULL DUE" : "50% DUE"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className="w-full py-5 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Banknote size={20} />}
                Confirm & Pay
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function errMsg(err, fallback = "") {
  const msg = err?.response?.data?.message || err?.response?.data || fallback;
  return msg ? `: ${msg}` : "";
}

function StatCard({ icon, label, value, suffix = "", color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    rose:    "bg-rose-50 text-rose-500",
    blue:    "bg-blue-50 text-blue-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">
          {suffix
            ? `${value} ${suffix}`
            : `₹${Number(value || 0).toLocaleString()}`}
        </p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
    </label>
  );
}