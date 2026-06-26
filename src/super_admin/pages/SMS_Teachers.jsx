// src/super_admin/pages/SMS_Teachers.jsx
import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { getAllTeachers } from "../services/superAdminService";
import {
  UserCheck,
  UserX,
  Briefcase,
  GraduationCap,
  Calendar,
  Search,
  User,
  RefreshCw,
  Download,
} from "lucide-react";

export default function Teachers() {
  const [teachers,   setTeachers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");

  const fetchTeachers = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getAllTeachers();
      setTeachers(res.data);
    } catch (error) {
      console.error("Error fetching teachers", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const totalTeachers    = teachers.length;
  const activeTeachers   = teachers.filter((t) => t.active).length;
  const inactiveTeachers = totalTeachers - activeTeachers;

  const filtered = teachers.filter((t) =>
    (t.employeeId || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.subjectSpecialization || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    if (!teachers.length) return;
    const headers = [
      "Employee ID",
      "Specialization",
      "Qualification",
      "Salary",
      "Joined",
      "Status",
    ];
    const rows = teachers.map((t) => [
      t.employeeId ?? "",
      t.subjectSpecialization ?? "",
      t.qualification ?? "",
      t.salary ?? "",
      t.dateOfJoining ?? "",
      t.active ? "Active" : "Inactive",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "teachers_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teachers Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and monitor teaching staff details and status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTeachers(true)}
              disabled={refreshing}
              className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Teachers"
            value={totalTeachers}
            icon={<GraduationCap size={22} className="text-blue-600" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="Active"
            value={activeTeachers}
            icon={<UserCheck size={22} className="text-green-600" />}
            bg="bg-green-50"
          />
          <StatCard
            label="Inactive"
            value={inactiveTeachers}
            icon={<UserX size={22} className="text-red-600" />}
            bg="bg-red-50"
          />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-t-2xl border-x border-t border-gray-200 flex justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by ID or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-medium">
                Fetching faculty list...
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-5">Employee</th>
                    <th className="p-5">Specialization</th>
                    <th className="p-5">Qualification</th>
                    <th className="p-5">Salary</th>
                    <th className="p-5">Joined</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {teacher.employeeId}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {teacher.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase size={14} className="text-blue-500" />
                          {teacher.subjectSpecialization ?? "N/A"}
                        </div>
                      </td>
                      <td className="p-5 text-sm">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                          {teacher.qualification ?? "N/A"}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-gray-700 font-semibold">
                        {teacher.salary
                          ? `₹${Number(teacher.salary).toLocaleString("en-IN")}`
                          : "N/A"}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          {teacher.dateOfJoining
                            ? new Date(teacher.dateOfJoining).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" }
                              )
                            : "N/A"}
                        </div>
                      </td>
                      <td className="p-5">
                        {teacher.active ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <GraduationCap className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No teachers found.</p>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right font-medium">
            Showing {filtered.length} of {totalTeachers} teachers
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
    </div>
  );
}
