// src/school_admin/pages/Results.jsx
// Role: SCHOOL_ADMIN
// Real API calls via resultService + examService
// Tabs: Class Results | Rank List | Report Card
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { examService, resultService } from "../../common/services/examService";
import {
  BarChart3, Trophy, ClipboardList, RefreshCcw,
  Calculator, Search, X, Printer, TrendingUp, TrendingDown,
  Users, CheckCircle, XCircle, ChevronDown,
} from "lucide-react";

// ── shared styles ─────────────────────────────────────────────────────────────
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
    color: "#64748b", borderBottom: "1px solid #f1f5f9",
    fontSize: 13, background: "#f8fafc",
  },
  td: {
    padding: "11px 16px", fontSize: 14, borderBottom: "1px solid #f8fafc",
  },
};

// grade → color
const GC = { "A+": "#059669", A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const gc  = (g) => GC[g] || "#6b7280";
const pc  = (p) => (p != null && p >= 33 ? "#059669" : "#ef4444");

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24,
      background: ok ? "#059669" : "#dc2626",
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      fontSize: 14, display: "flex", alignItems: "center", gap: 8,
    }}>
      {ok ? <CheckCircle size={16} /> : <XCircle size={16} />} {msg}
    </div>
  );
}

function Empty({ text = "No data found." }) {
  return (
    <tr>
      <td colSpan={20} style={{ padding: "52px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
        {text}
      </td>
    </tr>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ label, value, color = "#1e293b", bg = "#f8fafc" }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 90 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Results() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab]                     = useState("results");
  const [exams, setExams]                 = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loading, setLoading]             = useState(false);
  const [toast, setToast]                 = useState(null);

  // results tab
  const [classResults, setClassResults]   = useState([]);
  const [searchQ, setSearchQ]             = useState("");

  // rank list tab
  const [rankList, setRankList]           = useState(null);

  // report card tab
  const [rcStudentId, setRcStudentId]     = useState("");
  const [reportCard, setReportCard]       = useState(null);

  // recalculate
  const [recalculating, setRecalculating] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────
  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };
  const wrap = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };
  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

  // ── Load exams on mount ────────────────────────────────────────────────────
  useEffect(() => {
    wrap(async () => {
      try {
        const r = await examService.getAll();
        const list = r.data || [];
        setExams(list);
        // auto-select first exam if available
        if (list.length > 0) setSelectedExamId(String(list[0].id));
      } catch {
        notify("Failed to load exams", false);
      }
    });
  }, []);

  // ── Class Results ──────────────────────────────────────────────────────────
  const loadClassResults = () => wrap(async () => {
    if (!selectedExamId) return notify("Pehle ek exam select karo", false);
    try {
      const r = await resultService.getByClass(selectedExamId);
      setClassResults(r.data || []);
      if ((r.data || []).length === 0) notify("Is exam mein abhi koi result nahi hai", false);
    } catch (e) {
      notify(e.response?.data?.message || "Results load nahi hue", false);
    }
  });

  const calculateAll = () => wrap(async () => {
    if (!selectedExamId) return notify("Pehle ek exam select karo", false);
    try {
      await resultService.calculateAll(selectedExamId);
      notify("Saare results calculate ho gaye ✅");
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Calculation failed", false);
    }
  });

  const recalculateAll = async () => {
    if (!window.confirm("Yeh saare existing results ke liye summary rebuild karega. Continue?")) return;
    setRecalculating(true);
    try {
      const r = await resultService.recalculateAll();
      notify(typeof r.data === "string" ? r.data : "Recalculation complete ✅");
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Recalculation failed", false);
    } finally {
      setRecalculating(false);
    }
  };

  // ── Rank List ──────────────────────────────────────────────────────────────
  const buildRankList = () => wrap(async () => {
    if (!selectedExamId) return notify("Pehle ek exam select karo", false);
    try {
      const r = await resultService.getByClass(selectedExamId);
      const data = r.data || [];
      if (data.length === 0) return notify("Is exam mein koi results nahi hain", false);
      const sorted = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
      sorted.forEach((s, i) => { s._rank = i + 1; });
      const pass = sorted.filter((s) => (s.percentage || 0) >= 33).length;
      const total = sorted.length;
      setRankList({
        students: sorted,
        classAvg: total ? sorted.reduce((acc, s) => acc + (s.percentage || 0), 0) / total : 0,
        highest:  sorted[0]?.percentage || 0,
        lowest:   sorted[total - 1]?.percentage || 0,
        pass, fail: total - pass, total,
      });
    } catch (e) {
      notify(e.response?.data?.message || "Rank list load nahi hui", false);
    }
  });

  // ── Report Card ────────────────────────────────────────────────────────────
  const loadReportCard = () => wrap(async () => {
    if (!selectedExamId || !rcStudentId.trim())
      return notify("Exam aur student ID dono zaroori hain", false);
    try {
      const r = await resultService.getByStudent(rcStudentId.trim(), selectedExamId);
      setReportCard(r.data);
    } catch {
      notify("Is student ka report card nahi mila", false);
    }
  });

  // ── Filtered results ───────────────────────────────────────────────────────
  const filteredResults = classResults.filter((r) => {
    const name = `${r.student?.firstName || r.studentName || ""} ${r.student?.lastName || ""}`.toLowerCase();
    return name.includes(searchQ.toLowerCase());
  });

  // ── Stats derived from classResults ───────────────────────────────────────
  const stats = (() => {
    if (!classResults.length) return null;
    const pass  = classResults.filter((r) => (r.percentage || 0) >= 33).length;
    const total = classResults.length;
    const avg   = classResults.reduce((a, r) => a + (r.percentage || 0), 0) / total;
    const highest = Math.max(...classResults.map((r) => r.percentage || 0));
    return { pass, fail: total - pass, total, avg, highest };
  })();

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "results",    label: "Class Results", icon: <BarChart3 size={15} /> },
    { id: "rankList",   label: "Rank List",     icon: <Trophy size={15} /> },
    { id: "reportCard", label: "Report Card",   icon: <ClipboardList size={15} /> },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
      <SchoolAdminSidebar />

      {toast && <Toast {...toast} />}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
            Results Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            Class results, rank list aur individual report cards dekho
          </p>
        </div>

        {/* ── Global exam selector ─────────────────────────────────────────── */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "14px 20px",
          marginBottom: 20, display: "flex", gap: 12, alignItems: "center",
          flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
            <ChevronDown size={15} /> Exam Select Karo:
          </div>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setClassResults([]);
              setRankList(null);
              setReportCard(null);
            }}
            style={{ ...S.inp, maxWidth: 340 }}
          >
            <option value="">— Exam chunein —</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.examName} {ex.standard ? `(Std ${ex.standard})` : ""} — {ex.academicYear || ""}
              </option>
            ))}
          </select>
          {selectedExam && (
            <span style={{
              fontSize: 13, color: "#4f46e5", background: "#ede9fe",
              borderRadius: 6, padding: "4px 12px", fontWeight: 600,
            }}>
              {selectedExam.startDate} → {selectedExam.endDate}
            </span>
          )}
          {exams.length === 0 && !loading && (
            <span style={{ fontSize: 13, color: "#f97316" }}>
              ⚠️ Koi exam nahi mili — pehle Exams page pe exam create karo
            </span>
          )}
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...S.btn(tab === t.id ? "#4f46e5" : "#fff", tab === t.id ? "#fff" : "#475569"),
                boxShadow: tab === t.id ? "0 2px 8px rgba(79,70,229,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ════════════ CLASS RESULTS TAB ════════════ */}
        {tab === "results" && (
          <div>
            {/* Action bar */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "14px 20px",
              marginBottom: 16, display: "flex", gap: 10, alignItems: "center",
              flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Student name se search karo..."
                  style={{ ...S.inp, paddingLeft: 32 }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <button onClick={loadClassResults} disabled={loading || !selectedExamId} style={{ ...S.btn("#475569"), opacity: !selectedExamId ? 0.5 : 1 }}>
                <RefreshCcw size={14} /> {loading ? "Loading..." : "Load Results"}
              </button>
              <button onClick={calculateAll} disabled={loading || !selectedExamId} style={{ ...S.btn("#059669"), opacity: !selectedExamId ? 0.5 : 1 }}>
                <Calculator size={14} /> Calculate All
              </button>
              <button
                onClick={recalculateAll}
                disabled={recalculating}
                title="Existing result rows ke liye summary rebuild karo"
                style={{ ...S.btn("#7c3aed"), opacity: recalculating ? 0.7 : 1 }}
              >
                <RefreshCcw size={14} /> {recalculating ? "Rebuilding..." : "Fix Data"}
              </button>
            </div>

            {/* Stats bar — only shown after data loads */}
            {stats && (
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <Stat label="Total Students" value={stats.total} bg="#f0f9ff" color="#0369a1" />
                <Stat label="Pass" value={stats.pass} bg="#f0fdf4" color="#059669" />
                <Stat label="Fail" value={stats.fail} bg="#fef2f2" color="#dc2626" />
                <Stat label="Class Avg" value={`${stats.avg.toFixed(1)}%`} bg="#fafaf5" color="#b45309" />
                <Stat label="Highest %" value={`${stats.highest.toFixed(1)}%`} bg="#fdf4ff" color="#7e22ce" />
              </div>
            )}

            {/* Results table */}
            <div style={S.card}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  Class Results
                  {classResults.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                      ({filteredResults.length} students)
                    </span>
                  )}
                </h2>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "Student Name", "Total Marks", "Marks Obtained", "Percentage", "Grade", "Status"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <Empty text={
                        classResults.length === 0
                          ? "Exam select karo aur 'Load Results' click karo"
                          : "Koi student is naam se nahi mila"
                      } />
                    ) : (
                      filteredResults.map((r, i) => {
                        const pct = r.percentage ?? 0;
                        return (
                          <tr key={r.id || i} style={{ transition: "background 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ ...S.td, color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                            <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>
                              {r.student?.firstName || r.studentName || "—"}{" "}
                              {r.student?.lastName || ""}
                            </td>
                            <td style={{ ...S.td, color: "#475569" }}>
                              {r.totalMarks ?? "—"}
                            </td>
                            <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>
                              {r.totalObtained ?? r.marksObtained ?? "—"}
                            </td>
                            <td style={{ ...S.td, fontWeight: 700, color: pc(pct) }}>
                              {r.percentage != null ? `${pct.toFixed(1)}%` : "—"}
                            </td>
                            <td style={S.td}>
                              <span style={{
                                background: `${gc(r.grade)}22`, color: gc(r.grade),
                                borderRadius: 6, padding: "3px 10px",
                                fontWeight: 700, fontSize: 12,
                              }}>
                                {r.grade || "—"}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{
                                background: pct >= 33 ? "#dcfce7" : "#fee2e2",
                                color: pct >= 33 ? "#059669" : "#dc2626",
                                borderRadius: 6, padding: "3px 10px",
                                fontWeight: 600, fontSize: 12,
                              }}>
                                {r.percentage != null ? (pct >= 33 ? "PASS" : "FAIL") : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ RANK LIST TAB ════════════ */}
        {tab === "rankList" && (
          <div>
            <div style={{
              background: "#fff", borderRadius: 12, padding: "14px 20px",
              marginBottom: 16, display: "flex", gap: 10, alignItems: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}>
              <button onClick={buildRankList} disabled={loading || !selectedExamId}
                style={{ ...S.btn(), opacity: !selectedExamId ? 0.5 : 1 }}>
                <Trophy size={14} /> {loading ? "Generating..." : "Generate Rank List"}
              </button>
              {rankList && (
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {rankList.total} students ranked
                </span>
              )}
            </div>

            {!rankList && !loading && (
              <div style={{ ...S.card, padding: 52, textAlign: "center" }}>
                <Trophy size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  Exam select karo aur Generate Rank List click karo
                </p>
              </div>
            )}

            {rankList && (
              <div style={S.card}>
                {/* Stats bar */}
                <div style={{
                  display: "flex", gap: 16, padding: "16px 24px",
                  background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
                  flexWrap: "wrap",
                }}>
                  <Stat label="Class Avg"   value={`${rankList.classAvg.toFixed(1)}%`} color="#4f46e5" bg="#ede9fe" />
                  <Stat label="Highest"     value={`${rankList.highest.toFixed(1)}%`}  color="#059669" bg="#f0fdf4" />
                  <Stat label="Lowest"      value={`${rankList.lowest.toFixed(1)}%`}   color="#dc2626" bg="#fef2f2" />
                  <Stat label="Pass"        value={rankList.pass}   color="#059669" bg="#f0fdf4" />
                  <Stat label="Fail"        value={rankList.fail}   color="#dc2626" bg="#fef2f2" />
                  <Stat label="Total"       value={rankList.total}  color="#1e293b" bg="#f0f9ff" />
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Rank", "Student Name", "Marks Obtained", "Total Marks", "Percentage", "Grade"].map((h) => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rankList.students.map((r) => (
                        <tr key={r.id || r._rank}
                          style={{ background: r._rank <= 3 ? "#fffbeb" : "transparent" }}
                        >
                          <td style={{ ...S.td, fontWeight: 800, fontSize: 18 }}>
                            {r._rank === 1 ? "🥇" : r._rank === 2 ? "🥈" : r._rank === 3 ? "🥉" : `#${r._rank}`}
                          </td>
                          <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>
                            {r.student?.firstName || r.studentName || "—"} {r.student?.lastName || ""}
                          </td>
                          <td style={{ ...S.td, fontWeight: 600 }}>
                            {r.totalObtained ?? r.marksObtained ?? "—"}
                          </td>
                          <td style={{ ...S.td, color: "#475569" }}>
                            {r.totalMarks ?? "—"}
                          </td>
                          <td style={{ ...S.td, fontWeight: 700, color: pc(r.percentage) }}>
                            {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
                          </td>
                          <td style={S.td}>
                            <span style={{
                              background: `${gc(r.grade)}22`, color: gc(r.grade),
                              borderRadius: 6, padding: "3px 10px",
                              fontWeight: 700, fontSize: 12,
                            }}>
                              {r.grade || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ REPORT CARD TAB ════════════ */}
        {tab === "reportCard" && (
          <div>
            {/* Search bar */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "16px 20px",
              marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-end",
              flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>
                  Student ID
                </label>
                <input
                  type="number"
                  placeholder="e.g. 101"
                  value={rcStudentId}
                  onChange={(e) => setRcStudentId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadReportCard()}
                  style={{ ...S.inp, maxWidth: 200 }}
                />
              </div>
              <button onClick={loadReportCard} disabled={loading} style={S.btn()}>
                <Search size={14} /> {loading ? "Loading..." : "Get Report Card"}
              </button>
              {reportCard && (
                <button onClick={() => window.print()} style={S.btn("#475569")}>
                  <Printer size={14} /> Print
                </button>
              )}
            </div>

            {!reportCard && (
              <div style={{ ...S.card, padding: 52, textAlign: "center" }}>
                <ClipboardList size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  Exam select karo, student ID daalo aur Get Report Card click karo
                </p>
              </div>
            )}

            {reportCard && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 32, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                {/* School header */}
                <div style={{ textAlign: "center", borderBottom: "3px solid #4f46e5", paddingBottom: 16, marginBottom: 24 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                    {reportCard.schoolName || "School Name"}
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                    Progress Report Card — {reportCard.academicYear || selectedExam?.academicYear || ""}
                  </p>
                </div>

                {/* Student info grid */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 16, marginBottom: 28, background: "#f8fafc",
                  borderRadius: 10, padding: "16px 20px",
                }}>
                  {[
                    ["Student Name",   reportCard.studentName || reportCard.student?.name],
                    ["Admission No.",  reportCard.admissionNumber],
                    ["Class",          reportCard.className || selectedExam?.standard],
                    ["Roll No.",       reportCard.rollNumber],
                    ["Exam",           reportCard.examName || selectedExam?.examName],
                    ["Academic Year",  reportCard.academicYear || selectedExam?.academicYear],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{l}</div>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{v || "—"}</div>
                    </div>
                  ))}
                </div>

                {/* Subject table */}
                <div style={{ overflowX: "auto", marginBottom: 24 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#4f46e5" }}>
                        {["Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"].map((h) => (
                          <th key={h} style={{
                            padding: "10px 16px", color: "#fff",
                            textAlign: "left", fontWeight: 600, fontSize: 13,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(reportCard.subjects || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                            Subject-wise data available nahi hai
                          </td>
                        </tr>
                      ) : (
                        (reportCard.subjects || []).map((s, i) => {
                          const spct = s.percentage ?? ((s.marksObtained / s.totalMarks) * 100) ?? 0;
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1e293b" }}>
                                {s.subject || s.subjectName || "—"}
                              </td>
                              <td style={{ padding: "10px 16px" }}>{s.marksObtained ?? "—"}</td>
                              <td style={{ padding: "10px 16px", color: "#475569" }}>{s.totalMarks ?? "—"}</td>
                              <td style={{ padding: "10px 16px", fontWeight: 700, color: pc(spct) }}>
                                {spct != null ? `${spct.toFixed(1)}%` : "—"}
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <span style={{
                                  background: `${gc(s.grade)}22`, color: gc(s.grade),
                                  borderRadius: 5, padding: "2px 9px", fontWeight: 700, fontSize: 12,
                                }}>
                                  {s.grade || "—"}
                                </span>
                              </td>
                              <td style={{
                                padding: "10px 16px", fontWeight: 600,
                                color: spct >= 33 ? "#059669" : "#dc2626",
                              }}>
                                {spct != null ? (spct >= 33 ? "Pass" : "Fail") : "—"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary box */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 12, padding: "18px 28px", minWidth: 280,
                  }}>
                    {[
                      ["Total Obtained",  `${reportCard.totalObtained ?? "—"} / ${reportCard.totalMarks ?? "—"}`],
                      ["Percentage",      reportCard.percentage != null ? `${reportCard.percentage.toFixed(2)}%` : "—"],
                      ["Overall Grade",   reportCard.overallGrade || reportCard.grade || "—"],
                      ["Class Rank",      reportCard.rank ? `#${reportCard.rank} of ${reportCard.totalStudents}` : "—"],
                    ].map(([l, v]) => (
                      <div key={l} style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 10,
                        borderBottom: "1px solid #dcfce7", paddingBottom: 10,
                      }}>
                        <span style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}>{l}</span>
                        <span style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>{v}</span>
                      </div>
                    ))}
                    {/* Overall status */}
                    {reportCard.percentage != null && (
                      <div style={{ textAlign: "center", marginTop: 4 }}>
                        <span style={{
                          background: reportCard.percentage >= 33 ? "#059669" : "#dc2626",
                          color: "#fff", borderRadius: 8, padding: "5px 20px",
                          fontWeight: 800, fontSize: 14,
                        }}>
                          {reportCard.percentage >= 33 ? "✓ PASS" : "✗ FAIL"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
// // import { useState } from "react";
// // import Layout from "../../common/components/Layout";

// // export default function Results() {

// //   const [selectedExam, setSelectedExam] = useState("Mid Term");
// //   const [selectedClass, setSelectedClass] = useState("10-A");

// //   // ✅ Dummy Exams & Classes
// //   const exams = ["Unit Test", "Mid Term", "Final Exam"];
// //   const classes = ["10-A", "10-B", "9-A"];

// //   // ✅ Dummy Result Data
// //   const students = [
// //     {
// //       id: 1,
// //       name: "Rahul Sharma",
// //       marks: { Math: 85, Science: 78, English: 88 }
// //     },
// //     {
// //       id: 2,
// //       name: "Priya Patel",
// //       marks: { Math: 92, Science: 81, English: 79 }
// //     },
// //     {
// //       id: 3,
// //       name: "Amit Verma",
// //       marks: { Math: 40, Science: 35, English: 50 }
// //     }
// //   ];

// //   // ✅ Grade Logic
// //   const getGrade = (percentage) => {
// //     if (percentage >= 90) return "A+";
// //     if (percentage >= 75) return "A";
// //     if (percentage >= 60) return "B";
// //     if (percentage >= 40) return "C";
// //     return "F";
// //   };

// //   return (
// //     <Layout>

// //       {/* HEADER */}
// //       <div className="flex justify-between items-center mb-6">

// //         <h2 className="text-2xl font-bold text-gray-800">
// //           Results Management
// //         </h2>

// //         <div className="flex gap-3">

// //           {/* EXAM SELECT */}
// //           <select
// //             value={selectedExam}
// //             onChange={(e) => setSelectedExam(e.target.value)}
// //             className="border px-3 py-2 rounded"
// //           >
// //             {exams.map((exam) => (
// //               <option key={exam}>{exam}</option>
// //             ))}
// //           </select>

// //           {/* CLASS SELECT */}
// //           <select
// //             value={selectedClass}
// //             onChange={(e) => setSelectedClass(e.target.value)}
// //             className="border px-3 py-2 rounded"
// //           >
// //             {classes.map((cls) => (
// //               <option key={cls}>{cls}</option>
// //             ))}
// //           </select>

// //         </div>

// //       </div>

// //       {/* TABLE */}
// //       <div className="bg-white rounded-xl shadow overflow-hidden">

// //         <div className="overflow-auto max-h-[600px]">

// //           <table className="w-full text-sm">

// //             <thead className="bg-gray-100 sticky top-0">
// //               <tr className="text-left text-gray-600">
// //                 <th className="p-3">Student</th>
// //                 <th className="p-3">Math</th>
// //                 <th className="p-3">Science</th>
// //                 <th className="p-3">English</th>
// //                 <th className="p-3">Total</th>
// //                 <th className="p-3">%</th>
// //                 <th className="p-3">Grade</th>
// //                 <th className="p-3">Status</th>
// //               </tr>
// //             </thead>

// //             <tbody>

// //               {students.map((student) => {

// //                 const total =
// //                   student.marks.Math +
// //                   student.marks.Science +
// //                   student.marks.English;

// //                 const percentage = (total / 300) * 100;
// //                 const grade = getGrade(percentage);

// //                 return (
// //                   <tr
// //                     key={student.id}
// //                     className="border-t hover:bg-gray-50"
// //                   >

// //                     <td className="p-3 font-medium">
// //                       {student.name}
// //                     </td>

// //                     <td className="p-3">{student.marks.Math}</td>
// //                     <td className="p-3">{student.marks.Science}</td>
// //                     <td className="p-3">{student.marks.English}</td>

// //                     <td className="p-3 font-semibold">
// //                       {total}
// //                     </td>

// //                     <td className="p-3">
// //                       {percentage.toFixed(1)}%
// //                     </td>

// //                     <td className="p-3">
// //                       {grade}
// //                     </td>

// //                     <td className="p-3">
// //                       <span className={`px-2 py-1 text-xs rounded ${
// //                         percentage >= 40
// //                           ? "bg-green-100 text-green-600"
// //                           : "bg-red-100 text-red-600"
// //                       }`}>
// //                         {percentage >= 40 ? "Pass" : "Fail"}
// //                       </span>
// //                     </td>

// //                   </tr>
// //                 );
// //               })}

// //             </tbody>

// //           </table>

// //         </div>

// //       </div>

// //     </Layout>
// //   );
// // }// src/school_admin/pages/Results.jsx
// // Role: SCHOOL_ADMIN
// // Route: /school-admin/results
// //
// // Standalone "Results Management" page.
// // Uses the same resultService / examService as Exams.jsx (Results tab),
// // so no backend changes needed.
// //
// // Features:
// //  • Exam selector (auto-loads class results on change)
// //  • Summary stat cards (Total / Pass / Fail / Class Avg / Highest / Lowest)
// //  • Search by student name
// //  • Calculate All + Recalculate (Fix Existing Data)
// //  • Edit a result (marks / grade) via modal
// //  • View printable Report Card per student
// //  • Bulk upload results via Excel
// //  • Export current view to CSV
// // ─────────────────────────────────────────────────────────────────────────────

// import { useEffect, useMemo, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { examService, resultService } from "../../common/services/examService";
// import {
//   RefreshCcw, Calculator, Search, Pencil, Eye, Download,
//   Upload, X, Save, CheckCircle, Users, Award, TrendingUp,
//   TrendingDown, BarChart3, Trophy, ClipboardList,
// } from "lucide-react";

// // ── shared style helpers (same system as Exams.jsx) ───────────────────────────
// const S = {
//   inp: {
//     width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
//     padding: "9px 12px", fontSize: 14, outline: "none",
//     boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
//   },
//   btn: (bg = "#4f46e5", fg = "#fff") => ({
//     background: bg, color: fg, border: "none", borderRadius: 8,
//     padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600,
//     display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
//   }),
//   card: {
//     background: "#fff", borderRadius: 14,
//     boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden",
//   },
//   th: {
//     padding: "11px 16px", textAlign: "left", fontWeight: 600,
//     color: "#64748b", borderBottom: "1px solid #f1f5f9", fontSize: 13,
//     background: "#f8fafc",
//   },
//   td: { padding: "11px 16px", fontSize: 14, borderBottom: "1px solid #f8fafc" },
// };

// const GC = { "A+": "#059669", A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
// const gc = (g) => GC[g] || "#6b7280";
// const pc = (p) => (p >= 33 ? "#059669" : "#ef4444");

// // ── tiny Modal (same as Exams.jsx) ─────────────────────────────────────────────
// function Modal({ title, onClose, children, wide }) {
//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
//       zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
//       padding: 16,
//     }}>
//       <div style={{
//         background: "#fff", borderRadius: 16, padding: 28,
//         width: "95%", maxWidth: wide ? 820 : 540,
//         maxHeight: "92vh", overflowY: "auto",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative",
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//           <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{title}</h3>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
//             <X size={20} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }

// const Field = ({ label, children, half }) => (
//   <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
//     <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
//     {children}
//   </div>
// );

// function Toast({ msg, ok }) {
//   return (
//     <div style={{
//       position: "fixed", top: 20, right: 24,
//       background: ok ? "#059669" : "#dc2626",
//       color: "#fff", padding: "12px 20px", borderRadius: 10,
//       boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 2000,
//       fontSize: 14, fontWeight: 600,
//     }}>
//       {msg}
//     </div>
//   );
// }

// function Empty({ text }) {
//   return (
//     <tr>
//       <td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>
//         {text}
//       </td>
//     </tr>
//   );
// }

// function StatCard({ label, value, color, icon }) {
//   return (
//     <div style={{
//       ...S.card, flex: "1 1 150px", padding: "16px 18px",
//       display: "flex", alignItems: "center", gap: 12,
//     }}>
//       <div style={{
//         width: 40, height: 40, borderRadius: 10, background: color + "20",
//         color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//       }}>
//         {icon}
//       </div>
//       <div>
//         <div style={{ fontSize: 19, fontWeight: 800, color: "#1e293b" }}>{value}</div>
//         <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// export default function Results() {
//   const [exams, setExams] = useState([]);
//   const [selectedExamId, setSelectedExamId] = useState("");
//   const [classResults, setClassResults] = useState([]);
//   const [search, setSearch] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [examsLoading, setExamsLoading] = useState(false);
//   const [recalculating, setRecalculating] = useState(false);
//   const [loadedOnce, setLoadedOnce] = useState(false);
//   const [toast, setToast] = useState(null);

//   // edit modal
//   const [editingResult, setEditingResult] = useState(null);

//   // report card modal
//   const [reportCard, setReportCard] = useState(null);
//   const [rcLoading, setRcLoading] = useState(false);

//   // bulk upload modal
//   const [showUpload, setShowUpload] = useState(false);
//   const [uploadFile, setUploadFile] = useState(null);

//   // ── helpers ──────────────────────────────────────────────────────────────
//   const notify = (msg, ok = true) => {
//     setToast({ msg, ok });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const wrap = async (fn) => {
//     setLoading(true);
//     try { await fn(); } finally { setLoading(false); }
//   };

//   const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

//   // ── load exams on mount ─────────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       setExamsLoading(true);
//       try {
//         const r = await examService.getAll();
//         setExams(r.data || []);
//       } catch {
//         notify("Failed to load exams", false);
//       } finally {
//         setExamsLoading(false);
//       }
//     })();
//   }, []);

//   // ── load results ────────────────────────────────────────────────────────
//   const loadClassResults = () => wrap(async () => {
//     if (!selectedExamId) return notify("Select an exam first", false);
//     try {
//       const r = await resultService.getByClass(selectedExamId);
//       setClassResults(r.data || []);
//       setLoadedOnce(true);
//     } catch {
//       notify("Failed to load results", false);
//     }
//   });

//   // Auto-load whenever exam selection changes
//   useEffect(() => {
//     if (selectedExamId) {
//       loadClassResults();
//     } else {
//       setClassResults([]);
//       setLoadedOnce(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedExamId]);

//   // ── calculate / recalculate ─────────────────────────────────────────────
//   const calculateAll = () => wrap(async () => {
//     if (!selectedExamId) return notify("Select an exam first", false);
//     try {
//       await resultService.calculateAll(selectedExamId);
//       notify("All results calculated ✅");
//       await loadClassResults();
//     } catch (e) {
//       notify(e.response?.data?.message || "Calculation failed", false);
//     }
//   });

//   const recalculateAllExisting = async () => {
//     if (!window.confirm("Yeh saare existing results ke liye summary recalculate karega. Continue?")) return;
//     setRecalculating(true);
//     try {
//       const r = await resultService.recalculateAll();
//       notify(r.data || "Recalculation complete ✅");
//       if (selectedExamId) await loadClassResults();
//     } catch (e) {
//       notify(e.response?.data?.message || "Recalculation failed", false);
//     } finally {
//       setRecalculating(false);
//     }
//   };

//   // ── edit result ─────────────────────────────────────────────────────────
//   const openEdit = (r) => {
//     setEditingResult({
//       id: r.id,
//       marksObtained: r.totalObtained ?? r.marksObtained ?? 0,
//       totalMarks: r.totalMarks ?? 0,
//       grade: r.grade || "",
//     });
//   };

//   const saveResultEdit = () => wrap(async () => {
//     try {
//       await resultService.update(editingResult.id, {
//         marksObtained: Number(editingResult.marksObtained),
//         totalMarks: Number(editingResult.totalMarks),
//         grade: editingResult.grade,
//       });
//       notify("Result updated ✅");
//       setEditingResult(null);
//       await loadClassResults();
//     } catch (e) {
//       notify(e.response?.data?.message || "Update failed", false);
//     }
//   });

//   // ── report card ─────────────────────────────────────────────────────────
//   const openReportCard = async (studentId) => {
//     if (!studentId) return notify("Student ID not found for this row", false);
//     setRcLoading(true);
//     setReportCard(null);
//     try {
//       const r = await resultService.getByStudent(studentId, selectedExamId);
//       setReportCard(r.data);
//     } catch {
//       notify("No report card found for this student", false);
//     } finally {
//       setRcLoading(false);
//     }
//   };

//   // ── bulk upload ─────────────────────────────────────────────────────────
//   const handleUpload = () => wrap(async () => {
//     if (!selectedExamId) return notify("Select an exam first", false);
//     if (!uploadFile) return notify("Select a file first", false);
//     try {
//       await resultService.uploadExcel(selectedExamId, uploadFile);
//       notify("Results uploaded successfully ✅");
//       setShowUpload(false);
//       setUploadFile(null);
//       await loadClassResults();
//     } catch (e) {
//       notify(e.response?.data?.message || "Upload failed", false);
//     }
//   });

//   // ── derived: ranked + filtered + stats ──────────────────────────────────
//   const ranked = useMemo(() => {
//     const sorted = [...classResults].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
//     sorted.forEach((s, i) => { s._rank = i + 1; });
//     return sorted;
//   }, [classResults]);

//   const filtered = useMemo(() => {
//     if (!search.trim()) return ranked;
//     const q = search.toLowerCase();
//     return ranked.filter((r) => {
//       const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""} ${r.studentName || ""}`.toLowerCase();
//       const adm = String(r.student?.admissionNumber || r.admissionNumber || "").toLowerCase();
//       return name.includes(q) || adm.includes(q);
//     });
//   }, [ranked, search]);

//   const stats = useMemo(() => {
//     if (!classResults.length) return null;
//     const total = classResults.length;
//     const pass = classResults.filter((r) => (r.percentage || 0) >= 33).length;
//     const avg = classResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / total;
//     const highest = Math.max(...classResults.map((r) => r.percentage || 0));
//     const lowest = Math.min(...classResults.map((r) => r.percentage || 0));
//     return { total, pass, fail: total - pass, avg, highest, lowest };
//   }, [classResults]);

//   // ── export CSV ───────────────────────────────────────────────────────────
//   const exportCSV = () => {
//     if (!ranked.length) return notify("No data to export", false);
//     const header = ["Rank", "Student", "Admission No.", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"];
//     const rows = ranked.map((r) => {
//       const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || r.studentName || "—";
//       return [
//         r._rank,
//         name,
//         r.student?.admissionNumber || r.admissionNumber || "—",
//         r.totalObtained ?? r.marksObtained ?? "",
//         r.totalMarks ?? "",
//         r.percentage != null ? r.percentage.toFixed(1) : "",
//         r.grade || "",
//         (r.percentage || 0) >= 33 ? "PASS" : "FAIL",
//       ];
//     });
//     const csv = [header, ...rows]
//       .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
//       .join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `Results_${selectedExam?.examName || "exam"}_${selectedExam?.standard || ""}.csv`.replace(/\s+/g, "_");
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
//       <SchoolAdminSidebar />

//       {toast && <Toast {...toast} />}

//       <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

//         {/* Page header */}
//         <div style={{ marginBottom: 24 }}>
//           <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Results Management</h1>
//           <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
//             View, edit and analyze exam results school-wide
//           </p>
//         </div>

//         {/* Exam selector + actions */}
//         <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
//           <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}
//             style={{ ...S.inp, maxWidth: 320 }}>
//             <option value="">
//               {examsLoading ? "Loading exams..." : "— Select Exam —"}
//             </option>
//             {exams.map((ex) => (
//               <option key={ex.id} value={ex.id}>
//                 {ex.examName} {ex.standard ? `(Std ${ex.standard})` : ""}
//               </option>
//             ))}
//           </select>

//           {selectedExam && (
//             <span style={{ fontSize: 13, color: "#64748b", background: "#f8fafc", borderRadius: 6, padding: "4px 12px", border: "1px solid #e2e8f0" }}>
//               {selectedExam.startDate} → {selectedExam.endDate} &nbsp;·&nbsp; {selectedExam.academicYear}
//             </span>
//           )}

//           {/* Search */}
//           <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
//             <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search student name / admission no..."
//               style={{ ...S.inp, paddingLeft: 32 }}
//             />
//           </div>

//           <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//             <button onClick={loadClassResults} disabled={!selectedExamId || loading} style={S.btn("#475569")}>
//               <RefreshCcw size={14} /> {loading ? "Loading..." : "Refresh"}
//             </button>
//             <button onClick={calculateAll} disabled={!selectedExamId || loading} style={S.btn("#059669")}>
//               <Calculator size={14} /> Calculate All
//             </button>
//             <button
//               onClick={recalculateAllExisting}
//               disabled={recalculating}
//               title="One-time fix: build summaries for all existing result rows"
//               style={{ ...S.btn("#7c3aed"), opacity: recalculating ? 0.7 : 1 }}>
//               <RefreshCcw size={14} /> {recalculating ? "Recalculating..." : "Fix Existing Data"}
//             </button>
//             <button onClick={() => setShowUpload(true)} disabled={!selectedExamId} style={S.btn("#0ea5e9")}>
//               <Upload size={14} /> Bulk Upload
//             </button>
//             <button onClick={exportCSV} disabled={!ranked.length} style={S.btn("#1e293b")}>
//               <Download size={14} /> Export CSV
//             </button>
//           </div>
//         </div>

//         {/* Stat cards */}
//         {stats && (
//           <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
//             <StatCard label="Total Students" value={stats.total} color="#4f46e5" icon={<Users size={18} />} />
//             <StatCard label="Passed" value={stats.pass} color="#059669" icon={<CheckCircle size={18} />} />
//             <StatCard label="Failed" value={stats.fail} color="#dc2626" icon={<X size={18} />} />
//             <StatCard label="Class Average" value={`${stats.avg.toFixed(1)}%`} color="#0ea5e9" icon={<BarChart3 size={18} />} />
//             <StatCard label="Highest" value={`${stats.highest.toFixed(1)}%`} color="#f59e0b" icon={<TrendingUp size={18} />} />
//             <StatCard label="Lowest" value={`${stats.lowest.toFixed(1)}%`} color="#f97316" icon={<TrendingDown size={18} />} />
//           </div>
//         )}

//         {/* Results table */}
//         <div style={S.card}>
//           <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
//             <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#1e293b" }}>
//               <Trophy size={17} color="#f59e0b" /> Class Results
//               {selectedExam && (
//                 <span style={{ background: "#ede9fe", color: "#6d28d9", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
//                   Std {selectedExam.standard}
//                 </span>
//               )}
//             </h2>
//             {!!filtered.length && (
//               <span style={{ fontSize: 13, color: "#94a3b8" }}>
//                 Showing {filtered.length} of {classResults.length} student{classResults.length !== 1 ? "s" : ""}
//               </span>
//             )}
//           </div>

//           <div style={{ overflowX: "auto" }}>
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead>
//                 <tr>
//                   {["Rank", "Student", "Admission No.", "Marks", "Percentage", "Grade", "Status", "Actions"].map((h) => (
//                     <th key={h} style={S.th}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {!selectedExamId && (
//                   <Empty text="Select an exam above to view results." />
//                 )}

//                 {selectedExamId && loading && classResults.length === 0 && (
//                   <Empty text="Loading results..." />
//                 )}

//                 {selectedExamId && !loading && loadedOnce && classResults.length === 0 && (
//                   <Empty text='No results found for this exam yet. Enter marks, then click "Calculate All".' />
//                 )}

//                 {selectedExamId && filtered.length === 0 && classResults.length > 0 && (
//                   <Empty text="No students match your search." />
//                 )}

//                 {filtered.map((r) => {
//                   const studentId = r.student?.id ?? r.studentId;
//                   const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || r.studentName || "—";
//                   const pass = (r.percentage || 0) >= 33;
//                   return (
//                     <tr key={r.id || studentId} style={{ background: r._rank <= 3 ? "#fffbeb" : "transparent" }}>
//                       <td style={{ ...S.td, fontWeight: 800 }}>
//                         {r._rank === 1 ? "🥇" : r._rank === 2 ? "🥈" : r._rank === 3 ? "🥉" : `#${r._rank}`}
//                       </td>
//                       <td style={{ ...S.td, fontWeight: 600 }}>{name}</td>
//                       <td style={{ ...S.td, color: "#64748b" }}>{r.student?.admissionNumber || r.admissionNumber || "—"}</td>
//                       <td style={S.td}>{r.totalObtained ?? r.marksObtained ?? "—"} / {r.totalMarks ?? "—"}</td>
//                       <td style={{ ...S.td, fontWeight: 700, color: pc(r.percentage) }}>
//                         {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
//                       </td>
//                       <td style={S.td}>
//                         <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
//                           {r.grade || "—"}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         <span style={{ background: pass ? "#dcfce7" : "#fee2e2", color: pass ? "#059669" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>
//                           {pass ? "PASS" : "FAIL"}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         <div style={{ display: "flex", gap: 8 }}>
//                           <button onClick={() => openReportCard(studentId)}
//                             title="View report card"
//                             style={{ background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
//                             <Eye size={12} /> View
//                           </button>
//                           <button onClick={() => openEdit(r)}
//                             title="Edit result"
//                             style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
//                             <Pencil size={12} /> Edit
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>

//       {/* ══════════════════════════════════════════════════════════════════
//           MODAL — EDIT RESULT
//       ══════════════════════════════════════════════════════════════════ */}
//       {editingResult && (
//         <Modal title={`Edit Result — ID ${editingResult.id}`} onClose={() => setEditingResult(null)}>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//             <Field label="Marks Obtained" half>
//               <input type="number" style={S.inp} value={editingResult.marksObtained}
//                 onChange={(e) => setEditingResult((p) => ({ ...p, marksObtained: e.target.value }))} />
//             </Field>
//             <Field label="Total Marks" half>
//               <input type="number" style={S.inp} value={editingResult.totalMarks}
//                 onChange={(e) => setEditingResult((p) => ({ ...p, totalMarks: e.target.value }))} />
//             </Field>
//             <Field label="Grade" half>
//               <input type="text" style={S.inp} value={editingResult.grade}
//                 onChange={(e) => setEditingResult((p) => ({ ...p, grade: e.target.value }))}
//                 placeholder="e.g. A, B, A+" />
//             </Field>
//           </div>
//           <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
//             <button onClick={saveResultEdit} disabled={loading}
//               style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
//               <Save size={14} /> {loading ? "Saving..." : "Save Changes"}
//             </button>
//             <button onClick={() => setEditingResult(null)} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
//               Cancel
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════
//           MODAL — REPORT CARD
//       ══════════════════════════════════════════════════════════════════ */}
//       {(reportCard || rcLoading) && (
//         <Modal title="Student Report Card" onClose={() => setReportCard(null)} wide>
//           {rcLoading && (
//             <p style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading report card...</p>
//           )}

//           {!rcLoading && reportCard && (
//             <div id="report-card-print">
//               <div style={{ textAlign: "center", borderBottom: "2px solid #4f46e5", paddingBottom: 16, marginBottom: 20 }}>
//                 <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
//                   {reportCard.schoolName || "School Name"}
//                 </h2>
//                 <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                   Progress Report Card — {reportCard.academicYear || selectedExam?.academicYear}
//                 </p>
//               </div>

//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "#f8fafc", borderRadius: 10, padding: "16px 20px" }}>
//                 {[
//                   ["Student Name", reportCard.studentName || reportCard.student?.name],
//                   ["Admission No.", reportCard.admissionNumber],
//                   ["Class", reportCard.className],
//                   ["Roll No.", reportCard.rollNumber],
//                   ["Exam", reportCard.examName || selectedExam?.examName],
//                   ["Exam Type", reportCard.examType || selectedExam?.examType],
//                 ].map(([l, v]) => (
//                   <div key={l}>
//                     <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{l}</div>
//                     <div style={{ fontWeight: 700, color: "#1e293b" }}>{v || "—"}</div>
//                   </div>
//                 ))}
//               </div>

//               <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
//                 <thead>
//                   <tr style={{ background: "#4f46e5" }}>
//                     {["Subject", "Marks Obtained", "Total", "%", "Grade", "Remarks"].map((h) => (
//                       <th key={h} style={{ padding: "10px 14px", color: "#fff", textAlign: "left", fontWeight: 600, fontSize: 13 }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(reportCard.subjects || []).map((s, i) => (
//                     <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
//                       <td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.subject || s.subjectName}</td>
//                       <td style={{ padding: "10px 14px" }}>{s.marksObtained}</td>
//                       <td style={{ padding: "10px 14px" }}>{s.totalMarks}</td>
//                       <td style={{ padding: "10px 14px", fontWeight: 700, color: pc(s.percentage) }}>
//                         {s.percentage != null ? `${s.percentage.toFixed(1)}%` : "—"}
//                       </td>
//                       <td style={{ padding: "10px 14px" }}>
//                         <span style={{ background: gc(s.grade) + "25", color: gc(s.grade), borderRadius: 5, padding: "2px 8px", fontWeight: 700 }}>{s.grade}</span>
//                       </td>
//                       <td style={{ padding: "10px 14px", color: s.remarks === "Fail" ? "#dc2626" : "#059669", fontWeight: 600 }}>
//                         {s.remarks || ((s.percentage || 0) >= 33 ? "Pass" : "Fail")}
//                       </td>
//                     </tr>
//                   ))}
//                   {(!reportCard.subjects || reportCard.subjects.length === 0) && (
//                     <tr>
//                       <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
//                         No subject-wise breakdown available.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>

//               <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                 <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 24px", minWidth: 260 }}>
//                   {[
//                     ["Total Obtained", `${reportCard.totalObtained ?? "—"} / ${reportCard.totalMarks ?? "—"}`],
//                     ["Percentage", `${reportCard.percentage?.toFixed(2) ?? "—"}%`],
//                     ["Overall Grade", reportCard.overallGrade || reportCard.grade || "—"],
//                     ["Class Rank", reportCard.rank ? `#${reportCard.rank} of ${reportCard.totalStudents}` : "—"],
//                   ].map(([l, v]) => (
//                     <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//                       <span style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}>{l}</span>
//                       <span style={{ fontWeight: 800 }}>{v}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
//                 <button onClick={() => window.print()} style={S.btn()}>
//                   <ClipboardList size={14} /> Print
//                 </button>
//                 <button onClick={() => setReportCard(null)} style={S.btn("#94a3b8")}>
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════
//           MODAL — BULK UPLOAD RESULTS
//       ══════════════════════════════════════════════════════════════════ */}
//       {showUpload && (
//         <Modal title={`Bulk Upload Results — ${selectedExam?.examName || ""}`} onClose={() => setShowUpload(false)}>
//           <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#166534" }}>
//             <strong>📋 Excel Format:</strong>
//             <br />
//             Required columns: <code>studentId</code>, <code>subject</code>, <code>marksObtained</code>, <code>totalMarks</code>
//             <br />
//             Results will be uploaded for: <strong>{selectedExam?.examName} (Std {selectedExam?.standard})</strong>
//           </div>

//           <input type="file" accept=".xlsx,.xls"
//             onChange={(e) => setUploadFile(e.target.files[0])}
//             style={{ marginBottom: 18, fontSize: 13 }} />

//           <div style={{ display: "flex", gap: 10 }}>
//             <button onClick={handleUpload} disabled={loading || !uploadFile}
//               style={{ ...S.btn("#0ea5e9"), flex: 1, justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
//               <Upload size={14} /> {loading ? "Uploading..." : "Upload"}
//             </button>
//             <button onClick={() => { setShowUpload(false); setUploadFile(null); }} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
//               Cancel
//             </button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }