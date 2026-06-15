// import { useState } from "react";
// import Layout from "../../common/components/Layout";

// export default function Results() {

//   const [selectedExam, setSelectedExam] = useState("Mid Term");
//   const [selectedClass, setSelectedClass] = useState("10-A");

//   // ✅ Dummy Exams & Classes
//   const exams = ["Unit Test", "Mid Term", "Final Exam"];
//   const classes = ["10-A", "10-B", "9-A"];

//   // ✅ Dummy Result Data
//   const students = [
//     {
//       id: 1,
//       name: "Rahul Sharma",
//       marks: { Math: 85, Science: 78, English: 88 }
//     },
//     {
//       id: 2,
//       name: "Priya Patel",
//       marks: { Math: 92, Science: 81, English: 79 }
//     },
//     {
//       id: 3,
//       name: "Amit Verma",
//       marks: { Math: 40, Science: 35, English: 50 }
//     }
//   ];

//   // ✅ Grade Logic
//   const getGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 75) return "A";
//     if (percentage >= 60) return "B";
//     if (percentage >= 40) return "C";
//     return "F";
//   };

//   return (
//     <Layout>

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">

//         <h2 className="text-2xl font-bold text-gray-800">
//           Results Management
//         </h2>

//         <div className="flex gap-3">

//           {/* EXAM SELECT */}
//           <select
//             value={selectedExam}
//             onChange={(e) => setSelectedExam(e.target.value)}
//             className="border px-3 py-2 rounded"
//           >
//             {exams.map((exam) => (
//               <option key={exam}>{exam}</option>
//             ))}
//           </select>

//           {/* CLASS SELECT */}
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="border px-3 py-2 rounded"
//           >
//             {classes.map((cls) => (
//               <option key={cls}>{cls}</option>
//             ))}
//           </select>

//         </div>

//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-xl shadow overflow-hidden">

//         <div className="overflow-auto max-h-[600px]">

//           <table className="w-full text-sm">

//             <thead className="bg-gray-100 sticky top-0">
//               <tr className="text-left text-gray-600">
//                 <th className="p-3">Student</th>
//                 <th className="p-3">Math</th>
//                 <th className="p-3">Science</th>
//                 <th className="p-3">English</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">%</th>
//                 <th className="p-3">Grade</th>
//                 <th className="p-3">Status</th>
//               </tr>
//             </thead>

//             <tbody>

//               {students.map((student) => {

//                 const total =
//                   student.marks.Math +
//                   student.marks.Science +
//                   student.marks.English;

//                 const percentage = (total / 300) * 100;
//                 const grade = getGrade(percentage);

//                 return (
//                   <tr
//                     key={student.id}
//                     className="border-t hover:bg-gray-50"
//                   >

//                     <td className="p-3 font-medium">
//                       {student.name}
//                     </td>

//                     <td className="p-3">{student.marks.Math}</td>
//                     <td className="p-3">{student.marks.Science}</td>
//                     <td className="p-3">{student.marks.English}</td>

//                     <td className="p-3 font-semibold">
//                       {total}
//                     </td>

//                     <td className="p-3">
//                       {percentage.toFixed(1)}%
//                     </td>

//                     <td className="p-3">
//                       {grade}
//                     </td>

//                     <td className="p-3">
//                       <span className={`px-2 py-1 text-xs rounded ${
//                         percentage >= 40
//                           ? "bg-green-100 text-green-600"
//                           : "bg-red-100 text-red-600"
//                       }`}>
//                         {percentage >= 40 ? "Pass" : "Fail"}
//                       </span>
//                     </td>

//                   </tr>
//                 );
//               })}

//             </tbody>

//           </table>

//         </div>

//       </div>

