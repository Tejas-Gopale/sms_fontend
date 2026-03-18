import { useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Timetable() {

  const [selectedClass, setSelectedClass] = useState("10-A");

  // ✅ Dummy Classes
  const classes = ["10-A", "10-B", "9-A", "8-A"];

  // ✅ Dummy Timetable Data
  const timetableData = {
    "10-A": [
      { day: "Monday", periods: ["Math", "Science", "English", "Break", "History", "Computer"] },
      { day: "Tuesday", periods: ["English", "Math", "Science", "Break", "Geography", "Computer"] },
      { day: "Wednesday", periods: ["Science", "Math", "English", "Break", "History", "Sports"] },
      { day: "Thursday", periods: ["Math", "Computer", "English", "Break", "Science", "Library"] },
      { day: "Friday", periods: ["English", "Science", "Math", "Break", "History", "Activity"] },
    ],
    "10-B": [
      { day: "Monday", periods: ["Science", "Math", "English", "Break", "Computer", "History"] },
      { day: "Tuesday", periods: ["Math", "English", "Science", "Break", "Geography", "Sports"] },
    ]
  };

  const currentTimetable = timetableData[selectedClass] || [];

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold text-gray-800">
            Timetable
          </h1>

          {/* CLASS SELECTOR */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-auto">

            <table className="w-full text-sm">

              {/* HEADER */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Day</th>
                  <th className="p-3">Period 1</th>
                  <th className="p-3">Period 2</th>
                  <th className="p-3">Period 3</th>
                  <th className="p-3">Period 4</th>
                  <th className="p-3">Period 5</th>
                  <th className="p-3">Period 6</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>

                {currentTimetable.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-400">
                      No timetable available
                    </td>
                  </tr>
                ) : (
                  currentTimetable.map((row, index) => (

                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50"
                    >

                      {/* DAY */}
                      <td className="p-3 font-medium text-gray-700">
                        {row.day}
                      </td>

                      {/* PERIODS */}
                      {row.periods.map((subject, i) => (
                        <td key={i} className="p-3 text-center">
                          {subject === "Break" ? (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
                              Break
                            </span>
                          ) : (
                            <span className="text-gray-700">
                              {subject}
                            </span>
                          )}
                        </td>
                      ))}

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}