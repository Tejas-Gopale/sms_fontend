import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, X } from "lucide-react";
import API from "../../common/services/api";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showClassModal, setShowClassModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/school-admin/getClassRoom", {
        params: { page, size: 10 }
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
  setTeachers(res.data.content || []); // ✅ FIXED
  };

  const loadStudents = async () => {
    const res = await API.get("/school-admin/getStudentDetails");
    setStudents(res.data.content || []);
  };

  useEffect(() => {
    loadClasses();
  }, [page]);

  const createClass = async () => {
    await API.post("/school-admin/createClassRoom", { grade, section });
    setShowClassModal(false);
    loadClasses();
  };

  const assignTeacher = async () => {
    await API.put("/api/v1/school-admin/getTeacherDetails", {
      classId: selectedClassId,
      teacherId: selectedTeacher
    });
    setShowTeacherModal(false);
    loadClasses();
  };

  const addStudents = async () => {
    await API.post("/school-admin/addStudentsToClass", {
      classId: selectedClassId,
      studentIds: selectedStudents
    });
    setShowStudentModal(false);
  };

  return (
    <div className="flex">
      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-sm text-gray-500">Manage classrooms</p>
          </div>

          <button
            onClick={() => setShowClassModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
          >
            <Plus size={16} /> Add Class
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600">
                <th className="p-3">Class</th>
                <th className="p-3">Section</th>
                <th className="p-3">Teacher</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{c.grade}</td>
                  <td className="p-3">{c.section}</td>
                  <td className="p-3">
                    {c.classTeacher?.employeeId || "Not Assigned"}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedClassId(c.id);
                          loadTeachers();
                          setShowTeacherModal(true);
                        }}
                        className="text-green-600 hover:underline"
                      >
                        Assign Teacher
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClassId(c.id);
                          loadStudents();
                          setShowStudentModal(true);
                        }}
                        className="text-purple-600 hover:underline"
                      >
                        Add Students
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* ADD CLASS MODAL */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-96 relative animate-fadeIn">
              <button
                onClick={() => setShowClassModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X />
              </button>

              <h2 className="text-lg mb-4">Add Class</h2>

              <input
                placeholder="Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border p-2 mb-2 rounded"
              />

              <input
                placeholder="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full border p-2 mb-4 rounded"
              />

              <button
                onClick={createClass}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* TEACHER MODAL */}
        {showTeacherModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-96 relative animate-fadeIn">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X />
              </button>

              <h2 className="mb-4 font-semibold">Assign Class Teacher</h2>

              <select
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option>Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.employeeId} - {t.subjectSpecialization}
                  </option>
                ))}
              </select>

              <button
                onClick={assignTeacher}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* STUDENT MODAL */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[420px] relative animate-fadeIn">
              <button
                onClick={() => setShowStudentModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X />
              </button>

              <h2 className="mb-4 font-semibold">Add Students</h2>

              <p className="text-xs text-gray-500 mb-2">Select multiple students (Bulk Add)</p>

              <select
                multiple
                onChange={(e) =>
                  setSelectedStudents(
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
                className="w-full border p-2 h-40 rounded"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button
                onClick={addStudents}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded w-full"
              >
                Add Students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
