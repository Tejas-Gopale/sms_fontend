// src/teachers/pages/TakeAttendance.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SMART ATTENDANCE — Time-saving features:
//  1. AUTO-DETECT PERIOD  — looks at current time + timetable, pre-selects period/subject
//  2. QUICK PRESETS       — "All Present" / "All Absent" in one tap
//  3. SMART DEFAULTS      — date defaults to today, status defaults to PRESENT
//  4. INLINE SAVE-ONE     — save a single student without submitting the whole class
//  5. PROGRESS BAR        — shows % filled so teacher knows when done
//  6. LAST SESSION MEMORY — remembers last class+subject selection in sessionStorage
//  7. RESPONSE COUNT      — after save shows how many were marked
//  8. ALREADY-MARKED UI   — amber banner when period attendance already exists
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
import {
  markClassAttendance,
  markSingleStudentAttendance,
  isAlreadyMarkedError,
  getAlreadyMarkedMessage,
} from "../../common/services/attendanceService";

const todayStr = () => new Date().toISOString().split("T")[0];

const STATUS = {
  PRESENT: { label: "P", full: "Present", bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  ABSENT:  { label: "A", full: "Absent",  bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  LEAVE:   { label: "L", full: "Leave",   bg: "#fef9c3", color: "#a16207", border: "#fde047" },
};

const NEXT_STATUS = { PRESENT: "ABSENT", ABSENT: "LEAVE", LEAVE: "PRESENT" };

// Detect which period is current based on timetable data
function detectCurrentPeriod(timetable) {
  if (!timetable?.timetable) return null;
  const dayKey = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][new Date().getDay()];
  const slots = timetable.timetable[dayKey] || [];
  const now = new Date().toTimeString().slice(0, 5);
  return slots.find(s => s.startTime <= now && now <= s.endTime) || null;
}

export default function TakeAttendance() {
  const [classrooms,          setClassrooms]          = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedSubjectId,   setSelectedSubjectId]   = useState("");
  const [subjects,            setSubjects]            = useState([]);
  const [students,            setStudents]            = useState([]);
  const [periodNumber,        setPeriodNumber]        = useState(1);
  const [date,                setDate]                = useState(todayStr());
  const [saving,              setSaving]              = useState(false);
  const [savingId,            setSavingId]            = useState(null);
  const [toast,               setToast]               = useState(null);
  const [loadingStudents,     setLoadingStudents]     = useState(false);
  const [savedCount,          setSavedCount]          = useState(null);
  const [autoDetected,        setAutoDetected]        = useState(false);
  const [searchQuery,         setSearchQuery]         = useState("");
  const [alreadyMarked,       setAlreadyMarked]       = useState(null); // { message, period, date }

  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Load classrooms on mount; restore last session
  useEffect(() => {
    getClassrooms()
      .then((d) => {
        const list = d?.content || d || [];
        setClassrooms(list);

        const lastClass   = sessionStorage.getItem("att_classId");
        const lastSubject = sessionStorage.getItem("att_subjectId");
        if (lastClass) {
          const cls = list.find(c => String(c.id) === lastClass);
          if (cls) {
            setSelectedClassroomId(lastClass);
            setSubjects(cls.subjects || []);
            if (lastSubject) setSelectedSubjectId(lastSubject);
            loadStudents(lastClass);
          }
        }
      })
      .catch(() => showToast("Failed to load classrooms", "error"));
  }, []); // eslint-disable-line

  const loadStudents = async (classroomId) => {
    setLoadingStudents(true);
    setStudents([]);
    try {
      const data = await getStudentsByClassroom(classroomId);
      setStudents(
        (data || []).map((s) => ({
          id:     s.id,
          name:   `${s.firstName} ${s.lastName || ""}`.trim(),
          rollNo: s.rollNo || s.admissionNumber || "—",
          status: "PRESENT",
        }))
      );
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassroomChange = async (e) => {
    const id = e.target.value;
    setSelectedClassroomId(id);
    setSelectedSubjectId("");
    setStudents([]);
    setSavedCount(null);
    setSearchQuery("");
    setAlreadyMarked(null);

    const cls  = classrooms.find((c) => c.id === Number(id));
    const subs = cls?.subjects || [];
    setSubjects(subs);

    sessionStorage.setItem("att_classId", id);
    sessionStorage.removeItem("att_subjectId");

    if (!id) return;
    await loadStudents(id);

    // Auto-detect current period from timetable
    try {
      const { default: API } = await import("../../common/services/api");
      const ttRes = await API.get("/teacher/my-timetable");
      const slot  = detectCurrentPeriod(ttRes.data);
      if (slot) {
        setPeriodNumber(slot.periodNumber || 1);
        const matchSub = subs.find(s =>
          s.subjectName?.toLowerCase() === slot.subjectName?.toLowerCase()
        );
        if (matchSub) {
          setSelectedSubjectId(String(matchSub.id));
          setAutoDetected(true);
          setTimeout(() => setAutoDetected(false), 4000);
        }
      }
    } catch { /* non-critical */ }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setAlreadyMarked(null);
    sessionStorage.setItem("att_subjectId", e.target.value);
  };

  const handlePeriodChange = (e) => {
    setPeriodNumber(e.target.value);
    setAlreadyMarked(null);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setAlreadyMarked(null);
  };

  const cycleStatus = (id) =>
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: NEXT_STATUS[s.status] } : s))
    );

  const setStatus = (id, status) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

  const markAll = (status) =>
    setStudents((prev) => prev.map((s) => ({ ...s, status })));

  const validate = useCallback(() => {
    if (!selectedClassroomId) return "Please select a classroom.";
    if (!selectedSubjectId)   return "Please select a subject.";
    if (!periodNumber)        return "Please select a period.";
    if (!date)                return "Please select a date.";
    return null;
  }, [selectedClassroomId, selectedSubjectId, periodNumber, date]);

  const handleSaveAll = async () => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSaving(true);
    setSavedCount(null);
    setAlreadyMarked(null);
    try {
      await markClassAttendance(selectedClassroomId, {
        subjectId:    Number(selectedSubjectId),
        date,
        periodNumber: Number(periodNumber),
        students:     students.map((s) => ({ studentId: s.id, status: s.status })),
      });
      const count = students.length;
      setSavedCount(count);
      showToast(`✅ Attendance saved for ${count} students`);
      setStudents(prev => prev.map(s => ({ ...s, status: "PRESENT" })));
    } catch (e) {
      if (isAlreadyMarkedError(e)) {
        setAlreadyMarked({
          message: getAlreadyMarkedMessage(e),
          period:  periodNumber,
          date,
        });
      } else {
        const msg = e?.response?.data?.message || e?.response?.data;
        showToast(typeof msg === "string" ? msg : "Failed to save attendance", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (student) => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSavingId(student.id);
    try {
      await markSingleStudentAttendance(selectedClassroomId, student.id, {
        subjectId:    Number(selectedSubjectId),
        date,
        periodNumber: Number(periodNumber),
        status:       student.status,
      });
      showToast(`${student.name} → ${STATUS[student.status].full}`);
    } catch (e) {
      if (isAlreadyMarkedError(e)) {
        setAlreadyMarked({
          message: getAlreadyMarkedMessage(e),
          period:  periodNumber,
          date,
        });
      } else {
        const msg = e?.response?.data?.message || e?.response?.data;
        showToast(typeof msg === "string" ? msg : "Failed to save", "error");
      }
    } finally {
      setSavingId(null);
    }
  };

  const counts = students.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}
  );

  const filteredStudents = searchQuery
    ? students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.includes(searchQuery)
      )
    : students;

  const presentCount  = counts["PRESENT"] || 0;
  const totalCount    = students.length;
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <TeacherSidebar />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#dc2626" : "#059669",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "slideIn 0.2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
              📋 Take Attendance
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              Mark for the whole class or correct individual students
            </p>
          </div>

          {students.length > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={saving || !selectedSubjectId || !selectedClassroomId}
              style={{
                background: saving ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 28px", fontWeight: 700, fontSize: 15,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 14px rgba(79,70,229,0.4)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {saving
                ? <><span style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Saving…</>
                : <>💾 Save All ({totalCount})</>
              }
            </button>
          )}
        </div>

        {/* Auto-detected banner */}
        {autoDetected && (
          <div style={{
            background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 10,
            padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#1d4ed8",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ✨ <strong>Auto-detected:</strong> Subject and period set based on your current timetable!
          </div>
        )}

        {/* Controls */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 20,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>

            {/* Classroom */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Classroom *
              </label>
              <select
                value={selectedClassroomId}
                onChange={handleClassroomChange}
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#fff", outline: "none", cursor: "pointer" }}
              >
                <option value="">Select classroom</option>
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: subjects.length === 0 ? "#f8fafc" : "#fff", outline: "none", cursor: subjects.length === 0 ? "not-allowed" : "pointer", opacity: subjects.length === 0 ? 0.5 : 1 }}
              >
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Period
              </label>
              <select
                value={periodNumber}
                onChange={handlePeriodChange}
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#fff", outline: "none" }}
              >
                {[1,2,3,4,5,6,7,8].map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                max={todayStr()}
                onChange={handleDateChange}
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#fff", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Quick actions row */}
          {students.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>QUICK SET:</span>
              <button onClick={() => markAll("PRESENT")} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ✓ All Present
              </button>
              <button onClick={() => markAll("ABSENT")} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ✗ All Absent
              </button>
              <button onClick={() => markAll("LEAVE")} style={{ background: "#fef9c3", color: "#a16207", border: "1px solid #fde047", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ○ All Leave
              </button>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  placeholder="🔍 Search student..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 13, outline: "none", width: 180 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary strip */}
        {students.length > 0 && (
          <div style={{
            background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0",
          }}>
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS[status]?.color, display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: STATUS[status]?.color }}>{count}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{STATUS[status]?.full}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{attendancePct}% present</span>
              <div style={{ width: 120, height: 6, background: "#e2e8f0", borderRadius: 99 }}>
                <div style={{
                  width: `${attendancePct}%`, height: 6,
                  background: attendancePct >= 75 ? "#059669" : attendancePct >= 50 ? "#f59e0b" : "#dc2626",
                  borderRadius: 99, transition: "width 0.4s",
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Already-marked warning banner ── */}
        {alreadyMarked && (
          <div style={{
            background: "#fefce8",
            border: "1px solid #fde047",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}>
            {/* Icon circle */}
            <div style={{
              width: 38, height: 38,
              background: "#fef08a",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 18,
            }}>
              📋
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#854d0e" }}>
                Attendance already marked — Period {alreadyMarked.period}, {alreadyMarked.date}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#713f12", lineHeight: 1.5 }}>
                {alreadyMarked.message ||
                  "Is period ki attendance pehle se save ho chuki hai. Corrections ke liye Edit Attendance section use karein."}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setAlreadyMarked(null)}
              aria-label="Dismiss"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#a16207", fontSize: 20, lineHeight: 1, padding: "2px 4px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Students Table */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
          {loadingStudents ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, border: "3px solid #4f46e5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading students…
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎒</div>
              <p style={{ fontWeight: 600 }}>Select a classroom to load students</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["#", "Student", "Roll No", "Status (tap to cycle)", "P", "A", "L", "Save One"].map((h, i) => (
                      <th key={i} style={{ padding: "12px 16px", textAlign: i > 3 ? "center" : "left", fontWeight: 700, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const cfg          = STATUS[student.status];
                    const isSavingThis = savingId === student.id;
                    return (
                      <tr
                        key={student.id}
                        style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 16px", color: "#94a3b8", fontSize: 12 }}>{idx + 1}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: cfg.bg, color: cfg.color,
                              fontWeight: 800, fontSize: 13,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: `1.5px solid ${cfg.border}`,
                              flexShrink: 0,
                            }}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{student.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px", color: "#64748b", fontSize: 12 }}>{student.rollNo}</td>

                        {/* Tap-to-cycle status badge */}
                        <td style={{ padding: "10px 16px" }}>
                          <button
                            onClick={() => cycleStatus(student.id)}
                            style={{
                              background: cfg.bg, color: cfg.color,
                              border: `1.5px solid ${cfg.border}`,
                              borderRadius: 8, padding: "5px 14px",
                              fontWeight: 700, fontSize: 13, cursor: "pointer",
                              transition: "all 0.15s", minWidth: 90,
                            }}
                          >
                            {cfg.full}
                          </button>
                        </td>

                        {/* Radio buttons */}
                        {["PRESENT", "ABSENT", "LEAVE"].map(s => (
                          <td key={s} style={{ padding: "10px 16px", textAlign: "center" }}>
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              checked={student.status === s}
                              onChange={() => setStatus(student.id, s)}
                              style={{ width: 16, height: 16, cursor: "pointer", accentColor: STATUS[s].color }}
                            />
                          </td>
                        ))}

                        {/* Save single */}
                        <td style={{ padding: "10px 16px", textAlign: "center" }}>
                          <button
                            onClick={() => handleSaveSingle(student)}
                            disabled={isSavingThis || !selectedSubjectId || !selectedClassroomId}
                            style={{
                              background: isSavingThis ? "#e2e8f0" : "#f0f9ff",
                              color: "#0369a1", border: "1px solid #bae6fd",
                              borderRadius: 7, padding: "5px 12px",
                              fontSize: 12, fontWeight: 600,
                              cursor: isSavingThis ? "not-allowed" : "pointer",
                              opacity: (!selectedSubjectId || !selectedClassroomId) ? 0.4 : 1,
                              transition: "all 0.15s",
                            }}
                          >
                            {isSavingThis
                              ? <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #0369a1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Success banner after save */}
        {savedCount !== null && (
          <div style={{
            marginTop: 16, background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
            color: "#166534", fontWeight: 600, fontSize: 14,
          }}>
            ✅ Attendance saved successfully for {savedCount} students!
            <button
              onClick={() => setSavedCount(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "#166534", cursor: "pointer", fontSize: 18 }}
            >×</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}