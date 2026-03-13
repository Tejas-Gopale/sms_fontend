import { Link } from "react-router-dom";
import { getUserRole, logout } from "../utils/auth";

export default function Sidebar() {

  const role = getUserRole();

  const menu = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/super-admin/dashboard" },
      { name: "Schools", path: "/super-admin/schools" },
      { name: "Onboard School", path: "/super-admin/onboard-school" },
      { name: "Subscriptions", path: "/super-admin/subscription" }
    ],

    SCHOOL_ADMIN: [
      { name: "Dashboard", path: "/school-admin/dashboard" },
      { name: "Teachers", path: "/school-admin/teachers" },
      { name: "Students", path: "/school-admin/students" },
      { name: "Parents", path: "/school-admin/parents" },
      { name: "Fees", path: "/school-admin/fees" }
    ],

    TEACHER: [
      { name: "Dashboard", path: "/teacher/dashboard" },
      { name: "Attendance", path: "/teacher/attendance" },
      { name: "Marks", path: "/teacher/marks" }
    ],

    STUDENT: [
      { name: "Dashboard", path: "/student/dashboard" },
      { name: "Marks", path: "/student/marks" },
      { name: "Fees", path: "/student/fees" }
    ],

    PARENT: [
      { name: "Dashboard", path: "/parent/dashboard" },
      { name: "Child Marks", path: "/parent/marks" },
      { name: "Fees", path: "/parent/fees" }
    ]
  };

  return (
    <div className="w-60 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl mb-6">School SaaS</h2>

      {menu[role]?.map((item) => (
        <Link key={item.name} to={item.path}>
          <div className="mb-4 hover:text-yellow-400">
            {item.name}
          </div>
        </Link>
      ))}

      <button
        onClick={logout}
        className="mt-10 bg-red-500 px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}