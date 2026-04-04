import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tt-page {
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #F3F4F6; /* ✅ same as bg-gray-100 */
          min-height: 100vh;
        }

        .tt-main {
  flex: 1;
  padding: 24px; /* ✅ same spacing like Subjects */
  overflow-x: auto;
  background: #F3F4F6; /* ✅ add this */
}

        /* HEADER */
        .tt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .tt-title-block h1 {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .tt-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 3px;
          font-family: 'DM Mono', monospace;
        }

        .tt-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .ctrl-select {
          appearance: none;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          padding: 9px 34px 9px 14px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1E293B;
          cursor: pointer;
          font-weight: 500;
          transition: border-color 0.15s, box-shadow 0.15s;
          min-width: 140px;
        }

        .ctrl-select:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .view-tabs {
          display: flex;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
        }

        .view-tab {
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #64748B;
          cursor: pointer;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .view-tab + .view-tab { border-left: 1.5px solid #E2E8F0; }

        .view-tab.active {
          background: #6366F1;
          color: #fff;
        }

        .btn-generate {
          background: #0F172A;
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s, transform 0.1s;
        }

        .btn-generate:hover { background: #1E293B; transform: translateY(-1px); }
        .btn-generate:active { transform: translateY(0); }

        /* CLASS BADGE */
        .class-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #EEF2FF;
          border: 1.5px solid #C7D2FE;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 13px;
          color: #4338CA;
          font-weight: 600;
          margin-bottom: 16px;
        }

        /* TABLE WRAPPER */
        .tt-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          overflow: auto;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        thead {
          background: #F8F9FC;
          border-bottom: 1.5px solid #E2E8F0;
        }

        thead th {
          padding: 12px 10px;
          text-align: center;
          font-weight: 600;
          color: #64748B;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        thead th:first-child {
          text-align: left;
          padding-left: 20px;
          min-width: 110px;
          color: #0F172A;
        }

        tbody tr {
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.1s;
        }

        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #FAFBFF; }

        .day-cell {
          padding: 14px 10px 14px 20px;
          font-weight: 600;
          color: #1E293B;
          font-size: 13px;
          white-space: nowrap;
          vertical-align: middle;
        }

        .day-label { font-weight: 700; color: #0F172A; }
        .day-date { font-size: 11px; color: #94A3B8; margin-top: 2px; font-family: 'DM Mono', monospace; }

        .period-cell {
          padding: 8px 6px;
          text-align: center;
          vertical-align: middle;
          min-width: 120px;
        }

        .subject-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          padding: 8px 10px;
          border-radius: 9px;
          border: 1.5px solid #E2E8F0;
          text-align: left;
          transition: transform 0.1s, box-shadow 0.1s;
          cursor: default;
        }

        .subject-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }

        .subject-name {
          font-weight: 700;
          font-size: 12.5px;
          line-height: 1.2;
        }

        .teacher-name {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
        }

        .period-time {
          font-size: 10px;
          color: #94A3B8;
          font-family: 'DM Mono', monospace;
          margin-top: 2px;
        }

        .break-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: #FFFBEB;
          border: 1.5px dashed #FCD34D;
          border-radius: 9px;
          padding: 8px 10px;
          font-size: 11.5px;
          color: #92400E;
          font-weight: 600;
          width: 100%;
        }

        .break-icon { font-size: 16px; }

        .empty-cell { opacity: 0.3; }
        .empty-dot { font-size: 18px; color: #CBD5E1; }

        /* LOADING */
        .loading-row td {
          padding: 48px;
          text-align: center;
          color: #94A3B8;
          font-size: 14px;
        }

        .spinner {
          display: inline-block;
          width: 20px; height: 20px;
          border: 2px solid #E2E8F0;
          border-top-color: #6366F1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state {
          padding: 64px 24px;
          text-align: center;
          color: #94A3B8;
        }

        .empty-state-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-state p { font-size: 14px; }
      `}</style>

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