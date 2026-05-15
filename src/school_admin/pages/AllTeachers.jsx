import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import TeacherProfileModal from "../components/TeacherProfileModal";
import {
  Search, Plus, ArrowUpDown, Upload, X,
  FileText, ChevronLeft, ChevronRight, User,
} from "lucide-react";

// ── small reusable field ──────────────────────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, required, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                   placeholder:text-slate-300 transition"
      />
    </div>
  );
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  employeeId: "",
  qualification: "",
  subjectSpecialization: "",
  joiningDate: "",
  salary: "",
};

export default function Teachers() {
  const queryClient = useQueryClient();

  // PAGINATION
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // SORTING
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // SEARCH
  const [search, setSearch] = useState("");

  // MODALS
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTeacher, setViewTeacher] = useState(null); // 👈 Teacher profile modal

  // ADD TEACHER FORM
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // ── FETCH TEACHERS ────────────────────────────────────────────────────────
  const { data: teacherData, isLoading: loading, refetch: fetchTeachers } = useQuery({
    queryKey: ["teachers", page, sortBy, sortDir, search],
    queryFn: async () => {
      const res = await API.get("/school-admin/getTeacherDetails", {
        params: { page, size: itemsPerPage, sortBy, sortDir, search },
      });
      setTotalPages(res.data.totalPages || 1);
      return res.data.content || [];
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const teachers = teacherData || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // ── BULK UPLOAD ───────────────────────────────────────────────────────────
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

  // ── ADD TEACHER ───────────────────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setAddError("");
    setAddSuccess(false);
    setShowAddModal(true);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const userData = getUserData();
      const schoolId = userData?.schoolId || localStorage.getItem("schoolId");
      const payload = {
        ...form,
        schoolId: schoolId ? Number(schoolId) : undefined,
        salary: form.salary ? Number(form.salary) : undefined,
        joiningDate: form.joiningDate || undefined,
      };
      await API.post("/school-admin/create-teachers", payload);
      setAddSuccess(true);
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(false);
        fetchTeachers();
      }, 1400);
    } catch (err) {
      const msg = err?.response?.data;
      setAddError(typeof msg === "string" ? msg : "Failed to add teacher. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
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
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
            >
              <Plus size={18} /> Add Teacher
            </button>
          </div>
        </div>

        {/* MAIN CARD */}
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
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="text-indigo-600 font-bold">{teachers.length}</span> teachers
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
                        {col.replace(/([A-Z])/g, " $1")}
                        <ArrowUpDown size={14} className={sortBy === col ? "text-indigo-600" : "text-slate-300"} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="p-6">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={48} className="mb-2" />
                        <p className="text-lg font-medium">No results found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setViewTeacher(t)} // 👈 row click se modal open
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {(t.userName || t.fullName || "T").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">{t.userName || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{t.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium">
                          {t.qualification || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-indigo-700/10">
                          {t.subjectSpecialization || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewTeacher(t); }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page + 1}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
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
                      page === p
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── TEACHER PROFILE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {viewTeacher && (
          <TeacherProfileModal
            teacher={viewTeacher}
            onClose={() => setViewTeacher(null)}
            onRefresh={() => {
              queryClient.invalidateQueries(["teachers"]);
              fetchTeachers();
            }}
          />
        )}
      </AnimatePresence>

      {/* ── BULK IMPORT MODAL ─────────────────────────────────────────────── */}
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
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all mb-6">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedFile
                      ? <span className="font-semibold text-indigo-600">{selectedFile.name}</span>
                      : "Click to upload Excel file"}
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

      {/* ── ADD TEACHER MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
                    <p className="text-xs text-slate-400">All fields marked * are required</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="px-7 py-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleFormChange} required />
                  </div>
                  <Field label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
                  <Field label="Phone" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleFormChange} required />
                  <Field label="Password" name="password" type="password" value={form.password} onChange={handleFormChange} required placeholder="Min 6 characters" />
                  <Field label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleFormChange} />
                  <Field label="Qualification" name="qualification" value={form.qualification} onChange={handleFormChange} placeholder="e.g. B.Ed, M.Sc" />
                  <Field label="Subject Specialization" name="subjectSpecialization" value={form.subjectSpecialization} onChange={handleFormChange} placeholder="e.g. Mathematics" />
                  <Field label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleFormChange} />
                  <Field label="Salary (₹)" name="salary" type="number" value={form.salary} onChange={handleFormChange} placeholder="e.g. 35000" />
                </div>

                {addError && (
                  <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
                    {addError}
                  </div>
                )}
                {addSuccess && (
                  <div className="mt-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                    ✅ Teacher added successfully!
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || addSuccess}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {adding
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding…</>
                      : "Add Teacher"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}