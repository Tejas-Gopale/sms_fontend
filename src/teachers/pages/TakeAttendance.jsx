import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function TakeAttendance() {

  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedSubject, setSelectedSubject] = useState("Math");

  const classes = ["10-A", "10-B", "9-A"];
  const subjects = ["Math", "Science", "English"];

  const [students, setStudents] = useState([
    { id: 1, name: "Rahul Sharma", status: "Present" },
    { id: 2, name: "Priya Patel", status: "Present" },
    { id: 3, name: "Amit Verma", status: "Absent" },
    { id: 4, name: "Sneha Iyer", status: "Present" },
  ]);

  const toggleStatus = (id, status) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    setStudents(updated);
  };

  const handleSave = () => {
    console.log("Attendance Saved:", {
      class: selectedClass,
      subject: selectedSubject,
      students
    });
    alert("Attendance Saved Successfully ✅");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <TeacherSidebar />

      {/* MAIN CONTENT */}
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

        {/* SELECTORS */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            {classes.map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            {subjects.map((sub) => (
              <option key={sub}>{sub}</option>
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
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">
                      {student.name}
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        checked={student.status === "Present"}
                        onChange={() => toggleStatus(student.id, "Present")}
                      />
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        checked={student.status === "Absent"}
                        onChange={() => toggleStatus(student.id, "Absent")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}