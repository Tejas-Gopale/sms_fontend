import ParentSidebar from "../components/ParentSidebar";
import { useState } from "react";

export default function ParentAttendance() {

  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const attendance = {
    10: { status: "Present", lectures: ["Present","Present","Present"] },
    11: { status: "Absent", lectures: ["Absent","Absent","Absent"] },
    12: { status: "Leave", lectures: ["Leave","Leave","Leave"] },
    13: { status: "Present", lectures: ["Present","Absent","Present"] }
  };

  const getColor = (status) => {
    if (status === "Present") return "bg-green-500 text-white";
    if (status === "Absent") return "bg-red-500 text-white";
    if (status === "Leave") return "bg-yellow-400 text-black";
    return "bg-gray-200";
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen relative">

        <h1 className="text-3xl font-bold mb-6">
          📅 Student Attendance
        </h1>

        {/* Legend */}

        <div className="flex gap-6 mb-6">

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            Present
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            Absent
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            Leave
          </div>

        </div>

        {/* Calendar */}

        <div className="bg-white rounded-2xl shadow-xl p-6">

          <div className="grid grid-cols-7 gap-4">

            {days.map((day) => {

              const record = attendance[day];

              return (

                <div
                  key={day}
                  onMouseEnter={(e) => {
                    if(record){
                      setHoveredDate(record);
                      setTooltipPos({
                        x: e.clientX,
                        y: e.clientY
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`h-16 rounded-xl flex items-center justify-center
                  font-semibold shadow cursor-pointer hover:scale-105 transition
                  ${getColor(record?.status)}`}
                >

                  {day}

                </div>

              );

            })}

          </div>

        </div>

        {/* Floating Attendance Tooltip */}

        {hoveredDate && (

          <div
            style={{
              top: tooltipPos.y - 80,
              left: tooltipPos.x + 10
            }}
            className="fixed bg-white shadow-2xl rounded-xl p-4 border z-50 w-56"
          >

            <h2 className="font-semibold mb-2">
              Lecture Attendance
            </h2>

            <div className="flex flex-col gap-2">

              {hoveredDate.lectures.map((lec, i) => (

                <div
                  key={i}
                  className={`px-3 py-1 rounded text-white text-sm
                  ${
                    lec === "Present"
                      ? "bg-green-500"
                      : lec === "Absent"
                      ? "bg-red-500"
                      : "bg-yellow-400 text-black"
                  }`}
                >

                  Lecture {i + 1}: {lec}

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>

  );
}