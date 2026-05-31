/**
 * ParentSidebar — SHIM
 *
 * Re-exports the centralized RoleSidebar.
 * All parent pages that import this file will automatically get the
 * correct sidebar for the logged-in role.
 */
export { default } from "../../common/components/RoleSidebar";

// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { clearAuthData, getUserData } from "../../common/utils/tokenStorage";
// import {
//   LayoutDashboard,
//   ClipboardCheck,
//   BookOpen,
//   FileText,
//   MapPin,
//   IndianRupee,
//   MessageSquare,
//   Bell,
//   Settings,
//   LogOut,
//   CalendarDays,
//   ChevronRight,
//   UserCircle,
// } from "lucide-react";

// export default function ParentSidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ── Get logged-in user from localStorage ─────────────────────────
//   const userData = getUserData();
//   const displayName = userData?.fullName || "Parent";
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
//         { name: "Dashboard", icon: LayoutDashboard, path: "/parents/dashboard" },
//       ],
//     },
//     {
//       group: "Academics",
//       items: [
//         { name: "Attendance",    icon: ClipboardCheck, path: "/parent/attendance" },
//         { name: "Homework",      icon: BookOpen,       path: "/parent/homework" },
//         { name: "Exam Results",  icon: FileText,       path: "/parent/results" },
//         { name: "Timetable",     icon: CalendarDays,   path: "/parent/timetable" },
//       ],
//     },
//     {
//       group: "Finance & Transport",
//       items: [
//         { name: "Fees Payment", icon: IndianRupee, path: "/parent/fees" },
//         { name: "Bus Tracking", icon: MapPin,      path: "/parent/bus-tracking" },
//       ],
//     },
//     {
//       group: "Communication",
//       items: [
//         { name: "Teacher Remarks", icon: MessageSquare, path: "/parent/remarks" },
//         { name: "Notifications",   icon: Bell,          path: "/parent/notifications" },
//       ],
//     },
//     {
//       group: "Account",
//       items: [
//         { name: "Settings", icon: Settings,    path: "/parent/settings" },
//         { name: "Profile",  icon: UserCircle,  path: "/parent/profile-settings" },
//       ],
//     },
//   ];

//   const isProfileActive = location.pathname === "/parent/profile-settings";

//   return (
//     <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200">

//       {/* ── Brand ───────────────────────────────────────────────── */}
//       <div className="p-5 border-b bg-blue-600">
//         <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
//         <p className="text-blue-100 text-xs">Parent Portal</p>
//       </div>

//       {/* ── Profile Mini Card ────────────────────────────────────── */}
//       <Link
//         to="/parent/profile-settings"
//         className={`flex items-center gap-3 mx-3 mt-3 p-3 rounded-xl border transition-all duration-200 group
//           ${isProfileActive
//             ? "bg-blue-50 border-blue-200 shadow-sm"
//             : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
//           }`}
//       >
//         {/* Avatar circle with initials */}
//         <div
//           className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
//           style={{ background: "linear-gradient(135deg, #4338CA, #6366F1)" }}
//         >
//           {initials}
//         </div>

//         {/* Name + email */}
//         <div className="min-w-0 flex-1">
//           <p
//             className={`text-sm font-semibold truncate leading-tight transition-colors
//               ${isProfileActive ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"}`}
//           >
//             {displayName}
//           </p>
//           <p className="text-xs text-gray-400 truncate leading-tight">{displayEmail}</p>
//         </div>

//         {/* Arrow indicator */}
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