import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthData } from "../../common/utils/tokenStorage";
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
  LogOut,
  UserCircle,
  UserCheck,
  Library,
  Bus,
  Home,
  Package,
  HeartPulse,
  BarChart3,
  MessageSquare,
  ChevronRight
} from "lucide-react";

export default function SchoolAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  // Groups/Modules setup
  const menuGroups = [
    {
      group: "Core Management",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/school-admin/dashboard" },
        { name: "Students", icon: Users, path: "/school-admin/students" },
        { name: "Teachers", icon: GraduationCap, path: "/school-admin/teachers" },
        { name: "Staff Management", icon: UserCheck, path: "/school-admin/staff" },
        { name: "Admission Management", icon: UserCircle, path: "/school-admin/admissions" },
        { name: "Event Management", icon: CalendarDays, path: "/school-admin/events" },
      ],
    },
    {
      group: "Academic & Learning",
      items: [
        { name: "Classes", icon: BookOpen, path: "/school-admin/classes" },
        { name: "Subjects", icon: ClipboardList, path: "/school-admin/subjects" },
        { name: "Timetable", icon: CalendarDays, path: "/school-admin/timetable" },
        { name: "Exams & Results", icon: FileText, path: "/school-admin/exams" },
        { name: "Library", icon: Library, path: "/school-admin/library" },
      ],
    },
    {
      group: "Operations & Finance",
      items: [
        { name: "Fees Management", icon: IndianRupee, path: "/school-admin/fees" },
        { name: "Inventory", icon: Package, path: "/school-admin/inventory" },
        { name: "Transport", icon: Bus, path: "/school-admin/transport" },
        { name: "Hostel", icon: Home, path: "/school-admin/hostel" },
      ],
    },
    {
      group: "Support & Extra",
      items: [
        { name: "Visitor Management", icon: UserCircle, path: "/school-admin/visitors" },
        
        { name: "Alumni", icon: Users, path: "/school-admin/alumni" },
        { name: "Health & Wellness", icon: HeartPulse, path: "/school-admin/health" },
        { name: "Communication", icon: MessageSquare, path: "/school-admin/communication" },
      ],
    },
    {
      group: "System & Reports",
      items: [
        { name: "Analytics", icon: BarChart3, path: "/school-admin/analytics" },
        { name: "Notifications", icon: Bell, path: "/school-admin/notifications" },
        { name: "Settings", icon: Settings, path: "/school-admin/settings" },
        { name: "Profile", icon: UserCircle, path: "/school-admin/profile-settings" },
      ],
    },
  ];

  return (
    <div className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-200">
      {/* Brand Logo */}
      <div className="p-6 border-b bg-blue-600">
        <h1 className="text-xl font-extrabold text-white tracking-tight">SCHOOL ERP</h1>
        <p className="text-blue-100 text-xs">Admin Control Panel</p>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
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
                      <Icon size={18} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"} />
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

      {/* Logout Footer */}
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