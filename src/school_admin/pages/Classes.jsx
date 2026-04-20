import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, X } from "lucide-react";
import API from "../../common/services/api";
import "../styles/Classes.css"; // Importing CSS for styling

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

  useEffect(() => {
    loadClasses();
  }, [page]);

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
    if (!excelFile) {
      alert("Please select a file");
      return;
    }
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
      <div className="cls-page">
        <SchoolAdminSidebar />

        <div className="cls-main">
          {/* HEADER */}
          <div className="cls-header">
            <div className="cls-title-block">
              <h1>🏫 Classes</h1>
              <div className="cls-subtitle">
                Manage classrooms &amp; assignments
              </div>
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
                    <td
                      colSpan={4}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: "#94A3B8",
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <div style={{ fontSize: 14 }}>
                        No classes found. Add one to get started.
                      </div>
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="grade-badge">{c.grade}</span>
                      </td>
                      <td>
                        <span className="section-badge">{c.section}</span>
                      </td>

                      <td>
                        {c.classTeacher ? (
                          <div className="teacher-assigned">
                            <span className="tag-green">✓ Class Teacher</span>
                            <div className="teacher-meta">
                              {c.classTeacher.employeeId} ·{" "}
                              {c.classTeacher.subjectSpecialization}
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

            <span className="page-info">
              Page {page + 1} of {totalPages || 1}
            </span>

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
            <button
              className="modal-close"
              onClick={() => setShowClassModal(false)}
            >
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
              <button
                className="modal-btn modal-btn-blue"
                onClick={createClass}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="modal-close"
              onClick={() => setShowTeacherModal(false)}
            >
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
              <button
                className="modal-btn modal-btn-green"
                onClick={assignTeacher}
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="modal-close"
              onClick={() => setShowStudentModal(false)}
            >
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
                <div className="modal-label">
                  Select Students (hold Ctrl / Cmd for multiple)
                </div>
                <select
                  multiple
                  className="modal-input"
                  onChange={(e) =>
                    setSelectedStudents(
                      [...e.target.selectedOptions].map((o) => o.value),
                    )
                  }
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="modal-btn modal-btn-purple"
                onClick={addStudents}
              >
                Add Students
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="modal-close"
              onClick={() => setShowBulkModal(false)}
            >
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
              <button
                className="modal-btn modal-btn-purple"
                onClick={uploadExcel}
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
