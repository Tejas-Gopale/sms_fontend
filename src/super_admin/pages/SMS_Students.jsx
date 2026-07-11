// src/super_admin/pages/SMS_Students.jsx
import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { getAllStudents } from "../services/superAdminService";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

export default function Students() {
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [filterGender, setFilterGender] = useState("ALL");

  const fetchStudents = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Derived stats
  const totalStudents    = students.length;
  const activeStudents   = students.filter((s) => s.active).length;
  const inactiveStudents = totalStudents - activeStudents;

  // Filtered list
  const filtered = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      (s.admissionNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchesGender =
      filterGender === "ALL"
        ? true
        : s.gender?.toUpperCase() === filterGender;
    return matchesSearch && matchesGender;
  });

  const handleExport = () => {
    if (!students.length) return;
    const headers = [
      "Name",
      "Admission No",
      "Roll No",
      "Gender",
      "School",
      "Section",
      "Status",
    ];
    const rows = students.map((s) => [
      `${s.firstName} ${s.lastName}`,
      s.admissionNumber ?? "",
      s.rollNumber ?? "",
      s.gender ?? "",
      s.user?.school_Identity?.schoolName ?? "",
      s.section ?? "",
      s.active ? "Active" : "Inactive",
    ]);
    const csv =
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "students_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Students Directory
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and view all students across the network.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStudents(true)}
              disabled={refreshing}
              className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
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

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Students"
            count={totalStudents}
            icon={<Users className="text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Active"
            count={activeStudents}
            icon={<UserCheck className="text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            title="Inactive"
            count={inactiveStudents}
            icon={<UserX className="text-red-600" />}
            bgColor="bg-red-50"
          />
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-t-xl border-x border-t border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {["ALL", "MALE", "FEMALE"].map((g) => (
              <button
                key={g}
                onClick={() => setFilterGender(g)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition ${
                  filterGender === g
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Filter size={13} />
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-500 font-medium">
                Fetching student records...
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">School</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/30 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {student.admissionNumber}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {student.rollNumber ?? "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm capitalize text-gray-600">
                        {student.gender}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-[180px] truncate">
                        {student.user?.school_Identity?.schoolName || "—"}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">
                        {student.section}
                      </td>
                      <td className="p-4">
                        {student.active ? (
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
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No students found.</p>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right font-medium">
            Showing {filtered.length} of {totalStudents} students
          </p>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, count, icon, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
    </div>
  );
}
