import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Plus } from "lucide-react";

export default function Classes() {

  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // 📌 FETCH DATA
  const loadClasses = async () => {
    try {
      setLoading(true);

      const res = await API.get("/school-admin/getClassRoom", {
        params: {
          page: page,
          size: 10
        }
      });

      setClasses(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);

    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [page]);

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-sm text-gray-500">
              Manage all classroom data
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow">
            <Plus size={16} /> Add Class
          </button>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-auto max-h-[600px]">

            <table className="w-full text-sm">

              {/* HEADER */}
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left text-gray-600">

                  <th className="p-3">Class</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Class Teacher</th>
                  <th className="p-3">Subjects</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>

                </tr>
              </thead>

              {/* BODY */}
              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      Loading classes...
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-400">
                      No classes found
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => (

                    <tr
                      key={c.id}
                      className="border-t hover:bg-gray-50 transition"
                    >

                      {/* CLASS */}
                      <td className="p-3 font-medium text-gray-800">
                        {c.grade}
                      </td>

                      {/* SECTION */}
                      <td className="p-3">
                        {c.section}
                      </td>

                      {/* TEACHER */}
                      <td className="p-3">
                        {c.classTeacher?.employeeId || "Not Assigned"}
                      </td>

                      {/* SUBJECTS */}
                      <td className="p-3">

                        {c.subjects?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">

                            {c.subjects.slice(0, 2).map((sub) => (
                              <span
                                key={sub.id}
                                className="bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded"
                              >
                                {sub.subjectName}
                              </span>
                            ))}

                            {c.subjects.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{c.subjects.length - 2} more
                              </span>
                            )}

                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No Subjects
                          </span>
                        )}

                      </td>

                      {/* STATUS */}
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded ${
                          c.active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-center">
                        <button className="text-blue-600 text-sm hover:underline">
                          View
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">

          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}