//     </Layout>
//   );
// }// src/school_admin/pages/Results.jsx
// Role: SCHOOL_ADMIN
// Route: /school-admin/results
//
// Standalone "Results Management" page.
// Uses the same resultService / examService as Exams.jsx (Results tab),
// so no backend changes needed.
//
// Features:
//  • Exam selector (auto-loads class results on change)
//  • Summary stat cards (Total / Pass / Fail / Class Avg / Highest / Lowest)
//  • Search by student name
//  • Calculate All + Recalculate (Fix Existing Data)
//  • Edit a result (marks / grade) via modal
//  • View printable Report Card per student
//  • Bulk upload results via Excel
//  • Export current view to CSV
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { examService, resultService } from "../../common/services/examService";
import {
  RefreshCcw, Calculator, Search, Pencil, Eye, Download,
  Upload, X, Save, CheckCircle, Users, Award, TrendingUp,
  TrendingDown, BarChart3, Trophy, ClipboardList,
} from "lucide-react";

// ── shared style helpers (same system as Exams.jsx) ───────────────────────────
const S = {
  inp: {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
  },
  btn: (bg = "#4f46e5", fg = "#fff") => ({
    background: bg, color: fg, border: "none", borderRadius: 8,
    padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
  }),
  card: {
    background: "#fff", borderRadius: 14,
    boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  th: {
    padding: "11px 16px", textAlign: "left", fontWeight: 600,
    color: "#64748b", borderBottom: "1px solid #f1f5f9", fontSize: 13,
    background: "#f8fafc",
  },
  td: { padding: "11px 16px", fontSize: 14, borderBottom: "1px solid #f8fafc" },
};

const GC = { "A+": "#059669", A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const gc = (g) => GC[g] || "#6b7280";
const pc = (p) => (p >= 33 ? "#059669" : "#ef4444");

// ── tiny Modal (same as Exams.jsx) ─────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "95%", maxWidth: wide ? 820 : 540,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children, half }) => (
  <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    {children}
  </div>
);

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24,
      background: ok ? "#059669" : "#dc2626",
      color: "#fff", padding: "12px 20px", borderRadius: 10,
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 2000,
      fontSize: 14, fontWeight: 600,
    }}>
      {msg}
    </div>
  );
}

