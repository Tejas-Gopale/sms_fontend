// src/school_admin/pages/Exams.jsx
// Role: SCHOOL_ADMIN, PRINCIPAL
// Tabs: Exams | Schedule | Results | Rank List | Report Card | Bulk Upload
//
// ── NEW FEATURES ──────────────────────────────────────────────────────────────
//  1. "Create Exam with Schedule" modal:
//     • Fill exam details + add subject slots inline (no separate screen)
//     • Calls POST /exam/create-with-schedule
//  2. Excel bulk upload still works as before (POST /exam-schedule/upload-exam-schedule)
//  3. Existing "Create Exam only" (POST /exam/create) still available via Edit flow
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import {
  examService,
  scheduleService,
  resultService,
} from "../../common/services/examService";
import {
  Search, Calculator, FileUp, Calendar, LayoutDashboard,
  RefreshCcw, Plus, Trash2, Pencil, CheckCircle, Trophy,
  FileText, Upload, X, Save, ClipboardList,
} from "lucide-react";

// ── shared style helpers ──────────────────────────────────────────────────────
const S = {
  inp: {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
  },
  btn: (bg = "#4f46e5", fg = "#fff") => ({
    background: bg, color: fg, border: "none", borderRadius: 8,
    padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6,
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

const EXAM_TYPES = ["UNIT_TEST", "MID_TERM", "FINAL", "ANNUAL", "QUARTERLY", "HALF_YEARLY"];

const BLANK_EXAM = {
  examName: "", examType: "UNIT_TEST", examTypeString: "",
  standard: "", startDate: "", endDate: "", academicYear: "2026-2027",
};
const BLANK_SLOT_ROW = { subject: "", examDate: "", startTime: "09:00", endTime: "12:00", maxMarks: 100 };
const BLANK_SINGLE_SLOT = { subject: "", examDate: "", startTime: "09:00", endTime: "12:00" };

// ── tiny Modal ────────────────────────────────────────────────────────────────
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
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      fontSize: 14,
    }}>
      {msg}
    </div>
  );
}

