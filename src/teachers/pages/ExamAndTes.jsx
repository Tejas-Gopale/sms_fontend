// src/teachers/pages/ExamAndTes.jsx
// Role: TEACHER, CLASS_TEACHER
// ─────────────────────────────────────────────────────────────────────────────
// FIXES:
//  • resultService.getAllByStudent — correct endpoint /result/student/all
//  • Subject dropdown fallback from schedule when class subjects unavailable
//  • Student ID lookup replaced with dropdown from loaded students
//  • Marks validation: warns if marks > totalMarks
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
import {
  examService,
  scheduleService,
  resultService,
} from "../../common/services/examService";
import {
  FileText, Save, RefreshCcw,
  Calendar, Search, History, ChevronDown, User,
} from "lucide-react";

const S = {
  inp: {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
  },
  card: {
    background: "#fff", borderRadius: 12,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  th: {
    padding: "11px 16px", textAlign: "left", fontWeight: 600,
    color: "#64748b", borderBottom: "1px solid #f1f5f9", fontSize: 13,
    background: "#f8fafc",
  },
};

const GC = { "A+": "#059669", A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
const gc = (g) => GC[g] || "#6b7280";

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24,
      background: ok ? "#059669" : "#dc2626",
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 14,
    }}>
      {msg}
    </div>
  );
}

export default function TeacherExam() {
  const [tab, setTab] = useState("enter");

  const [classrooms, setClassrooms]           = useState([]);
  const [exams, setExams]                     = useState([]);
  const [subjects, setSubjects]               = useState([]);
  const [students, setStudents]               = useState([]);
  const [schedule, setSchedule]               = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedExamId, setSelectedExamId]   = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [totalMarks, setTotalMarks]           = useState(100);
  const [marksData, setMarksData]             = useState({});

  // Student history — now uses dropdown instead of manual ID entry
  const [histStudentId, setHistStudentId]       = useState("");
  const [histStudentName, setHistStudentName]   = useState("");
  const [histExamId, setHistExamId]             = useState("");
  const [histResult, setHistResult]             = useState(null);
  const [allExamResults, setAllExamResults]     = useState(null);
  const [histStudents, setHistStudents]         = useState([]);
  const [histClassId, setHistClassId]           = useState("");

  const [saving, setSaving]                   = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [toast, setToast]                     = useState(null);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const wrap = (fn) => { setLoading(true); fn().finally(() => setLoading(false)); };

  useEffect(() => {
    const init = async () => {
      try {
        const [clData, exData] = await Promise.all([
          getClassrooms(),
          examService.getAll(),
        ]);
        setClassrooms(clData?.content || clData || []);
        setExams(exData.data || []);
      } catch {
        notify("Failed to load data", false);
      }
    };
    init();
  }, []);

  const handleClassChange = async (id) => {
    setSelectedClassId(id);
    setStudents([]);
    setMarksData({});
    setSubjects([]);
    const cls = classrooms.find((c) => String(c.id) === String(id));
    setSubjects(cls?.subjects || []);
    if (!id) return;
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClassroom(id);
      const fmt = (data || []).map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
      }));
      setStudents(fmt);
      const init = {};
      fmt.forEach((s) => (init[s.id] = ""));
      setMarksData(init);
    } catch {
      notify("Failed to load students", false);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleExamChange = async (id) => {
    setSelectedExamId(id);
    setSchedule([]);
    setSelectedSubject("");
    if (!id) return;
    try {
      const r = await scheduleService.getByExam(id);
      setSchedule(r.data || []);
    } catch { /* non-blocking */ }
  };

  const handleSave = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubject)
      return notify("Select exam, class & subject first", false);

    const entries = students.filter((s) => marksData[s.id] !== "");
    if (entries.length === 0)
      return notify("Enter marks for at least one student", false);

    // Validation
    const invalid = entries.find(s => Number(marksData[s.id]) > Number(totalMarks));
    if (invalid) return notify(`${invalid.name}: marks exceed total marks (${totalMarks})`, false);

    setSaving(true);
    try {
      await Promise.all(
        entries.map((s) =>
          resultService.enter({
            exam: { id: Number(selectedExamId) },
            student: { id: s.id },
            subject: selectedSubject,
            marksObtained: Number(marksData[s.id]),
            totalMarks: Number(totalMarks),
          })
        )
      );
      notify(`Marks saved for ${entries.length} student${entries.length > 1 ? "s" : ""} ✅`);
      const reset = {};
      students.forEach((s) => (reset[s.id] = ""));
      setMarksData(reset);
    } catch (e) {
      notify(e.response?.data?.message || "Save failed. Please retry.", false);
    } finally {
      setSaving(false);
    }
  };

  const loadSchedule = async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    setLoading(true);
    try {
      const r = await scheduleService.getByExam(selectedExamId);
      setSchedule(r.data || []);
    } catch {
      notify("Failed to load schedule", false);
    } finally {
      setLoading(false);
    }
  };

  // History: load students for a class
  const handleHistClassChange = async (id) => {
    setHistClassId(id);
    setHistStudentId("");
    setHistStudentName("");
    setHistStudents([]);
    if (!id) return;
    try {
      const data = await getStudentsByClassroom(id);
      setHistStudents((data || []).map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })));
    } catch {
      notify("Failed to load students for history", false);
    }
  };

  const loadHistory = () => wrap(async () => {
    if (!histStudentId || !histExamId)
      return notify("Select student and exam", false);
    try {
      const r = await resultService.getByStudent(histStudentId, histExamId);
      setHistResult(r.data);
      setAllExamResults(null);
    } catch {
      notify("No result found for this student / exam", false);
      setHistResult(null);
    }
  });

  const loadAllResults = () => wrap(async () => {
    if (!histStudentId) return notify("Select a student first", false);
    try {
      const r = await resultService.getAllByStudent(histStudentId);
      setAllExamResults(r.data || []);
      setHistResult(null);
    } catch {
      notify("No results found for this student", false);
      setAllExamResults(null);
    }
  });

  const filledCount = students.filter((s) => marksData[s.id] !== "").length;

  const subjectOptions = subjects.length > 0
    ? subjects.map((s) => ({ id: s.id, name: s.subjectName }))
    : schedule.map((sc) => ({ id: sc.id, name: sc.subject || sc.subjectName }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter',sans-serif" }}>
      <TeacherSidebar />

      {toast && <Toast {...toast} />}

      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <FileText size={28} color="#7c3aed" />
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" }}>Exam & Results</h2>
            <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 13 }}>
              Enter marks · View exam schedule · Check student history
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[
            ["enter",    "Enter Marks",      <FileText size={14} />],
            ["schedule", "Exam Schedule",    <Calendar size={14} />],
            ["history",  "Student History",  <History size={14} />],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: tab === id ? "#7c3aed" : "#fff",
                color: tab === id ? "#fff" : "#475569",
                boxShadow: tab === id ? "0 2px 8px rgba(124,58,237,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
              }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ═══ ENTER MARKS ═══ */}
        {tab === "enter" && (
          <>
            <div style={{ ...S.card, marginBottom: 20, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Exam Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Exam *</label>
                  <select style={S.inp} value={selectedExamId} onChange={(e) => handleExamChange(e.target.value)}>
                    <option value="">Select Exam</option>
                    {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Class *</label>
                  <select style={S.inp} value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)}>
                    <option value="">Select Class</option>
                    {classrooms.map((c) => <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Subject *</label>
                  <select style={S.inp} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjectOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Max Marks</label>
                  <input type="number" style={S.inp} value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)} />
                </div>
              </div>
            </div>

            {loadingStudents && (
              <div style={{ ...S.card, padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading students...</div>
            )}
            {!loadingStudents && selectedClassId && students.length === 0 && (
              <div style={{ ...S.card, padding: 48, textAlign: "center", color: "#94a3b8" }}>No students found.</div>
            )}
            {students.length > 0 && (
              <div style={S.card}>
                <div style={{ padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                    Marks Entry — {filledCount}/{students.length} filled
                  </span>
                  <div style={{ width: 180, background: "#e2e8f0", borderRadius: 99, height: 8 }}>
                    <div style={{ width: `${(filledCount / students.length) * 100}%`, background: "#7c3aed", height: 8, borderRadius: 99, transition: "width 0.3s" }} />
                  </div>
                </div>

                <div style={{ overflowY: "auto", maxHeight: "55vh" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr>
                        {["#", "Student Name", `Marks (/${totalMarks})`, "%"].map((h, i) => (
                          <th key={i} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const mark = marksData[s.id];
                        const pct = mark !== "" && !isNaN(mark) ? ((mark / totalMarks) * 100).toFixed(1) : null;
                        const isOver = mark !== "" && Number(mark) > Number(totalMarks);
                        return (
                          <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "10px 16px", color: "#94a3b8", fontSize: 12 }}>{idx + 1}</td>
                            <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1e293b" }}>{s.name}</td>
                            <td style={{ padding: "10px 16px", textAlign: "center" }}>
                              <input
                                type="number" min={0} max={totalMarks} value={mark}
                                onChange={(e) => setMarksData((p) => ({ ...p, [s.id]: e.target.value }))}
                                style={{ border: `1.5px solid ${isOver ? "#ef4444" : "#e2e8f0"}`, borderRadius: 6, padding: "6px 10px", width: 100, textAlign: "center", fontSize: 14, outline: "none" }}
                              />
                              {isOver && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 2 }}>Exceeds max!</div>}
                            </td>
                            <td style={{ padding: "10px 16px", textAlign: "center" }}>
                              {pct != null && (
                                <span style={{ fontWeight: 700, color: Number(pct) >= 33 ? "#059669" : "#dc2626" }}>
                                  {pct}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: saving ? "#94a3b8" : "#059669",
                      color: "#fff", border: "none", borderRadius: 8,
                      padding: "10px 24px", cursor: saving ? "not-allowed" : "pointer",
                      fontWeight: 700, fontSize: 14,
                    }}>
                    {saving ? <RefreshCcw size={16} /> : <Save size={16} />}
                    {saving ? "Saving..." : "Submit Marks"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ EXAM SCHEDULE ═══ */}
        {tab === "schedule" && (
          <div style={S.card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <select style={{ ...S.inp, maxWidth: 280 }} value={selectedExamId}
                onChange={(e) => handleExamChange(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
              </select>
              <button onClick={loadSchedule}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 600 }}>
                <RefreshCcw size={14} /> {loading ? "Loading..." : "Load Schedule"}
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Subject", "Date", "Start Time", "End Time"].map((h, i) => (
                    <th key={i} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                      Select an exam and click Load Schedule.
                    </td>
                  </tr>
                ) : (
                  schedule.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "11px 16px", color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "11px 16px", fontWeight: 600 }}>{s.subject || s.subjectName}</td>
                      <td style={{ padding: "11px 16px", color: "#475569" }}>{s.examDate}</td>
                      <td style={{ padding: "11px 16px", color: "#475569" }}>{s.startTime}</td>
                      <td style={{ padding: "11px 16px", color: "#475569" }}>{s.endTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══ STUDENT HISTORY ═══ */}
        {tab === "history" && (
          <div>
            <div style={{ ...S.card, padding: 20, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Look Up Student Results</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                {/* Class selector */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Class</label>
                  <select style={{ ...S.inp, width: 180 }} value={histClassId}
                    onChange={(e) => handleHistClassChange(e.target.value)}>
                    <option value="">Select Class</option>
                    {classrooms.map((c) => <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>)}
                  </select>
                </div>

                {/* Student dropdown */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Student *</label>
                  <select style={{ ...S.inp, width: 220 }} value={histStudentId}
                    onChange={(e) => {
                      setHistStudentId(e.target.value);
                      const s = histStudents.find(s => String(s.id) === e.target.value);
                      setHistStudentName(s?.name || "");
                    }}
                    disabled={histStudents.length === 0}>
                    <option value="">Select Student</option>
                    {histStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Exam (optional)</label>
                  <select style={{ ...S.inp, width: 240 }} value={histExamId}
                    onChange={(e) => setHistExamId(e.target.value)}>
                    <option value="">All Exams</option>
                    {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
                  </select>
                </div>

                <button onClick={histExamId ? loadHistory : loadAllResults} disabled={loading}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 600 }}>
                  <Search size={14} /> {loading ? "Loading..." : histExamId ? "Get Result" : "All Results"}
                </button>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8" }}>
                Select an exam for subject-wise breakdown, or leave blank for all-exam summary.
              </p>
            </div>

            {/* Subject-wise result */}
            {histResult && (
              <div style={{ ...S.card, marginBottom: 20 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                  Subject-wise Result {histStudentName && `— ${histStudentName}`}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Subject", "Marks Obtained", "Total Marks", "Grade"].map((h) => (<th key={h} style={S.th}>{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {(histResult.subjects || histResult)?.map?.((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "11px 16px", fontWeight: 600 }}>{r.subject || r.subjectName}</td>
                        <td style={{ padding: "11px 16px" }}>{r.marksObtained}</td>
                        <td style={{ padding: "11px 16px" }}>{r.totalMarks}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{r.grade || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {histResult.summary && (
                  <div style={{ padding: "14px 20px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0", display: "flex", gap: 28, flexWrap: "wrap" }}>
                    <span>Total: <strong>{histResult.summary.totalObtained} / {histResult.summary.totalMarks}</strong></span>
                    <span>Percentage: <strong style={{ color: "#059669" }}>{histResult.summary.percentage?.toFixed(1)}%</strong></span>
                    <span>Grade: <strong style={{ color: "#7c3aed" }}>{histResult.summary.grade}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* All-exam summary */}
            {allExamResults && (
              <div style={S.card}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                  All Exam Results — {histStudentName || `Student #${histStudentId}`}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["#", "Exam", "Total Marks", "Percentage", "Grade", "Status"].map((h) => (<th key={h} style={S.th}>{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {allExamResults.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No results found.</td></tr>
                    ) : (
                      allExamResults.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "11px 16px", color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                          <td style={{ padding: "11px 16px", fontWeight: 600 }}>{r.examName || r.exam?.examName || "—"}</td>
                          <td style={{ padding: "11px 16px" }}>{r.totalObtained} / {r.totalMarks}</td>
                          <td style={{ padding: "11px 16px", fontWeight: 700, color: (r.percentage >= 33) ? "#059669" : "#ef4444" }}>
                            {r.percentage?.toFixed(1)}%
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{r.grade}</span>
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: (r.percentage >= 33) ? "#dcfce7" : "#fee2e2", color: (r.percentage >= 33) ? "#059669" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>
                              {(r.percentage >= 33) ? "PASS" : "FAIL"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}