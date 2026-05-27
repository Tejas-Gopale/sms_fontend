// src/parents/pages/ParentResults.jsx
// Role: PARENT
// API: GET /parent/exams/{studentId}       → getExamResults (list of exams)
//      GET /parent/exams/detail/{examId}/{studentId}  → getExamDetail (subject breakdown)

import { useState, useEffect } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, FileText, Download, Printer, ChevronDown } from "lucide-react";
import { getExamResults, getExamDetail } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

// ── grade helper ──────────────────────────────────────────────────────────────
const getGrade = (p) => {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
};

const GC = { "A+": "#059669", A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const gc = (g) => GC[g] || "#6b7280";
const pc = (p) => (p >= 33 ? "#059669" : "#ef4444");

// ── Print styles injected once ────────────────────────────────────────────────
const PRINT_STYLE = `
  @media print {
    body * { visibility: hidden; }
    #resultCard, #resultCard * { visibility: visible; }
    #resultCard { position: absolute; left: 0; top: 0; width: 100%; }
    .no-print { display: none !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
export default function ParentResults() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();

  const [exams, setExams]               = useState([]);     // list of exam summaries
  const [selectedExam, setSelectedExam] = useState(null);   // currently shown exam summary
  const [detail, setDetail]             = useState(null);   // subject-wise detail for selected exam
  const [loading, setLoading]           = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]               = useState(null);

  // ── Inject print style ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = PRINT_STYLE;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Load exam list ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getExamResults(studentId)
      .then((res) => {
        const data = res.data ?? [];
        setExams(data);
        if (data.length > 0) {
          setSelectedExam(data[0]);
          loadDetail(data[0]);
        }
      })
      .catch(() => setError("Could not load exam results."))
      .finally(() => setLoading(false));
  }, [studentId]);

  // ── Load subject-wise detail ────────────────────────────────────────────────
  const loadDetail = (exam) => {
    if (!exam?.examId || !studentId) return;
    setDetailLoading(true);
    getExamDetail(exam.examId, studentId)
      .then((res) => setDetail(res.data ?? null))
      .catch(() => setDetail(null))           // graceful – fallback to summary data
      .finally(() => setDetailLoading(false));
  };

  const handleExamChange = (examId) => {
    const found = exams.find((x) => String(x.examId) === String(examId));
    if (!found) return;
    setSelectedExam(found);
    setDetail(null);
    loadDetail(found);
  };

  // ── Download as PDF via browser print ─────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Download PDF using html2canvas + jsPDF (optional, if installed) ────────
  const handleDownload = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF }       = await import("jspdf");
      const input = document.getElementById("resultCard");
      if (!input) return handlePrint();
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${selectedExam?.examName ?? "Result"}.pdf`);
    } catch {
      // html2canvas not installed → fallback to print
      handlePrint();
    }
  };

  // ── resolve subjects array (detail API first, then fallback to summary) ────
  const subjects = detail?.subjects ?? selectedExam?.subjects ?? [];
  const summary  = detail?.summary  ?? selectedExam;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter',sans-serif" }}>
      <ParentSidebar />

      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>📊 Exam Results</h1>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {exams.length > 0 && (
              <div style={{ position: "relative" }}>
                <select
                  value={selectedExam?.examId ?? ""}
                  onChange={(e) => handleExamChange(e.target.value)}
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 36px 8px 12px", fontSize: 14, background: "#fff", appearance: "none", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                  {exams.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>{ex.examName}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
              </div>
            )}
            <button onClick={handleDownload}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              <Download size={15} /> Download PDF
            </button>
            <button onClick={handlePrint}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {/* Loading / error states */}
        {(loading || sidLoading) && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
            <Loader2 size={40} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}
        {(error || sidError) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 20px", color: "#dc2626" }}>
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}
        {!loading && !sidLoading && !error && !sidError && !selectedExam && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 80, color: "#94a3b8", gap: 12 }}>
            <FileText size={52} />
            <p style={{ margin: 0, fontSize: 15 }}>No exam results found for this student.</p>
          </div>
        )}

        {/* Report Card */}
        {selectedExam && !loading && !sidLoading && (
          <div id="resultCard" style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

            {/* School/exam header */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #4f46e5", paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                {summary?.schoolName || "School Report Card"}
              </h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                Progress Report — {summary?.academicYear || selectedExam.academicYear || ""}
              </p>
            </div>

            {/* Student info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "#f8fafc", borderRadius: 12, padding: "16px 20px" }}>
              {[
                ["Student Name", selectedExam.studentName],
                ["Class",        selectedExam.className],
                ["Roll No.",     selectedExam.rollNumber],
                ["Exam",         selectedExam.examName],
                ["Academic Year",selectedExam.academicYear],
                ["Admission No.",selectedExam.admissionNumber],
              ].map(([l, v]) => v && (
                <div key={l}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Subject detail loading */}
            {detailLoading && (
              <div style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                Loading subject details...
              </div>
            )}

            {/* Subjects table */}
            {!detailLoading && (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "#4f46e5" }}>
                    {["Subject", "Marks", "Max Marks", "%", "Grade", "Status"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", color: "#fff", textAlign: "left", fontWeight: 600, fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
                        Subject-wise breakdown not available.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((r, i) => {
                      const pct = r.percentage ?? (r.maxMarks ? (r.marksObtained / r.maxMarks) * 100 : null);
                      const grade = r.grade ?? (pct != null ? getGrade(pct) : "—");
                      const pass = r.status === "Pass" || (pct != null && pct >= 33);
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "11px 14px", fontWeight: 600 }}>{r.subjectName || r.subject}</td>
                          <td style={{ padding: "11px 14px" }}>{r.marksObtained}</td>
                          <td style={{ padding: "11px 14px" }}>{r.maxMarks || r.totalMarks}</td>
                          <td style={{ padding: "11px 14px", fontWeight: 700, color: pct != null ? pc(pct) : "#64748b" }}>
                            {pct != null ? `${pct.toFixed(1)}%` : "—"}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ background: gc(grade) + "25", color: gc(grade), borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{grade}</span>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ background: pass ? "#dcfce7" : "#fee2e2", color: pass ? "#059669" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>
                              {r.status || (pass ? "Pass" : "Fail")}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total Marks",  value: `${selectedExam.totalMarks ?? summary?.totalMarks ?? "—"} / ${selectedExam.maxMarks ?? summary?.maxMarks ?? "—"}` },
                { label: "Percentage",   value: `${selectedExam.percentage ?? 0}%`, color: pc(selectedExam.percentage ?? 0) },
                { label: "Grade",        value: selectedExam.grade ?? getGrade(selectedExam.percentage ?? 0), color: gc(selectedExam.grade ?? getGrade(selectedExam.percentage ?? 0)) },
                { label: "Result",       value: selectedExam.result ?? ((selectedExam.percentage ?? 0) >= 33 ? "Pass" : "Fail"), color: ((selectedExam.percentage ?? 0) >= 33) ? "#059669" : "#dc2626" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color || "#1e293b" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Class rank if available */}
            {selectedExam.classRank && (
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13 }}>
                🏆 Class Rank: <strong style={{ color: "#1e293b" }}>{selectedExam.classRank}</strong>
              </p>
            )}

            {/* Teacher remark */}
            {selectedExam.teacherRemark && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>Teacher's Remark</h3>
                <p style={{ margin: 0, color: "#78350f", fontSize: 14 }}>{selectedExam.teacherRemark}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
