import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { 
  Plus, Trash2, Search, IndianRupee, X, TrendingUp, AlertCircle, 
  CheckCircle2, Settings2, ShieldCheck, ShieldAlert, Zap, Loader2 
} from "lucide-react";
import API from "../../common/services/api";
import { toast, Toaster } from "react-hot-toast"; // Feedback ke liye highly recommended

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

  const [newFeeHead, setNewFeeHead] = useState({ name: "", isOptional: false });
  const [form, setForm] = useState({ classRoomId: "", className: "", feeItems: [] });

  const schoolId = Number(localStorage.getItem("schoolId")) || 1;
  
  // --- DATA LOADING ---
  const fetchFeeHeads = async () => {
    try {
      const res = await API.get(`/fees/school/${schoolId}`);
      setFeeHeads(res.data || []);
    } catch (err) {
      toast.error("Fee Heads load nahi ho paye" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    }
  };

  const fetchLedger = async () => {
    try {
      const studentRes = await API.get(`/fees/students?schoolId=${schoolId}`);
      setStudents(studentRes.data || []);
    } catch (err) {
      toast.error("Student Ledger fetch karne mein issue hai" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const classRes = await API.get("/school-admin/getClassRoom");
        setClasses(classRes.data.content || []);
        await Promise.all([fetchFeeHeads(), fetchLedger()]);
      } catch (err) {
        toast.error("Initialization Failed" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [schoolId]);

  // --- HANDLERS ---
  const handleAddFeeHead = async () => {
    if (!newFeeHead.name.trim()) return toast.error("Category name zaroori hai");
    try {
      setLoading(true);
      await API.post("/fees/fee-head", { ...newFeeHead, schoolId });
      setNewFeeHead({ name: "", isOptional: false });
      await fetchFeeHeads();
      toast.success("New Fee Category Added! ✅");
    } catch (err) {
      toast.error("Add karne mein error aaya" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStructure = async () => {
    if (!form.classRoomId || form.feeItems.length === 0) return toast.error("Class and Items required");
    
    // Check for empty amounts
    if (form.feeItems.some(item => !item.amount || !item.feeHeadId)) {
      return toast.error("Please fill all amount and fee type fields");
    }

    try {
      setLoading(true);
      const res = await API.post("/fees/structure", {
        schoolId,
        classRoomId: Number(form.classRoomId),
        className: form.className
      });
      
      const structureId = res.data.id;
      const itemPromises = form.feeItems.map(item => 
        API.post("/fees/structure/item", {
          feeStructureId: structureId,
          feeHeadId: item.feeHeadId,
          amount: Number(item.amount)
        })
      );
      
      await Promise.all(itemPromises);
      toast.success("Structure Saved for " + form.className);
      setForm({ classRoomId: "", className: "", feeItems: [] });
    } catch (err) {
      toast.error("Structure save nahi ho paya" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) return toast.error("Amount valid nahi hai");
    if (amt > selectedStudent.dueAmount) return toast.error("Amount due se zyada hai!");

    try {
      setLoading(true);
      await API.post("/fees/pay", {
        studentFeeId: selectedStudent.studentFeeId,
        amount: amt
      });
      
      toast.success(`₹${amt} Received from ${selectedStudent.studentName}`);
      setSelectedStudent(null);
      setPaymentAmount("");
      await fetchLedger();
    } catch (err) {
      toast.error("Payment Process failed" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  const addFeeItem = () => {
    setForm({
      ...form,
      feeItems: [...form.feeItems, { feeHeadId: "", amount: "" }]
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

  const handleGenerateClassFees = async () => {
    if (!form.classRoomId) return toast.error("Please select a class first.");
    try {
      setLoading(true);
      await API.post(`/fees/generate/class/${form.classRoomId}/${schoolId}`);
      toast.success("Fees generated for all students in the class! 🚀");
      await fetchLedger();
    } catch (err) {
      toast.error("Error generating class fees. Have you created a structure for this class yet?" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULATIONS ---
  const stats = {
    collected: students.reduce((sum, s) => sum + (s.totalAmount - s.dueAmount), 0),
    pending: students.reduce((sum, s) => sum + s.dueAmount, 0),
    cleared: students.filter(s => s.dueAmount === 0).length
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === "outstanding") return matchesSearch && s.dueAmount > 0;
    if (filterMode === "cleared") return matchesSearch && s.dueAmount === 0;
    return matchesSearch;
  });

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans antialiased text-slate-900">
      <Toaster position="top-right" />
      <SchoolAdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Fee Ledger</h1>
            <p className="text-[11px] text-slate-400 font-medium">FINANCIAL OVERSIGHT • {new Date().getFullYear()}</p>
          </div>
          <div className="flex items-center gap-4">
             {loading && <Loader2 className="animate-spin text-blue-600" size={20} />}
             <div className="h-8 w-[1px] bg-slate-200 mx-2" />
             <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100">TERM 1</span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Collected" value={stats.collected} color="emerald" />
            <StatCard icon={<AlertCircle className="text-rose-500" />} label="Pending" value={stats.pending} color="rose" />
            <StatCard icon={<CheckCircle2 className="text-blue-600" />} label="Cleared" value={stats.cleared} suffix="Students" color="blue" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEDGER TABLE */}
            <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
               <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Search student name..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['all', 'outstanding', 'cleared'].map(m => (
                      <button 
                        key={m} onClick={() => setFilterMode(m)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filterMode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Student Info</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Outstanding</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map(student => (
                        <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 transition-all">
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{student.studentName}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Class {student.grade} • Sec {student.section}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.dueAmount === 0 ? (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100">PAID</span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-rose-400" style={{ width: `${(student.dueAmount/student.totalAmount)*100}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase">Pending</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-slate-700">₹{student.dueAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-medium">of ₹{student.totalAmount.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.dueAmount > 0 && (
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="p-2 bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-lg shadow-sm transition-all"
                              >
                                <Zap size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* CONFIG SIDEBAR */}
            <div className="xl:col-span-4 space-y-6">
               {/* CATEGORY MASTER */}
               <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Settings2 size={20}/></div>
                    <h3 className="font-bold text-slate-800">Category Master</h3>
                  </div>
                  <input 
                    className="w-full mb-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    placeholder="E.g. Transport Fee, Library"
                    value={newFeeHead.name}
                    onChange={e => setNewFeeHead({...newFeeHead, name: e.target.value})}
                  />
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                      {newFeeHead.isOptional ? <ShieldAlert size={14} className="text-amber-500" /> : <ShieldCheck size={14} className="text-blue-500" />}
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Optional</span>
                    </div>
                    <Toggle checked={newFeeHead.isOptional} onChange={v => setNewFeeHead({...newFeeHead, isOptional: v})} />
                  </div>
                  <button onClick={handleAddFeeHead} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                    <Plus size={18}/> Create Category
                  </button>
               </div>

               {/* CLASS STRUCTURE */}
               <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2"><Plus size={20} className="text-blue-400"/> Structure</h3>
                    <button 
                      onClick={handleGenerateClassFees}
                      className="bg-emerald-500 hover:bg-emerald-400 p-2 rounded-lg transition-colors"
                      title="Run Auto-Generation"
                    >
                      <Zap size={16} fill="white"/>
                    </button>
                  </div>
                  
                  <select 
                    className="w-full bg-slate-800 border-none rounded-xl mb-4 p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={e => {
                      const sel = classes.find(c => c.id === Number(e.target.value));
                      setForm({...form, classRoomId: Number(e.target.value), className: sel?.grade});
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.grade}-{c.section}</option>)}
                  </select>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 mb-6 pr-1 custom-scrollbar">
                    {form.feeItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 relative group">
                        <button onClick={() => removeFeeItem(idx)} className="absolute -top-1 -right-1 bg-rose-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10}/></button>
                        <select 
                          className="w-full bg-transparent border-none p-0 text-xs font-bold text-blue-400 mb-2 outline-none"
                          value={item.feeHeadId}
                          onChange={e => handleFormChange(idx, "feeHeadId", e.target.value)}
                        >
                          <option value="">Choose Fee Type</option>
                          {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <IndianRupee size={12} className="text-slate-500"/>
                          <input 
                            type="number" className="bg-transparent border-none p-0 text-lg font-black w-full outline-none placeholder:text-slate-700" 
                            placeholder="0.00" value={item.amount}
                            onChange={e => handleFormChange(idx, "amount", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={addFeeItem} className="w-full py-3 mb-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-blue-400 hover:border-blue-400 transition-all text-xs font-bold uppercase tracking-widest">
                    + Add Fee Row
                  </button>

                  <button onClick={handleSubmitStructure} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-blue-900/40">
                    Deploy Structure
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL - REDESIGNED */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                    {selectedStudent.studentName.charAt(0)}
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20}/></button>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedStudent.studentName}</h2>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-8">Class {selectedStudent.grade} • Collection</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fixed</p>
                    <p className="text-lg font-black text-slate-700">₹{selectedStudent.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Current Due</p>
                    <p className="text-lg font-black text-rose-600">₹{selectedStudent.dueAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-8">
                   <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"><IndianRupee size={28}/></div>
                      <input 
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[2rem] text-4xl font-black text-slate-800 outline-none transition-all placeholder:text-slate-200"
                        placeholder="0.00" value={paymentAmount} autoFocus
                        onChange={e => setPaymentAmount(e.target.value)}
                      />
                   </div>
                   <div className="flex gap-2 mt-3 ml-2">
                     {[0.5, 1].map(mult => (
                       <button key={mult} onClick={() => setPaymentAmount(String(selectedStudent.dueAmount * mult))} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                         {mult === 1 ? 'FULL DUE' : '50% DUE'}
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={handleProcessPayment}
                  className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Confirm & Pay <Banknote size={20}/>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ icon, label, value, suffix = "", color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-500",
    blue: "bg-blue-50 text-blue-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">
          {typeof value === 'number' && !suffix ? `₹${value.toLocaleString()}` : `${value} ${suffix}`}
        </p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
    </label>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { Plus, Trash2, Search, CreditCard, IndianRupee, X, Banknote, TrendingUp, AlertCircle, CheckCircle2, Settings2, ShieldCheck, ShieldAlert, Zap } from "lucide-react";
// import API from "../../common/services/api";

// export default function FeeManagement() {
//   // --- STATE MANAGEMENT ---
//   const [classes, setClasses] = useState([]);
//   const [feeHeads, setFeeHeads] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [filterMode, setFilterMode] = useState("all");

//   // New Fee Head Form State
//   const [newFeeHead, setNewFeeHead] = useState({ name: "", isOptional: false });

//   const [form, setForm] = useState({
//     classRoomId: "",
//     className: "",
//     feeItems: []
//   });

//   const schoolId = Number(localStorage.getItem("schoolId")) || 1;
  
//   // --- DATA LOADING ---
//   const fetchFeeHeads = async () => {
//     try {
//       const res = await API.get(`/fees/school/${schoolId}`);
//       setFeeHeads(res.data || []);
//     } catch (err) {
//       console.error("Error fetching fee heads:", err);
//     }
//   };

//   const fetchLedger = async () => {
//     try {
//       const studentRes = await API.get(`/fees/students?schoolId=${schoolId}`);
//       setStudents(studentRes.data || []);
//     } catch (err) {
//       console.error("Error fetching student ledger:", err);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const classRes = await API.get("/school-admin/getClassRoom");
//         setClasses(classRes.data.content || []);
//         await fetchFeeHeads();
//         await fetchLedger();
//       } catch (err) {
//         console.error("Initialization Error:", err);
//       }
//     };
//     fetchData();
//   }, [schoolId]);

//   // --- NEW FEE HEAD LOGIC ---
//   const handleAddFeeHead = async () => {
//     if (!newFeeHead.name.trim()) return alert("Please enter a fee head name");
//     try {
//       setLoading(true);
//       await API.post("/fees/fee-head", {
//         name: newFeeHead.name,
//         isOptional: newFeeHead.isOptional,
//         schoolId: schoolId
//       });
//       setNewFeeHead({ name: "", isOptional: false });
//       await fetchFeeHeads(); // Refresh the list
//       alert("Fee Head added successfully!");
//     } catch (err) {
//       alert("Error adding fee head");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- FEE STRUCTURE LOGIC ---
//   const addFeeItem = () => {
//     setForm({
//       ...form,
//       feeItems: [...form.feeItems, { feeHeadId: "", amount: "", frequency: "Monthly" }]
//     });
//   };

//   const removeFeeItem = (index) => {
//     const updated = [...form.feeItems];
//     updated.splice(index, 1);
//     setForm({ ...form, feeItems: updated });
//   };

//   const handleFormChange = (index, field, value) => {
//     const updated = [...form.feeItems];
//     updated[index][field] = value;
//     setForm({ ...form, feeItems: updated });
//   };

//   const handleSubmitStructure = async () => {
//     if (!form.classRoomId || form.feeItems.length === 0) {
//       return alert("Please select a class and add at least one fee item.");
//     }
//     try {
//       setLoading(true);
//       // 1. Create parent structure
//       const res = await API.post("/fees/structure", {
//         schoolId,
//         classRoomId: Number(form.classRoomId),
//         className: form.className
//       });
//       const structureId = res.data.id;
      
//       // 2. Add individual fee items
//       for (let item of form.feeItems) {
//         await API.post("/fees/structure/item", {
//           feeStructureId: structureId,
//           feeHeadId: item.feeHeadId,
//           amount: Number(item.amount)
//         });
//       }
//       alert("Structure Created Successfully ✅");
//       setForm({ classRoomId: "", className: "", feeItems: [] });
//     } catch (err) {
//       alert("Error creating structure");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- GENERATE CLASS FEES LOGIC ---
//   const handleGenerateClassFees = async () => {
//     if (!form.classRoomId) return alert("Please select a class first.");
//     try {
//       setLoading(true);
//       await API.post(`/fees/generate/class/${form.classRoomId}/${schoolId}`);
//       alert("Fees generated for all students in the class! 🚀");
//       await fetchLedger(); // Refresh the table to show new dues
//     } catch (err) {
//       alert("Error generating class fees. Have you created a structure for this class yet?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- PAYMENT LOGIC ---
//   const handleProcessPayment = async () => {
//     if (!paymentAmount || paymentAmount <= 0) return alert("Enter valid amount");
//     // Make sure your DTO has studentFeeId mapped to the frontend!
//     if (!selectedStudent.studentFeeId) return alert("Missing Student Fee ID. Check backend DTO.");
    
//     try {
//       setLoading(true);
//       await API.post("/fees/pay", {
//         studentFeeId: selectedStudent.studentFeeId,
//         amount: Number(paymentAmount)
//       });
      
//       alert(`Payment of ₹${paymentAmount} processed successfully!`);
//       setSelectedStudent(null);
//       setPaymentAmount("");
//       await fetchLedger(); // Refresh ledger
//     } catch (err) {
//       alert("Payment failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- COMPUTED VALUES ---
//   const totalCollected = students.reduce((sum, s) => sum + (s.totalAmount - s.dueAmount), 0);
//   const totalPending = students.reduce((sum, s) => sum + s.dueAmount, 0);
//   const clearedCount = students.filter(s => s.dueAmount === 0).length;

//   const annualEstimate = form.feeItems.reduce((sum, item) => {
//     const amt = Number(item.amount) || 0;
//     return sum + (item.frequency === "Monthly" ? amt * 12 : amt);
//   }, 0);

//   const filteredStudents = students.filter(s => {
//     const matchesSearch =
//       s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       s.grade.toLowerCase().includes(searchTerm.toLowerCase());
//     if (filterMode === "outstanding") return matchesSearch && s.dueAmount > 0;
//     if (filterMode === "cleared") return matchesSearch && s.dueAmount === 0;
//     return matchesSearch;
//   });

//   return (
//     <div className="flex bg-slate-50 min-h-screen">
//       <SchoolAdminSidebar />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* ── TOP BAR ── */}
//         <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
//           <div>
//             <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Fee Management</h1>
//             <p className="text-xs text-slate-400 mt-0.5">Collect payments and configure fee structures</p>
//           </div>
//           <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
//             AY 2024–25
//           </span>
//         </header>

//         <div className="flex-1 p-8 overflow-auto">
//           {/* ── SUMMARY STATS ── */}
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
//               <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
//                 <TrendingUp size={18} className="text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Collected</p>
//                 <p className="text-xl font-semibold text-emerald-600 mt-0.5">
//                   ₹{totalCollected.toLocaleString("en-IN")}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
//               <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
//                 <AlertCircle size={18} className="text-red-500" />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pending Dues</p>
//                 <p className="text-xl font-semibold text-red-500 mt-0.5">
//                   ₹{totalPending.toLocaleString("en-IN")}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
//               <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
//                 <CheckCircle2 size={18} className="text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Fully Cleared</p>
//                 <p className="text-xl font-semibold text-slate-800 mt-0.5">
//                   {clearedCount} <span className="text-sm text-slate-400 font-normal">students</span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//             {/* ── LEFT: STUDENT LEDGER ── */}
//             <div className="xl:col-span-2">
//               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
//                   <div>
//                     <h2 className="text-sm font-semibold text-slate-700">Student Fee Ledger</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">Click "Collect" to open payment panel</p>
//                   </div>
//                   <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
//                     {filteredStudents.length} records
//                   </span>
//                 </div>

//                 {/* Search & Filters */}
//                 <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
//                     <input
//                       type="text"
//                       placeholder="Search by name or grade…"
//                       className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-700 placeholder-slate-300"
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </div>
//                   {["all", "outstanding", "cleared"].map(mode => (
//                     <button
//                       key={mode}
//                       onClick={() => setFilterMode(mode)}
//                       className={`px-3 py-2 rounded-lg text-xs font-medium border transition capitalize ${
//                         filterMode === mode
//                           ? "bg-slate-800 text-white border-slate-800"
//                           : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
//                       }`}
//                     >
//                       {mode}
//                     </button>
//                   ))}
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left">
//                     <thead>
//                       <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
//                         <th className="px-6 py-3">Student</th>
//                         <th className="px-6 py-3">Class</th>
//                         <th className="px-6 py-3">Total Fees</th>
//                         <th className="px-6 py-3 text-right">Balance Due</th>
//                         <th className="px-6 py-3 text-center">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-50">
//                       {filteredStudents.length === 0 ? (
//                         <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No students found</td></tr>
//                       ) : (
//                         filteredStudents.map(student => (
//                           <tr key={student.studentId} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => student.dueAmount > 0 && setSelectedStudent(student)}>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-3">
//                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
//                                   {student.studentName.charAt(0)}
//                                 </div>
//                                 <div>
//                                   <p className="text-sm font-medium text-slate-700">{student.studentName}</p>
//                                   <p className="text-xs text-slate-400">ID #{1000 + student.studentId}</p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
//                                 {student.grade} – {student.section}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-500">₹{student.totalAmount.toLocaleString("en-IN")}</td>
//                             <td className="px-6 py-4 text-right">
//                               <span className={`text-sm font-semibold ${student.dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
//                                 ₹{student.dueAmount.toLocaleString("en-IN")}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 text-center">
//                               {student.dueAmount > 0 ? (
//                                 <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }} className="bg-blue-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition">
//                                   Collect
//                                 </button>
//                               ) : (
//                                 <span className="text-xs font-medium text-emerald-600">Cleared</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             {/* ── RIGHT: CONFIGURATIONS ── */}
//             <div className="space-y-6">
              
//               {/* COMPONENT: FEE HEAD MASTER */}
//               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
//                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
//                   <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Settings2 size={15} className="text-slate-500" />
//                     Fee Head Master
//                   </h2>
//                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Global Configuration</p>
//                 </div>
//                 <div className="p-5 space-y-4">
//                   <div>
//                     <label className="text-xs font-semibold text-slate-500 mb-1.5 block">New Fee Category Name</label>
//                     <input 
//                       type="text"
//                       placeholder="e.g. Library, Laboratory"
//                       className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
//                       value={newFeeHead.name}
//                       onChange={(e) => setNewFeeHead({ ...newFeeHead, name: e.target.value })}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
//                     <div className="flex items-center gap-2">
//                       {newFeeHead.isOptional ? <ShieldAlert size={14} className="text-amber-500" /> : <ShieldCheck size={14} className="text-blue-500" />}
//                       <span className="text-xs font-medium text-slate-600">Optional for students?</span>
//                     </div>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input 
//                         type="checkbox" 
//                         className="sr-only peer" 
//                         checked={newFeeHead.isOptional}
//                         onChange={(e) => setNewFeeHead({ ...newFeeHead, isOptional: e.target.checked })}
//                       />
//                       <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                     </label>
//                   </div>
//                   <button 
//                     onClick={handleAddFeeHead}
//                     disabled={loading}
//                     className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
//                   >
//                     <Plus size={14} /> Add Category
//                   </button>
//                 </div>
//               </div>

//               {/* COMPONENT: FEE STRUCTURE */}
//               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
//                   <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Plus size={15} className="text-blue-600" />
//                     Class Structure
//                   </h2>
//                   <button 
//                     onClick={handleGenerateClassFees}
//                     disabled={loading || !form.classRoomId}
//                     title="Generate fees for the selected class"
//                     className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition flex items-center gap-1 disabled:opacity-50"
//                   >
//                      <Zap size={12} /> Generate Fees
//                   </button>
//                 </div>
//                 <div className="p-6 space-y-5">
//                   <div>
//                     <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Class</label>
//                     <select
//                       value={form.classRoomId}
//                       onChange={(e) => {
//                         const selected = classes.find(cls => cls.id === Number(e.target.value));
//                         setForm({ ...form, classRoomId: Number(e.target.value), className: selected?.grade });
//                       }}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-slate-50 outline-none"
//                     >
//                       <option value="">Select class…</option>
//                       {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>)}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Assign Fee Heads</label>
//                     <div className="space-y-3">
//                       {form.feeItems.map((item, index) => (
//                         <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2.5">
//                           <div className="flex items-center justify-between">
//                             <span className="text-xs font-medium text-slate-400">Item #{index + 1}</span>
//                             <button onClick={() => removeFeeItem(index)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={13} /></button>
//                           </div>
//                           <select
//                             value={item.feeHeadId}
//                             onChange={(e) => handleFormChange(index, "feeHeadId", e.target.value)}
//                             className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
//                           >
//                             <option value="">Select fee type</option>
//                             {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name} {fh.isOptional ? '(Optional)' : ''}</option>)}
//                           </select>
//                           <div className="grid grid-cols-5 gap-2">
//                             <input
//                               type="number"
//                               placeholder="Amount"
//                               value={item.amount}
//                               onChange={(e) => handleFormChange(index, "amount", e.target.value)}
//                               className="col-span-3 text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
//                             />
//                             <select
//                               value={item.frequency}
//                               onChange={(e) => handleFormChange(index, "frequency", e.target.value)}
//                               className="col-span-2 text-sm border border-slate-200 rounded-lg p-2 bg-white outline-none"
//                             >
//                               <option value="Monthly">/ Mo</option>
//                               <option value="Yearly">/ Yr</option>
//                             </select>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <button onClick={addFeeItem} className="w-full mt-3 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1.5">
//                       <Plus size={13} /> Add Fee Item
//                     </button>
//                   </div>

//                   {form.feeItems.length > 0 && (
//                     <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
//                       <span className="text-xs text-slate-500">Annual estimate</span>
//                       <span className="text-sm font-semibold text-slate-700">₹{annualEstimate.toLocaleString("en-IN")}</span>
//                     </div>
//                   )}

//                   <button
//                     onClick={handleSubmitStructure}
//                     disabled={loading}
//                     className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-semibold transition"
//                   >
//                     {loading ? "Saving…" : "Save Structure"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── PAYMENT MODAL ── */}
//       {selectedStudent && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
//             <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
//               <div className="flex items-center gap-3 text-white">
//                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold text-sm">
//                   {selectedStudent.studentName.charAt(0)}
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-base">{selectedStudent.studentName}</h2>
//                   <p className="text-slate-400 text-xs">Class {selectedStudent.grade} – Section {selectedStudent.section}</p>
//                 </div>
//               </div>
//               <button onClick={() => { setSelectedStudent(null); setPaymentAmount(""); }} className="text-slate-400 hover:text-white transition"><X size={18} /></button>
//             </div>

//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-3 mb-6">
//                 <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
//                   <p className="text-xs text-slate-400 font-medium uppercase mb-1">Total</p>
//                   <p className="text-lg font-semibold text-slate-800">₹{selectedStudent.totalAmount.toLocaleString("en-IN")}</p>
//                 </div>
//                 <div className="bg-red-50 rounded-xl border border-red-100 p-4">
//                   <p className="text-xs text-red-400 font-medium uppercase mb-1">Due</p>
//                   <p className="text-lg font-semibold text-red-600">₹{selectedStudent.dueAmount.toLocaleString("en-IN")}</p>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Amount to Collect</label>
//                 <div className="relative">
//                   <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
//                   <input
//                     type="number" autoFocus placeholder="0"
//                     className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-2xl font-semibold outline-none transition"
//                     value={paymentAmount}
//                     onChange={(e) => setPaymentAmount(e.target.value)}
//                   /> 
//                 </div>
//                 <button onClick={() => setPaymentAmount(String(selectedStudent.dueAmount))} className="mt-2 text-xs text-blue-600 hover:underline">
//                   Fill full due amount
//                 </button>
//               </div>

//               {/* Confirm Payment Button */}
//               <button 
//                 onClick={handleProcessPayment} 
//                 disabled={loading || !paymentAmount}
//                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
//               >
//                 {loading ? "Processing..." : "Process Payment"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }