import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, X } from "lucide-react";
import API from "../../common/services/api";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const schoolId = localStorage.getItem("schoolId");

  const [showClassModal, setShowClassModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DATA =================
  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await API.get(`school-admin/getClassRoom`, {
        params: { page, size: 10 },
      });
      setClasses(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    const res = await API.get("/school-admin/getTeacherDetails");
    setTeachers(res.data.content || []);
  };

  const loadStudents = async () => {
    const res = await API.get("/school-admin/getStudentDetails");
    setStudents(res.data.content || []);
  };

  useEffect(() => { loadClasses(); }, [page]);

  // ================= ACTIONS =================
  const createClass = async () => {
    await API.post("/school-admin/createClassRoom", { grade, section });
    setShowClassModal(false);
    setGrade("");
    setSection("");
    loadClasses();
  };

  const assignTeacher = async () => {
    await API.patch("/school-admin/Adding-classTeacher", {
      classRomeId: selectedClassId,
      userId: selectedTeacher,
    });
    setShowTeacherModal(false);
    loadClasses();
  };

  const addStudents = async () => {
    await API.post("/school-admin/addStudentsToClass", {
      classId: selectedClassId,
      studentIds: selectedStudents,
    });
    setShowStudentModal(false);
  };

  const uploadExcel = async () => {
    if (!excelFile) { alert("Please select a file"); return; }
    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("schoolId", schoolId);
    try {
      await API.post(`/super-admin/school-onbarding/upload-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Excel uploaded successfully 🚀");
      setShowBulkModal(false);
      setExcelFile(null);
      loadClasses();
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // ================= UI =================
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cls-page {
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #F8F9FC;
          min-height: 100vh;
        }

        .cls-main {
          flex: 1;
          padding: 32px 28px;
          overflow-x: auto;
        }

        /* HEADER */
        .cls-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .cls-title-block h1 {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .cls-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 3px;
          font-family: 'DM Mono', monospace;
        }

        .cls-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          color: #4338CA;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-outline:hover {
          background: #EEF2FF;
          border-color: #A5B4FC;
        }

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

        /* CARD / TABLE */
        .cls-card {
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

        .grade-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          border: 1.5px solid #C7D2FE;
          border-radius: 8px;
          padding: 4px 11px;
          font-size: 13px;
          color: #4338CA;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          padding: 4px 11px;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
          font-family: 'DM Mono', monospace;
        }

        .teacher-assigned {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tag-green {
          display: inline-block;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #15803D;
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }

        .tag-red {
          display: inline-block;
          background: #FFF1F2;
          border: 1px solid #FECDD3;
          color: #BE123C;
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }

        .teacher-meta {
          font-size: 12px;
          color: #64748B;
          font-family: 'DM Mono', monospace;
          margin-top: 3px;
        }

        .action-btns {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .act-btn {
          padding: 6px 13px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .act-btn-green {
          background: #F0FDF4;
          border-color: #BBF7D0;
          color: #15803D;
        }

        .act-btn-green:hover {
          background: #DCFCE7;
          border-color: #86EFAC;
        }

        .act-btn-purple {
          background: #FAF5FF;
          border-color: #E9D5FF;
          color: #7E22CE;
        }

        .act-btn-purple:hover {
          background: #F3E8FF;
          border-color: #D8B4FE;
        }

        /* LOADING */
        .loading-row td {
          padding: 48px;
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

        /* PAGINATION */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
        }

        .page-info {
          font-size: 13px;
          color: #64748B;
          font-family: 'DM Mono', monospace;
        }

        .page-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          color: #1E293B;
          transition: all 0.15s;
        }

        .page-btn:hover:not(:disabled) {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* MODAL OVERLAY */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
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

        .modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
          color: #4338CA;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-family: 'DM Mono', monospace;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .modal-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1E293B;
          background: #F8F9FC;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }

        .modal-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          background: #fff;
        }

        .modal-input[multiple] { height: 140px; }

        .modal-input[type="file"] {
          padding: 8px 12px;
          cursor: pointer;
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
        }

        .modal-btn-blue {
          background: #0F172A;
          color: #fff;
        }

        .modal-btn-blue:hover { background: #1E293B; }

        .modal-btn-green {
          background: #15803D;
          color: #fff;
        }

        .modal-btn-green:hover { background: #166534; }

        .modal-btn-purple {
          background: #7E22CE;
          color: #fff;
        }

        .modal-btn-purple:hover { background: #6B21A8; }

        .field-group { display: flex; flex-direction: column; gap: 4px; }
      `}</style>

      <div className="cls-page">
        <SchoolAdminSidebar />

        <div className="cls-main">

          {/* HEADER */}
          <div className="cls-header">
            <div className="cls-title-block">
              <h1>🏫 Classes</h1>
              <div className="cls-subtitle">Manage classrooms &amp; assignments</div>
            </div>

            <div className="cls-actions">
              <button
                className="btn-outline"
                onClick={() => setShowBulkModal(true)}
              >
                <Plus size={15} /> Bulk Add Classes
              </button>

              <button
                className="btn-primary"
                onClick={() => setShowClassModal(true)}
              >
                <Plus size={15} /> Add Class
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="cls-card">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Class Teacher</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr className="loading-row">
                    <td colSpan={4}>
                      <span className="spinner" />
                      Loading classes…
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <div style={{ fontSize: 14 }}>No classes found. Add one to get started.</div>
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => (
                    <tr key={c.id}>
                      <td><span className="grade-badge">{c.grade}</span></td>
                      <td><span className="section-badge">{c.section}</span></td>

                      <td>
                        {c.classTeacher ? (
                          <div className="teacher-assigned">
                            <span className="tag-green">✓ Class Teacher</span>
                            <div className="teacher-meta">
                              {c.classTeacher.employeeId} · {c.classTeacher.subjectSpecialization}
                            </div>
                          </div>
                        ) : (
                          <span className="tag-red">⚠ Not Assigned</span>
                        )}
                      </td>

                      <td>
                        <div className="action-btns">
                          <button
                            className="act-btn act-btn-green"
                            onClick={() => {
                              setSelectedClassId(c.id);
                              loadTeachers();
                              setShowTeacherModal(true);
                            }}
                          >
                            Assign Teacher
                          </button>

                          <button
                            className="act-btn act-btn-purple"
                            onClick={() => {
                              setSelectedClassId(c.id);
                              loadStudents();
                              setShowStudentModal(true);
                            }}
                          >
                            Add Students
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Prev
            </button>

            <span className="page-info">Page {page + 1} of {totalPages || 1}</span>

            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>

        </div>
      </div>

      {/* ===== MODALS ===== */}

      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowClassModal(false)}>
              <X size={16} />
            </button>
            <div className="modal-title">➕ Add New Class</div>
            <div className="modal-body">
              <div className="field-group">
                <div className="modal-label">Grade</div>
                <input
                  className="modal-input"
                  placeholder="e.g. LKG, Grade 5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div className="field-group">
                <div className="modal-label">Section</div>
                <input
                  className="modal-input"
                  placeholder="e.g. A, B"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>
              <button className="modal-btn modal-btn-blue" onClick={createClass}>
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowTeacherModal(false)}>
              <X size={16} />
            </button>
            <div className="modal-title">👩‍🏫 Assign Class Teacher</div>
            {selectedClass && (
              <div className="modal-badge">
                {selectedClass.grade} · Section {selectedClass.section}
              </div>
            )}
            <div className="modal-body">
              <div className="field-group">
                <div className="modal-label">Select Teacher</div>
                <select
                  className="modal-input"
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">— Choose a teacher —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.userName} · {t.subjectSpecialization}
                    </option>
                  ))}
                </select>
              </div>
              <button className="modal-btn modal-btn-green" onClick={assignTeacher}>
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowStudentModal(false)}>
              <X size={16} />
            </button>
            <div className="modal-title">🎒 Add Students to Class</div>
            {selectedClass && (
              <div className="modal-badge">
                {selectedClass.grade} · Section {selectedClass.section}
              </div>
            )}
            <div className="modal-body">
              <div className="field-group">
                <div className="modal-label">Select Students (hold Ctrl / Cmd for multiple)</div>
                <select
                  multiple
                  className="modal-input"
                  onChange={(e) =>
                    setSelectedStudents([...e.target.selectedOptions].map((o) => o.value))
                  }
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button className="modal-btn modal-btn-purple" onClick={addStudents}>
                Add Students
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowBulkModal(false)}>
              <X size={16} />
            </button>
            <div className="modal-title">📤 Bulk Upload Classes</div>
            <div className="modal-body">
              <div className="field-group">
                <div className="modal-label">Excel File (.xlsx / .xls)</div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="modal-input"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                />
              </div>
              <button className="modal-btn modal-btn-purple" onClick={uploadExcel}>
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { Plus, X } from "lucide-react";
// import API from "../../common/services/api";

// export default function Classes() {
//   const [classes, setClasses] = useState([]);
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const schoolId = localStorage.getItem("schoolId");

//   const [showClassModal, setShowClassModal] = useState(false);
//   const [showTeacherModal, setShowTeacherModal] = useState(false);
//   const [showStudentModal, setShowStudentModal] = useState(false);
//   const [showBulkModal, setShowBulkModal] = useState(false);

//   const [selectedClassId, setSelectedClassId] = useState(null);

//   const [grade, setGrade] = useState("");
//   const [section, setSection] = useState("");

//   const [teachers, setTeachers] = useState([]);
//   const [students, setStudents] = useState([]);

//   const [selectedTeacher, setSelectedTeacher] = useState("");
//   const [selectedStudents, setSelectedStudents] = useState([]);

//   const [excelFile, setExcelFile] = useState(null);

//   // ================= LOAD DATA =================
//   const loadClasses = async () => {
//     try {
//       const res = await API.get(`school-admin/getClassRoom`, {
//         params: { page, size: 10 }
//       });
//       console.log("Classes API response:", res.data.content); // DEBUG LOG
//       setClasses(res.data.content || []);
//       setTotalPages(res.data.totalPages || 0);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadTeachers = async () => {
//     const res = await API.get("/school-admin/getTeacherDetails");
//     console.log("Teachers API response:", res.data); // DEBUG LOG
//     setTeachers(res.data.content || []);
//   };

//   const loadStudents = async () => {
//     const res = await API.get("/school-admin/getStudentDetails");
//     console.log("Students API response:", res.data); // DEBUG LOG
//     setStudents(res.data.content || []);
//   };

//   useEffect(() => {
//     loadClasses();
//   }, [page]);

//   // ================= ACTIONS =================
//   const createClass = async () => {
//     await API.post("/school-admin/createClassRoom", { grade, section });
//     console.log("Class created with grade:", grade, "and section:", section); // DEBUG LOG
//     setShowClassModal(false);
//     setGrade("");
//     setSection("");
//     loadClasses();
//   };

//   const assignTeacher = async () => {
//     await API.patch("/school-admin/Adding-classTeacher", {
//       classRomeId: selectedClassId,
//       userId: selectedTeacher
//     });
//     console.log("Assigned teacher ID:", selectedTeacher, "to class ID:", selectedClassId); // DEBUG LOG

//     setShowTeacherModal(false);
//     loadClasses();
//   };

//   const addStudents = async () => {
//     await API.post("/school-admin/addStudentsToClass", {
//       classId: selectedClassId,
//       studentIds: selectedStudents
//     });
//     console.log("Students added to class ID:", selectedClassId); // DEBUG LOG
//     setShowStudentModal(false);
//   };

//   const uploadExcel = async () => {
//     if (!excelFile) {
//       alert("Please select a file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", excelFile);
//     formData.append("schoolId", schoolId);

//     try {
//       await API.post(`/super-admin/school-onbarding/upload-excel`, formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       console.log("Excel file uploaded successfully"); // DEBUG LOG
//       alert("Excel uploaded successfully 🚀");
//       setShowBulkModal(false);
//       setExcelFile(null);
//       loadClasses();
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed ❌");
//     }
//   };

//   // ================= UI =================
//   return (
//     <div className="flex">
//       <SchoolAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">Classes</h1>
//             <p className="text-sm text-gray-500">Manage classrooms</p>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowBulkModal(true)}
//               className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <Plus size={16} /> Bulk Add Classes
//             </button>

//             <button
//               onClick={() => setShowClassModal(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <Plus size={16} /> Add Class
//             </button>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded shadow">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3">Class</th>
//                 <th className="p-3">Section</th>
//                 <th className="p-3">Teacher</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {classes.map((c) => (
//                 <tr key={c.id} className="border-t">
//                   <td className="p-3">{c.grade}</td>
//                   <td className="p-3">{c.section}</td>

//                   {/* ✅ UPDATED TEACHER COLUMN */}
//                   <td className="p-3">
//                     {c.classTeacher ? (
//                       <div>
//                         <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
//                           Class Teacher
//                         </span>
//                         <div className="text-sm mt-1">
//                           {c.classTeacher.employeeId} ({c.classTeacher.subjectSpecialization})
//                         </div>
//                       </div>
//                     ) : (
//                       <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
//                         Not Assigned
//                       </span>
//                     )}
//                   </td>

//                   <td className="p-3 text-center">
//                     <div className="flex justify-center gap-4">
//                       <button
//                         onClick={() => {
//                           setSelectedClassId(c.id);
//                           loadTeachers();
//                           setShowTeacherModal(true);
//                         }}
//                         className="text-green-600"
//                       >
//                         Assign Teacher
//                       </button>

//                       <button
//                         onClick={() => {
//                           setSelectedClassId(c.id);
//                           loadStudents();
//                           setShowStudentModal(true);
//                         }}
//                         className="text-purple-600"
//                       >
//                         Add Students
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* PAGINATION */}
//         <div className="flex justify-between mt-4">
//           <button
//             disabled={page === 0}
//             onClick={() => setPage(page - 1)}
//             className="bg-gray-200 px-4 py-2 rounded"
//           >
//             Prev
//           </button>

//           <button
//             disabled={page === totalPages - 1}
//             onClick={() => setPage(page + 1)}
//             className="bg-gray-200 px-4 py-2 rounded"
//           >
//             Next
//           </button>
//         </div>

//         {/* MODALS */}
//         {showClassModal && (
//           <Modal onClose={() => setShowClassModal(false)} title="Add Class">
//             <input
//               placeholder="Grade"
//               value={grade}
//               onChange={(e) => setGrade(e.target.value)}
//               className="input"
//             />
//             <input
//               placeholder="Section"
//               value={section}
//               onChange={(e) => setSection(e.target.value)}
//               className="input"
//             />
//             <button onClick={createClass} className="btn-blue">
//               Create
//             </button>
//           </Modal>
//         )}

//         {showTeacherModal && (
//           <Modal onClose={() => setShowTeacherModal(false)} title="Assign Teacher">
//             <select
//               onChange={(e) => {
//                 setSelectedTeacher(e.target.value);
//                 console.log("Selected teacher ID:", e.target.value);
//               }}
//               className="input"
//             >
//               <option>Select Teacher</option>
//               {teachers.map((t) => (
//                 <option key={t.id} value={t.id}>
//                   {t.userName} - {t.subjectSpecialization}
//                 </option>
//               ))}
//             </select>
//             <button onClick={assignTeacher} className="btn-green">
//               Save
//             </button>
//           </Modal>
//         )}

//         {showStudentModal && (
//           <Modal onClose={() => setShowStudentModal(false)} title="Add Students">
//             <select
//               multiple
//               onChange={(e) =>
//                 setSelectedStudents(
//                   [...e.target.selectedOptions].map((o) => o.value)
//                 )
//               }
//               className="input h-40"
//             >
//               {students.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.name}
//                 </option>
//               ))}
//             </select>
//             <button onClick={addStudents} className="btn-purple">
//               Add Students
//             </button>
//           </Modal>
//         )}

//         {showBulkModal && (
//           <Modal onClose={() => setShowBulkModal(false)} title="Bulk Upload Classes">
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={(e) => setExcelFile(e.target.files[0])}
//               className="input"
//             />
//             <button onClick={uploadExcel} className="btn-purple">
//               Upload
//             </button>
//           </Modal>
//         )}
//       </div>
//     </div>
//   );
// }

// // ================= MODAL =================
// function Modal({ children, onClose, title }) {
//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
//       <div className="bg-white p-6 rounded w-96 relative">

//         <button onClick={onClose} className="absolute top-2 right-2">
//           <X />
//         </button>

//         <h2 className="mb-4 font-semibold">{title}</h2>

//         <div className="flex flex-col gap-3">{children}</div>
//       </div>
//     </div>
//   );
// }