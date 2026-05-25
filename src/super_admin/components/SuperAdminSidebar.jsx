// src/super-admin/components/SuperAdminSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthData } from "../../common/utils/tokenStorage";
import {
  LayoutDashboard,
  School,
  Users,
  UserCheck,
  IndianRupee,
  Settings,
  CreditCard,
  LogOut,
  GraduationCap,
  Crown,
  Receipt,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",     icon: LayoutDashboard, path: "/super-admin/dashboard" },
  { name: "Schools",       icon: School,          path: "/super-admin/schools" },
  { name: "Students",      icon: Users,           path: "/super-admin/students" },
  { name: "Teachers",      icon: UserCheck,       path: "/super-admin/teachers" },
  { name: "Revenue",       icon: IndianRupee,     path: "/super-admin/revenue" },
  { name: "Subscriptions", icon: CreditCard,      path: "/super-admin/subscriptions" },
  { name: "School Owner",  icon: Crown,           path: "/super-admin/school-owner" },
  { name: "Expenses",      icon: Receipt,         path: "/super-admin/expenses" },
  { name: "Settings",      icon: Settings,        path: "/super-admin/settings" },
];

export default function SuperAdminSidebar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 flex flex-col flex-shrink-0">

      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">SchoolMS</p>
            <p className="text-gray-500 text-xs">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const Icon   = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
}
// // src/super-admin/components/SuperAdminSidebar.jsx
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { clearAuthData } from "../../common/utils/tokenStorage";
// import {
//   LayoutDashboard,
//   School,
//   Users,
//   UserCheck,
//   IndianRupee,
//   Settings,
//   CreditCard,
//   LogOut,
//   GraduationCap,
// } from "lucide-react";

// const menuItems = [
//   { name: "Dashboard",     icon: LayoutDashboard, path: "/super-admin/dashboard" },
//   { name: "Schools",       icon: School,          path: "/super-admin/schools" },
//   { name: "Students",      icon: Users,           path: "/super-admin/students" },
//   { name: "Teachers",      icon: UserCheck,       path: "/super-admin/teachers" },
//   { name: "Revenue",       icon: IndianRupee,     path: "/super-admin/revenue" },
//   { name: "Subscriptions", icon: CreditCard,      path: "/super-admin/subscriptions" },
//   { name: "Settings",      icon: Settings,        path: "/super-admin/settings" },
// ];

// export default function SuperAdminSidebar() {
//   const location = useLocation();
//   const navigate  = useNavigate();

//   const handleLogout = () => {
//     clearAuthData();
//     navigate("/");
//   };

//   return (
//     <div className="w-64 min-h-screen bg-gray-900 flex flex-col flex-shrink-0">

//       {/* Brand */}
//       <div className="px-6 py-5 border-b border-gray-800">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//             <GraduationCap size={18} className="text-white" />
//           </div>
//           <div>
//             <p className="text-white font-bold text-sm">SchoolMS</p>
//             <p className="text-gray-500 text-xs">Super Admin</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
//         <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
//           Main Menu
//         </p>
//         {menuItems.map((item) => {
//           const Icon   = item.icon;
//           const active = location.pathname === item.path;
//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
//                 active
//                   ? "bg-blue-600 text-white"
//                   : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
//               }`}
//             >
//               <Icon size={18} className="flex-shrink-0" />
//               {item.name}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="px-3 py-4 border-t border-gray-800">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300 transition-all duration-150"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>

//     </div>
//   );
// }
