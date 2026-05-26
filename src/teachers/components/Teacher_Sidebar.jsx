import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthData, getUserData } from "../../common/utils/tokenStorage";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  FileText,
  BookOpen,
  MessageSquare,
  IndianRupee,
  Bell,
  Settings,
  LogOut,
  Clock,
  PenLine,
  Megaphone,
  UserCircle,
  ChevronRight,
  MapPin,
} from "lucide-react";

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Get logged-in user from localStorage ─────────────────────────
  const userData = getUserData();
  const displayName = userData?.fullName || "Teacher";
  const displayEmail = userData?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  const menuGroups = [
    {
      group: "Overview",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/teachers/dashboard" },
      ],
    },
    {
      group: "Attendance",
      items: [
        { name: "Take Attendance",  icon: ClipboardCheck, path: "/teacher/attendance" },
        { name: "My Attendance",    icon: CalendarDays,   path: "/teacher/my-attendance" },
        { name: "GPS Attendance",   icon: MapPin,         path: "/teacher/gps-attendance" },
      ],
    },
    {
      group: "Academic",
      items: [
        { name: "Timetable",       icon: Clock,          path: "/teacher/timetable" },
        { name: "Homework",        icon: BookOpen,       path: "/teacher/assign-homework" },
        { name: "Exams / Tests",   icon: FileText,       path: "/teacher/exams_and_tests" },
        { name: "Student Remarks", icon: MessageSquare,  path: "/teacher/remarks" },
      ],
    },
    {
      group: "Leave & Notice",
      items: [
        { name: "Leave Request", icon: PenLine,   path: "/teacher/leave" },
        { name: "Notice Board",  icon: Megaphone, path: "/teacher/notices" },
      ],
    },
    {
      group: "System",
      items: [
        { name: "Salary",        icon: IndianRupee, path: "/teacher/salary" },
        { name: "Notifications", icon: Bell,        path: "/teacher/notifications" },
        { name: "Settings",      icon: Settings,    path: "/teacher/settings" },
        { name: "Profile",       icon: UserCircle,  path: "/teacher/profile-settings" },
      ],
    },
  ];

  const isProfileActive = location.pathname === "/teacher/profile-settings";

  return (
    <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200">

      {/* ── Brand ───────────────────────────────────────────────── */}
      <div className="p-5 border-b bg-blue-600">
        <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
        <p className="text-blue-100 text-xs">Teacher Panel</p>
      </div>

      {/* ── Profile Mini Card ────────────────────────────────────── */}
      <Link
        to="/teacher/profile-settings"
        className={`flex items-center gap-3 mx-3 mt-3 p-3 rounded-xl border transition-all duration-200 group
          ${isProfileActive
            ? "bg-blue-50 border-blue-200 shadow-sm"
            : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
          }`}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0891B2, #06B6D4)" }}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate leading-tight transition-colors
              ${isProfileActive ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"}`}
          >
            {displayName}
          </p>
          <p className="text-xs text-gray-400 truncate leading-tight">{displayEmail}</p>
        </div>

        <ChevronRight
          size={14}
          className={`flex-shrink-0 transition-colors
            ${isProfileActive ? "text-blue-500" : "text-gray-300 group-hover:text-blue-400"}`}
        />
      </Link>

      {/* ── Scrollable Navigation ────────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar mt-1">
        {menuGroups.map((group, gIndex) => (
          <div key={gIndex}>
            <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-3 tracking-widest">
              {group.group}
            </h2>
            <div className="space-y-1">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center justify-between group px-3 py-2.5 rounded-lg transition-all duration-200
                      ${active
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}
                      />
                      <span className="text-sm font-semibold leading-none">{item.name}</span>
                    </div>
                    {active && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout Footer ────────────────────────────────────────── */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:bg-red-100 transition-colors p-3 w-full rounded-xl font-bold text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { clearAuthData, getUserData } from "../../common/utils/tokenStorage";
// import {
//   LayoutDashboard,
//   ClipboardCheck,
//   CalendarDays,
//   FileText,
//   BookOpen,
//   MessageSquare,
//   IndianRupee,
//   Bell,
//   Settings,
//   LogOut,
//   Clock,
//   PenLine,
//   Megaphone,
//   UserCircle,
//   ChevronRight,
// } from "lucide-react";

// export default function TeacherSidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ── Get logged-in user from localStorage ─────────────────────────
//   const userData = getUserData();
//   const displayName = userData?.fullName || "Teacher";
//   const displayEmail = userData?.email || "";
//   const initials = displayName
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);

//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   const menuGroups = [
//     {
//       group: "Overview",
//       items: [
//         { name: "Dashboard", icon: LayoutDashboard, path: "/teachers/dashboard" },
//       ],
//     },
//     {
//       group: "Attendance",
//       items: [
//         { name: "Take Attendance", icon: ClipboardCheck, path: "/teacher/attendance" },
//         { name: "My Attendance",   icon: CalendarDays,   path: "/teacher/my-attendance" },
//       ],
//     },
//     {
//       group: "Academic",
//       items: [
//         { name: "Timetable",       icon: Clock,          path: "/teacher/timetable" },
//         { name: "Homework",        icon: BookOpen,       path: "/teacher/assign-homework" },
//         { name: "Exams / Tests",   icon: FileText,       path: "/teacher/exams_and_tests" },
//         { name: "Student Remarks", icon: MessageSquare,  path: "/teacher/remarks" },
//       ],
//     },
//     {
//       group: "Leave & Notice",
//       items: [
//         { name: "Leave Request", icon: PenLine,   path: "/teacher/leave" },
//         { name: "Notice Board",  icon: Megaphone, path: "/teacher/notices" },
//       ],
//     },
//     {
//       group: "System",
//       items: [
//         { name: "Salary",        icon: IndianRupee, path: "/teacher/salary" },
//         { name: "Notifications", icon: Bell,        path: "/teacher/notifications" },
//         { name: "Settings",      icon: Settings,    path: "/teacher/settings" },
//         { name: "Profile",       icon: UserCircle,  path: "/teacher/profile-settings" },
//       ],
//     },
//   ];

//   const isProfileActive = location.pathname === "/teacher/profile-settings";

//   return (
//     <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200">

//       {/* ── Brand ───────────────────────────────────────────────── */}
//       <div className="p-5 border-b bg-blue-600">
//         <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
//         <p className="text-blue-100 text-xs">Teacher Panel</p>
//       </div>

//       {/* ── Profile Mini Card ────────────────────────────────────── */}
//       <Link
//         to="/teacher/profile-settings"
//         className={`flex items-center gap-3 mx-3 mt-3 p-3 rounded-xl border transition-all duration-200 group
//           ${isProfileActive
//             ? "bg-blue-50 border-blue-200 shadow-sm"
//             : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
//           }`}
//       >
//         <div
//           className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
//           style={{ background: "linear-gradient(135deg, #0891B2, #06B6D4)" }}
//         >
//           {initials}
//         </div>

//         <div className="min-w-0 flex-1">
//           <p
//             className={`text-sm font-semibold truncate leading-tight transition-colors
//               ${isProfileActive ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"}`}
//           >
//             {displayName}
//           </p>
//           <p className="text-xs text-gray-400 truncate leading-tight">{displayEmail}</p>
//         </div>

//         <ChevronRight
//           size={14}
//           className={`flex-shrink-0 transition-colors
//             ${isProfileActive ? "text-blue-500" : "text-gray-300 group-hover:text-blue-400"}`}
//         />
//       </Link>

//       {/* ── Scrollable Navigation ────────────────────────────────── */}
//       <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar mt-1">
//         {menuGroups.map((group, gIndex) => (
//           <div key={gIndex}>
//             <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-3 tracking-widest">
//               {group.group}
//             </h2>
//             <div className="space-y-1">
//               {group.items.map((item, index) => {
//                 const Icon = item.icon;
//                 const active = location.pathname === item.path;
//                 return (
//                   <Link
//                     key={index}
//                     to={item.path}
//                     className={`flex items-center justify-between group px-3 py-2.5 rounded-lg transition-all duration-200
//                       ${active
//                         ? "bg-blue-50 text-blue-600 shadow-sm"
//                         : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Icon
//                         size={18}
//                         className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}
//                       />
//                       <span className="text-sm font-semibold leading-none">{item.name}</span>
//                     </div>
//                     {active && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </nav>

//       {/* ── Logout Footer ────────────────────────────────────────── */}
//       <div className="p-4 border-t bg-gray-50">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 text-red-500 hover:bg-red-100 transition-colors p-3 w-full rounded-xl font-bold text-sm"
//         >
//           <LogOut size={18} />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );
// }