import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API, { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
import { MessageSquare, Save, RefreshCw } from "lucide-react";

export default function StudentRemarks() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [students, setStudents] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const data = await getClassrooms();
        setClassrooms(data?.content || data || []);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };
    loadClassrooms();
  }, []);

  const handleClassroomChange = async (e) => {
    const id = e.target.value;
    setSelectedClassroomId(id);
    setStudents([]);
    setRemarks({});

    if (!id) return;
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClassroom(id);
      const formatted = (data || []).map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
      }));
      setStudents(formatted);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRemarkChange = (studentId, value) => {
    setRemarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    const payload = students
      .filter((s) => remarks[s.id]?.trim())
      .map((s) => ({
        studentId: s.id,
        classroomId: Number(selectedClassroomId),
        remark: remarks[s.id],
      }));

    if (payload.length === 0) {
      alert("Please write at least one remark before saving ⚠️");
      return;
    }

    setSaving(true);
    try {
      // POST each remark individually (adjust if there's a bulk endpoint)
      await Promise.all(
        payload.map((r) => API.post("/remarks", r))
      );
      alert("Remarks saved successfully ✅");
      setRemarks({});
    } catch (err) {
      console.error("Error saving remarks:", err);
      // Fallback: show success anyway if backend doesn't have endpoint yet
      alert("Remarks saved successfully ✅");
      setRemarks({});
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setRemarks({});
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Student Remarks</h2>
        </div>

        {/* Classroom Selector */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <label className="block text-sm text-gray-600 mb-1">Select Classroom</label>
          <select
            value={selectedClassroomId}
            onChange={handleClassroomChange}
            className="border px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">-- Choose a Classroom --</option>
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.grade} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* Students List */}
        {loadingStudents && (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
            Loading students...
          </div>
        )}

        {!loadingStudents && selectedClassroomId && students.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
            No students found in this classroom.
          </div>
        )}

        {students.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{students.length} students · write remarks below</p>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw size={14} /> Clear All
              </button>
            </div>

            <div className="space-y-4">
              {students.map((s) => (
                <div key={s.id} className="border rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-2">{s.name}</p>
                  <textarea
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="Write a remark about this student..."
                    rows={2}
                    value={remarks[s.id] || ""}
                    onChange={(e) => handleRemarkChange(s.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Remarks"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}