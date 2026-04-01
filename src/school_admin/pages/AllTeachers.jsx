import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Search, Plus, ArrowUpDown, Upload, X } from "lucide-react";

export default function Teachers() {

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // SORTING
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // SEARCH
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // MODAL
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔥 Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // FETCH
  useEffect(() => {
    fetchTeachers();
  }, [page, sortBy, sortDir, debouncedSearch]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {

      const res = await API.get("/school-admin/getTeacherDetails", {
        params: {
          page,
          size: itemsPerPage,
          sortBy,
          sortDir,
          search: debouncedSearch,
        },
      });

      const data = res.data;
      console.log("Fetched teachers:", data); // DEBUG LOG
      setTeachers(data.content || []);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  // SORT
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!selectedFile) return alert("Select file first");

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await API.post(
        "/super-admin/school-onbarding/upload-teacher-excel",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status !== 200) throw new Error();

      alert("Teachers uploaded ✅");
      setShowUploadModal(false);
      setSelectedFile(null);
      fetchTeachers();

    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Teachers
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow"
        >

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">

            <h2 className="text-lg font-semibold">Teacher List</h2>

            <div className="flex gap-2">

              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg"
                />
              </div>

              {/* ADD */}
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={16} /> Add
              </button>

              {/* UPLOAD */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload size={16} /> Bulk Upload
              </button>

            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="text-center py-6">Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <p className="text-center py-6 text-gray-400">No teachers found</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">

                  <th onClick={() => handleSort("email")} className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1">
                      Email <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th onClick={() => handleSort("userName")} className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1">
                      Names <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th onClick={() => handleSort("qualification")} className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1">
                      Qualification <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th onClick={() => handleSort("subjectSpecialization")} className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1">
                      Subject <ArrowUpDown size={14} />
                    </div>
                  </th>

                </tr>
              </thead>

              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">

                    <td className="p-3 font-medium">
                      {t.email || "-"}
                    </td>
                   
                      <td className="p-3 font-medium">
                        {t.userName || "-"}
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
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-6">

            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>

            <div className="flex gap-2">

              <button
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 0}
                className="px-3 py-1 rounded-lg border"
              >
                Prev
              </button>

              {[...Array(totalPages).keys()].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-lg ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-lg border"
              >
                Next
              </button>

            </div>
          </div>

        </motion.div>
      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Bulk Upload</h2>
              <X onClick={() => setShowUploadModal(false)} className="cursor-pointer" />
            </div>

            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="mb-4"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}