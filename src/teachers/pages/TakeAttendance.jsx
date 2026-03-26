import { useEffect, useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { getClassrooms, getStudentsByClassroom } from "../../common/services/api"; // ✅ FIXED IMPORT

export default function TakeAttendance() {

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // 🔹 Fetch Classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const data = await getClassrooms();
        setClassrooms(data?.content || []);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };

    fetchClassrooms();
  }, []);

  // 🔹 Handle Classroom Change
  const handleClassroomChange = async (e) => {
    const classroomId = e.target.value;
    setSelectedClassroomId(classroomId);

    // 🔥 Reset states (important)
    setSelectedSubject("");
    setStudents([]);
    setSubjects([]);

    const selectedClassroom = classrooms.find(
      (c) => c.id === Number(classroomId)
    );

    if (selectedClassroom) {
      setSubjects(selectedClassroom.subjects || []);
    }

    // 🔥 Fetch Students
    try {
      const data = await getStudentsByClassroom(classroomId);

      const formattedStudents = (data || []).map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        status: "Present",
      }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // 🔹 Toggle Attendance
  const toggleStatus = (id, status) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    setStudents(updated);
  };

  // 🔹 Save Attendance
  const handleSave = () => {
    if (!selectedClassroomId || !selectedSubject) {
      alert("Please select classroom and subject ⚠️");
      return;
    }

    console.log("Attendance Saved:", {
      classroomId: selectedClassroomId,
      subject: selectedSubject,
      students,
    });

    alert("Attendance Saved Successfully ✅");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <TeacherSidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Take Attendance
          </h2>

          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Save Attendance
          </button>
        </div>

        {/* DROPDOWNS */}
        <div className="flex gap-4 mb-6">

          {/* CLASSROOM */}
          <select
            value={selectedClassroomId}
            onChange={handleClassroomChange}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Select Classroom</option>
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.grade} - {cls.section}
              </option>
            ))}
          </select>

          {/* SUBJECT */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.subjectName}>
                {sub.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-auto max-h-[65vh]">
            <table className="w-full text-sm">

              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Present</th>
                  <th className="p-3 text-center">Absent</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        {student.name}
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === "Present"}
                          onChange={() =>
                            toggleStatus(student.id, "Present")
                          }
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === "Absent"}
                          onChange={() =>
                            toggleStatus(student.id, "Absent")
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}