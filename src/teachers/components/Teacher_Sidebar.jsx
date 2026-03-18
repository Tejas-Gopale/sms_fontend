import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../../common/utils/tokenStorage"; 
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
  LogOut
} from "lucide-react";

//= polutry (20,000) + dalim + drakshay + oranges + school sas (karyasoft) = 
export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
   
  const handleLogout = () => {
    clearAuthData(); // removes accessToken, refreshToken, userData
    navigate("/");
  };

  const menuItems = [

    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/teachers/dashboard"
    },
    
    {
      name: "Take Attendance",
      icon: ClipboardCheck,
      path: "/teacher/attendance"
    },

    {
      name: "My Attendance",
      icon: CalendarDays,
      path: "/teacher/my-attendance"
    },

    {
      name: "Homework",
      icon: BookOpen,
      path: "/teacher/assign-homework"
    },

    {
      name: "Exams / Tests",
      icon: FileText,
      path: "/teacher/exams_and_tests"
    },

    {
      name: "Student Remarks",
      icon: MessageSquare,
      path: "/teacher/remarks"
    },

    {
      name: "Salary",
      icon: IndianRupee,
      path: "/teacher/salary"
    },

    {
      name: "Notifications",
      icon: Bell,
      path: "/teacher/notifications"
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/teacher/settings"
    }

  ];

  return (

    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">

      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          Teacher Panel
        </h1>
      </div>

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
              {item.name}

            </Link>

          );

        })}

      </nav>

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