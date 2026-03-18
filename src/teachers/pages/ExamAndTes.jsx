import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function TeacherExam() {

  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [examName, setExamName] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);

  const classes = ["10-A", "10-B"];
  const subjects = ["Math", "Science"];

  // ✅ Dummy students
  const [students, setStudents] = useState([
    { id: 1, name: "Rahul Sharma", marks: "" },
    { id: 2, name: "Priya Patel", marks: "" },
    { id: 3, name: "Amit Verma", marks: "" },
  ]);

  // ✅ Handle Marks Change
  const handleMarksChange = (id, value) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, marks: value } : s
    );
    setStudents(updated);
  };

  // ✅ Save Exam
  const handleSave = () => {
    console.log({
      examName,
      selectedClass,
      selectedSubject,
      maxMarks,
      students
    });

    alert("Exam & Marks Saved ✅");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <TeacherSidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <h2 className="text-2xl font-bold mb-6">
          Create Test / Exam
        </h2>

        {/* EXAM FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <div className="grid grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Exam Name (Unit Test)"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="Max Marks"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

          </div>

        </div>

        {/* MARKS ENTRY TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-auto max-h-[60vh]">

            <table className="w-full text-sm">

              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 text-left">Student Name</th>
                  <th className="p-3 text-center">Marks</th>
                </tr>
              </thead>

              <tbody>

                {students.map((s) => (

                  <tr key={s.id} className="border-t">

                    <td className="p-3">{s.name}</td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={s.marks}
                        onChange={(e) =>
                          handleMarksChange(s.id, e.target.value)
                        }
                        className="border px-2 py-1 rounded w-24 text-center"
                      />
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Save Exam
        </button>

      </div>
    </div>
  );
}