function Empty({ text }) {
  return (
    <tr>
      <td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>
        {text}
      </td>
    </tr>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      ...S.card, flex: "1 1 150px", padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: color + "20",
        color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#1e293b" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Results() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [classResults, setClassResults] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [toast, setToast] = useState(null);

  // edit modal
  const [editingResult, setEditingResult] = useState(null);

  // report card modal
  const [reportCard, setReportCard] = useState(null);
  const [rcLoading, setRcLoading] = useState(false);

  // bulk upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const wrap = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

  // ── load exams on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setExamsLoading(true);
      try {
        const r = await examService.getAll();
        setExams(r.data || []);
      } catch {
        notify("Failed to load exams", false);
      } finally {
        setExamsLoading(false);
      }
    })();
  }, []);

  // ── load results ────────────────────────────────────────────────────────
  const loadClassResults = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    try {
      const r = await resultService.getByClass(selectedExamId);
      setClassResults(r.data || []);
      setLoadedOnce(true);
    } catch {
      notify("Failed to load results", false);
    }
  });

  // Auto-load whenever exam selection changes
  useEffect(() => {
    if (selectedExamId) {
      loadClassResults();
    } else {
      setClassResults([]);
      setLoadedOnce(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId]);

  // ── calculate / recalculate ─────────────────────────────────────────────
  const calculateAll = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    try {
      await resultService.calculateAll(selectedExamId);
      notify("All results calculated ✅");
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Calculation failed", false);
    }
  });

  const recalculateAllExisting = async () => {
    if (!window.confirm("Yeh saare existing results ke liye summary recalculate karega. Continue?")) return;
    setRecalculating(true);
    try {
      const r = await resultService.recalculateAll();
      notify(r.data || "Recalculation complete ✅");
      if (selectedExamId) await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Recalculation failed", false);
    } finally {
      setRecalculating(false);
    }
  };

  // ── edit result ─────────────────────────────────────────────────────────
  const openEdit = (r) => {
    setEditingResult({
      id: r.id,
      marksObtained: r.totalObtained ?? r.marksObtained ?? 0,
      totalMarks: r.totalMarks ?? 0,
      grade: r.grade || "",
    });
  };

  const saveResultEdit = () => wrap(async () => {
    try {
      await resultService.update(editingResult.id, {
        marksObtained: Number(editingResult.marksObtained),
        totalMarks: Number(editingResult.totalMarks),
        grade: editingResult.grade,
      });
      notify("Result updated ✅");
      setEditingResult(null);
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Update failed", false);
    }
  });

  // ── report card ─────────────────────────────────────────────────────────
  const openReportCard = async (studentId) => {
    if (!studentId) return notify("Student ID not found for this row", false);
    setRcLoading(true);
    setReportCard(null);
    try {
      const r = await resultService.getByStudent(studentId, selectedExamId);
      setReportCard(r.data);
    } catch {
      notify("No report card found for this student", false);
    } finally {
      setRcLoading(false);
    }
  };

  // ── bulk upload ─────────────────────────────────────────────────────────
  const handleUpload = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    if (!uploadFile) return notify("Select a file first", false);
    try {
      await resultService.uploadExcel(selectedExamId, uploadFile);
      notify("Results uploaded successfully ✅");
      setShowUpload(false);
      setUploadFile(null);
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Upload failed", false);
    }
  });

  // ── derived: ranked + filtered + stats ──────────────────────────────────
  const ranked = useMemo(() => {
    const sorted = [...classResults].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    sorted.forEach((s, i) => { s._rank = i + 1; });
    return sorted;
  }, [classResults]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter((r) => {
      const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""} ${r.studentName || ""}`.toLowerCase();
      const adm = String(r.student?.admissionNumber || r.admissionNumber || "").toLowerCase();
      return name.includes(q) || adm.includes(q);
    });
  }, [ranked, search]);

  const stats = useMemo(() => {
    if (!classResults.length) return null;
    const total = classResults.length;
    const pass = classResults.filter((r) => (r.percentage || 0) >= 33).length;
    const avg = classResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / total;
    const highest = Math.max(...classResults.map((r) => r.percentage || 0));
    const lowest = Math.min(...classResults.map((r) => r.percentage || 0));
    return { total, pass, fail: total - pass, avg, highest, lowest };
  }, [classResults]);

  // ── export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!ranked.length) return notify("No data to export", false);
    const header = ["Rank", "Student", "Admission No.", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"];
    const rows = ranked.map((r) => {
      const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || r.studentName || "—";
      return [
        r._rank,
        name,
        r.student?.admissionNumber || r.admissionNumber || "—",
        r.totalObtained ?? r.marksObtained ?? "",
        r.totalMarks ?? "",
        r.percentage != null ? r.percentage.toFixed(1) : "",
        r.grade || "",
        (r.percentage || 0) >= 33 ? "PASS" : "FAIL",
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Results_${selectedExam?.examName || "exam"}_${selectedExam?.standard || ""}.csv`.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
      <SchoolAdminSidebar />

      {toast && <Toast {...toast} />}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Results Management</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            View, edit and analyze exam results school-wide
          </p>
        </div>

        {/* Exam selector + actions */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}
            style={{ ...S.inp, maxWidth: 320 }}>
            <option value="">
              {examsLoading ? "Loading exams..." : "— Select Exam —"}
            </option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.examName} {ex.standard ? `(Std ${ex.standard})` : ""}
              </option>
            ))}
          </select>

          {selectedExam && (
            <span style={{ fontSize: 13, color: "#64748b", background: "#f8fafc", borderRadius: 6, padding: "4px 12px", border: "1px solid #e2e8f0" }}>
              {selectedExam.startDate} → {selectedExam.endDate} &nbsp;·&nbsp; {selectedExam.academicYear}
            </span>
          )}

          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name / admission no..."
              style={{ ...S.inp, paddingLeft: 32 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={loadClassResults} disabled={!selectedExamId || loading} style={S.btn("#475569")}>
              <RefreshCcw size={14} /> {loading ? "Loading..." : "Refresh"}
            </button>
            <button onClick={calculateAll} disabled={!selectedExamId || loading} style={S.btn("#059669")}>
              <Calculator size={14} /> Calculate All
            </button>
            <button
              onClick={recalculateAllExisting}
              disabled={recalculating}
              title="One-time fix: build summaries for all existing result rows"
              style={{ ...S.btn("#7c3aed"), opacity: recalculating ? 0.7 : 1 }}>
              <RefreshCcw size={14} /> {recalculating ? "Recalculating..." : "Fix Existing Data"}
            </button>
            <button onClick={() => setShowUpload(true)} disabled={!selectedExamId} style={S.btn("#0ea5e9")}>
              <Upload size={14} /> Bulk Upload
            </button>
            <button onClick={exportCSV} disabled={!ranked.length} style={S.btn("#1e293b")}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {stats && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Total Students" value={stats.total} color="#4f46e5" icon={<Users size={18} />} />
            <StatCard label="Passed" value={stats.pass} color="#059669" icon={<CheckCircle size={18} />} />
            <StatCard label="Failed" value={stats.fail} color="#dc2626" icon={<X size={18} />} />
            <StatCard label="Class Average" value={`${stats.avg.toFixed(1)}%`} color="#0ea5e9" icon={<BarChart3 size={18} />} />
            <StatCard label="Highest" value={`${stats.highest.toFixed(1)}%`} color="#f59e0b" icon={<TrendingUp size={18} />} />
            <StatCard label="Lowest" value={`${stats.lowest.toFixed(1)}%`} color="#f97316" icon={<TrendingDown size={18} />} />
          </div>
        )}

        {/* Results table */}
        <div style={S.card}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#1e293b" }}>
              <Trophy size={17} color="#f59e0b" /> Class Results
              {selectedExam && (
                <span style={{ background: "#ede9fe", color: "#6d28d9", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                  Std {selectedExam.standard}
                </span>
              )}
            </h2>
            {!!filtered.length && (
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                Showing {filtered.length} of {classResults.length} student{classResults.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Rank", "Student", "Admission No.", "Marks", "Percentage", "Grade", "Status", "Actions"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!selectedExamId && (
                  <Empty text="Select an exam above to view results." />
                )}

                {selectedExamId && loading && classResults.length === 0 && (
                  <Empty text="Loading results..." />
                )}

                {selectedExamId && !loading && loadedOnce && classResults.length === 0 && (
                  <Empty text='No results found for this exam yet. Enter marks, then click "Calculate All".' />
                )}

                {selectedExamId && filtered.length === 0 && classResults.length > 0 && (
                  <Empty text="No students match your search." />
                )}

                {filtered.map((r) => {
                  const studentId = r.student?.id ?? r.studentId;
                  const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || r.studentName || "—";
                  const pass = (r.percentage || 0) >= 33;
                  return (
                    <tr key={r.id || studentId} style={{ background: r._rank <= 3 ? "#fffbeb" : "transparent" }}>
                      <td style={{ ...S.td, fontWeight: 800 }}>
                        {r._rank === 1 ? "🥇" : r._rank === 2 ? "🥈" : r._rank === 3 ? "🥉" : `#${r._rank}`}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{name}</td>
                      <td style={{ ...S.td, color: "#64748b" }}>{r.student?.admissionNumber || r.admissionNumber || "—"}</td>
                      <td style={S.td}>{r.totalObtained ?? r.marksObtained ?? "—"} / {r.totalMarks ?? "—"}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: pc(r.percentage) }}>
                        {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
                      </td>
                      <td style={S.td}>
                        <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                          {r.grade || "—"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ background: pass ? "#dcfce7" : "#fee2e2", color: pass ? "#059669" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>
                          {pass ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openReportCard(studentId)}
                            title="View report card"
                            style={{ background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => openEdit(r)}
                            title="Edit result"
                            style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                            <Pencil size={12} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — EDIT RESULT
      ══════════════════════════════════════════════════════════════════ */}
      {editingResult && (
        <Modal title={`Edit Result — ID ${editingResult.id}`} onClose={() => setEditingResult(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Field label="Marks Obtained" half>
              <input type="number" style={S.inp} value={editingResult.marksObtained}
                onChange={(e) => setEditingResult((p) => ({ ...p, marksObtained: e.target.value }))} />
            </Field>
            <Field label="Total Marks" half>
              <input type="number" style={S.inp} value={editingResult.totalMarks}
                onChange={(e) => setEditingResult((p) => ({ ...p, totalMarks: e.target.value }))} />
            </Field>
            <Field label="Grade" half>
              <input type="text" style={S.inp} value={editingResult.grade}
                onChange={(e) => setEditingResult((p) => ({ ...p, grade: e.target.value }))}
                placeholder="e.g. A, B, A+" />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={saveResultEdit} disabled={loading}
              style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
              <Save size={14} /> {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={() => setEditingResult(null)} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — REPORT CARD
      ══════════════════════════════════════════════════════════════════ */}
      {(reportCard || rcLoading) && (
        <Modal title="Student Report Card" onClose={() => setReportCard(null)} wide>
          {rcLoading && (
            <p style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading report card...</p>
          )}

          {!rcLoading && reportCard && (
            <div id="report-card-print">
              <div style={{ textAlign: "center", borderBottom: "2px solid #4f46e5", paddingBottom: 16, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                  {reportCard.schoolName || "School Name"}
                </h2>
                <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                  Progress Report Card — {reportCard.academicYear || selectedExam?.academicYear}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: "16px 20px" }}>
                {[
                  ["Student Name", reportCard.studentName || reportCard.student?.name],
                  ["Admission No.", reportCard.admissionNumber],
                  ["Class", reportCard.className],
                  ["Roll No.", reportCard.rollNumber],
                  ["Exam", reportCard.examName || selectedExam?.examName],
                  ["Exam Type", reportCard.examType || selectedExam?.examType],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: "#4f46e5" }}>
                    {["Subject", "Marks Obtained", "Total", "%", "Grade", "Remarks"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", color: "#fff", textAlign: "left", fontWeight: 600, fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reportCard.subjects || []).map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.subject || s.subjectName}</td>
                      <td style={{ padding: "10px 14px" }}>{s.marksObtained}</td>
                      <td style={{ padding: "10px 14px" }}>{s.totalMarks}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: pc(s.percentage) }}>
                        {s.percentage != null ? `${s.percentage.toFixed(1)}%` : "—"}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: gc(s.grade) + "25", color: gc(s.grade), borderRadius: 5, padding: "2px 8px", fontWeight: 700 }}>{s.grade}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: s.remarks === "Fail" ? "#dc2626" : "#059669", fontWeight: 600 }}>
                        {s.remarks || ((s.percentage || 0) >= 33 ? "Pass" : "Fail")}
                      </td>
                    </tr>
                  ))}
                  {(!reportCard.subjects || reportCard.subjects.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                        No subject-wise breakdown available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 24px", minWidth: 260 }}>
                  {[
                    ["Total Obtained", `${reportCard.totalObtained ?? "—"} / ${reportCard.totalMarks ?? "—"}`],
                    ["Percentage", `${reportCard.percentage?.toFixed(2) ?? "—"}%`],
                    ["Overall Grade", reportCard.overallGrade || reportCard.grade || "—"],
                    ["Class Rank", reportCard.rank ? `#${reportCard.rank} of ${reportCard.totalStudents}` : "—"],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}>{l}</span>
                      <span style={{ fontWeight: 800 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button onClick={() => window.print()} style={S.btn()}>
                  <ClipboardList size={14} /> Print
                </button>
                <button onClick={() => setReportCard(null)} style={S.btn("#94a3b8")}>
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — BULK UPLOAD RESULTS
      ══════════════════════════════════════════════════════════════════ */}
      {showUpload && (
        <Modal title={`Bulk Upload Results — ${selectedExam?.examName || ""}`} onClose={() => setShowUpload(false)}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#166534" }}>
            <strong>📋 Excel Format:</strong>
            <br />
            Required columns: <code>studentId</code>, <code>subject</code>, <code>marksObtained</code>, <code>totalMarks</code>
            <br />
            Results will be uploaded for: <strong>{selectedExam?.examName} (Std {selectedExam?.standard})</strong>
          </div>

          <input type="file" accept=".xlsx,.xls"
            onChange={(e) => setUploadFile(e.target.files[0])}
            style={{ marginBottom: 18, fontSize: 13 }} />

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleUpload} disabled={loading || !uploadFile}
              style={{ ...S.btn("#0ea5e9"), flex: 1, justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
              <Upload size={14} /> {loading ? "Uploading..." : "Upload"}
            </button>
            <button onClick={() => { setShowUpload(false); setUploadFile(null); }} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}