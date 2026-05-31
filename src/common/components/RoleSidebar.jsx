/**
 * RoleSidebar — SINGLE CENTRALIZED SIDEBAR FOR ALL ROLES
 *
 * Used by every role in the app. Reads the logged-in user's role from
 * tokenStorage, picks the correct menu from roleConfig, and renders
 * the School-Admin-style sidebar (white bg, blue-600 header, blue active state).
 *
 * ── How to use ──────────────────────────────────────────────────────────────
 *   import RoleSidebar from "../../common/components/RoleSidebar";
 *   // then inside JSX:
 *   <RoleSidebar />
 *
 * That's it — no props needed. The sidebar reads the role automatically.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthData, getUserData } from "../utils/tokenStorage";
import { getMenuForRole } from "../utils/roleConfig";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
  UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
  BarChart3, MessageSquare, ChevronRight, Clock, ClipboardCheck,
  Megaphone, TrendingUp, Receipt, CreditCard, MapPin, Navigation,
  ArrowLeftRight, Eye, Shield, AlertCircle, Plug, School, Banknote,
  UtensilsCrossed, ShoppingCart, BookMarked, Crown,
} from "lucide-react";

// ─── Icon registry — add any new Lucide icons here ───────────────────────────
const ICON_MAP = {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
  UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
  BarChart3, MessageSquare, ChevronRight, Clock, ClipboardCheck,
  Megaphone, TrendingUp, Receipt, CreditCard, MapPin, Navigation,
  ArrowLeftRight, Eye, Shield, AlertCircle, Plug, School, Banknote,
  UtensilsCrossed, ShoppingCart, BookMarked, Crown,
};

// ─── Human-readable role labels ───────────────────────────────────────────────
const ROLE_LABELS = {
  SUPER_ADMIN:       "Super Admin",
  SCHOOL_OWNER:      "School Owner",
  SCHOOL_ADMIN:      "Admin Control Panel",
  PRINCIPAL:         "Principal",
  VICE_PRINCIPAL:    "Vice Principal",
  TEACHER:           "Teacher Panel",
  CLASS_TEACHER:     "Class Teacher Panel",
  COUNSELOR:         "Counselor",
  STUDENT:           "Student Portal",
  PARENT:            "Parent Portal",
  ACCOUNTANT:        "Accountant",
  CASHIER:           "Cashier",
  TRANSPORT_MANAGER: "Transport Manager",
  BUS_DRIVER:        "Bus Driver",
  BUS_CONDUCTOR:     "Bus Conductor",
  LIBRARIAN:         "Library Panel",
  RECEPTIONIST:      "Receptionist",
  NURSE:             "Nurse",
  SECURITY:          "Security",
  HOUSEKEEPING:      "Housekeeping",
  CANTEEN_STAFF:     "Canteen Staff",
  IT_ADMIN:          "IT Admin",
};

// ─── Profile route per role (for the clickable mini profile card) ─────────────
const PROFILE_ROUTE = {
  SUPER_ADMIN:       "/super-admin/settings",
  SCHOOL_OWNER:      "/school-owner/profile-settings",
  SCHOOL_ADMIN:      "/school-admin/profile-settings",
  PRINCIPAL:         "/principal/profile-settings",
  VICE_PRINCIPAL:    "/principal/profile-settings",
  TEACHER:           "/teacher/profile-settings",
  CLASS_TEACHER:     "/teacher/profile-settings",
  COUNSELOR:         "/counselor/profile-settings",
  STUDENT:           "/student/profile-settings",
  PARENT:            "/parent/profile-settings",
  ACCOUNTANT:        "/accountant/profile-settings",
  CASHIER:           "/cashier/profile-settings",
  TRANSPORT_MANAGER: "/transport-manager/profile-settings",
  BUS_DRIVER:        "/bus-driver/profile-settings",
  BUS_CONDUCTOR:     "/bus-driver/profile-settings",
  LIBRARIAN:         "/librarian/profile-settings",
  RECEPTIONIST:      "/receptionist/profile-settings",
  NURSE:             "/nurse/profile-settings",
  SECURITY:          "/security/profile-settings",
  HOUSEKEEPING:      "/staff/profile-settings",
  CANTEEN_STAFF:     "/staff/profile-settings",
  IT_ADMIN:          "/it-admin/profile-settings",
};

// ─── Avatar gradient per role category ───────────────────────────────────────
const AVATAR_GRADIENT = {
  SUPER_ADMIN:       "linear-gradient(135deg, #DC2626, #EF4444)",   // red
  SCHOOL_OWNER:      "linear-gradient(135deg, #7C3AED, #8B5CF6)",   // violet
  SCHOOL_ADMIN:      "linear-gradient(135deg, #4338CA, #6366F1)",   // indigo
  PRINCIPAL:         "linear-gradient(135deg, #1D4ED8, #3B82F6)",   // blue
  VICE_PRINCIPAL:    "linear-gradient(135deg, #1D4ED8, #3B82F6)",
  TEACHER:           "linear-gradient(135deg, #0891B2, #06B6D4)",   // cyan
  CLASS_TEACHER:     "linear-gradient(135deg, #059669, #10B981)",   // emerald
  COUNSELOR:         "linear-gradient(135deg, #D97706, #F59E0B)",   // amber
  STUDENT:           "linear-gradient(135deg, #0284C7, #38BDF8)",   // sky
  PARENT:            "linear-gradient(135deg, #4338CA, #6366F1)",   // indigo
  ACCOUNTANT:        "linear-gradient(135deg, #B45309, #D97706)",   // amber-dark
  CASHIER:           "linear-gradient(135deg, #B45309, #D97706)",
  TRANSPORT_MANAGER: "linear-gradient(135deg, #0F766E, #14B8A6)",   // teal
  BUS_DRIVER:        "linear-gradient(135deg, #0F766E, #14B8A6)",
  BUS_CONDUCTOR:     "linear-gradient(135deg, #0F766E, #14B8A6)",
  LIBRARIAN:         "linear-gradient(135deg, #6D28D9, #8B5CF6)",   // purple
  RECEPTIONIST:      "linear-gradient(135deg, #BE185D, #EC4899)",   // pink
  NURSE:             "linear-gradient(135deg, #DC2626, #F87171)",   // red-light
  SECURITY:          "linear-gradient(135deg, #374151, #6B7280)",   // gray
  HOUSEKEEPING:      "linear-gradient(135deg, #065F46, #34D399)",   // green
  CANTEEN_STAFF:     "linear-gradient(135deg, #92400E, #F59E0B)",   // orange
  IT_ADMIN:          "linear-gradient(135deg, #1E3A5F, #2563EB)",   // deep blue
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RoleSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userData  = getUserData();

  const userRoles    = userData?.roles || [];
  const primaryRole  = userRoles[0] || "STUDENT";
  const displayName  = userData?.fullName || "User";
  const displayEmail = userData?.email    || "";
  const roleLabel    = ROLE_LABELS[primaryRole]  || primaryRole.replace(/_/g, " ");
  const profilePath  = PROFILE_ROUTE[primaryRole] || "/";
  const avatarGrad   = AVATAR_GRADIENT[primaryRole] || "linear-gradient(135deg, #4338CA, #6366F1)";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  const menuGroups        = getMenuForRole(primaryRole);
  const isActive          = (path) => location.pathname === path;
  const isProfileActive   = location.pathname === profilePath;

  return (
    <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200 flex-shrink-0">

      {/* ── Brand header ─────────────────────────────────────────── */}
      <div className="p-5 border-b bg-blue-600 flex-shrink-0">
        <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
        <p className="text-blue-100 text-xs mt-0.5">{roleLabel}</p>
      </div>

      {/* ── Profile mini-card ────────────────────────────────────── */}
      <Link
        to={profilePath}
        className={`flex items-center gap-3 mx-3 mt-3 p-3 rounded-xl border transition-all duration-200 group flex-shrink-0
          ${isProfileActive
            ? "bg-blue-50 border-blue-200 shadow-sm"
            : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
          }`}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm"
          style={{ background: avatarGrad }}
        >
          {initials}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate leading-tight transition-colors
            ${isProfileActive ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"}`}>
            {displayName}
          </p>
          <p className="text-xs text-gray-400 truncate leading-tight">{displayEmail}</p>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={14}
          className={`flex-shrink-0 transition-colors
            ${isProfileActive ? "text-blue-500" : "text-gray-300 group-hover:text-blue-400"}`}
        />
      </Link>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 px-4 pt-3 pb-2 space-y-5 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.group}>
            {/* Group label */}
            <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 px-3 tracking-widest">
              {group.group}
            </h2>

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon   = ICON_MAP[item.icon] || LayoutDashboard;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between group px-3 py-2.5 rounded-lg transition-all duration-150
                      ${active
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}
                      />
                      <span className="text-sm font-semibold leading-none">{item.name}</span>
                    </div>
                    {active && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout footer ────────────────────────────────────────── */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors p-3 w-full rounded-xl font-bold text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

    </div>
  );
}

// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { clearAuthData, getUserData } from "../utils/tokenStorage";
// import { getMenuForRole } from "../utils/roleConfig";
// import {
//   LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
//   CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
//   UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
//   BarChart3, MessageSquare, ChevronRight, Clock, ClipboardCheck,
//   Megaphone, TrendingUp, Receipt, CreditCard, MapPin, Navigation,
//   ArrowLeftRight, Eye, Shield, AlertCircle, Plug, School, Banknote,
//   UtensilsCrossed, ShoppingCart, BookMarked,
// } from "lucide-react";

// // Icon lookup map — add more as needed
// const ICON_MAP = {
//   LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
//   CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
//   UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
//   BarChart3, MessageSquare, ChevronRight, Clock, ClipboardCheck,
//   Megaphone, TrendingUp, Receipt, CreditCard, MapPin, Navigation,
//   ArrowLeftRight, Eye, Shield, AlertCircle, Plug, School, Banknote,
//   UtensilsCrossed, ShoppingCart, BookMarked,
// };

// const ROLE_LABELS = {
//   SUPER_ADMIN:       "Super Admin",
//   SCHOOL_OWNER:      "School Owner",
//   SCHOOL_ADMIN:      "School Admin",
//   PRINCIPAL:         "Principal",
//   VICE_PRINCIPAL:    "Vice Principal",
//   TEACHER:           "Teacher",
//   CLASS_TEACHER:     "Class Teacher",
//   COUNSELOR:         "Counselor",
//   STUDENT:           "Student",
//   PARENT:            "Parent",
//   ACCOUNTANT:        "Accountant",
//   CASHIER:           "Cashier",
//   TRANSPORT_MANAGER: "Transport Manager",
//   BUS_DRIVER:        "Bus Driver",
//   BUS_CONDUCTOR:     "Bus Conductor",
//   LIBRARIAN:         "Librarian",
//   RECEPTIONIST:      "Receptionist",
//   NURSE:             "Nurse",
//   SECURITY:          "Security",
//   HOUSEKEEPING:      "Housekeeping",
//   CANTEEN_STAFF:     "Canteen Staff",
//   IT_ADMIN:          "IT Admin",
// };

// export default function RoleSidebar() {
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const userData  = getUserData();

//   const userRoles   = userData?.roles || [];
//   const primaryRole = userRoles[0] || "STUDENT";
//   const displayName = userData?.fullName || "User";
//   const displayEmail= userData?.email   || "";
//   const roleLabel   = ROLE_LABELS[primaryRole] || primaryRole;

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

//   const menuGroups = getMenuForRole(primaryRole);
//   const isActive   = (path) => location.pathname === path;

//   return (
//     <div
//       className="flex flex-col h-screen bg-gray-900 text-white"
//       style={{ width: "260px", minWidth: "260px" }}
//     >
//       {/* ── Logo ────────────────────────────────────────────────── */}
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

//       {/* ── Menu ────────────────────────────────────────────────── */}
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

//       {/* ── User card ───────────────────────────────────────────── */}
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