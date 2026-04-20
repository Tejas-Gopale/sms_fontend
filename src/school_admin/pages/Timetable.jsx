import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import "../styles/timetable.css";
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_SHORT = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat" };

const SUBJECT_COLORS = [
  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
  { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
];

const subjectColorMap = {};
const getSubjectColor = (name) => {
  if (!name || name === "BREAK") return null;
  if (!subjectColorMap[name]) {
    const keys = Object.keys(subjectColorMap);
    subjectColorMap[name] = SUBJECT_COLORS[keys.length % SUBJECT_COLORS.length];
  }
  return subjectColorMap[name];
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
};

export default function Timetable() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [viewType, setViewType] = useState("WEEK");
  const [loading, setLoading] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/school-admin/getClassRoom");
      const rooms = res.data.content || [];
      setClassrooms(rooms);
      if (rooms.length > 0) setSelectedClassId(rooms[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const urlMap = {
        WEEK: `/tablecontroller/class/${selectedClassId}/week`,
        TODAY: `/tablecontroller/class/${selectedClassId}/today`,
        TOMORROW: `/tablecontroller/class/${selectedClassId}/tomorrow`,
      };
      const res = await API.get(urlMap[viewType]);
      // API returns flat array; filter by selected classroom
      const selectedRoom = classrooms.find((c) => String(c.id) === String(selectedClassId));
      const data = Array.isArray(res.data) ? res.data : [];

      // Filter to only show periods matching selected classroom + section
      const filtered = selectedRoom
        ? data.filter(
            (p) =>
              p.classRoom === selectedRoom.grade &&
              (p.section === selectedRoom.section || p.isBreak)
          )
        : data;

      setTimetable(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTimetable = async () => {
    if (!selectedClassId) return;
    try {
      const periodTime = [
        ["09:15:00", "10:00:00"],
        ["10:00:00", "10:45:00"],
        ["11:00:00", "11:45:00"],
        ["11:45:00", "12:30:00"],
        ["01:10:00", "01:55:00"],
        ["01:55:00", "02:40:00"],
        ["02:40:00", "03:25:00"],
      ];
      const payload = {
        name: "AUTO",
        classRoomId: selectedClassId,
        slots: [],
      };
      DAYS.forEach((day) => {
        periodTime.forEach((time, index) => {
          payload.slots.push({
            dayOfWeek: day,
            periodNumber: index + 1,
            startTime: time[0],
            endTime: time[1],
            subjectId: index === 3 ? null : 5 + (index % 4),
            teacherId: index === 3 ? null : 3 + (index % 5),
            isBreak: index === 3,
          });
        });
      });
      await API.post("/tablecontroller/create", payload);
      alert("✅ Timetable Created Successfully");
      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert("❌ Error creating timetable");
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);
  useEffect(() => { fetchTimetable(); }, [selectedClassId, viewType]);

  // ✅ FIX: Group by actual dayOfWeek field from API response
  const groupByDay = () => {
  const grouped = {};
  DAYS.forEach((d) => (grouped[d] = []));

  if (!timetable || timetable.length === 0) return grouped;

  const periodsPerDay = 7; // tera fixed hai
  let dayIndex = 0;

  for (let i = 0; i < timetable.length; i++) {
    const day = DAYS[dayIndex];

    grouped[day].push(timetable[i]);

    // har 7 period ke baad next day
    if ((i + 1) % periodsPerDay === 0) {
      dayIndex++;
    }
  }

  return grouped;
};

  const groupedData = groupByDay();
  const selectedRoom = classrooms.find((c) => String(c.id) === String(selectedClassId));
  const maxPeriods = Math.max(
  ...Object.values(groupedData).map((d) => d.length),
  0
);
  const periodHeaders = Array.from({ length: maxPeriods || 7 }, (_, i) => i + 1);

  const PeriodCell = ({ p }) => {
    if (!p) return <td className="period-cell empty-cell"><span className="empty-dot">—</span></td>;
    if (p.isBreak) {
      return (
        <td className="period-cell">
          <div className="break-badge">
            <span className="break-icon">☕</span>
            <span>Break</span>
            <span className="period-time">{formatTime(p.startTime)}</span>
          </div>
        </td>
      );
    }
    const color = getSubjectColor(p.subjectName);
    return (
      <td className="period-cell">
        <div
          className="subject-pill"
          style={{ background: color?.bg, borderColor: color?.border }}
        >
          <span className="subject-name" style={{ color: color?.text }}>{p.subjectName}</span>
          <span className="teacher-name">{p.teacherName}</span>
          <span className="period-time">{formatTime(p.startTime)} – {formatTime(p.endTime)}</span>
        </div>
      </td>
    );
  };

  return (
    <>

      <div className="tt-page">
        <SchoolAdminSidebar />

        <div className="tt-main">
          {/* HEADER */}
          <div className="tt-header">
            <div className="tt-title-block">
              <h1>📅 Timetable</h1>
              <div className="tt-subtitle">
                {selectedRoom
                  ? `${selectedRoom.grade} · Section ${selectedRoom.section}`
                  : "Select a classroom"}
              </div>
            </div>

            <div className="tt-controls">
              {/* Classroom selector */}
              <select
                className="ctrl-select"
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade} – {cls.section}
                  </option>
                ))}
              </select>

              {/* View tabs */}
              <div className="view-tabs">
                {["WEEK", "TODAY", "TOMORROW"].map((v) => (
                  <button
                    key={v}
                    className={`view-tab ${viewType === v ? "active" : ""}`}
                    onClick={() => setViewType(v)}
                  >
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Generate */}
              <button className="btn-generate" onClick={createTimetable}>
                ⚡ Generate
              </button>
            </div>
          </div>

          {/* CLASS BADGE */}
          {selectedRoom && (
            <div className="class-badge">
              🏫 {selectedRoom.grade} &nbsp;·&nbsp; Section {selectedRoom.section}
            </div>
          )}

          {/* TABLE */}
          <div className="tt-card">
            <table>
              <thead>
                <tr>
                  <th>Day / Period</th>
                  {periodHeaders.map((p) => (
                    <th key={p}>P{p}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="loading-row">
                    <td colSpan={periodHeaders.length + 1}>
                      <span className="spinner" />
                      Loading timetable…
                    </td>
                  </tr>
                ) : viewType === "WEEK" ? (
                  DAYS.map((day) => {
                    const periods = groupedData[day] || [];
                    if (periods.length === 0) return null;
                    return (
                      <tr key={day}>
                        <td className="day-cell">
                          <div className="day-label">{DAY_SHORT[day]}</div>
                          <div className="day-date">{day}</div>
                        </td>
                        {periodHeaders.map((_, i) => (
                          <PeriodCell key={i} p={periods[i]} />
                        ))}
                      </tr>
                    );
                  })
                ) : timetable.length === 0 ? (
                  <tr>
                    <td colSpan={periodHeaders.length + 1}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>No timetable found for this class today.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="day-cell">
                      <div className="day-label">{viewType}</div>
                    </td>
                    {timetable.map((p, i) => (
                      <PeriodCell key={i} p={p} />
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}