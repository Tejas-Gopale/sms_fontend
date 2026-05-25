// src/principal/pages/PrincipalDashboard.jsx
// Roles: PRINCIPAL, VICE_PRINCIPAL

import { useState, useEffect } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import API from "../../common/services/api";
import {
  Users, GraduationCap, ClipboardCheck, BarChart3,
  BookOpen, Bell, TrendingUp, AlertTriangle, Calendar,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color = "yellow" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-${color}-50`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
    </div>
  </div>
);

const SectionTable = ({ title, headers, rows, emptyMsg = "No data" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <h2 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h2>
    {rows.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-6">{emptyMsg}</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {headers.map((h) => (
                <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="py-2.5 text-gray-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default function PrincipalDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Principal";
  const userRoles   = userData?.roles    || [];
  const isPrincipal = userRoles.includes("PRINCIPAL");

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Placeholder stats — replace with real API calls
  const stats = {
    totalStudents:    "842",
    presentToday:     "786",
    totalTeachers:    "54",
    teacherPresent:   "49",
    examsThisMonth:   "6",
    lowAttendance:    "12",
  };

  const lowAttendanceStudents = [
    ["Rahul Sharma",   "10-A",  "62%"],
    ["Priya Mehta",    "9-B",   "58%"],
    ["Arun Kumar",     "11-C",  "55%"],
  ];

  const upcomingExams = [
    ["Mathematics",  "10-A", "28 May 2025"],
    ["Science",      "9-B",  "30 May 2025"],
    ["English",      "12-C", "02 Jun 2025"],
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {isPrincipal ? "Principal" : "Vice Principal"} Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{today} · Welcome, {displayName}</p>
          </div>
          <Bell size={20} className="text-gray-400 cursor-pointer hover:text-yellow-500" />
        </div>

        <div className="p-8 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard icon={Users}        label="Total Students"        value={stats.totalStudents}  sub={`${stats.presentToday} present today`} color="blue" />
            <StatCard icon={GraduationCap}label="Total Teachers"        value={stats.totalTeachers}  sub={`${stats.teacherPresent} present today`} color="green" />
            <StatCard icon={ClipboardCheck}label="Student Attendance"   value="93.4%"                sub="School average today" color="yellow" />
            <StatCard icon={BarChart3}    label="Exams This Month"      value={stats.examsThisMonth} sub="Scheduled" color="purple" />
            <StatCard icon={AlertTriangle}label="Low Attendance (<70%)" value={stats.lowAttendance}  sub="Students need attention" color="red" />
            <StatCard icon={TrendingUp}   label="Pass Rate (Last Exam)" value="87%"                  sub="School-wide average" color="indigo" />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionTable
              title="Students with Low Attendance"
              headers={["Student", "Class", "Attendance %"]}
              rows={lowAttendanceStudents}
            />
            <SectionTable
              title="Upcoming Exams"
              headers={["Subject", "Class", "Date"]}
              rows={upcomingExams}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "View All Students",   path: "/principal/students" },
                { label: "View All Teachers",   path: "/principal/teachers" },
                { label: "Attendance Report",   path: "/principal/attendance" },
                { label: "Exam Schedule",       path: "/principal/exams" },
                { label: "Send Announcement",   path: "/principal/announcements" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.path}
                  className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}