const Empty = ({ text }) => (
  <tr>
    <td colSpan={20} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>{text}</td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminExams() {
  const [tab, setTab] = useState("exams");

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [classResults, setClassResults] = useState([]);
  const [rankList, setRankList] = useState(null);
  const [reportCard, setReportCard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  // 1) Edit-only exam modal (existing exam, no schedule rows)
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState(BLANK_EXAM);
  const [editingExamId, setEditingExamId] = useState(null);

  // 2) Create-with-schedule modal (NEW: exam + inline subject rows)
  const [showCreateWithSchedule, setShowCreateWithSchedule] = useState(false);
  const [cwsExam, setCwsExam] = useState(BLANK_EXAM);
  const [cwsSlots, setCwsSlots] = useState([{ ...BLANK_SLOT_ROW }]);

  // 3) Add single slot to existing exam
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState(BLANK_SINGLE_SLOT);

  const [editingResult, setEditingResult] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [rcStudentId, setRcStudentId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState("results");

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

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    wrap(async () => {
      try {
        const r = await examService.getAll();
        setExams(r.data || []);
      } catch {
        notify("Failed to load exams", false);
      }
    });
  }, []);

  const refreshExams = async () => {
    const r = await examService.getAll();
    setExams(r.data || []);
  };

  // ── EXAM EDIT MODAL ───────────────────────────────────────────────────────
  const openEdit = (ex) => {
    setExamForm({ ...ex });
    setEditingExamId(ex.id);
    setShowExamModal(true);
  };

  const submitExamEdit = () => wrap(async () => {
    const { examName, standard, startDate, endDate } = examForm;
    if (!examName || !standard || !startDate || !endDate)
      return notify("Please fill all required fields", false);
    try {
      await examService.update(editingExamId, examForm);
      notify("Exam updated ✅");
      setShowExamModal(false);
      await refreshExams();
    } catch (e) {
      notify(e.response?.data?.message || "Update failed", false);
    }
  });

  const deleteExam = (id) => wrap(async () => {
    if (!window.confirm("Delete this exam? All schedules and results will also be removed.")) return;
    try {
      await examService.remove(id);
      notify("Exam deleted");
      await refreshExams();
      if (String(selectedExamId) === String(id)) setSelectedExamId("");
    } catch {
      notify("Delete failed", false);
    }
  });

  // ── CREATE WITH SCHEDULE ──────────────────────────────────────────────────
  const openCreateWithSchedule = () => {
    setCwsExam({ ...BLANK_EXAM });
    setCwsSlots([{ ...BLANK_SLOT_ROW }]);
    setShowCreateWithSchedule(true);
  };

  const cwsAddRow = () => setCwsSlots((p) => [...p, { ...BLANK_SLOT_ROW }]);

  const cwsRemoveRow = (i) => setCwsSlots((p) => p.filter((_, idx) => idx !== i));

  const cwsUpdateSlot = (i, field, value) =>
    setCwsSlots((p) => p.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const submitCreateWithSchedule = () => wrap(async () => {
    const { examName, standard, startDate, endDate } = cwsExam;
    if (!examName || !standard || !startDate || !endDate)
      return notify("Fill all exam details (name, class, dates)", false);

    const incompleteSlot = cwsSlots.some((s) => !s.subject || !s.examDate);
    if (incompleteSlot)
      return notify("Each subject row needs a subject name and date", false);

    const payload = {
      ...cwsExam,
      schedule: cwsSlots.map((s) => ({
        subject: s.subject,
        examDate: s.examDate,
        startTime: s.startTime,
        endTime: s.endTime,
        maxMarks: Number(s.maxMarks) || 100,
      })),
    };

    try {
      await examService.createWithSchedule(payload);
      notify(`Exam created with ${cwsSlots.length} subject(s) ✅`);
      setShowCreateWithSchedule(false);
      await refreshExams();
    } catch (e) {
      notify(e.response?.data?.message || "Create failed", false);
    }
  });

  // ── SCHEDULE ──────────────────────────────────────────────────────────────
  const loadSchedule = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    try {
      const r = await scheduleService.getByExam(selectedExamId);
      setSchedule(r.data || []);
    } catch {
      notify("Failed to load schedule", false);
    }
  });

  const addSlot = () => wrap(async () => {
    if (!slotForm.subject || !slotForm.examDate)
      return notify("Fill subject & date", false);
    try {
      await scheduleService.add(selectedExamId, slotForm);
      notify("Slot added ✅");
      setShowSlotModal(false);
      setSlotForm(BLANK_SINGLE_SLOT);
      await loadSchedule();
    } catch {
      notify("Failed to add slot", false);
    }
  });

  const deleteSlot = (id) => wrap(async () => {
    if (!window.confirm("Remove this schedule slot?")) return;
    try {
      await scheduleService.remove(id);
      notify("Slot removed");
      setSchedule((p) => p.filter((s) => s.id !== id));
    } catch {
      notify("Delete failed", false);
    }
  });

  // ── RESULTS ───────────────────────────────────────────────────────────────
  const loadClassResults = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    try {
      const r = await resultService.getByClass(selectedExamId);
      setClassResults(r.data || []);
    } catch {
      notify("Failed to load results", false);
    }
  });

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
      await loadClassResults();
    } catch (e) {
      notify(e.response?.data?.message || "Recalculation failed", false);
    } finally {
      setRecalculating(false);
    }
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
    } catch {
      notify("Update failed", false);
    }
  });

  // ── RANK LIST ─────────────────────────────────────────────────────────────
  const loadRankList = () => wrap(async () => {
    if (!selectedExamId) return notify("Select an exam first", false);
    try {
      const r = await resultService.getByClass(selectedExamId);
      const data = r.data || [];
      const sorted = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
      sorted.forEach((s, i) => { s._rank = i + 1; });
      const pass = sorted.filter((s) => (s.percentage || 0) >= 33).length;
      setRankList({
        students: sorted,
        classAvg: sorted.length ? sorted.reduce((acc, s) => acc + (s.percentage || 0), 0) / sorted.length : 0,
        highest: sorted[0]?.percentage || 0,
        lowest: sorted[sorted.length - 1]?.percentage || 0,
        pass,
        fail: sorted.length - pass,
        total: sorted.length,
      });
    } catch {
      notify("Failed to load rank list", false);
    }
  });

  // ── REPORT CARD ───────────────────────────────────────────────────────────
  const loadReportCard = () => wrap(async () => {
    if (!selectedExamId || !rcStudentId)
      return notify("Select exam & enter student ID", false);
    try {
      const r = await resultService.getByStudent(rcStudentId, selectedExamId);
      setReportCard(r.data);
    } catch {
      notify("No report card found for this student", false);
    }
  });

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  const handleUpload = () => wrap(async () => {
    if (!uploadFile) return notify("Select a file first", false);
    if (uploadType === "results" && !selectedExamId)
      return notify("Select an exam first", false);
    try {
      if (uploadType === "results") {
        await resultService.uploadExcel(selectedExamId, uploadFile);
      } else {
        await scheduleService.uploadExcel(uploadFile);
      }
      notify("File uploaded successfully ✅");
      setUploadFile(null);
      if (uploadType === "schedule") await refreshExams();
    } catch (e) {
      notify(e.response?.data?.message || "Upload failed", false);
    }
  });

  // ── TABS ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "exams",      label: "Exams",       icon: <FileText size={15} /> },
    { id: "schedule",   label: "Schedule",    icon: <Calendar size={15} /> },
    { id: "results",    label: "Results",     icon: <LayoutDashboard size={15} /> },
    { id: "rankList",   label: "Rank List",   icon: <Trophy size={15} /> },
    { id: "reportCard", label: "Report Card", icon: <ClipboardList size={15} /> },
    { id: "upload",     label: "Bulk Upload", icon: <Upload size={15} /> },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
      <SchoolAdminSidebar />

      {toast && <Toast {...toast} />}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Exam Management</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            Create exams, manage schedules, enter &amp; review results
          </p>
        </div>

        {/* Global exam selector */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}
            style={{ ...S.inp, maxWidth: 320 }}>
            <option value="">— Select Exam —</option>
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
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...S.btn(tab === t.id ? "#4f46e5" : "#fff", tab === t.id ? "#fff" : "#475569"),
                boxShadow: tab === t.id ? "0 2px 8px rgba(79,70,229,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════ EXAMS TAB ═══════════ */}
        {tab === "exams" && (
          <div style={S.card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>All Exams</h2>
              {/* ── TWO create buttons ── */}
              <div style={{ display: "flex", gap: 10 }}>
                {/* NEW: Create exam + schedule in one go */}
                <button onClick={openCreateWithSchedule} style={{ ...S.btn("#059669") }}>
                  <Plus size={15} /> Create Exam with Schedule
                </button>
              </div>
            </div>

            {/* ── Info banner explaining both methods ── */}
            <div style={{ margin: "12px 20px", background: "#eff6ff", borderRadius: 10, padding: "12px 16px", border: "1px solid #bfdbfe", fontSize: 13, color: "#1d4ed8" }}>
              <strong>Tip:</strong> Use <em>"Create Exam with Schedule"</em> to fill exam details + add all subject slots in one form.
              You can also use <em>Bulk Upload</em> tab to create everything via Excel.
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Exam Name", "Type", "Standard", "Start", "End", "Acad. Year", "Actions"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 && <Empty text='No exams yet. Click "Create Exam with Schedule" to get started.' />}
                {exams.map((ex) => (
                  <tr key={ex.id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>{ex.examName}</td>
                    <td style={S.td}>{ex.examTypeString || ex.examType}</td>
                    <td style={S.td}>
                      <span style={{ background: "#ede9fe", color: "#6d28d9", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                        {ex.standard}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: "#64748b" }}>{ex.startDate}</td>
                    <td style={{ ...S.td, color: "#64748b" }}>{ex.endDate}</td>
                    <td style={{ ...S.td, color: "#64748b" }}>{ex.academicYear}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(ex)}
                          style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => deleteExam(ex.id)}
                          style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ SCHEDULE TAB ═══════════ */}
        {tab === "schedule" && (
          <div style={S.card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Exam Schedule</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={loadSchedule} style={S.btn("#475569")}>
                  <RefreshCcw size={14} /> {loading ? "Loading..." : "Load"}
                </button>
                <button onClick={() => { setSlotForm(BLANK_SINGLE_SLOT); setShowSlotModal(true); }}
                  disabled={!selectedExamId} style={S.btn()}>
                  <Plus size={14} /> Add Slot
                </button>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Subject", "Date", "Start Time", "End Time", "Max Marks", ""].map((h, i) => (
                    <th key={i} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.length === 0
                  ? <Empty text="Select an exam and click Load to view the schedule." />
                  : schedule.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{s.subject || s.subjectName}</td>
                      <td style={{ ...S.td, color: "#475569" }}>{s.examDate}</td>
                      <td style={{ ...S.td, color: "#475569" }}>{s.startTime}</td>
                      <td style={{ ...S.td, color: "#475569" }}>{s.endTime}</td>
                      <td style={{ ...S.td, color: "#475569" }}>{s.maxMarks ?? "—"}</td>
                      <td style={S.td}>
                        <button onClick={() => deleteSlot(s.id)}
                          style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ RESULTS TAB ═══════════ */}
        {tab === "results" && (
          <div style={S.card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Class Results</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={loadClassResults} style={S.btn("#475569")}>
                  <RefreshCcw size={14} /> {loading ? "Loading..." : "Load"}
                </button>
                <button onClick={calculateAll} style={S.btn("#059669")}>
                  <Calculator size={14} /> Calculate All
                </button>
                <button
                  onClick={recalculateAllExisting}
                  disabled={recalculating}
                  title="One-time fix: build summaries for all existing result rows"
                  style={{ ...S.btn("#7c3aed"), opacity: recalculating ? 0.7 : 1 }}>
                  <RefreshCcw size={14} /> {recalculating ? "Recalculating..." : "Fix Existing Data"}
                </button>
              </div>
            </div>

            {editingResult && (
              <div style={{ background: "#eff6ff", padding: "12px 20px", borderBottom: "1px solid #dbeafe", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, color: "#1e40af", fontSize: 13 }}>Editing Result ID: {editingResult.id}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Marks Obtained</label>
                  <input type="number" value={editingResult.marksObtained}
                    onChange={(e) => setEditingResult((p) => ({ ...p, marksObtained: e.target.value }))}
                    style={{ ...S.inp, width: 100 }} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Grade</label>
                  <input type="text" value={editingResult.grade}
                    onChange={(e) => setEditingResult((p) => ({ ...p, grade: e.target.value }))}
                    style={{ ...S.inp, width: 70 }} />
                </div>
                <button onClick={saveResultEdit} style={S.btn()}><Save size={13} /> Save</button>
                <button onClick={() => setEditingResult(null)} style={S.btn("#94a3b8")}>Cancel</button>
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Student", "Total Marks", "Percentage", "Grade", "Status", "Actions"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classResults.length === 0
                  ? <Empty text="Select an exam and click Load to view results." />
                  : classResults.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={{ ...S.td, color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>
                        {r.student?.firstName || r.student?.name || r.studentName || "—"}&nbsp;
                        {r.student?.lastName || ""}
                      </td>
                      <td style={S.td}>{r.totalObtained ?? r.marksObtained} / {r.totalMarks}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: pc(r.percentage) }}>
                        {r.percentage != null ? `${r.percentage.toFixed(1)}%` : "—"}
                      </td>
                      <td style={S.td}>
                        <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                          {r.grade || "—"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ background: (r.percentage >= 33) ? "#dcfce7" : "#fee2e2", color: (r.percentage >= 33) ? "#059669" : "#dc2626", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>
                          {(r.percentage >= 33) ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <button onClick={() => setEditingResult({ id: r.id, marksObtained: r.totalObtained ?? r.marksObtained, totalMarks: r.totalMarks, grade: r.grade })}
                          style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                          <Pencil size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ RANK LIST TAB ═══════════ */}
        {tab === "rankList" && (
          <div style={S.card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Class Rank List</h2>
              <button onClick={loadRankList} style={S.btn()}>
                <Trophy size={14} /> {loading ? "Loading..." : "Generate Rank List"}
              </button>
            </div>

            {!rankList && (
              <p style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                Select an exam above and click "Generate Rank List".
              </p>
            )}

            {rankList && (
              <>
                <div style={{ display: "flex", gap: 24, padding: "14px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                  {[
                    ["Class Avg", `${rankList.classAvg.toFixed(1)}%`],
                    ["Highest", `${rankList.highest.toFixed(1)}%`],
                    ["Lowest", `${rankList.lowest.toFixed(1)}%`],
                    ["Pass", rankList.pass],
                    ["Fail", rankList.fail],
                    ["Total", rankList.total],
                  ].map(([l, v]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{l}</div>
                    </div>
                  ))}
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Rank", "Student", "Total Marks", "Percentage", "Grade"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankList.students.map((r) => (
                      <tr key={r.id || r._rank} style={{ background: r._rank <= 3 ? "#fffbeb" : "transparent" }}>
                        <td style={{ ...S.td, fontWeight: 800, fontSize: 16 }}>
                          {r._rank === 1 ? "🥇" : r._rank === 2 ? "🥈" : r._rank === 3 ? "🥉" : `#${r._rank}`}
                        </td>
                        <td style={{ ...S.td, fontWeight: 600 }}>
                          {r.student?.firstName || r.studentName || "—"}&nbsp;{r.student?.lastName || ""}
                        </td>
                        <td style={S.td}>{r.totalObtained} / {r.totalMarks}</td>
                        <td style={{ ...S.td, fontWeight: 700, color: pc(r.percentage) }}>
                          {r.percentage?.toFixed(1)}%
                        </td>
                        <td style={S.td}>
                          <span style={{ background: gc(r.grade) + "25", color: gc(r.grade), borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* ═══════════ REPORT CARD TAB ═══════════ */}
        {tab === "reportCard" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Student ID</label>
                <input type="number" placeholder="e.g. 101" value={rcStudentId}
                  onChange={(e) => setRcStudentId(e.target.value)}
                  style={{ ...S.inp, width: 160 }} />
              </div>
              <button onClick={loadReportCard} disabled={loading} style={S.btn()}>
                <Search size={14} /> {loading ? "Loading..." : "Get Report Card"}
              </button>
            </div>

            {reportCard && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 32, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
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
                          {s.remarks || (s.percentage >= 33 ? "Pass" : "Fail")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 24px", minWidth: 260 }}>
                    {[
                      ["Total Obtained", `${reportCard.totalObtained} / ${reportCard.totalMarks}`],
                      ["Percentage", `${reportCard.percentage?.toFixed(2) ?? "—"}%`],
                      ["Overall Grade", reportCard.overallGrade || reportCard.grade],
                      ["Class Rank", reportCard.rank ? `#${reportCard.rank} of ${reportCard.totalStudents}` : "—"],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}>{l}</span>
                        <span style={{ fontWeight: 800 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <button onClick={() => window.print()} style={S.btn()}>🖨️ Print</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ BULK UPLOAD TAB ═══════════ */}
        {tab === "upload" && (
          <div>
            {/* Info card */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 20px", marginBottom: 20, fontSize: 13, color: "#166534" }}>
              <strong>📋 Excel Format for Exam + Schedule Upload:</strong>
              <br />
              Required columns: <code>examName</code>, <code>examType</code>, <code>standard</code>, <code>subject</code>, <code>examDate</code> (YYYY-MM-DD), <code>startTime</code> (HH:mm), <code>endTime</code> (HH:mm)
              <br />
              Optional: <code>examTypeString</code>, <code>academicYear</code>, <code>maxMarks</code>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                {
                  type: "results",
                  title: "Bulk Results Upload",
                  desc: "Upload student marks via Excel (.xlsx). Required columns: studentId, subject, marksObtained, totalMarks",
                  color: "#4f46e5",
                  icon: <FileUp size={40} color="#4f46e5" />,
                  note: "Exam must be selected in the exam selector above.",
                },
                {
                  type: "schedule",
                  title: "Bulk Exam + Schedule Upload",
                  desc: "Create exam + schedule via Excel. Each row = one subject slot. Groups by examName + standard automatically.",
                  color: "#059669",
                  icon: <Calendar size={40} color="#059669" />,
                  note: "No need to pre-create the exam — the Excel does it all.",
                },
              ].map((u) => (
                <div key={u.type} style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", textAlign: "center" }}>
                  <div style={{ marginBottom: 12 }}>{u.icon}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{u.title}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{u.desc}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20, fontStyle: "italic" }}>{u.note}</p>
                  <input type="file" accept=".xlsx,.xls"
                    onChange={(e) => { setUploadFile(e.target.files[0]); setUploadType(u.type); }}
                    style={{ marginBottom: 16, fontSize: 13 }} />
                  <button onClick={handleUpload}
                    disabled={loading || uploadType !== u.type || !uploadFile}
                    style={{ ...S.btn(u.color), width: "100%", justifyContent: "center", opacity: (loading && uploadType === u.type) ? 0.7 : 1 }}>
                    <Upload size={15} />
                    {loading && uploadType === u.type ? "Uploading..." : `Upload ${u.type === "results" ? "Results" : "Schedule"}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1 — EDIT EXAM (no schedule)
      ══════════════════════════════════════════════════════════════════════ */}
      {showExamModal && (
        <Modal title="Edit Exam" onClose={() => setShowExamModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Field label="Exam Name *">
              <input style={S.inp} value={examForm.examName}
                onChange={(e) => setExamForm((p) => ({ ...p, examName: e.target.value }))}
                placeholder="e.g. Unit Test 1" />
            </Field>
            <Field label="Exam Type *" half>
              <select style={S.inp} value={examForm.examType}
                onChange={(e) => setExamForm((p) => ({ ...p, examType: e.target.value }))}>
                {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Term Label" half>
              <input style={S.inp} value={examForm.examTypeString}
                onChange={(e) => setExamForm((p) => ({ ...p, examTypeString: e.target.value }))}
                placeholder="e.g. Term 1" />
            </Field>
            <Field label="Standard / Class *" half>
              <input style={S.inp} value={examForm.standard}
                onChange={(e) => setExamForm((p) => ({ ...p, standard: e.target.value }))}
                placeholder="e.g. 10" />
            </Field>
            <Field label="Academic Year *" half>
              <input style={S.inp} value={examForm.academicYear}
                onChange={(e) => setExamForm((p) => ({ ...p, academicYear: e.target.value }))}
                placeholder="2026-2027" />
            </Field>
            <Field label="Start Date *" half>
              <input type="date" style={S.inp} value={examForm.startDate}
                onChange={(e) => setExamForm((p) => ({ ...p, startDate: e.target.value }))} />
            </Field>
            <Field label="End Date *" half>
              <input type="date" style={S.inp} value={examForm.endDate}
                onChange={(e) => setExamForm((p) => ({ ...p, endDate: e.target.value }))} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={submitExamEdit} disabled={loading}
              style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
              <CheckCircle size={14} /> {loading ? "Saving..." : "Update Exam"}
            </button>
            <button onClick={() => setShowExamModal(false)} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2 — CREATE EXAM WITH SCHEDULE (NEW)
          Wide modal: exam details on top, subject rows table below
      ══════════════════════════════════════════════════════════════════════ */}
      {showCreateWithSchedule && (
        <Modal title="Create Exam with Schedule" onClose={() => setShowCreateWithSchedule(false)} wide>

          {/* ── Exam Details ── */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 18px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, color: "#1e293b", fontSize: 14 }}>📋 Exam Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px" }}>
              <Field label="Exam Name *">
                <input style={S.inp} value={cwsExam.examName}
                  onChange={(e) => setCwsExam((p) => ({ ...p, examName: e.target.value }))}
                  placeholder="e.g. Unit Test 1" />
              </Field>
              <Field label="Exam Type" half>
                <select style={S.inp} value={cwsExam.examType}
                  onChange={(e) => setCwsExam((p) => ({ ...p, examType: e.target.value }))}>
                  {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Term Label" half>
                <input style={S.inp} value={cwsExam.examTypeString}
                  onChange={(e) => setCwsExam((p) => ({ ...p, examTypeString: e.target.value }))}
                  placeholder="e.g. Term 1" />
              </Field>
              <Field label="Standard / Class *" half>
                <input style={S.inp} value={cwsExam.standard}
                  onChange={(e) => setCwsExam((p) => ({ ...p, standard: e.target.value }))}
                  placeholder="e.g. 10" />
              </Field>
              <Field label="Academic Year" half>
                <input style={S.inp} value={cwsExam.academicYear}
                  onChange={(e) => setCwsExam((p) => ({ ...p, academicYear: e.target.value }))}
                  placeholder="2026-2027" />
              </Field>
              <div />
              <Field label="Start Date *" half>
                <input type="date" style={S.inp} value={cwsExam.startDate}
                  onChange={(e) => setCwsExam((p) => ({ ...p, startDate: e.target.value }))} />
              </Field>
              <Field label="End Date *" half>
                <input type="date" style={S.inp} value={cwsExam.endDate}
                  onChange={(e) => setCwsExam((p) => ({ ...p, endDate: e.target.value }))} />
              </Field>
            </div>
          </div>

          {/* ── Subject / Schedule Rows ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                📅 Subject Schedule ({cwsSlots.length} subject{cwsSlots.length !== 1 ? "s" : ""})
              </p>
              <button onClick={cwsAddRow} style={{ ...S.btn("#4f46e5"), padding: "7px 14px", fontSize: 13 }}>
                <Plus size={13} /> Add Subject
              </button>
            </div>

            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.8fr 32px", gap: 8, marginBottom: 4 }}>
              {["Subject *", "Date *", "Start", "End", "Max Marks", ""].map((h) => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
              ))}
            </div>

            {/* Subject rows */}
            {cwsSlots.map((slot, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.8fr 32px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  style={S.inp}
                  value={slot.subject}
                  onChange={(e) => cwsUpdateSlot(i, "subject", e.target.value)}
                  placeholder="Mathematics"
                />
                <input
                  type="date"
                  style={S.inp}
                  value={slot.examDate}
                  onChange={(e) => cwsUpdateSlot(i, "examDate", e.target.value)}
                />
                <input
                  type="time"
                  style={S.inp}
                  value={slot.startTime}
                  onChange={(e) => cwsUpdateSlot(i, "startTime", e.target.value)}
                />
                <input
                  type="time"
                  style={S.inp}
                  value={slot.endTime}
                  onChange={(e) => cwsUpdateSlot(i, "endTime", e.target.value)}
                />
                <input
                  type="number"
                  style={S.inp}
                  value={slot.maxMarks}
                  min={1}
                  onChange={(e) => cwsUpdateSlot(i, "maxMarks", e.target.value)}
                />
                <button
                  onClick={() => cwsRemoveRow(i)}
                  disabled={cwsSlots.length === 1}
                  style={{ background: cwsSlots.length === 1 ? "#f1f5f9" : "#fef2f2", color: cwsSlots.length === 1 ? "#cbd5e1" : "#dc2626", border: "none", borderRadius: 6, width: 32, height: 32, cursor: cwsSlots.length === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* ── Footer buttons ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 8, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <button onClick={submitCreateWithSchedule} disabled={loading}
              style={{ ...S.btn("#059669"), flex: 1, justifyContent: "center" }}>
              <CheckCircle size={14} />
              {loading ? "Creating..." : `Create Exam with ${cwsSlots.length} Subject${cwsSlots.length !== 1 ? "s" : ""}`}
            </button>
            <button onClick={() => setShowCreateWithSchedule(false)}
              style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3 — ADD SINGLE SLOT TO EXISTING EXAM
      ══════════════════════════════════════════════════════════════════════ */}
      {showSlotModal && (
        <Modal title={`Add Slot to: ${selectedExam?.examName || "Exam"}`} onClose={() => setShowSlotModal(false)}>
          <Field label="Subject *">
            <input style={S.inp} value={slotForm.subject}
              onChange={(e) => setSlotForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. Mathematics" />
          </Field>
          <Field label="Exam Date *">
            <input type="date" style={S.inp} value={slotForm.examDate}
              onChange={(e) => setSlotForm((p) => ({ ...p, examDate: e.target.value }))} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Time" half>
              <input type="time" style={S.inp} value={slotForm.startTime}
                onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))} />
            </Field>
            <Field label="End Time" half>
              <input type="time" style={S.inp} value={slotForm.endTime}
                onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={addSlot} disabled={loading} style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
              <Plus size={14} /> {loading ? "Adding..." : "Add Slot"}
            </button>
            <button onClick={() => setShowSlotModal(false)} style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
