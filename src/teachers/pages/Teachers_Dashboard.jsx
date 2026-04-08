import { useEffect, useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";

import {
  ClipboardCheck,
  BookOpen,
  FileText,
  CalendarDays
} from "lucide-react";

export default function TeacherDashboard() {

  const [todayLectures, setTodayLectures] = useState([]);

  const stats = [
    {
      title: "Classes Today",
      value: todayLectures.length,
      icon: CalendarDays,
      color: "border-blue-500"
    },
    {
      title: "Attendance Pending",
      value: todayLectures.length, // later dynamic karenge
      icon: ClipboardCheck,
      color: "border-green-500"
    },
    {
      title: "Homework Assigned",
      value: 12,
      icon: BookOpen,
      color: "border-purple-500"
    },
    {
      title: "Tests Created",
      value: 4,
      icon: FileText,
      color: "border-yellow-500"
    }
  ];

  // 🔥 API Call
  useEffect(() => {
    fetchTodayLectures();
  }, []);

  const fetchTodayLectures = async () => {
    try {
      const res = await API.get("/teacher/get_todayslects");

      console.log("Today Lectures:", res.data);

      setTodayLectures(res.data || []);
    } catch (err) {
      console.error("Error fetching lectures", err);
    }
  };

  // 🔥 Sort lectures by time
  const sortedLectures = [...todayLectures].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // 🔥 Current time
  const now = new Date().toTimeString().slice(0, 5);

  return (
    <div className="flex">

      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        <h1 className="text-3xl font-bold mb-6">
          Teacher Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
              >
                <div className="flex justify-between items-center">

                  <div>
                    <p className="text-gray-500 text-sm">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl font-bold">
                      {stat.value}
                    </h2>
                  </div>

                  <Icon size={28} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Schedule */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Today's Schedule
          </h2>

          <ul className="space-y-3">

            {sortedLectures.length === 0 ? (
              <p className="text-gray-500">
                No lectures today
              </p>
            ) : (
              sortedLectures.map((lec, index) => {

                const isActive =
                  now >= lec.startTime && now <= lec.endTime;

                return (
                  <li
                    key={index}
                    className={`flex justify-between border-b pb-2 ${
                      isActive
                        ? "bg-green-100 px-2 rounded"
                        : ""
                    }`}
                  >
                    <span>
                      {lec.subjectName} - {lec.className}
                    </span>

                    <span>
                      {lec.startTime} - {lec.endTime}
                    </span>
                  </li>
                );
              })
            )}

          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
              Take Attendance
            </button>

            <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
              Add Homework
            </button>

            <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600">
              Create Test
            </button>

            <button className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600">
              Add Remarks
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}