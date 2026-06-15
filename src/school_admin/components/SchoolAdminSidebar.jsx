// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { clearAuthData, getUserData } from "../../common/utils/tokenStorage";
// import { getMenuForRole } from "../../common/utils/roleConfig";
// import {
//   LayoutDashboard,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardList,
//   CalendarDays,
//   IndianRupee,
//   FileText,
//   Bell,
//   Settings,
//   LogOut,
//   UserCircle,
//   UserCheck,
//   Library,
//   Bus,
//   Home,
//   Package,
//   HeartPulse,
//   BarChart3,
//   MessageSquare,
//   ChevronRight,
// } from "lucide-react";

// // ─── Icon lookup (for RoleSidebar-style rendering) ─────────────────────────
// const ICON_MAP = {
//   LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
//   CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
//   UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
//   BarChart3, MessageSquare, ChevronRight,
// };

// const ROLE_LABELS = {
//   SCHOOL_ADMIN:      "School Admin",
//   ACCOUNTANT:        "Accountant",
//   CASHIER:           "Cashier",
//   PRINCIPAL:         "Principal",
//   VICE_PRINCIPAL:    "Vice Principal",
//   TEACHER:           "Teacher",
//   CLASS_TEACHER:     "Class Teacher",
//   COUNSELOR:         "Counselor",
//   STUDENT:           "Student",
//   PARENT:            "Parent",
//   TRANSPORT_MANAGER: "Transport Manager",
//   BUS_DRIVER:        "Bus Driver",
//   LIBRARIAN:         "Librarian",
//   RECEPTIONIST:      "Receptionist",
//   NURSE:             "Nurse",
//   SECURITY:          "Security",
//   IT_ADMIN:          "IT Admin",
// };

// // ─── Generic RoleSidebar (used for all non-school-admin roles) ──────────────
// function GenericRoleSidebar({ userData, primaryRole }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const displayName  = userData?.fullName || "User";
//   const displayEmail = userData?.email    || "";
//   const roleLabel    = ROLE_LABELS[primaryRole] || primaryRole;

//   const initials = displayName
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);

//   const handleLogout = () => { clearAuthData(); navigate("/"); };
//   const menuGroups   = getMenuForRole(primaryRole);
//   const isActive     = (path) => location.pathname === path;

//   return (
//     <div
//       className="flex flex-col h-screen bg-gray-900 text-white"
//       style={{ width: "260px", minWidth: "260px" }}
//     >
//       {/* Logo */}
//       <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
//         <div
//           className="flex items-center justify-center rounded-lg bg-yellow-500 text-gray-900 font-bold text-sm"
//           style={{ width: 36, height: 36 }}
//         >
//           SS
//         </div>
//         <div>
//           <p className="font-semibold text-sm text-white leading-tight">SchoolSaaS</p>
//           <p className="text-xs text-yellow-400 font-medium">{roleLabel}</p>
//         </div>
//       </div>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto px-3 py-3">
//         {menuGroups.map((group) => (
//           <div key={group.group} className="mb-4">
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
//               {group.group}
//             </p>
//             {group.items.map((item) => {
//               const Icon   = ICON_MAP[item.icon] || LayoutDashboard;
//               const active = isActive(item.path);
//               return (
//                 <Link key={item.path} to={item.path}>
//                   <div
//                     className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 ${
//                       active
//                         ? "bg-yellow-500 text-gray-900 font-semibold"
//                         : "text-gray-300 hover:bg-gray-700 hover:text-white"
//                     }`}
//                   >
//                     <Icon size={17} />
//                     <span className="text-sm">{item.name}</span>
//                     {active && <ChevronRight size={14} className="ml-auto" />}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         ))}
//       </nav>

//       {/* User card */}
//       <div className="border-t border-gray-700 px-3 py-3">
//         <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors">
//           <div
//             className="flex items-center justify-center rounded-full bg-yellow-500 text-gray-900 font-bold text-sm flex-shrink-0"
//             style={{ width: 36, height: 36 }}
//           >
//             {initials}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-semibold text-white truncate">{displayName}</p>
//             <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
//           </div>
//           <button
//             onClick={handleLogout}
//             title="Logout"
//             className="text-gray-400 hover:text-red-400 transition-colors"
//           >
//             <LogOut size={16} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main export — role-aware wrapper ──────────────────────────────────────
// // If the logged-in user is NOT a SCHOOL_ADMIN, render the correct role sidebar.
// // This means every page that imports SchoolAdminSidebar automatically works
// // for any role without any page-level changes.
// // ─── Original School Admin sidebar (renamed to inner) ──────────────────────
// function SchoolAdminSidebarInner() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const userData     = getUserData();
//   const displayName  = userData?.fullName || "Admin";
//   const displayEmail = userData?.email    || "";
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
//       group: "Core Management",
//       items: [
//         { name: "Dashboard",           icon: LayoutDashboard, path: "/school-admin/dashboard" },
//         { name: "Students",            icon: Users,           path: "/school-admin/students" },
//         { name: "Teachers",            icon: GraduationCap,   path: "/school-admin/teachers" },
//         { name: "Staff Management",    icon: UserCheck,       path: "/school-admin/staff" },
//         { name: "Admission Management",icon: UserCircle,      path: "/school-admin/admissions" },
//         { name: "Event Management",    icon: CalendarDays,    path: "/school-admin/events" },
//       ],
//     },
//     {
//       group: "Academic & Learning",
//       items: [
//         { name: "Classes",      icon: BookOpen,     path: "/school-admin/classes" },
//         { name: "Subjects",     icon: ClipboardList,path: "/school-admin/subjects" },
//         { name: "Timetable",    icon: CalendarDays, path: "/school-admin/timetable" },
//         { name: "Exams & Results",icon: FileText,   path: "/school-admin/exams" },
//         { name: "Library",      icon: Library,      path: "/school-admin/library" },
        
//       ],
//     },
//     {
//       group: "Operations & Finance",
//       items: [
//         { name: "Fees Management", icon: IndianRupee, path: "/school-admin/fees" },
//         // { name: "Inventory",       icon: Package,     path: "/school-admin/inventory" },
//         { name: "Transport",       icon: Bus,         path: "/school-admin/transport" },
//         { name: "Hostel",          icon: Home,        path: "/school-admin/hostel" },
//         {name : "Leavee Management", icon: UserCircle, path: "/school-admin/leave-management" }
//       ],
//     },
//     {
//       group: "Support & Extra",
//       items: [
//         { name: "Visitor Management", icon: UserCircle,   path: "/school-admin/visitors" },
//         { name: "Alumni",             icon: Users,        path: "/school-admin/alumni" },
//         // { name: "Health & Wellness",  icon: HeartPulse,   path: "/school-admin/health" },
//         // { name: "Communication",      icon: MessageSquare,path: "/school-admin/communication" },
//       ],
//     },
//     {
//       group: "System & Reports",
//       items: [
//         { name: "Analytics",    icon: BarChart3,    path: "/school-admin/analytics" },
//         { name: "Notifications",icon: Bell,         path: "/school-admin/notifications" },
//         { name: "Settings",     icon: Settings,     path: "/school-admin/settings" },
//         { name: "Profile",      icon: UserCircle,   path: "/school-admin/profile-settings" },
//       ],
//     },
//   ];

//   const isProfileActive = location.pathname === "/school-admin/profile-settings";

//   return (
//     <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200">
      
//       {/* ── Brand ───────────────────────────────────────────────── */}
//       <div className="p-5 border-b bg-blue-600">
//         <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
//         <p className="text-blue-100 text-xs">Admin Control Panel</p>
//       </div>

//       {/* ── Profile Mini Card ────────────────────────────────────── */}
//       <Link
//         to="/school-admin/profile-settings"
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

// // ─── Default export: role-aware wrapper ─────────────────────────────────────
// // Any page importing SchoolAdminSidebar will automatically get the correct
// // sidebar for the logged-in role — no page-level changes needed.
// export default function SchoolAdminSidebar() {
//   const userData    = getUserData();
//   const primaryRole = userData?.roles?.[0] || "SCHOOL_ADMIN";

//   if (primaryRole === "SCHOOL_ADMIN") {
//     return <SchoolAdminSidebarInner />;
//   }

//   // All other roles (ACCOUNTANT, CASHIER, PRINCIPAL, TEACHER, etc.)
//   // get the generic role-aware dark sidebar
//   return <GenericRoleSidebar userData={userData} primaryRole={primaryRole} />;
// }
/**
 * SchoolAdminSidebar — SHIM
 *
 * All school_admin pages import this file. Instead of duplicating sidebar
 * logic, we just re-export the single centralized RoleSidebar.
 * The RoleSidebar reads the logged-in role automatically and renders the
 * correct menu + styling for every role.
 *
 * No page-level changes needed — existing imports keep working.
 */
export { default } from "../../common/components/RoleSidebar";
