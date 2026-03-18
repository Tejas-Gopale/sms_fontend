import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function TeacherAttendance() {

  const [selectedDate, setSelectedDate] = useState("2026-03-18");

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      empId: "T001",
      checkIn: "09:05 AM",
      checkOut: "04:30 PM",
      hours: "7h 25m",
      status: "Present"
    },
    {
      id: 2,
      name: "Anita Sharma",
      empId: "T002",
      checkIn: "09:40 AM",
      checkOut: "04:10 PM",
      hours: "6h 30m",
      status: "Late"
    },
    {
      id: 3,
      name: "Vikas Patil",
      empId: "T003",
      checkIn: "-",
      checkOut: "-",
      hours: "0h",
      status: "Absent"
    }
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <TeacherSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Teacher Daily Attendance
          </h2>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-auto max-h-[70vh]">

            <table className="w-full text-sm">

              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Teacher Name</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Working Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                {teachers.map((t) => (

                  <tr key={t.id} className="border-t hover:bg-gray-50">

                    <td className="p-3">{t.empId}</td>
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3">{t.checkIn}</td>
                    <td className="p-3">{t.checkOut}</td>
                    <td className="p-3">{t.hours}</td>

                    {/* STATUS */}
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${t.status === "Present" && "bg-green-100 text-green-700"}
                        ${t.status === "Late" && "bg-yellow-100 text-yellow-700"}
                        ${t.status === "Absent" && "bg-red-100 text-red-700"}
                      `}>
                        {t.status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="p-3 text-center">
                      <button className="text-blue-600 hover:underline">
                        Edit
                      </button>
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