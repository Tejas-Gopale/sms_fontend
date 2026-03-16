import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  School,
  Users,
  UserCheck,
  IndianRupee,
  Settings,
  CreditCard,
  LogOut
} from "lucide-react";

export default function Sidebar() {

  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/super-admin/dashboard" },
    { name: "Schools", icon: School, path: "/super-admin/schools" },
    { name: "Students", icon: Users, path: "/super-admin/students" },
    { name: "Teachers", icon: UserCheck, path: "/super-admin/teachers" },
    { name: "Revenue", icon: IndianRupee, path: "/super-admin/revenue" },
    { name: "Subscriptions", icon: CreditCard, path: "/super-admin/subscriptions" },
    { name: "Settings", icon: Settings, path: "/super-admin/settings" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">

      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-white-600">School SaaS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active
                  ? "bg-white-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
       
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center gap-2 text-red-500">
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </div>
  );
}