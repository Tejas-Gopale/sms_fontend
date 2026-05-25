// src/students/pages/StudentDashboard.jsx
// Role: STUDENT

import { useState, useEffect } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import API from "../../common/services/api";
import {
  BookOpen, ClipboardCheck, BarChart3, IndianRupee,
  Clock, Bell, Calendar, TrendingUp,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}>
      <Icon size={20} className={`text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Student";

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const recentResults = [
    { subject: "Mathematics", exam: "Unit Test 2", marks: "45/50", grade: "A+" },
    { subject: "Science",     exam: "Unit Test 2", marks: "38/50", grade: "B+" },
    { subject: "English",     exam: "Unit Test 2", marks: "42/50", grade: "A"  },
  ];

  const pendingHomework = [
    { subject: "History",  task: "Chapter 5 Notes", dueDate: "27 May" },
    { subject: "Math",     task: "Exercise 6.3",    dueDate: "28 May" },
  ];

  const todayTimetable = [
    { period: "1st",  time: "8:00–8:45",  subject: "English",     teacher: "Mrs. Sharma" },
    { period: "2nd",  time: "8:45–9:30",  subject: "Mathematics", teacher: "Mr. Gupta" },
    { period: "3rd",  time: "9:45–10:30", subject: "Science",     teacher: "Mrs. Patel" },
    { period: "4th",  time: "10:30–11:15",subject: "History",     teacher: "Mr. Khan" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">{today} · Hello, {displayName.split(" ")[0]}!</p>
          </div>
          <Bell size={20} className="text-gray-400 cursor-pointer hover:text-yellow-500" />
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={ClipboardCheck} label="Attendance"         value="92%"   color="green"  />
            <StatCard icon={TrendingUp}     label="Average Score"      value="84%"   color="blue"   />
            <StatCard icon={BookOpen}       label="Pending Homework"   value="2"     color="yellow" />
            <StatCard icon={IndianRupee}    label="Fee Status"         value="Paid"  color="green"  />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Today's timetable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-yellow-500" /> Today's Timetable
              </h2>
              <div className="space-y-2">
                {todayTimetable.map((p) => (
                  <div key={p.period} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">{p.period}</span>
                    <span className="text-xs text-gray-400 w-24">{p.time}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.subject}</p>
                      <p className="text-xs text-gray-400">{p.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending homework */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-yellow-500" /> Pending Homework
              </h2>
              {pendingHomework.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">🎉 All homework done!</p>
              ) : (
                <div className="space-y-3">
                  {pendingHomework.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-yellow-100 bg-yellow-50 rounded-lg">
                      <BookOpen size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{h.subject}</p>
                        <p className="text-xs text-gray-600">{h.task}</p>
                      </div>
                      <span className="text-xs text-red-500 font-medium">Due {h.dueDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-yellow-500" /> Recent Results
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Subject", "Exam", "Marks", "Grade"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentResults.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{r.subject}</td>
                    <td className="py-2.5 text-gray-600">{r.exam}</td>
                    <td className="py-2.5 text-gray-700">{r.marks}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        r.grade.startsWith("A") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}