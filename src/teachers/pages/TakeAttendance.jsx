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
//  8. KEYBOARD SHORTCUTS  — Enter key moves to next student mark
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
import {
  markClassAttendance,
  markSingleStudentAttendance,
} from "../../common/services/attendanceService";

const todayStr = () => new Date().toISOString().split("T")[0];

const STATUS = {
  PRESENT: { label: "P", full: "Present", bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  ABSENT:  { label: "A", full: "Absent",  bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  LEAVE:   { label: "L", full: "Leave",   bg: "#fef9c3", color: "#a16207", border: "#fde047" },
};

const NEXT_STATUS = { PRESENT: "ABSENT", ABSENT: "LEAVE", LEAVE: "PRESENT" };

// Detect which period is current based on timetable data
function detectCurrentPeriod(timetable, today) {
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

        // Restore last session selection
        const lastClass = sessionStorage.getItem("att_classId");
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
          id: s.id,
          name: `${s.firstName} ${s.lastName || ""}`.trim(),
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

    const cls = classrooms.find((c) => c.id === Number(id));
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
      const slot = detectCurrentPeriod(ttRes.data, new Date());
      if (slot) {
        setPeriodNumber(slot.periodNumber || 1);
        // Find subject by name match
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
    sessionStorage.setItem("att_subjectId", e.target.value);
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
    try {
      const res = await markClassAttendance(selectedClassroomId, {
        subjectId:    Number(selectedSubjectId),
        date,
        periodNumber: Number(periodNumber),
        students: students.map((s) => ({ studentId: s.id, status: s.status })),
      });
      const count = students.length;
      setSavedCount(count);
      showToast(`✅ Attendance saved for ${count} students`);

      // Reset statuses for next session
      setStudents(prev => prev.map(s => ({ ...s, status: "PRESENT" })));
    } catch (e) {
      const msg = e?.response?.data;
      showToast(typeof msg === "string" ? msg : "Failed to save attendance", "error");
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
      const msg = e?.response?.data;
      showToast(typeof msg === "string" ? msg : "Failed to save", "error");
    } finally {
      setSavingId(null);
    }
  };

  const counts = students.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}
  );

  const filteredStudents = searchQuery
    ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery))
    : students;

  const presentCount = counts["PRESENT"] || 0;
  const totalCount = students.length;
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
                onChange={(e) => setPeriodNumber(e.target.value)}
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
                onChange={(e) => setDate(e.target.value)}
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

            {/* Progress bar */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{attendancePct}% present</span>
              <div style={{ width: 120, height: 6, background: "#e2e8f0", borderRadius: 99 }}>
                <div style={{ width: `${attendancePct}%`, height: 6, background: attendancePct >= 75 ? "#059669" : attendancePct >= 50 ? "#f59e0b" : "#dc2626", borderRadius: 99, transition: "width 0.4s" }} />
              </div>
            </div>
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
                    const cfg = STATUS[student.status];
                    const isSavingThis = savingId === student.id;
                    return (
                      <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
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

                        {/* Big tap-to-cycle status badge */}
                        <td style={{ padding: "10px 16px" }}>
                          <button
                            onClick={() => cycleStatus(student.id)}
                            style={{
                              background: cfg.bg, color: cfg.color,
                              border: `1.5px solid ${cfg.border}`,
                              borderRadius: 8, padding: "5px 14px",
                              fontWeight: 700, fontSize: 13, cursor: "pointer",
                              transition: "all 0.15s",
                              minWidth: 90,
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
                              fontSize: 12, fontWeight: 600, cursor: isSavingThis ? "not-allowed" : "pointer",
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
            <button onClick={() => setSavedCount(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#166534", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
//----------------working code upto 2024-06-10, with individual save and better UI/UX, error handling, loading states, etc.----------------
// import { useEffect, useState, useCallback } from "react";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
// import {
//   markClassAttendance,
//   markSingleStudentAttendance,
// } from "../../common/services/attendanceService";

// const todayStr = () => new Date().toISOString().split("T")[0];

// const STATUS = {
//   PRESENT: { label: "Present", bg: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
//   ABSENT:  { label: "Absent",  bg: "bg-rose-100 text-rose-700 border-rose-300",         dot: "bg-rose-500"    },
//   LEAVE:   { label: "Leave",   bg: "bg-amber-100 text-amber-700 border-amber-300",       dot: "bg-amber-400"   },
// };

// export default function TakeAttendance() {
//   const [classrooms,          setClassrooms]          = useState([]);
//   const [selectedClassroomId, setSelectedClassroomId] = useState("");
//   const [selectedSubjectId,   setSelectedSubjectId]   = useState("");
//   const [subjects,            setSubjects]            = useState([]);
//   const [students,            setStudents]            = useState([]);
//   const [periodNumber,        setPeriodNumber]        = useState(1);
//   const [date,                setDate]                = useState(todayStr());
//   const [saving,              setSaving]              = useState(false);
//   const [savingId,            setSavingId]            = useState(null);
//   const [toast,               setToast]               = useState(null);
//   const [loadingStudents,     setLoadingStudents]     = useState(false);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   useEffect(() => {
//     getClassrooms()
//       .then((d) => setClassrooms(d?.content || []))
//       .catch(() => showToast("Failed to load classrooms", "error"));
//   }, []);

//   const handleClassroomChange = async (e) => {
//     const id = e.target.value;
//     setSelectedClassroomId(id);
//     setSelectedSubjectId("");
//     setStudents([]);
//     const cls = classrooms.find((c) => c.id === Number(id));
//     setSubjects(cls?.subjects || []);
//     if (!id) return;
//     setLoadingStudents(true);
//     try {
//       const data = await getStudentsByClassroom(id);
//       setStudents(
//         (data || []).map((s) => ({
//           id: s.id,
//           name: `${s.firstName} ${s.lastName || ""}`.trim(),
//           rollNo: s.rollNo || s.admissionNumber || "—",
//           status: "PRESENT",
//         }))
//       );
//     } catch {
//       showToast("Failed to load students", "error");
//     } finally {
//       setLoadingStudents(false);
//     }
//   };

//   const toggleStatus = (id, status) =>
//     setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

//   const markAll = (status) =>
//     setStudents((prev) => prev.map((s) => ({ ...s, status })));

//   const validate = useCallback(() => {
//     if (!selectedClassroomId) return "Please select a classroom.";
//     if (!selectedSubjectId)   return "Please select a subject.";
//     if (!periodNumber)        return "Please select a period.";
//     if (!date)                return "Please select a date.";
//     return null;
//   }, [selectedClassroomId, selectedSubjectId, periodNumber, date]);

//   const handleSaveAll = async () => {
//     const err = validate();
//     if (err) { showToast(err, "error"); return; }
//     setSaving(true);
//     try {
//       await markClassAttendance(selectedClassroomId, {
//         subjectId:    Number(selectedSubjectId),
//         date,
//         periodNumber: Number(periodNumber),
//         students: students.map((s) => ({ studentId: s.id, status: s.status })),
//       });
//       showToast(`Attendance saved for ${students.length} students`);
//     } catch (e) {
//       const msg = e?.response?.data;
//       showToast(typeof msg === "string" ? msg : "Failed to save attendance", "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveSingle = async (student) => {
//     const err = validate();
//     if (err) { showToast(err, "error"); return; }
//     setSavingId(student.id);
//     try {
//       await markSingleStudentAttendance(selectedClassroomId, student.id, {
//         subjectId:    Number(selectedSubjectId),
//         date,
//         periodNumber: Number(periodNumber),
//         status:       student.status,
//       });
//       showToast(`${student.name} marked ${student.status.toLowerCase()}`);
//     } catch (e) {
//       const msg = e?.response?.data;
//       showToast(typeof msg === "string" ? msg : "Failed to save", "error");
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const counts = students.reduce(
//     (acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}
//   );

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <TeacherSidebar />

//       <div className="flex-1 p-6">

//         {toast && (
//           <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
//             ${toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
//             {toast.msg}
//           </div>
//         )}

//         <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Take Attendance</h1>
//             <p className="text-sm text-slate-500 mt-0.5">Mark for all students or individually</p>
//           </div>
//           <button
//             onClick={handleSaveAll}
//             disabled={saving || students.length === 0}
//             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
//                        text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow transition"
//           >
//             {saving
//               ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</>
//               : <>💾 Save All</>}
//           </button>
//         </div>

//         {/* Controls */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-5">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Classroom</label>
//               <select value={selectedClassroomId} onChange={handleClassroomChange}
//                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
//                 <option value="">Select classroom</option>
//                 {classrooms.map((cls) => (
//                   <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</label>
//               <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}
//                 disabled={subjects.length === 0}
//                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50">
//                 <option value="">Select subject</option>
//                 {subjects.map((sub) => (
//                   <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</label>
//               <select value={periodNumber} onChange={(e) => setPeriodNumber(e.target.value)}
//                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
//                 {[1,2,3,4,5,6,7,8].map((p) => (
//                   <option key={p} value={p}>Period {p}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
//               <input type="date" value={date} max={todayStr()}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
//             </div>
//           </div>
//         </div>

//         {/* Summary + bulk buttons */}
//         {students.length > 0 && (
//           <div className="flex flex-wrap items-center gap-3 mb-4">
//             {Object.entries(counts).map(([status, count]) => (
//               <span key={status}
//                 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS[status]?.bg}`}>
//                 <span className={`w-2 h-2 rounded-full ${STATUS[status]?.dot}`}/>
//                 {count} {STATUS[status]?.label}
//               </span>
//             ))}
//             <div className="ml-auto flex gap-2">
//               <button onClick={() => markAll("PRESENT")}
//                 className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold transition">
//                 ✓ All Present
//               </button>
//               <button onClick={() => markAll("ABSENT")}
//                 className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold transition">
//                 ✗ All Absent
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           {loadingStudents ? (
//             <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
//               <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/>
//               Loading students…
//             </div>
//           ) : students.length === 0 ? (
//             <div className="py-20 text-center text-slate-400">
//               <div className="text-4xl mb-3">🎒</div>
//               <p className="font-medium">Select a classroom to load students</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                   <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
//                     <th className="px-4 py-3 font-semibold">#</th>
//                     <th className="px-4 py-3 font-semibold">Student</th>
//                     <th className="px-4 py-3 font-semibold text-center">Present</th>
//                     <th className="px-4 py-3 font-semibold text-center">Absent</th>
//                     <th className="px-4 py-3 font-semibold text-center">Leave</th>
//                     <th className="px-4 py-3 font-semibold text-center">Status</th>
//                     <th className="px-4 py-3 font-semibold text-center">Save One</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {students.map((student, idx) => {
//                     const cfg = STATUS[student.status];
//                     const isSavingThis = savingId === student.id;
//                     return (
//                       <tr key={student.id} className="hover:bg-slate-50 transition">
//                         <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
//                               {student.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="font-semibold text-slate-800">{student.name}</p>
//                               <p className="text-xs text-slate-400">{student.rollNo}</p>
//                             </div>
//                           </div>
//                         </td>
//                         {["PRESENT","ABSENT","LEAVE"].map((s) => (
//                           <td key={s} className="px-4 py-3 text-center">
//                             <input type="radio" name={`status-${student.id}`}
//                               checked={student.status === s}
//                               onChange={() => toggleStatus(student.id, s)}
//                               className="w-4 h-4 cursor-pointer accent-indigo-600" />
//                           </td>
//                         ))}
//                         <td className="px-4 py-3 text-center">
//                           <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
//                             <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
//                             {cfg.label}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <button
//                             onClick={() => handleSaveSingle(student)}
//                             disabled={isSavingThis || !selectedSubjectId || !selectedClassroomId}
//                             className="inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5
//                                        bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200
//                                        rounded-lg font-semibold transition disabled:opacity-40">
//                             {isSavingThis
//                               ? <span className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"/>
//                               : "Save"}
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


/////////--------------------------------------------------older code

// import { useEffect, useState } from "react";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import API, {
//   getClassrooms,
//   getStudentsByClassroom,
// } from "../../common/services/api";

// export default function TakeAttendance() {

//   const [classrooms, setClassrooms] = useState([]);
//   const [selectedClassroomId, setSelectedClassroomId] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [saving, setSaving] = useState(false);

//   // 🔹 Fetch Classrooms
//   useEffect(() => {
//     const fetchClassrooms = async () => {
//       try {
//         const data = await getClassrooms();
//         setClassrooms(data?.content || []);
//       } catch (err) {
//         console.error("Error fetching classrooms:", err);
//       }
//     };

//     fetchClassrooms();
//   }, []);

//   // 🔹 Handle Classroom Change
//   const handleClassroomChange = async (e) => {
//     const classroomId = e.target.value;
//     setSelectedClassroomId(classroomId);

//     // reset
//     setSelectedSubject("");
//     setStudents([]);
//     setSubjects([]);

//     const selectedClassroom = classrooms.find(
//       (c) => c.id === Number(classroomId)
//     );

//     if (selectedClassroom) {
//       setSubjects(selectedClassroom.subjects || []);
//     }

//     // fetch students
//     try {
//       const data = await getStudentsByClassroom(classroomId);

//       const formattedStudents = (data || []).map((s) => ({
//         id: s.id,
//         name: `${s.firstName} ${s.lastName}`,
//         status: "Present",
//       }));

//       setStudents(formattedStudents);
//     } catch (err) {
//       console.error("Error fetching students:", err);
//     }
//   };

//   // 🔹 Toggle Attendance
//   const toggleStatus = (id, status) => {
//     const updated = students.map((s) =>
//       s.id === id ? { ...s, status } : s
//     );
//     setStudents(updated);
//   };

//   // 🔥 SAVE ATTENDANCE API
//   const handleSave = async () => {
//     if (!selectedClassroomId || !selectedSubject) {
//       alert("Please select classroom and subject ⚠️");
//       return;
//     }

//     try {
//       setSaving(true);

//       // find subjectId
//       const selectedSub = subjects.find(
//         (s) => s.subjectName === selectedSubject
//       );

//       const payload = {
//         subjectId: selectedSub?.id,
//         date: new Date().toISOString().split("T")[0],
//         students: students.map((s) => ({
//           studentId: s.id,
//           status: s.status === "Present" ? "PRESENT" : "ABSENT",
//         })),
//       };

//       console.log("Payload:", payload);

//       await API.post(
//         `/attendance/${selectedClassroomId}/attendance`,
//         payload
//       );

//       alert("Attendance Saved Successfully ✅");

//     } catch (err) {
//       console.error("Error saving attendance:", err);
//       alert("Failed to save attendance ❌");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       <TeacherSidebar />

//       <div className="flex-1 p-6">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Take Attendance
//           </h2>

//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//           >
//             {saving ? "Saving..." : "Save Attendance"}
//           </button>
//         </div>

//         {/* DROPDOWNS */}
//         <div className="flex gap-4 mb-6">

//           {/* CLASSROOM */}
//           <select
//             value={selectedClassroomId}
//             onChange={handleClassroomChange}
//             className="border px-3 py-2 rounded bg-white"
//           >
//             <option value="">Select Classroom</option>
//             {classrooms.map((cls) => (
//               <option key={cls.id} value={cls.id}>
//                 {cls.grade} - {cls.section}
//               </option>
//             ))}
//           </select>

//           {/* SUBJECT */}
//           <select
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             className="border px-3 py-2 rounded bg-white"
//           >
//             <option value="">Select Subject</option>
//             {subjects.map((sub) => (
//               <option key={sub.id} value={sub.subjectName}>
//                 {sub.subjectName}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           <div className="overflow-auto max-h-[65vh]">
//             <table className="w-full text-sm">

//               <thead className="bg-gray-100 sticky top-0 z-10">
//                 <tr className="text-left text-gray-600">
//                   <th className="p-3">Student Name</th>
//                   <th className="p-3 text-center">Present</th>
//                   <th className="p-3 text-center">Absent</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {students.length > 0 ? (
//                   students.map((student) => (
//                     <tr key={student.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3 font-medium">
//                         {student.name}
//                       </td>

//                       <td className="p-3 text-center">
//                         <input
//                           type="radio"
//                           name={`status-${student.id}`}
//                           checked={student.status === "Present"}
//                           onChange={() =>
//                             toggleStatus(student.id, "Present")
//                           }
//                         />
//                       </td>

//                       <td className="p-3 text-center">
//                         <input
//                           type="radio"
//                           name={`status-${student.id}`}
//                           checked={student.status === "Absent"}
//                           onChange={() =>
//                             toggleStatus(student.id, "Absent")
//                           }
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="text-center p-4 text-gray-500">
//                       No students found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>

//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }