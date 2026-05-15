import { useEffect, useState } from "react";
import API from "../../common/services/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_SHORT = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat",
};

const DEFAULT_PERIOD_TIMES = [
  { start: "09:15:00", end: "10:00:00" },
  { start: "10:00:00", end: "10:45:00" },
  { start: "11:00:00", end: "11:45:00" },
  { start: "11:45:00", end: "12:30:00", isBreak: true },
  { start: "01:10:00", end: "01:55:00" },
  { start: "01:55:00", end: "02:40:00" },
  { start: "02:40:00", end: "03:25:00" },
];

const PERIOD_COUNT = 7;

const emptySlot = (day, periodNumber) => {
  const t = DEFAULT_PERIOD_TIMES[periodNumber - 1];
  return {
    dayOfWeek: day, periodNumber,
    startTime: t.start, endTime: t.end,
    subjectId: null, teacherId: null,
    isBreak: !!t.isBreak,
  };
};

const buildInitialSlots = () => {
  const slots = {};
  DAYS.forEach((day) => {
    slots[day] = Array.from({ length: PERIOD_COUNT }, (_, i) => emptySlot(day, i + 1));
  });
  return slots;
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
};

const PALETTE = [
  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", tag: "#DBEAFE" },
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", tag: "#DCFCE7" },
  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", tag: "#FFEDD5" },
  { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF", tag: "#F3E8FF" },
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3", tag: "#FFE4E6" },
  { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4", tag: "#CCFBF1" },
  { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", tag: "#FEF3C7" },
  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", tag: "#EDE9FE" },
];

const colorCache = {};
const getColor = (id) => {
  if (!id) return null;
  if (!colorCache[id]) {
    colorCache[id] = PALETTE[Object.keys(colorCache).length % PALETTE.length];
  }
  return colorCache[id];
};

// ─── SlotEditor Modal ─────────────────────────────────────────────────────────
function SlotEditor({ slot, subjects, onSave, onClose }) {
  const [subjectId, setSubjectId] = useState(slot.subjectId ?? "");
  const [isBreak, setIsBreak] = useState(slot.isBreak ?? false);

  // Get teacher directly from selected subject object
  const selectedSubject = subjects.find((s) => String(s.id) === String(subjectId));

  const handleSave = () => {
    onSave({
      ...slot,
      subjectId: isBreak ? null : subjectId ? Number(subjectId) : null,
      // teacherId comes straight from the subject
      teacherId: isBreak ? null : selectedSubject?.teacherId ?? null,
      isBreak,
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>Edit Period</div>
            <div style={styles.modalSub}>
              {DAY_SHORT[slot.dayOfWeek]} · P{slot.periodNumber} · {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.modalBody}>
          {/* Break toggle */}
          <label style={styles.switchRow}>
            <span style={styles.label}>Mark as Break</span>
            <div
              style={{ ...styles.toggle, background: isBreak ? "#6366F1" : "#D1D5DB" }}
              onClick={() => { setIsBreak(!isBreak); setSubjectId(""); }}
            >
              <div style={{ ...styles.toggleKnob, transform: isBreak ? "translateX(20px)" : "translateX(0)" }} />
            </div>
          </label>

          {!isBreak && (
            <>
              {/* Subject dropdown */}
              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <select
                  style={styles.select}
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">— Select Subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subjectName}</option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <span style={styles.hint}>⚠️ No subjects found for this classroom</span>
                )}
              </div>

              {/* Teacher — auto-resolved from subject */}
              {subjectId && (
                <div style={styles.field}>
                  <label style={styles.label}>Teacher</label>
                  {selectedSubject?.teacherName ? (
                    <div style={styles.teacherInfoBox}>
                      <span style={styles.teacherInfoName}>
                        👤 {selectedSubject.teacherName}
                      </span>
                      <span style={styles.teacherInfoSub}>
                        {selectedSubject.teacherEmployeeId} · Auto-assigned
                      </span>
                    </div>
                  ) : (
                    <div style={styles.noTeacherBox}>
                      ⚠️ No teacher assigned to this subject yet
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave}>Save Period</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TimetableCreator({ onBack }) {
  const [classrooms, setClassrooms]     = useState([]);
  const [subjects, setSubjects]         = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [timetableName, setTimetableName]     = useState("");
  const [slots, setSlots]               = useState(buildInitialSlots());
  const [editingSlot, setEditingSlot]   = useState(null);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeDay, setActiveDay]       = useState("MONDAY");

  // ── 1. Fetch classrooms once ──
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await API.get("/school-admin/getClassRoom");
        const rooms = res.data?.content || res.data || [];
        setClassrooms(rooms);
        if (rooms.length > 0) setSelectedClassId(String(rooms[0].id));
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to load classrooms", "error");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // ── 2. Fetch subjects whenever selected classroom changes ──
  useEffect(() => {
    if (!selectedClassId) return;

    const selectedRoom = classrooms.find((c) => String(c.id) === selectedClassId);
    if (!selectedRoom) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]); // clear while loading
      try {
        const res = await API.get(
          `/classroom/getSubjectByClassRoomId?page=0&size=100&sortBy=id&sortDir=asc`
        );
        const all = res.data?.content || res.data || [];

        // Filter by selected classroom's grade + section
        const filtered = all.filter(
          (s) =>
            s.grade === selectedRoom.grade &&
            s.section === selectedRoom.section
        );
        setSubjects(filtered);
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to load subjects", "error");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedClassId, classrooms]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openEditor  = (day, periodIndex) => setEditingSlot({ day, periodIndex });
  const closeEditor = () => setEditingSlot(null);

  const saveSlot = (updatedSlot) => {
    setSlots((prev) => {
      const daySlots = [...prev[updatedSlot.dayOfWeek]];
      daySlots[updatedSlot.periodNumber - 1] = updatedSlot;
      return { ...prev, [updatedSlot.dayOfWeek]: daySlots };
    });
    closeEditor();
  };

  const copyDayToAll = (sourceDay) => {
    const source = slots[sourceDay];
    setSlots((prev) => {
      const next = { ...prev };
      DAYS.forEach((d) => {
        if (d !== sourceDay) next[d] = source.map((s) => ({ ...s, dayOfWeek: d }));
      });
      return next;
    });
    showToast(`📋 ${DAY_SHORT[sourceDay]}'s schedule copied to all days`);
  };

  const clearDay = (day) => {
    setSlots((prev) => ({
      ...prev,
      [day]: Array.from({ length: PERIOD_COUNT }, (_, i) => emptySlot(day, i + 1)),
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClassId) return showToast("❌ Please select a classroom", "error");

    const flatSlots = [];
    DAYS.forEach((day) => {
      slots[day].forEach((s) => {
        const slot = {
          dayOfWeek: s.dayOfWeek, periodNumber: s.periodNumber,
          startTime: s.startTime, endTime: s.endTime, isBreak: s.isBreak,
        };
        if (!s.isBreak) {
          if (s.subjectId) slot.subjectId = s.subjectId;
          if (s.teacherId) slot.teacherId = s.teacherId;
        }
        flatSlots.push(slot);
      });
    });

    const selectedRoom = classrooms.find((c) => String(c.id) === selectedClassId);
    const payload = {
      name: timetableName || `${selectedRoom?.grade || "Class"}`,
      classRoomId: Number(selectedClassId),
      slots: flatSlots,
    };

    setSaving(true);
    try {
      await API.post("/tablecontroller/create", payload);
      showToast("✅ Timetable created successfully!");
      if (onBack) setTimeout(onBack, 1500);
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to create timetable. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ──
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.subjectName || "";
  const getTeacherName = (id) => {
    // id here is teacherId stored on the slot
    const sub = subjects.find((s) => s.teacherId === id);
    return sub?.teacherName || "";
  };

  const selectedRoom     = classrooms.find((c) => String(c.id) === selectedClassId);
  const editingSlotData  = editingSlot ? slots[editingSlot.day][editingSlot.periodIndex] : null;

  const totalNonBreak = DAYS.length * DEFAULT_PERIOD_TIMES.filter((t) => !t.isBreak).length;
  const filledSlots   = DAYS.reduce((acc, day) =>
    acc + slots[day].filter((s) => !s.isBreak && s.subjectId).length, 0);
  const pct = Math.round((filledSlots / totalNonBreak) * 100);

  if (loadingRooms) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: "#6B7280", marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
          Loading classrooms…
        </p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === "error" ? "#FEE2E2" : "#ECFDF5",
          borderColor: toast.type === "error" ? "#FCA5A5" : "#6EE7B7",
          color: toast.type === "error" ? "#991B1B" : "#065F46",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {onBack && <button style={styles.backBtn} onClick={onBack}>← Back</button>}
          <div>
            <h1 style={styles.title}>Create Timetable</h1>
            <p style={styles.subtitle}>Build a weekly schedule for your classroom</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.progressPill}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${pct}%` }} />
            </div>
            <span style={styles.progressText}>{filledSlots}/{totalNonBreak} slots filled</span>
          </div>
          <button
            style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving…" : "💾 Save Timetable"}
          </button>
        </div>
      </div>

      {/* Config bar */}
      <div style={styles.configBar}>
        <div style={styles.configField}>
          <label style={styles.label}>Classroom</label>
          <select
            style={styles.select}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">— Select Class —</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.grade} – {c.section}</option>
            ))}
          </select>
        </div>

        <div style={styles.configField}>
          <label style={styles.label}>
            Timetable Name <span style={{ color: "#9CA3AF" }}>(optional)</span>
          </label>
          <input
            style={styles.input}
            placeholder={selectedRoom ? `${selectedRoom.grade} – ${selectedRoom.section} Schedule` : "e.g. LKG Weekly"}
            value={timetableName}
            onChange={(e) => setTimetableName(e.target.value)}
          />
        </div>

        {/* Subject chips for selected class */}
        <div style={styles.subjectBadgeWrap}>
          <label style={styles.label}>
            Subjects
            {loadingSubjects && <span style={{ color: "#9CA3AF", fontWeight: 400 }}> Loading…</span>}
          </label>
          <div style={styles.subjectBadgeList}>
            {!loadingSubjects && subjects.length === 0 && (
              <span style={styles.noSubjectNote}>⚠️ No subjects assigned to this class</span>
            )}
            {subjects.map((s) => (
              <span
                key={s.id}
                style={{
                  ...styles.subjectChip,
                  background: getColor(s.id)?.tag || "#F3F4F6",
                  color: getColor(s.id)?.text || "#374151",
                }}
              >
                {s.subjectName} {s.teacherName ? "✓" : "⚠️"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div style={styles.dayTabs}>
        {DAYS.map((day) => {
          const filled = slots[day].filter((s) => !s.isBreak && s.subjectId).length;
          const total  = slots[day].filter((s) => !s.isBreak).length;
          return (
            <button
              key={day}
              style={{
                ...styles.dayTab,
                ...(activeDay === day ? styles.dayTabActive : {}),
                ...(filled === total ? styles.dayTabComplete : {}),
              }}
              onClick={() => setActiveDay(day)}
            >
              <span>{DAY_SHORT[day]}</span>
              <span style={styles.dayTabBadge}>{filled}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule grid */}
      <div style={styles.daySection}>
        <div style={styles.daySectionHeader}>
          <div style={styles.dayTitle}>
            <span style={styles.dayTitleText}>{activeDay}</span>
            <span style={styles.daySlotsCount}>
              {slots[activeDay].filter((s) => !s.isBreak && s.subjectId).length} of{" "}
              {slots[activeDay].filter((s) => !s.isBreak).length} periods filled
            </span>
          </div>
          <div style={styles.dayActions}>
            <button style={styles.ghostBtn} onClick={() => copyDayToAll(activeDay)}>📋 Copy to All Days</button>
            <button style={styles.ghostBtn} onClick={() => clearDay(activeDay)}>🗑 Clear Day</button>
          </div>
        </div>

        <div style={styles.periodsGrid}>
          {slots[activeDay].map((slot, i) => {
            const subjName = getSubjectName(slot.subjectId);
            const tchrName = getTeacherName(slot.teacherId);
            const color    = getColor(slot.subjectId);
            return (
              <div
                key={i}
                style={{
                  ...styles.periodCard,
                  ...(slot.isBreak ? styles.periodCardBreak : {}),
                  ...(color && !slot.isBreak ? { background: color.bg, borderColor: color.border } : {}),
                }}
                onClick={() => !slot.isBreak && openEditor(activeDay, i)}
              >
                <div style={styles.periodNum}>P{slot.periodNumber}</div>
                <div style={styles.periodTime}>
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </div>
                {slot.isBreak ? (
                  <div style={styles.breakContent}>
                    <span style={styles.breakIcon}>☕</span>
                    <span style={styles.breakText}>Break</span>
                  </div>
                ) : subjName ? (
                  <>
                    <div style={{ ...styles.subjectTag, background: color?.tag, color: color?.text }}>
                      {subjName}
                    </div>
                    <div style={styles.teacherName}>{tchrName || "⚠️ No teacher"}</div>
                  </>
                ) : (
                  <div style={styles.emptySlot}>
                    <span style={styles.plusIcon}>＋</span>
                    <span style={styles.emptyText}>Add period</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly overview */}
      <div style={styles.overviewSection}>
        <div style={styles.overviewTitle}>Weekly Overview</div>
        <div style={styles.overviewGrid}>
          {DAYS.map((day) => (
            <div key={day} style={styles.overviewDay}>
              <div style={styles.overviewDayLabel}>{DAY_SHORT[day]}</div>
              <div style={styles.overviewPills}>
                {slots[day].map((s, i) =>
                  s.isBreak ? (
                    <div key={i} style={styles.overviewBreak} title="Break">☕</div>
                  ) : s.subjectId ? (
                    <div
                      key={i}
                      style={{
                        ...styles.overviewPill,
                        background: getColor(s.subjectId)?.bg,
                        color: getColor(s.subjectId)?.text,
                        borderColor: getColor(s.subjectId)?.border,
                      }}
                      title={`${getSubjectName(s.subjectId)} · ${getTeacherName(s.teacherId)}`}
                    >
                      {getSubjectName(s.subjectId)?.slice(0, 3)}
                    </div>
                  ) : (
                    <div
                      key={i}
                      style={styles.overviewEmpty}
                      onClick={() => { setActiveDay(day); openEditor(day, i); }}
                    >–</div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor modal */}
      {editingSlot && editingSlotData && (
        <SlotEditor
          slot={editingSlotData}
          subjects={subjects}
          onSave={saveSlot}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}

// ─── Styles (unchanged from before) ──────────────────────────────────────────
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh", padding: "24px", boxSizing: "border-box", position: "relative" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" },
  spinner: { width: 36, height: 36, border: "3px solid #E0E7FF", borderTop: "3px solid #6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, border: "1px solid", fontWeight: 500, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#374151", fontFamily: "'DM Sans', sans-serif" },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" },
  subtitle: { margin: "2px 0 0", fontSize: 13, color: "#9CA3AF" },
  progressPill: { display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "6px 14px" },
  progressBar: { width: 80, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", background: "#6366F1", borderRadius: 99, transition: "width 0.4s" },
  progressText: { fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" },
  submitBtn: { background: "#6366F1", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  configBar: { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px" },
  configField: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 },
  subjectBadgeWrap: { display: "flex", flexDirection: "column", gap: 6, flex: 2, minWidth: 200 },
  subjectBadgeList: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  subjectChip: { padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 },
  noSubjectNote: { fontSize: 12, color: "#B45309", background: "#FEF3C7", padding: "4px 10px", borderRadius: 99 },
  dayTabs: { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  dayTab: { display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" },
  dayTabActive: { background: "#EEF2FF", borderColor: "#C7D2FE", color: "#4338CA", fontWeight: 600 },
  dayTabComplete: { borderColor: "#A7F3D0", color: "#065F46" },
  dayTabBadge: { background: "#F3F4F6", color: "#9CA3AF", borderRadius: 99, fontSize: 11, padding: "2px 6px", fontFamily: "'DM Mono', monospace" },
  daySection: { background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px", marginBottom: 20 },
  daySectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 },
  dayTitle: { display: "flex", alignItems: "center", gap: 10 },
  dayTitleText: { fontSize: 16, fontWeight: 700, color: "#111827" },
  daySlotsCount: { fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 99, padding: "3px 10px" },
  dayActions: { display: "flex", gap: 8 },
  ghostBtn: { background: "transparent", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" },
  periodsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 },
  periodCard: { border: "1.5px dashed #E5E7EB", borderRadius: 12, padding: "14px 12px", cursor: "pointer", minHeight: 100, display: "flex", flexDirection: "column", gap: 6, background: "white" },
  periodCardBreak: { background: "#FAFAFA", borderStyle: "solid", borderColor: "#F3F4F6", cursor: "default" },
  periodNum: { fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "'DM Mono', monospace" },
  periodTime: { fontSize: 11, color: "#D1D5DB" },
  breakContent: { display: "flex", alignItems: "center", gap: 6, marginTop: 4 },
  breakIcon: { fontSize: 16 },
  breakText: { fontSize: 13, color: "#9CA3AF", fontWeight: 500 },
  subjectTag: { display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, width: "fit-content" },
  teacherName: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emptySlot: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 4, opacity: 0.5 },
  plusIcon: { fontSize: 20, color: "#D1D5DB" },
  emptyText: { fontSize: 11, color: "#9CA3AF" },
  overviewSection: { background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px" },
  overviewTitle: { fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 14 },
  overviewGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, overflowX: "auto" },
  overviewDay: { display: "flex", flexDirection: "column", gap: 5 },
  overviewDayLabel: { fontSize: 11, fontWeight: 700, color: "#9CA3AF", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" },
  overviewPills: { display: "flex", flexDirection: "column", gap: 3 },
  overviewPill: { border: "1px solid", borderRadius: 5, padding: "3px 0", fontSize: 10, fontWeight: 600, textAlign: "center" },
  overviewBreak: { textAlign: "center", fontSize: 11, padding: "2px 0", background: "#F9FAFB", borderRadius: 5 },
  overviewEmpty: { border: "1px dashed #E5E7EB", borderRadius: 5, padding: "3px 0", fontSize: 11, color: "#D1D5DB", textAlign: "center", cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "white", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 0" },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#111827" },
  modalSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  closeBtn: { background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 12, color: "#6B7280", flexShrink: 0 },
  modalBody: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #F3F4F6" },
  cancelBtn: { background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6B7280", fontFamily: "'DM Sans', sans-serif" },
  saveBtn: { background: "#6366F1", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
  teacherInfoBox: { background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 },
  teacherInfoName: { fontSize: 13, fontWeight: 600, color: "#15803D" },
  teacherInfoSub: { fontSize: 11, color: "#6B7280" },
  noTeacherBox: { background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#854D0E" },
  label: { fontSize: 12, fontWeight: 600, color: "#374151" },
  select: { border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#111827", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%", background: "white" },
  input: { border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#111827", outline: "none", fontFamily: "'DM Sans', sans-serif", width: "100%", boxSizing: "border-box" },
  hint: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  switchRow: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  toggle: { width: 40, height: 22, borderRadius: 99, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleKnob: { position: "absolute", top: 3, left: 3, width: 16, height: 16, background: "white", borderRadius: "50%", transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
};
// import { useEffect, useState, useCallback } from "react";
// import API from "../../common/services/api";

// // ─── Constants ───────────────────────────────────────────────────────────────
// const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
// const DAY_SHORT = {
//   MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
//   THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat",
// };

// const DEFAULT_PERIOD_TIMES = [
//   { start: "09:15:00", end: "10:00:00" },
//   { start: "10:00:00", end: "10:45:00" },
//   { start: "11:00:00", end: "11:45:00" },
//   { start: "11:45:00", end: "12:30:00", isBreak: true },
//   { start: "01:10:00", end: "01:55:00" },
//   { start: "01:55:00", end: "02:40:00" },
//   { start: "02:40:00", end: "03:25:00" },
// ];

// const PERIOD_COUNT = 7;

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const emptySlot = (day, periodNumber) => {
//   const t = DEFAULT_PERIOD_TIMES[periodNumber - 1];
//   return {
//     dayOfWeek: day,
//     periodNumber,
//     startTime: t.start,
//     endTime: t.end,
//     subjectId: null,
//     teacherId: null,
//     isBreak: !!t.isBreak,
//   };
// };

// const buildInitialSlots = () => {
//   const slots = {};
//   DAYS.forEach((day) => {
//     slots[day] = Array.from({ length: PERIOD_COUNT }, (_, i) => emptySlot(day, i + 1));
//   });
//   return slots;
// };

// const formatTime = (t) => {
//   if (!t) return "";
//   const [h, m] = t.split(":");
//   const hour = parseInt(h);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const display = hour % 12 === 0 ? 12 : hour % 12;
//   return `${display}:${m} ${ampm}`;
// };

// // ─── Subject color palette ────────────────────────────────────────────────────
// const PALETTE = [
//   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", tag: "#DBEAFE" },
//   { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", tag: "#DCFCE7" },
//   { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", tag: "#FFEDD5" },
//   { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF", tag: "#F3E8FF" },
//   { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3", tag: "#FFE4E6" },
//   { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4", tag: "#CCFBF1" },
//   { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", tag: "#FEF3C7" },
//   { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", tag: "#EDE9FE" },
// ];

// const colorCache = {};
// const getColor = (id) => {
//   if (!id) return null;
//   if (!colorCache[id]) {
//     const keys = Object.keys(colorCache).length;
//     colorCache[id] = PALETTE[keys % PALETTE.length];
//   }
//   return colorCache[id];
// };

// // ─── SlotEditor Modal ─────────────────────────────────────────────────────────
// function SlotEditor({ slot, subjects, teachers, onSave, onClose }) {
//   const [subjectId, setSubjectId] = useState(slot.subjectId ?? "");
//   const [teacherId, setTeacherId] = useState(slot.teacherId ?? "");
//   const [isBreak, setIsBreak] = useState(slot.isBreak ?? false);

//   const selectedSubject = subjects.find((s) => String(s.id) === String(subjectId));
//   // Filter teachers that teach this subject (by specialization match) or show all
//   const eligibleTeachers = subjectId
//     ? teachers.filter(
//         (t) =>
//           !t.specialization ||
//           t.specialization.toLowerCase().includes(selectedSubject?.subjectName?.toLowerCase() ?? "") ||
//           true // show all teachers regardless, let user choose
//       )
//     : teachers;

//   const handleSave = () => {
//     onSave({
//       ...slot,
//       subjectId: isBreak ? null : subjectId ? Number(subjectId) : null,
//       teacherId: isBreak ? null : teacherId ? Number(teacherId) : null,
//       isBreak,
//     });
//   };

//   return (
//     <div style={styles.overlay} onClick={onClose}>
//       <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//         <div style={styles.modalHeader}>
//           <div>
//             <div style={styles.modalTitle}>Edit Period</div>
//             <div style={styles.modalSub}>
//               {DAY_SHORT[slot.dayOfWeek]} · P{slot.periodNumber} · {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
//             </div>
//           </div>
//           <button style={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         <div style={styles.modalBody}>
//           {/* Break toggle */}
//           <label style={styles.switchRow}>
//             <span style={styles.label}>Mark as Break</span>
//             <div
//               style={{ ...styles.toggle, background: isBreak ? "#6366F1" : "#D1D5DB" }}
//               onClick={() => { setIsBreak(!isBreak); setSubjectId(""); setTeacherId(""); }}
//             >
//               <div style={{ ...styles.toggleKnob, transform: isBreak ? "translateX(20px)" : "translateX(0)" }} />
//             </div>
//           </label>

//           {!isBreak && (
//             <>
//               {/* Subject */}
//               <div style={styles.field}>
//                 <label style={styles.label}>Subject</label>
//                 <select
//                   style={styles.select}
//                   value={subjectId}
//                   onChange={(e) => { setSubjectId(e.target.value); setTeacherId(""); }}
//                 >
//                   <option value="">— Select Subject —</option>
//                   {subjects.map((s) => (
//                     <option key={s.id} value={s.id}>{s.subjectName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Teacher */}
//               <div style={styles.field}>
//                 <label style={styles.label}>Teacher</label>
//                 <select
//                   style={styles.select}
//                   value={teacherId}
//                   onChange={(e) => setTeacherId(e.target.value)}
//                   disabled={!subjectId}
//                 >
//                   <option value="">— Select Teacher —</option>
//                   {eligibleTeachers.map((t) => (
//                     <option key={t.id} value={t.id}>
//                       {t.firstName} {t.lastName}
//                       {t.specialization ? ` · ${t.specialization}` : ""}
//                     </option>
//                   ))}
//                 </select>
//                 {!subjectId && (
//                   <span style={styles.hint}>Select a subject first</span>
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         <div style={styles.modalFooter}>
//           <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
//           <button style={styles.saveBtn} onClick={handleSave}>Save Period</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function TimetableCreator({ onBack }) {
//   const [classrooms, setClassrooms] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [selectedClassId, setSelectedClassId] = useState("");
//   const [timetableName, setTimetableName] = useState("");
//   const [slots, setSlots] = useState(buildInitialSlots());
//   const [editingSlot, setEditingSlot] = useState(null); // { day, periodIndex }
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [loadingData, setLoadingData] = useState(true);
//   const [activeDay, setActiveDay] = useState("MONDAY");

//   // ── Fetch all master data ──
//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoadingData(true);
//       try {
//         const [classRes, subjectRes, teacherRes] = await Promise.all([
//           API.get("/school-admin/getClassRoom"),
//           API.get("/school-admin/getSubject"), 
//           API.get("/school-admin/getTeacherDetails?page=0&size=100&sortBy=id&sortDir=asc&search="),
//         ]);
//         console.log("Fetched data:", { classRes, subjectRes, teacherRes });

//         const rooms = classRes.data?.content || classRes.data || [];
//         const subs = subjectRes.data?.content || subjectRes.data || [];
//         const tchrs = teacherRes.data?.content || teacherRes.data || [];

//         setClassrooms(rooms);
//         setSubjects(subs);
//         setTeachers(tchrs);

//         if (rooms.length > 0) setSelectedClassId(String(rooms[0].id));
//       } catch (err) {
//         console.error("Failed to load data:", err);
//         showToast("❌ Failed to load classroom/subject/teacher data", "error");
//       } finally {
//         setLoadingData(false);
//       }
//     };
//     fetchAll();
//   }, []);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   // ── Slot edit handlers ──
//   const openEditor = (day, periodIndex) => {
//     setEditingSlot({ day, periodIndex });
//   };

//   const closeEditor = () => setEditingSlot(null);

//   const saveSlot = (updatedSlot) => {
//     setSlots((prev) => {
//       const daySlots = [...prev[updatedSlot.dayOfWeek]];
//       daySlots[updatedSlot.periodNumber - 1] = updatedSlot;
//       return { ...prev, [updatedSlot.dayOfWeek]: daySlots };
//     });
//     closeEditor();
//   };

//   // Copy day's schedule to all days
//   const copyDayToAll = (sourceDay) => {
//     const source = slots[sourceDay];
//     setSlots((prev) => {
//       const next = { ...prev };
//       DAYS.forEach((d) => {
//         if (d !== sourceDay) {
//           next[d] = source.map((s, i) => ({
//             ...s,
//             dayOfWeek: d,
//           }));
//         }
//       });
//       return next;
//     });
//     showToast(`📋 ${DAY_SHORT[sourceDay]}'s schedule copied to all days`);
//   };

//   // Clear all slots for a day
//   const clearDay = (day) => {
//     setSlots((prev) => ({
//       ...prev,
//       [day]: Array.from({ length: PERIOD_COUNT }, (_, i) => emptySlot(day, i + 1)),
//     }));
//   };

//   // ── Submit ──
//   const handleSubmit = async () => {
//     if (!selectedClassId) return showToast("❌ Please select a classroom", "error");

//     const flatSlots = [];
//     DAYS.forEach((day) => {
//       slots[day].forEach((s) => {
//         const slot = {
//           dayOfWeek: s.dayOfWeek,
//           periodNumber: s.periodNumber,
//           startTime: s.startTime,
//           endTime: s.endTime,
//           isBreak: s.isBreak,
//         };
//         if (!s.isBreak) {
//           if (s.subjectId) slot.subjectId = s.subjectId;
//           if (s.teacherId) slot.teacherId = s.teacherId;
//         }
//         flatSlots.push(slot);
//       });
//     });

//     const payload = {
//       name: timetableName || `Timetable - ${classrooms.find((c) => String(c.id) === selectedClassId)?.grade || "Class"}`,
//       classRoomId: Number(selectedClassId),
//       slots: flatSlots,
//     };

//     setSaving(true);
//     try {
//       await API.post("/tablecontroller/create", payload);
//       showToast("✅ Timetable created successfully!");
//       if (onBack) setTimeout(onBack, 1500);
//     } catch (err) {
//       console.error(err);
//       showToast("❌ Failed to create timetable. Please try again.", "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Derived ──
//   const getSubjectName = (id) => subjects.find((s) => s.id === id)?.subjectName || "";
//   const getTeacherName = (id) => {
//     const t = teachers.find((t) => t.id === id);
//     return t ? `${t.firstName} ${t.lastName}` : "";
//   };
//   const selectedRoom = classrooms.find((c) => String(c.id) === selectedClassId);
//   const editingSlotData =
//     editingSlot ? slots[editingSlot.day][editingSlot.periodIndex] : null;

//   // ── Completion stats ──
//   const totalNonBreak = DAYS.length * DEFAULT_PERIOD_TIMES.filter((t) => !t.isBreak).length;
//   const filledSlots = DAYS.reduce((acc, day) => {
//     return acc + slots[day].filter((s) => !s.isBreak && s.subjectId && s.teacherId).length;
//   }, 0);
//   const pct = Math.round((filledSlots / totalNonBreak) * 100);

//   if (loadingData) {
//     return (
//       <div style={styles.loadingWrap}>
//         <div style={styles.spinner} />
//         <p style={{ color: "#6B7280", marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
//           Loading data…
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.root}>
//       {/* Google Font */}
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
//         rel="stylesheet"
//       />

//       {/* Toast */}
//       {toast && (
//         <div style={{ ...styles.toast, background: toast.type === "error" ? "#FEE2E2" : "#ECFDF5", borderColor: toast.type === "error" ? "#FCA5A5" : "#6EE7B7", color: toast.type === "error" ? "#991B1B" : "#065F46" }}>
//           {toast.msg}
//         </div>
//       )}

//       {/* Header */}
//       <div style={styles.header}>
//         <div style={styles.headerLeft}>
//           {onBack && (
//             <button style={styles.backBtn} onClick={onBack}>← Back</button>
//           )}
//           <div>
//             <h1 style={styles.title}>Create Timetable</h1>
//             <p style={styles.subtitle}>Build a weekly schedule for your classroom</p>
//           </div>
//         </div>

//         <div style={styles.headerRight}>
//           {/* Progress pill */}
//           <div style={styles.progressPill}>
//             <div style={styles.progressBar}>
//               <div style={{ ...styles.progressFill, width: `${pct}%` }} />
//             </div>
//             <span style={styles.progressText}>{filledSlots}/{totalNonBreak} slots filled</span>
//           </div>
//           <button style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save Timetable"}
//           </button>
//         </div>
//       </div>

//       {/* Config bar */}
//       <div style={styles.configBar}>
//         <div style={styles.configField}>
//           <label style={styles.label}>Classroom</label>
//           <select style={styles.select} value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
//             <option value="">— Select Class —</option>
//             {classrooms.map((c) => (
//               <option key={c.id} value={c.id}>{c.grade} – {c.section}</option>
//             ))}
//           </select>
//         </div>

//         <div style={styles.configField}>
//           <label style={styles.label}>Timetable Name <span style={{ color: "#9CA3AF" }}>(optional)</span></label>
//           <input
//             style={styles.input}
//             placeholder={selectedRoom ? `${selectedRoom.grade} Schedule` : "e.g. 2nd Std Weekly"}
//             value={timetableName}
//             onChange={(e) => setTimetableName(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Day tabs */}
//       <div style={styles.dayTabs}>
//         {DAYS.map((day) => {
//           const filled = slots[day].filter((s) => !s.isBreak && s.subjectId).length;
//           const total = slots[day].filter((s) => !s.isBreak).length;
//           const complete = filled === total;
//           return (
//             <button
//               key={day}
//               style={{
//                 ...styles.dayTab,
//                 ...(activeDay === day ? styles.dayTabActive : {}),
//                 ...(complete ? styles.dayTabComplete : {}),
//               }}
//               onClick={() => setActiveDay(day)}
//             >
//               <span>{DAY_SHORT[day]}</span>
//               <span style={styles.dayTabBadge}>{filled}/{total}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Schedule grid for active day */}
//       <div style={styles.daySection}>
//         <div style={styles.daySectionHeader}>
//           <div style={styles.dayTitle}>
//             <span style={styles.dayTitleText}>{activeDay}</span>
//             <span style={styles.daySlotsCount}>
//               {slots[activeDay].filter((s) => !s.isBreak && s.subjectId).length} of{" "}
//               {slots[activeDay].filter((s) => !s.isBreak).length} periods filled
//             </span>
//           </div>
//           <div style={styles.dayActions}>
//             <button style={styles.ghostBtn} onClick={() => copyDayToAll(activeDay)}>📋 Copy to All Days</button>
//             <button style={styles.ghostBtn} onClick={() => clearDay(activeDay)}>🗑 Clear Day</button>
//           </div>
//         </div>

//         <div style={styles.periodsGrid}>
//           {slots[activeDay].map((slot, i) => {
//             const subjName = getSubjectName(slot.subjectId);
//             const tchrName = getTeacherName(slot.teacherId);
//             const color = getColor(slot.subjectId);

//             return (
//               <div
//                 key={i}
//                 style={{
//                   ...styles.periodCard,
//                   ...(slot.isBreak ? styles.periodCardBreak : {}),
//                   ...(color && !slot.isBreak ? { background: color.bg, borderColor: color.border } : {}),
//                 }}
//                 onClick={() => openEditor(activeDay, i)}
//               >
//                 <div style={styles.periodNum}>P{slot.periodNumber}</div>
//                 <div style={styles.periodTime}>
//                   {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
//                 </div>

//                 {slot.isBreak ? (
//                   <div style={styles.breakContent}>
//                     <span style={styles.breakIcon}>☕</span>
//                     <span style={styles.breakText}>Break</span>
//                   </div>
//                 ) : subjName ? (
//                   <>
//                     <div style={{ ...styles.subjectTag, background: color?.tag, color: color?.text }}>
//                       {subjName}
//                     </div>
//                     <div style={styles.teacherName}>{tchrName || "No teacher"}</div>
//                   </>
//                 ) : (
//                   <div style={styles.emptySlot}>
//                     <span style={styles.plusIcon}>＋</span>
//                     <span style={styles.emptyText}>Add period</span>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Full week overview (compact) */}
//       <div style={styles.overviewSection}>
//         <div style={styles.overviewTitle}>Weekly Overview</div>
//         <div style={styles.overviewGrid}>
//           {DAYS.map((day) => (
//             <div key={day} style={styles.overviewDay}>
//               <div style={styles.overviewDayLabel}>{DAY_SHORT[day]}</div>
//               <div style={styles.overviewPills}>
//                 {slots[day].map((s, i) =>
//                   s.isBreak ? (
//                     <div key={i} style={styles.overviewBreak} title="Break">☕</div>
//                   ) : s.subjectId ? (
//                     <div
//                       key={i}
//                       style={{
//                         ...styles.overviewPill,
//                         background: getColor(s.subjectId)?.bg,
//                         color: getColor(s.subjectId)?.text,
//                         borderColor: getColor(s.subjectId)?.border,
//                       }}
//                       title={`${getSubjectName(s.subjectId)} · ${getTeacherName(s.teacherId)}`}
//                     >
//                       {getSubjectName(s.subjectId)?.slice(0, 3)}
//                     </div>
//                   ) : (
//                     <div
//                       key={i}
//                       style={styles.overviewEmpty}
//                       onClick={() => { setActiveDay(day); openEditor(day, i); }}
//                       title="Empty — click to fill"
//                     >
//                       –
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Editor modal */}
//       {editingSlot && editingSlotData && (
//         <SlotEditor
//           slot={editingSlotData}
//           subjects={subjects}
//           teachers={teachers}
//           onSave={saveSlot}
//           onClose={closeEditor}
//         />
//       )}
//     </div>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = {
//   root: {
//     fontFamily: "'DM Sans', sans-serif",
//     background: "#F8FAFC",
//     minHeight: "100vh",
//     padding: "24px",
//     boxSizing: "border-box",
//     position: "relative",
//   },
//   loadingWrap: {
//     display: "flex", flexDirection: "column", alignItems: "center",
//     justifyContent: "center", height: "60vh",
//   },
//   spinner: {
//     width: 36, height: 36, border: "3px solid #E0E7FF",
//     borderTop: "3px solid #6366F1", borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   },
//   toast: {
//     position: "fixed", top: 20, right: 20, zIndex: 9999,
//     padding: "12px 20px", borderRadius: 10, border: "1px solid",
//     fontWeight: 500, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
//     animation: "slideIn 0.3s ease",
//   },

//   // Header
//   header: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     marginBottom: 24, flexWrap: "wrap", gap: 16,
//   },
//   headerLeft: { display: "flex", alignItems: "center", gap: 16 },
//   headerRight: { display: "flex", alignItems: "center", gap: 12 },
//   backBtn: {
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 8,
//     padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#374151",
//     fontFamily: "'DM Sans', sans-serif",
//   },
//   title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" },
//   subtitle: { margin: "2px 0 0", fontSize: 13, color: "#9CA3AF" },
//   progressPill: {
//     display: "flex", alignItems: "center", gap: 10,
//     background: "white", border: "1px solid #E5E7EB",
//     borderRadius: 20, padding: "6px 14px",
//   },
//   progressBar: { width: 80, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" },
//   progressFill: { height: "100%", background: "#6366F1", borderRadius: 99, transition: "width 0.4s" },
//   progressText: { fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" },
//   submitBtn: {
//     background: "#6366F1", color: "white", border: "none", borderRadius: 10,
//     padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14,
//     fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s",
//   },

//   // Config bar
//   configBar: {
//     display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap",
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 12,
//     padding: "16px 20px",
//   },
//   configField: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 },

//   // Day tabs
//   dayTabs: {
//     display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap",
//   },
//   dayTab: {
//     display: "flex", alignItems: "center", gap: 6,
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 8,
//     padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500,
//     color: "#6B7280", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
//   },
//   dayTabActive: {
//     background: "#EEF2FF", borderColor: "#C7D2FE", color: "#4338CA", fontWeight: 600,
//   },
//   dayTabComplete: {
//     borderColor: "#A7F3D0", color: "#065F46",
//   },
//   dayTabBadge: {
//     background: "#F3F4F6", color: "#9CA3AF", borderRadius: 99,
//     fontSize: 11, padding: "2px 6px", fontFamily: "'DM Mono', monospace",
//   },

//   // Day section
//   daySection: {
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 14,
//     padding: "20px", marginBottom: 20,
//   },
//   daySectionHeader: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     marginBottom: 16, flexWrap: "wrap", gap: 10,
//   },
//   dayTitle: { display: "flex", alignItems: "center", gap: 10 },
//   dayTitleText: { fontSize: 16, fontWeight: 700, color: "#111827" },
//   daySlotsCount: { fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 99, padding: "3px 10px" },
//   dayActions: { display: "flex", gap: 8 },
//   ghostBtn: {
//     background: "transparent", border: "1px solid #E5E7EB", borderRadius: 8,
//     padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#6B7280",
//     fontFamily: "'DM Sans', sans-serif",
//   },

//   periodsGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
//     gap: 10,
//   },
//   periodCard: {
//     border: "1.5px dashed #E5E7EB", borderRadius: 12, padding: "14px 12px",
//     cursor: "pointer", transition: "all 0.15s", minHeight: 100,
//     display: "flex", flexDirection: "column", gap: 6,
//     background: "white",
//     ":hover": { borderColor: "#6366F1" },
//   },
//   periodCardBreak: {
//     background: "#FAFAFA", borderStyle: "solid", borderColor: "#F3F4F6",
//     cursor: "default",
//   },
//   periodNum: {
//     fontSize: 11, fontWeight: 600, color: "#9CA3AF",
//     fontFamily: "'DM Mono', monospace",
//   },
//   periodTime: { fontSize: 11, color: "#D1D5DB" },
//   breakContent: { display: "flex", alignItems: "center", gap: 6, marginTop: 4 },
//   breakIcon: { fontSize: 16 },
//   breakText: { fontSize: 13, color: "#9CA3AF", fontWeight: 500 },
//   subjectTag: {
//     display: "inline-block", padding: "3px 8px", borderRadius: 6,
//     fontSize: 12, fontWeight: 600, width: "fit-content",
//   },
//   teacherName: { fontSize: 12, color: "#6B7280", marginTop: 2 },
//   emptySlot: {
//     display: "flex", flexDirection: "column", alignItems: "center",
//     justifyContent: "center", flex: 1, gap: 4, opacity: 0.5,
//   },
//   plusIcon: { fontSize: 20, color: "#D1D5DB" },
//   emptyText: { fontSize: 11, color: "#9CA3AF" },

//   // Overview
//   overviewSection: {
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px",
//   },
//   overviewTitle: { fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 14 },
//   overviewGrid: {
//     display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
//     overflowX: "auto",
//   },
//   overviewDay: { display: "flex", flexDirection: "column", gap: 5 },
//   overviewDayLabel: {
//     fontSize: 11, fontWeight: 700, color: "#9CA3AF", textAlign: "center",
//     textTransform: "uppercase", letterSpacing: "0.05em",
//   },
//   overviewPills: { display: "flex", flexDirection: "column", gap: 3 },
//   overviewPill: {
//     border: "1px solid", borderRadius: 5, padding: "3px 0",
//     fontSize: 10, fontWeight: 600, textAlign: "center", cursor: "default",
//   },
//   overviewBreak: {
//     textAlign: "center", fontSize: 11, padding: "2px 0",
//     background: "#F9FAFB", borderRadius: 5,
//   },
//   overviewEmpty: {
//     border: "1px dashed #E5E7EB", borderRadius: 5, padding: "3px 0",
//     fontSize: 11, color: "#D1D5DB", textAlign: "center", cursor: "pointer",
//   },

//   // Modal
//   overlay: {
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
//     zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
//   },
//   modal: {
//     background: "white", borderRadius: 16, width: "100%", maxWidth: 440,
//     boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
//   },
//   modalHeader: {
//     display: "flex", justifyContent: "space-between", alignItems: "flex-start",
//     padding: "20px 20px 0",
//   },
//   modalTitle: { fontSize: 16, fontWeight: 700, color: "#111827" },
//   modalSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
//   closeBtn: {
//     background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30,
//     cursor: "pointer", fontSize: 12, color: "#6B7280", flexShrink: 0,
//   },
//   modalBody: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
//   modalFooter: {
//     display: "flex", justifyContent: "flex-end", gap: 10,
//     padding: "14px 20px", borderTop: "1px solid #F3F4F6",
//   },
//   cancelBtn: {
//     background: "white", border: "1px solid #E5E7EB", borderRadius: 8,
//     padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#6B7280",
//     fontFamily: "'DM Sans', sans-serif",
//   },
//   saveBtn: {
//     background: "#6366F1", color: "white", border: "none", borderRadius: 8,
//     padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600,
//     fontFamily: "'DM Sans', sans-serif",
//   },

//   // Shared
//   label: { fontSize: 12, fontWeight: 600, color: "#374151" },
//   select: {
//     border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px",
//     fontSize: 13, color: "#111827", outline: "none", cursor: "pointer",
//     fontFamily: "'DM Sans', sans-serif", width: "100%", background: "white",
//   },
//   input: {
//     border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px",
//     fontSize: 13, color: "#111827", outline: "none",
//     fontFamily: "'DM Sans', sans-serif", width: "100%", boxSizing: "border-box",
//   },
//   hint: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
//   field: { display: "flex", flexDirection: "column", gap: 5 },
//   switchRow: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     cursor: "pointer",
//   },
//   toggle: {
//     width: 40, height: 22, borderRadius: 99, cursor: "pointer",
//     position: "relative", transition: "background 0.2s", flexShrink: 0,
//   },
//   toggleKnob: {
//     position: "absolute", top: 3, left: 3, width: 16, height: 16,
//     background: "white", borderRadius: "50%", transition: "transform 0.2s",
//     boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
//   },
// };