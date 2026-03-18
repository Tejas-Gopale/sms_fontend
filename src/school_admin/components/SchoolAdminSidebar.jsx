import { Link, useLocation } from "react-router-dom";
import { clearAuthData } from "../../common/utils/tokenStorage"; 
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CalendarDays,
  IndianRupee,
  FileText,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

export default function SchoolAdminSidebar() {
const navigate = useNavigate();
  const handleLogout = () => {
    clearAuthData(); // removes accessToken, refreshToken, userData
    navigate("/");
  };

  const location = useLocation();

  const menuItems = [

    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/school-admin/dashboard"
    },

    {
      name: "Students",
      icon: Users,
      path: "/school-admin/students"
    },

    {
      name: "Teachers",
      icon: GraduationCap,
      path: "/school-admin/teachers"
    },

    {
      name: "Classes",
      icon: BookOpen,
      path: "/school-admin/classes"
    },

    {
      name: "Subjects",
      icon: ClipboardList,
      path: "/school-admin/subjects"
    },

    {
      name: "Timetable",
      icon: CalendarDays,
      path: "/school-admin/timetable"
    },

    {
      name: "Fees Management",
      icon: IndianRupee,
      path: "/school-admin/fees"
    },

    {
      name: "Exams & Results",
      icon: FileText,
      path: "/school-admin/exams"
    },

    {
      name: "Notifications",
      icon: Bell,
      path: "/school-admin/notifications"
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/school-admin/settings"
    }

  ];

  return (

    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          School Panel
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (

            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition
                ${
                  active
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >

              <Icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>

            </Link>

          );

        })}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 w-full rounded-lg"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </div>
  );

}