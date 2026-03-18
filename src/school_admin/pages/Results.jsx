import { useState } from "react";
import Layout from "../../common/components/Layout";

export default function Results() {

  const [selectedExam, setSelectedExam] = useState("Mid Term");
  const [selectedClass, setSelectedClass] = useState("10-A");

  // ✅ Dummy Exams & Classes
  const exams = ["Unit Test", "Mid Term", "Final Exam"];
  const classes = ["10-A", "10-B", "9-A"];

  // ✅ Dummy Result Data
  const students = [
    {
      id: 1,
      name: "Rahul Sharma",
      marks: { Math: 85, Science: 78, English: 88 }
    },
    {
      id: 2,
      name: "Priya Patel",
      marks: { Math: 92, Science: 81, English: 79 }
    },
    {
      id: 3,
      name: "Amit Verma",
      marks: { Math: 40, Science: 35, English: 50 }
    }
  ];

  // ✅ Grade Logic
  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 75) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 40) return "C";
    return "F";
  };

  return (
    <Layout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Results Management
        </h2>

        <div className="flex gap-3">

          {/* EXAM SELECT */}
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {exams.map((exam) => (
              <option key={exam}>{exam}</option>
            ))}
          </select>

          {/* CLASS SELECT */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {classes.map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-auto max-h-[600px]">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 sticky top-0">
              <tr className="text-left text-gray-600">
                <th className="p-3">Student</th>
                <th className="p-3">Math</th>
                <th className="p-3">Science</th>
                <th className="p-3">English</th>
                <th className="p-3">Total</th>
                <th className="p-3">%</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>

              {students.map((student) => {

                const total =
                  student.marks.Math +
                  student.marks.Science +
                  student.marks.English;

                const percentage = (total / 300) * 100;
                const grade = getGrade(percentage);

                return (
                  <tr
                    key={student.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3 font-medium">
                      {student.name}
                    </td>

                    <td className="p-3">{student.marks.Math}</td>
                    <td className="p-3">{student.marks.Science}</td>
                    <td className="p-3">{student.marks.English}</td>

                    <td className="p-3 font-semibold">
                      {total}
                    </td>

                    <td className="p-3">
                      {percentage.toFixed(1)}%
                    </td>

                    <td className="p-3">
                      {grade}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        percentage >= 40
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {percentage >= 40 ? "Pass" : "Fail"}
                      </span>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}