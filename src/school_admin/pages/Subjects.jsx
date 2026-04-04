import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, LayoutGrid, Table, Upload, X } from "lucide-react";
import API from "../../common/services/api";

const SUBJECT_COLORS = [
  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
  { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
];
const colorMap = {};
const getColor = (name) => {
  if (!name) return SUBJECT_COLORS[0];
  if (!colorMap[name]) {
    colorMap[name] = SUBJECT_COLORS[Object.keys(colorMap).length % SUBJECT_COLORS.length];
  }
  return colorMap[name];
};

export default function Subjects() {
  const [view, setView] = useState("table");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("ALL");

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Subjects.jsx - Retrieved token:", token);
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/school-admin/getClassRoom");
      setClassrooms(res.data.content || []);
    } catch (err) {
      console.error("Error fetching classrooms", err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/classroom/getSubjectByClassRoomId", {
        params: {
          classroomId: selectedClassroom === "ALL" ? null : selectedClassroom,
          page: 0,
          size: 100,
          sortBy: "id",
          sortDir: "asc",
        },
      });
      setSubjects(res.data.content || []);
    } catch (err) {
      console.error("Error fetching subjects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file first");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post("/super-admin/school-onbarding/upload-subjects", formData, {
        params: { classRoomId: selectedClassroom === "ALL" ? null : selectedClassroom },
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Upload Success");
      setShowUpload(false);
      setFile(null);
      fetchSubjects();
    } catch (err) {
      console.error("File cant be uploaded: " + err.message || "Upload failed", err);
      alert("Upload Failed" + (err.message ? ": " + err.message : ""));
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);
  useEffect(() => { fetchSubjects(); }, [selectedClassroom]);

  const selectedLabel = selectedClassroom === "ALL"
    ? "All Classes"
    : (() => {
        const c = classrooms.find((x) => String(x.id) === String(selectedClassroom));
        return c ? `${c.grade} · ${c.section}` : "";
      })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sub-page {
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #F8F9FC;
          min-height: 100vh;
        }

        .sub-main {
          flex: 1;
          padding: 32px 28px;
          overflow-x: auto;
        }

        /* HEADER */
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sub-title-block h1 {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .sub-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 3px;
          font-family: 'DM Mono', monospace;
        }

        .sub-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
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
          min-width: 160px;
        }

        .ctrl-select:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        /* VIEW TOGGLE */
        .view-tabs {
          display: flex;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
        }

        .view-tab {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #64748B;
          transition: all 0.15s;
        }

        .view-tab + .view-tab { border-left: 1.5px solid #E2E8F0; }

        .view-tab.active {
          background: #6366F1;
          color: #fff;
        }

        /* BUTTONS */
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #0F172A;
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }

        .btn-primary:hover { background: #1E293B; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }

        /* FILTER BADGE */
        .filter-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          border: 1.5px solid #C7D2FE;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 13px;
          color: #4338CA;
          font-weight: 600;
          margin-bottom: 16px;
          font-family: 'DM Mono', monospace;
        }

        /* CARD */
        .sub-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          overflow: auto;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
        }

        /* TABLE */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }

        thead {
          background: #F8F9FC;
          border-bottom: 1.5px solid #E2E8F0;
        }

        thead th {
          padding: 13px 14px;
          text-align: left;
          font-weight: 600;
          color: #64748B;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        thead th:last-child { text-align: center; }

        tbody tr {
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.1s;
        }

        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #FAFBFF; }

        tbody td {
          padding: 13px 14px;
          color: #1E293B;
          vertical-align: middle;
        }

        .subject-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 11px;
          border-radius: 8px;
          border: 1.5px solid;
          font-size: 13px;
          font-weight: 700;
        }

        .class-mono {
          font-family: 'DM Mono', monospace;
          font-size: 12.5px;
          color: #475569;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 7px;
          padding: 3px 10px;
          display: inline-block;
        }

        .teacher-cell {
          font-size: 13px;
          color: #1E293B;
        }

        .teacher-none {
          font-size: 12px;
          color: #94A3B8;
          font-style: italic;
        }

        .status-active {
          display: inline-block;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #15803D;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }

        .status-inactive {
          display: inline-block;
          background: #FFF1F2;
          border: 1px solid #FECDD3;
          color: #BE123C;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }

        .action-btns {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .act-btn {
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .act-blue { background:#EFF6FF; border-color:#BFDBFE; color:#1D4ED8; }
        .act-blue:hover { background:#DBEAFE; }

        .act-green { background:#F0FDF4; border-color:#BBF7D0; color:#15803D; }
        .act-green:hover { background:#DCFCE7; }

        .act-red { background:#FFF1F2; border-color:#FECDD3; color:#BE123C; }
        .act-red:hover { background:#FFE4E6; }

        /* GRID */
        .sub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          padding: 20px;
        }

        .sub-grid-card {
          border-radius: 14px;
          border: 1.5px solid;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: default;
        }

        .sub-grid-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.07);
        }

        .grid-subject-name {
          font-size: 15px;
          font-weight: 700;
        }

        .grid-meta {
          font-size: 12px;
          color: #64748B;
          font-family: 'DM Mono', monospace;
        }

        .grid-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        /* LOADING / EMPTY */
        .state-row td {
          padding: 56px;
          text-align: center;
          color: #94A3B8;
          font-size: 14px;
        }

        .spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2px solid #E2E8F0;
          border-top-color: #6366F1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          background: #fff;
          border-radius: 18px;
          border: 1.5px solid #E2E8F0;
          padding: 28px;
          width: 420px;
          max-width: 95vw;
          position: relative;
          box-shadow: 0 20px 60px rgba(15,23,42,0.15);
          animation: slideUp 0.18s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: #F1F5F9;
          border: none;
          border-radius: 8px;
          padding: 5px;
          cursor: pointer;
          color: #64748B;
          display: flex;
          align-items: center;
          transition: background 0.15s;
        }

        .modal-close:hover { background: #E2E8F0; }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 20px;
          padding-right: 32px;
        }

        .modal-body { display: flex; flex-direction: column; gap: 12px; }

        .modal-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .field-group { display: flex; flex-direction: column; gap: 4px; }

        .modal-hint {
          font-size: 11.5px;
          color: #94A3B8;
          margin-top: 2px;
        }

        .upload-area {
          border: 2px dashed #C7D2FE;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          background: #F8F9FF;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .upload-area:hover { border-color: #818CF8; background: #EEF2FF; }

        .upload-icon { font-size: 28px; margin-bottom: 8px; }

        .upload-area input[type="file"] {
          display: none;
        }

        .upload-area label {
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          color: #4338CA;
        }

        .upload-area .upload-hint {
          font-size: 12px;
          color: #94A3B8;
          margin-top: 4px;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F0FDF4;
          border: 1.5px solid #BBF7D0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #15803D;
          font-weight: 500;
          font-family: 'DM Mono', monospace;
          margin-top: 4px;
        }

        .modal-btn {
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: none;
          margin-top: 4px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .modal-btn-green { background: #15803D; color: #fff; }
        .modal-btn-green:hover { background: #166534; }

        .modal-footer-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .modal-btn-cancel {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: #F8F9FC;
          border: 1.5px solid #E2E8F0;
          color: #64748B;
          transition: all 0.15s;
        }

        .modal-btn-cancel:hover { background: #F1F5F9; }

        .modal-btn-upload {
          flex: 2;
          padding: 10px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: #15803D;
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.15s;
        }

        .modal-btn-upload:hover { background: #166534; }

        /* GRID EMPTY */
        .grid-empty {
          grid-column: 1 / -1;
          padding: 64px;
          text-align: center;
          color: #94A3B8;
          font-size: 14px;
        }

        .grid-empty-icon { font-size: 36px; margin-bottom: 10px; }
      `}</style>

      <div className="sub-page">
        <SchoolAdminSidebar />

        <div className="sub-main">

          {/* HEADER */}
          <div className="sub-header">
            <div className="sub-title-block">
              <h1>📚 Subjects</h1>
              <div className="sub-subtitle">View and manage class subjects</div>
            </div>

            <div className="sub-controls">
              {/* CLASS FILTER */}
              <select
                className="ctrl-select"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                <option value="ALL">All Classes</option>
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.grade}{cls.section ? ` – ${cls.section}` : ""}
                  </option>
                ))}
              </select>

              {/* VIEW TOGGLE */}
              <div className="view-tabs">
                <button
                  className={`view-tab ${view === "table" ? "active" : ""}`}
                  onClick={() => setView("table")}
                  title="Table view"
                >
                  <Table size={16} />
                </button>
                <button
                  className={`view-tab ${view === "grid" ? "active" : ""}`}
                  onClick={() => setView("grid")}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              {/* ADD BUTTON */}
              <button className="btn-primary" onClick={() => setShowUpload(true)}>
                <Plus size={15} /> Add Subject
              </button>
            </div>
          </div>

          {/* FILTER BADGE */}
          <div className="filter-badge">
            🏫 {selectedLabel}
            &nbsp;·&nbsp;
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
          </div>

          {/* CONTENT CARD */}
          <div className="sub-card">

            {loading ? (
              view === "grid" ? (
                <div className="sub-grid">
                  <div className="grid-empty">
                    <span className="spinner" /> Loading subjects…
                  </div>
                </div>
              ) : (
                <table>
                  <tbody>
                    <tr className="state-row">
                      <td colSpan={5}>
                        <span className="spinner" /> Loading subjects…
                      </td>
                    </tr>
                  </tbody>
                </table>
              )
            ) : view === "table" ? (

              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr className="state-row">
                      <td colSpan={5}>
                        <div style={{ fontSize: 34, marginBottom: 10 }}>📭</div>
                        <div>No subjects found for this class.</div>
                      </td>
                    </tr>
                  ) : (
                    subjects.map((sub) => {
                      const color = getColor(sub.subjectName);
                      return (
                        <tr key={sub.id}>
                          <td>
                            <span
                              className="subject-chip"
                              style={{ background: color.bg, borderColor: color.border, color: color.text }}
                            >
                              {sub.subjectName}
                            </span>
                          </td>
                          <td><span className="class-mono">{sub.className}</span></td>
                          <td>
                            {sub.teacherName
                              ? <span className="teacher-cell">{sub.teacherName}</span>
                              : <span className="teacher-none">Not Assigned</span>
                            }
                          </td>
                          <td>
                            {sub.active
                              ? <span className="status-active">● Active</span>
                              : <span className="status-inactive">● Inactive</span>
                            }
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="act-btn act-blue">Edit</button>
                              <button className="act-btn act-green">Assign Teacher</button>
                              <button className="act-btn act-red">Disable</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

            ) : (

              <div className="sub-grid">
                {subjects.length === 0 ? (
                  <div className="grid-empty">
                    <div className="grid-empty-icon">📭</div>
                    <div>No subjects found for this class.</div>
                  </div>
                ) : (
                  subjects.map((sub) => {
                    const color = getColor(sub.subjectName);
                    return (
                      <div
                        key={sub.id}
                        className="sub-grid-card"
                        style={{ background: color.bg, borderColor: color.border }}
                      >
                        <div className="grid-subject-name" style={{ color: color.text }}>
                          {sub.subjectName}
                        </div>
                        <div className="grid-meta">🏫 {sub.className}</div>
                        <div className="grid-meta">
                          👩‍🏫 {sub.teacherName || "Not Assigned"}
                        </div>
                        <div>
                          {sub.active
                            ? <span className="status-active">● Active</span>
                            : <span className="status-inactive">● Inactive</span>
                          }
                        </div>
                        <div className="grid-actions">
                          <button className="act-btn act-blue">Edit</button>
                          <button className="act-btn act-green">Assign</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            )}
          </div>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowUpload(false)}>
              <X size={16} />
            </button>
            <div className="modal-title">📤 Upload Subjects</div>

            <div className="modal-body">
              <div className="field-group">
                <div className="modal-label">Excel File</div>

                <div className="upload-area" onClick={() => document.getElementById("sub-file-input").click()}>
                  <div className="upload-icon">📊</div>
                  <input
                    id="sub-file-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="sub-file-input">
                    {file ? file.name : "Click to choose file"}
                  </label>
                  <div className="upload-hint">.xlsx or .xls only</div>
                </div>

                {file && (
                  <div className="file-selected">
                    ✅ {file.name}
                  </div>
                )}
              </div>

              <div className="modal-footer-row">
                <button className="modal-btn-cancel" onClick={() => { setShowUpload(false); setFile(null); }}>
                  Cancel
                </button>
                <button className="modal-btn-upload" onClick={handleUpload}>
                  <Upload size={15} /> Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { Plus, LayoutGrid, Table, Upload } from "lucide-react";
// import API from "../../common/services/api";

// export default function Subjects() {
//   const [view, setView] = useState("table");
//   const [showUpload, setShowUpload] = useState(false);
//   const [file, setFile] = useState(null);

//   const [classrooms, setClassrooms] = useState([]);
//   const [selectedClassroom, setSelectedClassroom] = useState("ALL");

//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     console.log("Subjects.jsx - Retrieved token:", token);
//     fetchClassrooms();
//   }
//   , []);

//   // ✅ FETCH CLASSROOMS
//    const fetchClassrooms = async () => {
//   try {
//     const res = await API.get("/school-admin/getClassRoom");

//     console.log("Fetched classrooms:", res.data);

//     setClassrooms(res.data.content || []); // ✅ FIXED

//   } catch (err) {
//     console.error("Error fetching classrooms", err);
//   }
// };

//   // ✅ FETCH SUBJECTS
//   const fetchSubjects = async () => {
//     setLoading(true);
//     try {
//       console.log("Fetching subjects for classroom:", selectedClassroom);
//       const res = await API.get("/classroom/getSubjectByClassRoomId", {
//       params: {
//         classroomId: selectedClassroom === "ALL" ? null : selectedClassroom,
//         page: 0,
//         size: 10,
//         sortBy: "id",
//         sortDir: "asc",
//       },
//     });
//       setSubjects(res.data.content || []);
//     } catch (err) {
//       console.error("Error fetching subjects", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ FILE UPLOAD
//   const handleUpload = async () => {
//     if (!file) return alert("Select file first");

//     const formData = new FormData();
//     formData.append("file", file);
//       // classroomId = selectedClassroom === "ALL" ? null : selectedClassroom;
     
    
//     try {
//       await API.post("/super-admin/school-onbarding/upload-subjects", formData,{params: {
//         classRoomId: selectedClassroom === "ALL" ? null : selectedClassroom,
//       },
//         headers : { "Content-Type": "multipart/form-data" }
//     }); 
      
//       console.log("Upload successful");
//       alert("Upload Success");
//       setShowUpload(false);
//       setFile(null);

//       fetchSubjects(); // refresh data
//     } catch (err) {
//       console.error("File cant be uploaded: " + err.message || "Upload failed", err);
//       alert("Upload Failed" + (err.message ? ": " + err.message : ""));
//     }
//   };

//   // ✅ LOAD DATA
//   useEffect(() => {
//     fetchClassrooms();
//   }, []);

//   useEffect(() => {
//     fetchSubjects();
//   }, [selectedClassroom]);

//   return (
//     <div className="flex">
//       <SchoolAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Subjects</h1>

//           <div className="flex gap-3 items-center">

//             {/* CLASS FILTER */}
//             <select
//               value={selectedClassroom}
//               onChange={(e) => setSelectedClassroom(e.target.value)}
//               className="border px-3 py-2 rounded"
//             >
//               <option value="ALL">All Classes</option>

//               {classrooms.map((cls) => (
//                 <option key={cls.id} value={cls.id}>
//                   Class {cls.grade} {cls.section ? `- ${cls.section}` : ""}
//                 </option>
//               ))}
//             </select>

//             {/* VIEW TOGGLE */}
//             <div className="flex bg-white rounded shadow-sm">
//               <button
//                 onClick={() => setView("table")}
//                 className={`p-2 ${
//                   view === "table" ? "bg-blue-500 text-white" : ""
//                 }`}
//               >
//                 <Table size={18} />
//               </button>

//               <button
//                 onClick={() => setView("grid")}
//                 className={`p-2 ${
//                   view === "grid" ? "bg-blue-500 text-white" : ""
//                 }`}
//               >
//                 <LayoutGrid size={18} />
//               </button>
//             </div>

//             {/* ADD BUTTON */}
//             <button
//               onClick={() => setShowUpload(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"
//             >
//               <Plus size={16} /> Add Subject
//             </button>
//           </div>
//         </div>

//         {/* UPLOAD MODAL */}
//         {showUpload && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
//             <div className="bg-white p-6 rounded-lg w-[400px]">
//               <h2 className="text-lg font-bold mb-4">Upload Excel</h2>

//               <input
//                 type="file"
//                 accept=".xlsx,.xls"
//                 onChange={(e) => setFile(e.target.files[0])}
//                 className="mb-4"
//               />

//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setShowUpload(false)}
//                   className="px-3 py-1 border rounded"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={handleUpload}
//                   className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"
//                 >
//                   <Upload size={16} /> Upload
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* CONTENT */}
//         <div className="bg-white rounded shadow">

//           {loading ? (
//             <p className="p-4">Loading...</p>
//           ) : view === "table" ? (

//             <table className="w-full text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-3">Subject</th>
//                   <th className="p-3">Class</th>
//                   <th className="p-3">Teacher</th>
//                   <th className="p-3">Status</th>
//                   <th className="p-3">Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {subjects.map((sub) => (
//                   <tr key={sub.id} className="border-t">
//                     <td className="p-3">{sub.subjectName}</td>
//                     <td className="p-3">{sub.className}</td>
//                     <td className="p-3">
//                       {sub.teacherName || "Not Assigned"}
//                     </td>
//                     <td className="p-3">
//                       {sub.active ? "Active" : "Inactive"}
//                     </td>
//                     <td className="p-3 flex gap-2">
//                       <button className="text-blue-600">Edit</button>
//                       <button className="text-green-600">
//                         Assign Teacher
//                       </button>
//                       <button className="text-red-600">Disable</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//           ) : (

//             <div className="grid grid-cols-3 gap-4 p-4">
//               {subjects.map((sub) => (
//                 <div key={sub.id} className="border p-4 rounded">
//                   <h3 className="font-bold">{sub.subjectName}</h3>
//                   <p>Class: {sub.className}</p>
//                   <p>
//                     Teacher: {sub.teacherName || "Not Assigned"}
//                   </p>

//                   <div className="flex gap-2 mt-2">
//                     <button className="text-blue-600">Edit</button>
//                     <button className="text-green-600">Assign</button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//           )}
//         </div>
//       </div>
//     </div>
//   );
// }