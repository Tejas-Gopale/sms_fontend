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
      alert("Upload failed ❌");
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
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import API from "../../common/services/api";
// import { Search, Plus, ArrowUpDown, Upload, X } from "lucide-react";

// export default function Teachers() {

//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // PAGINATION
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const itemsPerPage = 10;

//   // SORTING
//   const [sortBy, setSortBy] = useState("id");
//   const [sortDir, setSortDir] = useState("asc");

//   // SEARCH
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   // MODAL
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   // 🔥 Debounce
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//       setPage(0);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [search]);

//   // FETCH
//   useEffect(() => {
//     fetchTeachers();
//   }, [page, sortBy, sortDir, debouncedSearch]);

//   const fetchTeachers = async () => {
//     setLoading(true);
//     try {

//       const res = await API.get("/school-admin/getTeacherDetails", {
//         params: {
//           page,
//           size: itemsPerPage,
//           sortBy,
//           sortDir,
//           search: debouncedSearch,
//         },
//       });

//       const data = res.data;
//       console.log("Fetched teachers:", data); // DEBUG LOG
//       setTeachers(data.content || []);
//       setTotalPages(data.totalPages || 1);

//     } catch (err) {
//       console.error("Error fetching teachers:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // SORT
//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortBy(field);
//       setSortDir("asc");
//     }
//   };

//   // UPLOAD
//   const handleUpload = async () => {
//     if (!selectedFile) return alert("Select file first");

//     try {
//       setUploading(true);

//       const formData = new FormData();
//       formData.append("file", selectedFile);

//       const res = await API.post(
//         "/super-admin/school-onbarding/upload-teacher-excel",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (res.status !== 200) throw new Error();

//       alert("Teachers uploaded ✅");
//       setShowUploadModal(false);
//       setSelectedFile(null);
//       fetchTeachers();

//     } catch (err) {
//       console.error(err);
//       alert("Upload failed ❌");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="flex">

//       <SchoolAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">

//         {/* TITLE */}
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-3xl font-bold mb-6"
//         >
//           Teachers
//         </motion.h1>

//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow"
//         >

//           {/* HEADER */}
//           <div className="flex justify-between items-center mb-4 flex-wrap gap-3">

//             <h2 className="text-lg font-semibold">Teacher List</h2>

//             <div className="flex gap-2">

//               {/* SEARCH */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="pl-9 pr-3 py-2 border rounded-lg"
//                 />
//               </div>

//               {/* ADD */}
//               <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
//                 <Plus size={16} /> Add
//               </button>

//               {/* UPLOAD */}
//               <button
//                 onClick={() => setShowUploadModal(true)}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//               >
//                 <Upload size={16} /> Bulk Upload
//               </button>

//             </div>
//           </div>

//           {/* TABLE */}
//           {loading ? (
//             <p className="text-center py-6">Loading teachers...</p>
//           ) : teachers.length === 0 ? (
//             <p className="text-center py-6 text-gray-400">No teachers found</p>
//           ) : (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b text-gray-500">

//                   <th onClick={() => handleSort("email")} className="p-3 cursor-pointer">
//                     <div className="flex items-center gap-1">
//                       Email <ArrowUpDown size={14} />
//                     </div>
//                   </th>

//                   <th onClick={() => handleSort("userName")} className="p-3 cursor-pointer">
//                     <div className="flex items-center gap-1">
//                       Names <ArrowUpDown size={14} />
//                     </div>
//                   </th>

//                   <th onClick={() => handleSort("qualification")} className="p-3 cursor-pointer">
//                     <div className="flex items-center gap-1">
//                       Qualification <ArrowUpDown size={14} />
//                     </div>
//                   </th>

//                   <th onClick={() => handleSort("subjectSpecialization")} className="p-3 cursor-pointer">
//                     <div className="flex items-center gap-1">
//                       Subject <ArrowUpDown size={14} />
//                     </div>
//                   </th>

//                 </tr>
//               </thead>

//               <tbody>
//                 {teachers.map((t) => (
//                   <tr key={t.id} className="border-b hover:bg-gray-50">

//                     <td className="p-3 font-medium">
//                       {t.email || "-"}
//                     </td>
                   
//                       <td className="p-3 font-medium">
//                         {t.userName || "-"}
//                       </td>

//                     <td className="p-3">
//                       {t.qualification || "-"}
//                     </td>

//                     <td className="p-3">
//                       <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
//                         {t.subjectSpecialization || "-"}
//                       </span>
//                     </td>

//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}

//           {/* PAGINATION */}
//           <div className="flex justify-between items-center mt-6">

//             <span className="text-sm text-gray-500">
//               Page {page + 1} of {totalPages}
//             </span>

//             <div className="flex gap-2">

//               <button
//                 onClick={() => setPage((prev) => prev - 1)}
//                 disabled={page === 0}
//                 className="px-3 py-1 rounded-lg border"
//               >
//                 Prev
//               </button>

//               {[...Array(totalPages).keys()].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => setPage(p)}
//                   className={`px-3 py-1 rounded-lg ${
//                     page === p
//                       ? "bg-blue-600 text-white"
//                       : "bg-white border"
//                   }`}
//                 >
//                   {p + 1}
//                 </button>
//               ))}

//               <button
//                 onClick={() => setPage((prev) => prev + 1)}
//                 disabled={page >= totalPages - 1}
//                 className="px-3 py-1 rounded-lg border"
//               >
//                 Next
//               </button>

//             </div>
//           </div>

//         </motion.div>
//       </div>

//       {/* UPLOAD MODAL */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

//           <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">

//             <div className="flex justify-between mb-4">
//               <h2 className="text-xl font-semibold">Bulk Upload</h2>
//               <X onClick={() => setShowUploadModal(false)} className="cursor-pointer" />
//             </div>

//             <input
//               type="file"
//               accept=".xlsx"
//               onChange={(e) => setSelectedFile(e.target.files[0])}
//               className="mb-4"
//             />

//             <button
//               onClick={handleUpload}
//               disabled={uploading}
//               className="w-full bg-blue-600 text-white py-2 rounded"
//             >
//               {uploading ? "Uploading..." : "Upload File"}
//             </button>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }