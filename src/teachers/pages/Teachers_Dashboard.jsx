import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import {
  ClipboardCheck,
  BookOpen,
  FileText,
  CalendarDays,
  User,
  Briefcase,
} from "lucide-react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [todayLectures, setTodayLectures] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchTodayLectures();
  }, []);

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
      value: dashboardData?.HomeWorkAssignedCount ?? 0,
      icon: BookOpen,
      color: "border-purple-500",
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: "Tests Created",
      value: dashboardData?.TestCreateCount ?? 0,
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
    { label: "Take Attendance", path: "/teacher/attendance", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Assign Homework", path: "/teacher/assign-homework", color: "bg-green-500 hover:bg-green-600" },
    { label: "Create Test", path: "/teacher/exams_and_tests", color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Add Remarks", path: "/teacher/remarks", color: "bg-yellow-500 hover:bg-yellow-600" },
  ];

  return (
    <div className="flex">
      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        {/* Header */}
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
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">{new Date().toDateString()}</span>
        </div>

        {/* Stats Cards */}
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
                <div
                  key={index}
                  className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
                >
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

        {/* Today's Schedule */}
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
                    const isPast = now > (lec.endTime || "");
                    return (
                      <tr key={index} className={`border-t ${isActive ? "bg-green-50" : ""}`}>
                        <td className="py-3 px-3">{lec.periodNumber || index + 1}</td>
                        <td className="py-3 px-3 font-medium">{lec.subjectName}</td>
                        <td className="py-3 px-3">{lec.classRoom || lec.className}{lec.section ? ` - ${lec.section}` : ""}</td>
                        <td className="py-3 px-3">{lec.startTime} – {lec.endTime}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${isActive ? "bg-green-100 text-green-700" :
                              isPast ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
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

        {/* Quick Actions */}
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
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import API from "../../common/services/api";

// import {
//   ClipboardCheck,
//   BookOpen,
//   FileText,
//   CalendarDays
// } from "lucide-react";

// export default function TeacherDashboard() {

//   const [todayLectures, setTodayLectures] = useState([]);

//   const stats = [
//     {
//       title: "Classes Today",
//       value: todayLectures.length,
//       icon: CalendarDays,
//       color: "border-blue-500"
//     },
//     {
//       title: "Attendance Pending",
//       value: todayLectures.length, // later dynamic karenge
//       icon: ClipboardCheck,
//       color: "border-green-500"
//     },
//     {
//       title: "Homework Assigned",
//       value:  12, // later dynamic karenge
//       icon: BookOpen,
//       color: "border-purple-500"
//     },
//     {
//       title: "Tests Created",
//       value: 4, // later dynamic karenge
//       icon: FileText,
//       color: "border-yellow-500"
//     }
     
//   ];

//   // 🔥 API Call
//   useEffect(() => {
//     fetchTodayLectures();
//   }, []);

//   const fetchTodayLectures = async () => {
//     try {
//       const res = await API.get("/teacher/get_todayslects");

//       console.log("Today Lectures:", res.data);

//       setTodayLectures(res.data || []);
//     } catch (err) {
//       console.error("Error fetching lectures", err);
//     }
//   };

//   // 🔥 Sort lectures by time
//   const sortedLectures = [...todayLectures].sort((a, b) =>
//     a.startTime.localeCompare(b.startTime)
//   );

//   // 🔥 Current time
//   const now = new Date().toTimeString().slice(0, 5);

//   return (
//     <div className="flex">

//       <TeacherSidebar />

//       <div className="flex-1 bg-gray-100 min-h-screen p-6">

//         <h1 className="text-3xl font-bold mb-6">
//           Teacher Dashboard
//         </h1>

//         {/* Stats Cards */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

//           {stats.map((stat, index) => {
//             const Icon = stat.icon;

//             return (
//               <div
//                 key={index}
//                 className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
//               >
//                 <div className="flex justify-between items-center">

//                   <div>
//                     <p className="text-gray-500 text-sm">
//                       {stat.title}
//                     </p>

//                     <h2 className="text-2xl font-bold">
//                       {stat.value}
//                     </h2>
//                   </div>

//                   <Icon size={28} />
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Today's Schedule */}
//         <div className="mt-8 bg-white p-6 rounded-xl shadow">

//           <h2 className="text-xl font-bold mb-4">
//             Today's Schedule
//           </h2>

//           <ul className="space-y-3">

//             {sortedLectures.length === 0 ? (
//               <p className="text-gray-500">
//                 No lectures today
//               </p>
//             ) : (
//               sortedLectures.map((lec, index) => {

//                 const isActive =
//                   now >= lec.startTime && now <= lec.endTime;

//                 return (
//                   <li
//                     key={index}
//                     className={`flex justify-between border-b pb-2 ${
//                       isActive
//                         ? "bg-green-100 px-2 rounded"
//                         : ""
//                     }`}
//                   >
//                     <span>
//                       {lec.subjectName} - {lec.className}
//                     </span>

//                     <span>
//                       {lec.startTime} - {lec.endTime}
//                     </span>
//                   </li>
//                 );
//               })
//             )}

//           </ul>
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 bg-white p-6 rounded-xl shadow">

//           <h2 className="text-xl font-bold mb-4">
//             Quick Actions
//           </h2>

//           <div className="grid md:grid-cols-4 gap-4">

//             <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
//               Take Attendance
//             </button>

//             <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
//               Add Homework
//             </button>

//             <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600">
//               Create Test
//             </button>

//             <button className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600">
//               Add Remarks
//             </button>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }