import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Search, Plus, ArrowUpDown, Upload, X, FileText, ChevronLeft, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchTeachers();
  }, [page, sortBy, sortDir, debouncedSearch]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/school-admin/getTeacherDetails", {
        params: { page, size: itemsPerPage, sortBy, sortDir, search: debouncedSearch },
      });
      setTeachers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching teachers:", err);
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      await API.post("/super-admin/school-onbarding/upload-teacher-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      fetchTeachers();
    } catch (err) {
      alert("Upload failed ❌",err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold text-slate-800 tracking-tight"
            >
              Teacher Management
            </motion.h1>
            <p className="text-slate-500 mt-1">View and manage all registered educators.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
            >
              <Upload size={18} /> Bulk Import
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium">
              <Plus size={18} /> Add Teacher
            </button>
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* TABLE CONTROLS */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Showing {teachers.length} teachers
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["userName", "email", "qualification", "subjectSpecialization"].map((col) => (
                    <th 
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {col.replace(/([A-Z])/g, ' $1')}
                        <ArrowUpDown size={14} className={sortBy === col ? "text-indigo-600" : "text-slate-300"} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="4" className="p-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={48} className="mb-2" />
                        <p className="text-lg font-medium">No results found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{t.userName || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{t.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium">{t.qualification || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-indigo-700/10">
                          {t.subjectSpecialization || "General"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page + 1}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === p ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MODERN MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Bulk Teacher Upload</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all mb-6">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedFile ? <span className="font-semibold text-indigo-600">{selectedFile.name}</span> : "Click to upload Excel file"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".xlsx" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </label>

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
              >
                {uploading ? "Processing..." : "Confirm Upload"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}