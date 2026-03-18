import { useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, LayoutGrid, Table } from "lucide-react";

export default function Subjects() {

  const [views, setView] = useState("table");

  // ✅ TEMP RAW DATA
  const subjects = [
    { id: 1, subjectName: "Mathematics", code: "MATH101", class: "10", teacher: "T001", active: true },
    { id: 2, subjectName: "Science", code: "SCI102", class: "9", teacher: "T002", active: true },
    { id: 3, subjectName: "English", code: "ENG103", class: "8", teacher: "T003", active: false },
    { id: 4, subjectName: "History", code: "HIS104", class: "10", teacher: null, active: true },
    { id: 5, subjectName: "Geography", code: "GEO105", class: "7", teacher: "T005", active: true },
    { id: 6, subjectName: "Computer", code: "CS106", class: "10", teacher: "T006", active: true },
  ];

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>

          <div className="flex gap-2 items-center">

            {/* VIEW TOGGLE */}
            <div className="flex bg-white rounded shadow-sm overflow-hidden">

              <button
                onClick={() => setView("table")}
                className={`p-2 ${views === "table" ? "bg-blue-500 text-white" : "text-gray-600"}`}
              >
                <Table size={18} />
              </button>

              <button
                onClick={() => setView("grid")}
                className={`p-2 ${views === "grid" ? "bg-blue-500 text-white" : "text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>

            </div>

            {/* ADD BUTTON */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow">
              <Plus size={16} /> Add Subject
            </button>

          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-xl shadow">

          {views === "table" ? (

            /* ================= TABLE VIEW ================= */
            <div className="overflow-auto max-h-[600px]">

              <table className="w-full text-sm">

                <thead className="bg-gray-100 sticky top-0">
                  <tr className="text-left text-gray-600">
                    <th className="p-3">Subject</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {subjects.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-t hover:bg-gray-50 transition"
                    >

                      <td className="p-3 font-medium text-gray-800">
                        {sub.subjectName}
                      </td>

                      <td className="p-3">
                        {sub.code}
                      </td>

                      <td className="p-3">
                        Class {sub.class}
                      </td>

                      <td className="p-3">
                        {sub.teacher || (
                          <span className="text-gray-400 text-sm">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded ${
                          sub.active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {sub.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button className="text-blue-600 text-sm hover:underline">
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

          ) : (

            /* ================= GRID VIEW ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

              {subjects.map((sub) => (

                <div
                  key={sub.id}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >

                  <h3 className="text-lg font-semibold mb-1">
                    {sub.subjectName}
                  </h3>

                  <p className="text-sm text-gray-500 mb-2">
                    {sub.code}
                  </p>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Class:</span> {sub.class}</p>
                    <p>
                      <span className="font-medium">Teacher:</span>{" "}
                      {sub.teacher || "Not Assigned"}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-between items-center">

                    <span className={`text-xs px-2 py-1 rounded ${
                      sub.active
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {sub.active ? "Active" : "Inactive"}
                    </span>

                    <button className="text-blue-600 text-sm hover:underline">
                      View
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}