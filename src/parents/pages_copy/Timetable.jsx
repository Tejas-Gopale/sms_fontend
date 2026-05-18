import { useEffect, useState } from "react";
import API from "../../common/services/api";
import ParentSidebar from "../components/ParentSidebar";

export default function ParentTimeTable() {

  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState("TODAY");

  const classroomId = 5;

  // 🔥 Common API handler
  const fetchTimeTable = async (type, day = "") => {
    try {
      let url = "";

      if (type === "TODAY") {
        url = `/tablecontroller/class/${classroomId}/today`;
      } else if (type === "TOMORROW") {
        url = `/tablecontroller/class/${classroomId}/tomorrow`;
      } else if (type === "DAY") {
        url = `/tablecontroller/class/${classroomId}/day?day=${day}`;
      }

      const res = await API.get(url);
      setTimetable(res.data || []);
      setSelectedDay(type === "DAY" ? day : type);

    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  // Default load
  useEffect(() => {
    fetchTimeTable("TODAY");
  }, [classroomId]);

  return (
    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-4">
          Timetable 📅 ({selectedDay})
        </h1>

        {/* 🔥 NEW: Controls (Buttons + Dropdown) */}
        <div className="flex gap-3 mb-6">

          <button
            onClick={() => fetchTimeTable("TODAY")}
            className={`px-4 py-2 rounded ${
              selectedDay === "TODAY"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => fetchTimeTable("TOMORROW")}
            className={`px-4 py-2 rounded ${
              selectedDay === "TOMORROW"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Tomorrow
          </button>

          <select
            onChange={(e) => fetchTimeTable("DAY", e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Select Day</option>
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">Saturday</option>
          </select>

        </div>

        {/* Existing UI SAME */}
        <div className="space-y-5">

          {timetable.length > 0 ? (

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

              <table className="w-full text-sm">

                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Teacher</th>
                  </tr>
                </thead>

                <tbody>
                  {timetable.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-2">
                        {item.startTime} - {item.endTime}
                      </td>
                      <td className="p-2">
                        {item.isBreak ? "BREAK" : item.subjectName}
                      </td>
                      <td className="p-2">
                        {item.isBreak ? "-" : item.teacherName}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          ) : (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No timetable available
            </div>
          )}

        </div>

      </div>
    </div>
  );
}