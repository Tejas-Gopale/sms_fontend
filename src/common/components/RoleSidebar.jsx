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
  UtensilsCrossed, ShoppingCart, BookMarked,
} from "lucide-react";

// Icon lookup map — add more as needed
const ICON_MAP = {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarDays, IndianRupee, FileText, Bell, Settings, LogOut,
  UserCircle, UserCheck, Library, Bus, Home, Package, HeartPulse,
  BarChart3, MessageSquare, ChevronRight, Clock, ClipboardCheck,
  Megaphone, TrendingUp, Receipt, CreditCard, MapPin, Navigation,
  ArrowLeftRight, Eye, Shield, AlertCircle, Plug, School, Banknote,
  UtensilsCrossed, ShoppingCart, BookMarked,
};

const ROLE_LABELS = {
  SUPER_ADMIN:       "Super Admin",
  SCHOOL_OWNER:      "School Owner",
  SCHOOL_ADMIN:      "School Admin",
  PRINCIPAL:         "Principal",
  VICE_PRINCIPAL:    "Vice Principal",
  TEACHER:           "Teacher",
  CLASS_TEACHER:     "Class Teacher",
  COUNSELOR:         "Counselor",
  STUDENT:           "Student",
  PARENT:            "Parent",
  ACCOUNTANT:        "Accountant",
  CASHIER:           "Cashier",
  TRANSPORT_MANAGER: "Transport Manager",
  BUS_DRIVER:        "Bus Driver",
  BUS_CONDUCTOR:     "Bus Conductor",
  LIBRARIAN:         "Librarian",
  RECEPTIONIST:      "Receptionist",
  NURSE:             "Nurse",
  SECURITY:          "Security",
  HOUSEKEEPING:      "Housekeeping",
  CANTEEN_STAFF:     "Canteen Staff",
  IT_ADMIN:          "IT Admin",
};

export default function RoleSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userData  = getUserData();

  const userRoles   = userData?.roles || [];
  const primaryRole = userRoles[0] || "STUDENT";
  const displayName = userData?.fullName || "User";
  const displayEmail= userData?.email   || "";
  const roleLabel   = ROLE_LABELS[primaryRole] || primaryRole;

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

  const menuGroups = getMenuForRole(primaryRole);
  const isActive   = (path) => location.pathname === path;

  return (
    <div
      className="flex flex-col h-screen bg-gray-900 text-white"
      style={{ width: "260px", minWidth: "260px" }}
    >
      {/* ── Logo ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div
          className="flex items-center justify-center rounded-lg bg-yellow-500 text-gray-900 font-bold text-sm"
          style={{ width: 36, height: 36 }}
        >
          SS
        </div>
        <div>
          <p className="font-semibold text-sm text-white leading-tight">SchoolSaaS</p>
          <p className="text-xs text-yellow-400 font-medium">{roleLabel}</p>
        </div>
      </div>

      {/* ── Menu ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {menuGroups.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {group.group}
            </p>
            {group.items.map((item) => {
              const Icon   = ICON_MAP[item.icon] || LayoutDashboard;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 ${
                      active
                        ? "bg-yellow-500 text-gray-900 font-semibold"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    <span className="text-sm">{item.name}</span>
                    {active && <ChevronRight size={14} className="ml-auto" />}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User card ───────────────────────────────────────────── */}
      <div className="border-t border-gray-700 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <div
            className="flex items-center justify-center rounded-full bg-yellow-500 text-gray-900 font-bold text-sm flex-shrink-0"
            style={{ width: 36, height: 36 }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  
  );
}