import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { classTeacherService } from "../services/teacherService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  ClipboardCheck,
  BookOpen,
  FileText,
  CalendarDays,
  User,
  Briefcase,
  GraduationCap,
  Users,
  BookMarked,
  Wallet,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const userData = getUserData();
  const roles = userData?.roles || [];
  const isClassTeacher =
    roles.includes("CLASS_TEACHER") || roles.includes("ROLE_CLASS_TEACHER");

  const [todayLectures, setTodayLectures]     = useState([]);
  const [dashboardData, setDashboardData]     = useState(null);
  const [loading, setLoading]                 = useState(true);

  // Class teacher state
  const [myClassroom, setMyClassroom]         = useState(null);
  const [classStudents, setClassStudents]     = useState([]);
  const [classFees, setClassFees]             = useState([]);
  const [classSubjects, setClassSubjects]     = useState([]);
  const [ctLoading, setCtLoading]             = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchTodayLectures();
  }, []);

  useEffect(() => {
    if (isClassTeacher) fetchClassTeacherData();
  }, [isClassTeacher]);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/teacher/getTeachersDetilasForAdmin");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLectures = async () => {
    try {
      const res = await API.get("/teacher/get_todayslects");
      setTodayLectures(res.data || []);
    } catch (err) {
      console.error("Error fetching lectures", err);
    }
  };

  const fetchClassTeacherData = async () => {
    setCtLoading(true);
    try {
      const [classroomRes, studentsRes, feesRes, subjectsRes] = await Promise.allSettled([
        classTeacherService.getMyClassroom(),
        classTeacherService.getStudents(0, 5),
        classTeacherService.getClassFees(),
        classTeacherService.getSubjects(),
      ]);

      if (classroomRes.status === "fulfilled") setMyClassroom(classroomRes.value.data);
      if (studentsRes.status === "fulfilled")  setClassStudents(studentsRes.value.data?.content || []);
      
      // Fixed: Added fallback to empty array if data isn't an array
      if (feesRes.status === "fulfilled") {
        const feesData = feesRes.value.data;
        setClassFees(Array.isArray(feesData) ? feesData : []);
      }
      
      if (subjectsRes.status === "fulfilled")  setClassSubjects(subjectsRes.value.data || []);
    } catch (err) {
      console.error("Error fetching class teacher data", err);
    } finally {
      setCtLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const stats = [
    {
      title: "Classes Today",
      value: dashboardData?.todayLectureCount ?? todayLectures.length,
      icon: CalendarDays,
      color: "border-blue-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Attendance Pending",
      value: dashboardData?.todayPendingAttendanceCount ?? 0,
      icon: ClipboardCheck,
      color: "border-green-500",
      bg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      title: "Homework Assigned",
      value: dashboardData?.homeworkAssignedCount ?? 0,
      icon: BookOpen,
      color: "border-purple-500",
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: "Tests Created",
      value: dashboardData?.testCreateCount ?? 0,
      icon: FileText,
      color: "border-yellow-500",
      bg: "bg-yellow-50",
      iconColor: "text-yellow-500",
    },
  ];

  const sortedLectures = [...todayLectures].sort((a, b) =>
    (a.startTime || "").localeCompare(b.startTime || "")
  );

  const now = new Date().toTimeString().slice(0, 5);

  const quickActions = [
    { label: "Take Attendance",  path: "/teacher/attendance",      color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Assign Homework",  path: "/teacher/assign-homework", color: "bg-green-500 hover:bg-green-600" },
    { label: "Create Test",      path: "/teacher/exams_and_tests", color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Add Remarks",      path: "/teacher/remarks",         color: "bg-yellow-500 hover:bg-yellow-600" },
  ];

  // Fixed: Added Array.isArray() defensive wrapper fallback to handle empty state elegantly
  const safeClassFees = Array.isArray(classFees) ? classFees : [];

  // ── Fee summary computed ──────────────────────────────────────
  const totalDue    = safeClassFees.reduce((s, f) => s + (f.dueAmount    || 0), 0);
  const totalPaid   = safeClassFees.reduce((s, f) => s + (f.paidAmount   || 0), 0);
  const totalAmount = safeClassFees.reduce((s, f) => s + (f.totalAmount  || 0), 0);
  const defaulters  = safeClassFees.filter((f) => (f.dueAmount || 0) > 0).length;

  return (
    <div className="flex">
      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            {dashboardData && (
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <User size={16} />
                Welcome, <span className="font-medium text-gray-700">{dashboardData.teacherName}</span>
                <span className="mx-2">·</span>
                <Briefcase size={16} />
                Emp ID: <span className="font-medium text-gray-700">{dashboardData.employeeId}</span>
                {isClassTeacher && myClassroom && (
                  <>
                    <span className="mx-2">·</span>
                    <GraduationCap size={16} className="text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">
                      Class Teacher — Grade {myClassroom.grade} {myClassroom.section}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">{new Date().toDateString()}</span>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-200 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <h2 className="text-2xl font-bold">{stat.value}</h2>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-full`}>
                      <Icon size={24} className={stat.iconColor} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            CLASS TEACHER SECTION — only shown if CLASS_TEACHER
        ══════════════════════════════════════════════════════ */}
        {isClassTeacher && (
          <div className="mt-8">

            {/* Section heading */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <GraduationCap size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">My Classroom</h2>
                {myClassroom && (
                  <p className="text-sm text-gray-500">
                    Grade {myClassroom.grade} · Section {myClassroom.section}
                  </p>
                )}
              </div>
            </div>

            {ctLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow animate-pulse h-40 border-l-4 border-emerald-200" />
                ))}
              </div>
            ) : (
              <>
                {/* ── Class Teacher Summary Cards ────────────── */}
                <div className="grid md:grid-cols-3 gap-6">

                  {/* Students Card */}
                  <div
                    className="bg-white rounded-xl shadow border-l-4 border-emerald-500 p-5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate("/teacher/class/students")}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Total Students</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">
                          {myClassroom
                            ? (classStudents.length > 0
                                ? `${classStudents.length}+`
                                : "0")
                            : "—"}
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          {classSubjects.length} subjects assigned
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-full">
                        <Users size={22} className="text-emerald-500" />
                      </div>
                    </div>
                    <button
                      className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      onClick={(e) => { e.stopPropagation(); navigate("/teacher/class/students"); }}
                    >
                      View All Students <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Subjects Card */}
                  <div
                    className="bg-white rounded-xl shadow border-l-4 border-blue-400 p-5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate("/teacher/class/subjects")}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Subjects</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">
                          {classSubjects.length}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Assigned to this class
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-full">
                        <BookMarked size={22} className="text-blue-500" />
                      </div>
                    </div>
                    {/* Mini subject pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {classSubjects.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium"
                        >
                          {s.subjectName}
                        </span>
                      ))}
                      {classSubjects.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px]">
                          +{classSubjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fee Overview Card */}
                  <div
                    className="bg-white rounded-xl shadow border-l-4 border-orange-400 p-5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate("/teacher/class/fees")}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Fee Collection</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">
                          ₹{totalPaid.toLocaleString("en-IN")}
                        </h3>
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          ₹{totalDue.toLocaleString("en-IN")} pending
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-full">
                        <Wallet size={22} className="text-orange-500" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    {totalAmount > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                          <span>Collected</span>
                          <span>{Math.round((totalPaid / totalAmount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {defaulters > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                        <AlertCircle size={12} />
                        {defaulters} student{defaulters > 1 ? "s" : ""} with pending dues
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Recent Students Preview ────────────────── */}
                {classStudents.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users size={17} className="text-emerald-500" />
                        Recent Students
                      </h3>
                      <button
                        onClick={() => navigate("/teacher/class/students")}
                        className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                            <th className="pb-2 px-2">Roll No.</th>
                            <th className="pb-2 px-2">Name</th>
                            <th className="pb-2 px-2">Gender</th>
                            <th className="pb-2 px-2">Admission No.</th>
                            <th className="pb-2 px-2">Fee Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.slice(0, 5).map((student, i) => {
                            const feeRecord = safeClassFees.find(
                              (f) => f.studentId === student.id || f.student?.id === student.id
                            );
                            const hasDue = feeRecord && feeRecord.dueAmount > 0;
                            return (
                              <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="py-2.5 px-2 text-gray-500">
                                  {student.rollNumber || "—"}
                                </td>
                                <td className="py-2.5 px-2 font-medium text-gray-800">
                                  {student.firstName} {student.lastName}
                                </td>
                                <td className="py-2.5 px-2 text-gray-500 capitalize">
                                  {student.gender?.toLowerCase() || "—"}
                                </td>
                                <td className="py-2.5 px-2 text-gray-500">
                                  {student.admissionNumber || "—"}
                                </td>
                                <td className="py-2.5 px-2">
                                  {feeRecord ? (
                                    hasDue ? (
                                      <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                                        <AlertCircle size={12} />
                                        ₹{feeRecord.dueAmount?.toLocaleString("en-IN")} due
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                        <CheckCircle2 size={12} />
                                        Clear
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-xs text-gray-400">No record</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Quick Class Actions ────────────────────── */}
                <div className="mt-6 bg-white rounded-xl shadow p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={17} className="text-emerald-500" />
                    Class Teacher Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "View All Students",  path: "/teacher/class/students",   color: "bg-emerald-500 hover:bg-emerald-600" },
                      { label: "Add New Student",    path: "/teacher/class/add-student", color: "bg-blue-500 hover:bg-blue-600" },
                      { label: "Manage Subjects",    path: "/teacher/class/subjects",    color: "bg-indigo-500 hover:bg-indigo-600" },
                      { label: "Fee Overview",       path: "/teacher/class/fees",        color: "bg-orange-500 hover:bg-orange-600" },
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className={`${action.color} text-white p-3 rounded-lg transition text-sm font-semibold`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* ══ END CLASS TEACHER SECTION ══ */}

        {/* ── Today's Schedule ────────────────────────────────── */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CalendarDays size={20} className="text-blue-500" />
            Today's Schedule
          </h2>

          {sortedLectures.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No lectures scheduled for today</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-3 px-3">Period</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Class</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLectures.map((lec, index) => {
                    const isActive = now >= (lec.startTime || "") && now <= (lec.endTime || "");
                    const isPast   = now > (lec.endTime || "");
                    return (
                      <tr key={index} className={`border-t ${isActive ? "bg-green-50" : ""}`}>
                        <td className="py-3 px-3">{lec.periodNumber || index + 1}</td>
                        <td className="py-3 px-3 font-medium">{lec.subjectName}</td>
                        <td className="py-3 px-3">
                          {lec.classRoom || lec.className}
                          {lec.section ? ` - ${lec.section}` : ""}
                        </td>
                        <td className="py-3 px-3">{lec.startTime} – {lec.endTime}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${isActive ? "bg-green-100 text-green-700" :
                                isPast   ? "bg-gray-100 text-gray-500"   : "bg-blue-100 text-blue-700"}`}
                          >
                            {isActive ? "Ongoing" : isPast ? "Done" : "Upcoming"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white p-3 rounded-lg transition font-medium`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import API from "../../common/services/api";
// import {
//   ClipboardCheck,
//   BookOpen,
//   FileText,
//   CalendarDays,
//   User,
//   Briefcase,
// } from "lucide-react";

// export default function TeacherDashboard() {
//   const navigate = useNavigate();
//   const [todayLectures, setTodayLectures] = useState([]);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//     fetchTodayLectures();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const res = await API.get("/teacher/getTeachersDetilasForAdmin");
//       setDashboardData(res.data);
//     } catch (err) {
//       console.error("Error fetching dashboard data", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTodayLectures = async () => {
//     try {
//       const res = await API.get("/teacher/get_todayslects");
//       setTodayLectures(res.data || []);
//     } catch (err) {
//       console.error("Error fetching lectures", err);
//     }
//   };

//   const stats = [
//     {
//       title: "Classes Today",
//       // Backend field: todayLectureCount
//       value: dashboardData?.todayLectureCount ?? todayLectures.length,
//       icon: CalendarDays,
//       color: "border-blue-500",
//       bg: "bg-blue-50",
//       iconColor: "text-blue-500",
//     },
//     {
//       title: "Attendance Pending",
//       // Backend field: todayPendingAttendanceCount
//       value: dashboardData?.todayPendingAttendanceCount ?? 0,
//       icon: ClipboardCheck,
//       color: "border-green-500",
//       bg: "bg-green-50",
//       iconColor: "text-green-500",
//     },
//     {
//       title: "Homework Assigned",
//       // ✅ FIX: Backend sends "homeworkAssignedCount" (was wrongly "HomeWorkAssignedCount" in old code)
//       value: dashboardData?.homeworkAssignedCount ?? 0,
//       icon: BookOpen,
//       color: "border-purple-500",
//       bg: "bg-purple-50",
//       iconColor: "text-purple-500",
//     },
//     {
//       title: "Tests Created",
//       // ✅ FIX: Backend sends "testCreateCount" (was wrongly "TestCreateCount" in old code)
//       value: dashboardData?.testCreateCount ?? 0,
//       icon: FileText,
//       color: "border-yellow-500",
//       bg: "bg-yellow-50",
//       iconColor: "text-yellow-500",
//     },
//   ];

//   const sortedLectures = [...todayLectures].sort((a, b) =>
//     (a.startTime || "").localeCompare(b.startTime || "")
//   );

//   const now = new Date().toTimeString().slice(0, 5);

//   const quickActions = [
//     { label: "Take Attendance",  path: "/teacher/attendance",       color: "bg-blue-500 hover:bg-blue-600"   },
//     { label: "Assign Homework",  path: "/teacher/assign-homework",  color: "bg-green-500 hover:bg-green-600" },
//     { label: "Create Test",      path: "/teacher/exams_and_tests",  color: "bg-purple-500 hover:bg-purple-600"},
//     { label: "Add Remarks",      path: "/teacher/remarks",          color: "bg-yellow-500 hover:bg-yellow-600"},
//   ];

//   return (
//     <div className="flex">
//       <TeacherSidebar />

//       <div className="flex-1 bg-gray-100 min-h-screen p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
//             {dashboardData && (
//               <p className="text-gray-500 mt-1 flex items-center gap-2">
//                 <User size={16} />
//                 Welcome, <span className="font-medium text-gray-700">{dashboardData.teacherName}</span>
//                 <span className="mx-2">·</span>
//                 <Briefcase size={16} />
//                 Emp ID: <span className="font-medium text-gray-700">{dashboardData.employeeId}</span>
//               </p>
//             )}
//           </div>
//           <span className="text-sm text-gray-500">{new Date().toDateString()}</span>
//         </div>

//         {/* Stats Cards */}
//         {loading ? (
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-200 animate-pulse h-28" />
//             ))}
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, index) => {
//               const Icon = stat.icon;
//               return (
//                 <div
//                   key={index}
//                   className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-gray-500 text-sm">{stat.title}</p>
//                       <h2 className="text-2xl font-bold">{stat.value}</h2>
//                     </div>
//                     <div className={`${stat.bg} p-3 rounded-full`}>
//                       <Icon size={24} className={stat.iconColor} />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Today's Schedule */}
//         <div className="mt-8 bg-white p-6 rounded-xl shadow">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <CalendarDays size={20} className="text-blue-500" />
//             Today's Schedule
//           </h2>

//           {sortedLectures.length === 0 ? (
//             <p className="text-gray-500 py-4 text-center">No lectures scheduled for today</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-600 border-b">
//                     <th className="py-3 px-3">Period</th>
//                     <th className="py-3 px-3">Subject</th>
//                     <th className="py-3 px-3">Class</th>
//                     <th className="py-3 px-3">Time</th>
//                     <th className="py-3 px-3">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sortedLectures.map((lec, index) => {
//                     const isActive = now >= (lec.startTime || "") && now <= (lec.endTime || "");
//                     const isPast   = now > (lec.endTime || "");
//                     return (
//                       <tr key={index} className={`border-t ${isActive ? "bg-green-50" : ""}`}>
//                         <td className="py-3 px-3">{lec.periodNumber || index + 1}</td>
//                         <td className="py-3 px-3 font-medium">{lec.subjectName}</td>
//                         <td className="py-3 px-3">
//                           {lec.classRoom || lec.className}
//                           {lec.section ? ` - ${lec.section}` : ""}
//                         </td>
//                         <td className="py-3 px-3">{lec.startTime} – {lec.endTime}</td>
//                         <td className="py-3 px-3">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-semibold
//                               ${isActive ? "bg-green-100 text-green-700" :
//                                 isPast   ? "bg-gray-100 text-gray-500"   : "bg-blue-100 text-blue-700"}`}
//                           >
//                             {isActive ? "Ongoing" : isPast ? "Done" : "Upcoming"}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 bg-white p-6 rounded-xl shadow">
//           <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
//           <div className="grid md:grid-cols-4 gap-4">
//             {quickActions.map((action, i) => (
//               <button
//                 key={i}
//                 onClick={() => navigate(action.path)}
//                 className={`${action.color} text-white p-3 rounded-lg transition font-medium`}
//               >
//                 {action.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }