import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Search, Plus, ArrowUpDown, Upload, X } from "lucide-react";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔥 Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔥 Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔥 Fetch API
  useEffect(() => {
    fetchTeachers();
  }, [page, size, sortBy, sortDir, debouncedSearch]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const response = await API.get(`/school-admin/getTeacherDetails`, {
        params: {
          page,
          size,
          sortBy,
          sortDir,
          search: debouncedSearch,
        },
      });

      setTeachers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // 🔥 Upload API Call
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      await API.post(
        "/super-admin/school-onbarding/upload-teacher-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Teachers uploaded successfully 🚀");
      setShowUploadModal(false);
      setSelectedFile(null);
      fetchTeachers();

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

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
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by Employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* ADD SINGLE */}
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
              <Plus size={18} /> Add Teacher
            </button>

            {/* BULK UPLOAD */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <Upload size={18} /> Upload Excel
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow p-5">

          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse">
              Fetching teachers...
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No teachers found
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">

                    <th
                      className="p-3 cursor-pointer"
                      onClick={() => handleSort("employeeId")}
                    >
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
                      className="p-3 cursor-pointer"
                      onClick={() => handleSort("subjectSpecialization")}
                    >
                      <div className="flex items-center gap-1">
                        Subject <ArrowUpDown size={14} />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-800">
                        {t.employeeId || "-"}
                      </td>

                      <td className="p-3">{t.qualification || "-"}</td>

                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                          {t.subjectSpecialization || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-6">

                <span className="text-gray-600 text-sm">
                  Page {page + 1} of {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 🔥 UPLOAD MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl p-6 w-[400px] relative">

              {/* CLOSE */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4">
                Upload Teachers Excel
              </h2>

              {/* FILE INPUT */}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full mb-4"
              />

              {selectedFile && (
                <p className="text-sm text-gray-600 mb-3">
                  Selected: {selectedFile.name}
                </p>
              )}

              {/* ACTION BUTTON */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}