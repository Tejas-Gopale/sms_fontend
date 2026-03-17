import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Search, Plus, ArrowUpDown } from "lucide-react";

export default function Teachers() {

  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, [page, size, sortBy, sortDir]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/school-admin/getTeacherDetails?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      );

      setTeachers(response.data.content);
      setTotalPages(response.data.totalPages);

    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // Local search filter (frontend)
  const filteredTeachers = teachers.filter((t) =>
    t.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

          <h1 className="text-3xl font-bold text-gray-800">
            Teachers Management
          </h1>

          <div className="flex gap-3 w-full md:w-auto">

            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* ADD BUTTON */}
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
              <Plus size={18} /> Add
            </button>

          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl shadow p-5">

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading teachers...
            </div>
          ) : (

            <>
              <table className="w-full text-sm">

                {/* HEADER */}
                <thead>
                  <tr className="text-gray-500 border-b">

                   <th className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1">
                      Employee ID <ArrowUpDown size={14} />
                    </div>
                  </th>

                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => handleSort("qualification")}
                    >
                      <div className="flex items-center gap-1">
                      Qualification <ArrowUpDown size={14} />
                      </div>
                    </th>

                    <th
                      className="p-3 cursor-pointer flex"
                      onClick={() => handleSort("subjectSpecialization")}
                    >
                      <div className="flex items-center gap-1">
                      Subject <ArrowUpDown size={14} />
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b hover:bg-gray-50 transition"
                      >

                        <td className="p-3 font-medium text-gray-800">
                          {t.employeeId || "-"}
                        </td>

                        <td className="p-3">
                          {t.qualification || "-"}
                        </td>

                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                            {t.subjectSpecialization || "-"}
                          </span>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-gray-400">
                        No teachers found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

              {/* PAGINATION */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">

                {/* PAGE INFO */}
                <span className="text-gray-600 text-sm">
                  Page {page + 1} of {totalPages}
                </span>

                {/* BUTTONS */}
                <div className="flex gap-2">

                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                  >
                    Prev
                  </button>

                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                  >
                    Next
                  </button>

                </div>

                {/* PAGE SIZE */}
                <select
                  value={size}
                  onChange={(e) => {
                    setPage(0);
                    setSize(Number(e.target.value));
                  }}
                  className="border px-3 py-2 rounded-lg"
                >
                  <option value={5}>5 rows</option>
                  <option value={10}>10 rows</option>
                  <option value={20}>20 rows</option>
                </select>

              </div>
            </>
          )}
        </div>
      </div>  
    </div>
  );
}