import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { classTeacherService } from "../services/teacherService";
import {
  Users,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Save,
} from "lucide-react";

export default function ClassTeacher_Students() {
  const navigate = useNavigate();

  const [classroom, setClassroom]           = useState(null);
  const [students, setStudents]             = useState([]);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);
  const [page, setPage]                     = useState(0);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [finalizing, setFinalizing]         = useState(false);
  const [finalizeMsg, setFinalizeMsg]       = useState(null);

  // Add student modal
  const [showAddModal, setShowAddModal]     = useState(false);
  const [addLoading, setAddLoading]         = useState(false);
  const [addError, setAddError]             = useState(null);
  const [addSuccess, setAddSuccess]         = useState(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    admissionNumber: "", dateOfBirth: "", gender: "MALE",
    rollNumber: "", section: "",
  });

  const PAGE_SIZE = 15;

  useEffect(() => { fetchAll(); }, [page]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [crRes, stRes] = await Promise.allSettled([
        classTeacherService.getMyClassroom(),
        classTeacherService.getStudents(page, PAGE_SIZE),
      ]);
      if (crRes.status === "fulfilled") setClassroom(crRes.value.data);
      if (stRes.status === "fulfilled") {
        const d = stRes.value.data;
        setStudents(d.content || []);
        setTotalPages(d.totalPages || 0);
        setTotalElements(d.totalElements || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRolls = async () => {
    setFinalizing(true);
    setFinalizeMsg(null);
    try {
      const res = await classTeacherService.finalizeRollNumbers();
      setFinalizeMsg({ type: "success", text: res.data || "Roll numbers finalized!" });
      fetchAll();
    } catch (e) {
      setFinalizeMsg({ type: "error", text: "Could not finalize rolls. Try again." });
    } finally {
      setFinalizing(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      await classTeacherService.createStudent({
        ...form,
        rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
        section: classroom?.section || form.section,
      });
      setAddSuccess("Student added successfully!");
      setForm({ firstName: "", lastName: "", email: "", password: "",
        admissionNumber: "", dateOfBirth: "", gender: "MALE",
        rollNumber: "", section: "" });
      fetchAll();
    } catch (e) {
      setAddError(e?.response?.data || "Failed to add student. Please check all fields.");
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.admissionNumber || "").toLowerCase().includes(q) ||
      String(s.rollNumber || "").includes(q)
    );
  });

  return (
    <div className="flex">
      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/teachers/dashboard")}
                className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50 text-gray-500"
              >
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
            </div>
            {classroom && (
              <p className="text-sm text-gray-500 mt-1 ml-9 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-emerald-500" />
                Grade {classroom.grade} · Section {classroom.section}
                <span className="ml-2 font-semibold text-gray-700">{totalElements} students</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFinalizeRolls}
              disabled={finalizing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={finalizing ? "animate-spin" : ""} />
              Finalize Rolls
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
            >
              <UserPlus size={16} />
              Add Student
            </button>
          </div>
        </div>

        {finalizeMsg && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium
            ${finalizeMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {finalizeMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {finalizeMsg.text}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, admission number, or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? "Try a different search term" : "Add your first student to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Roll No.</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Admission No.</th>
                      <th className="px-4 py-3">Date of Birth</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((student, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {student.rollNumber || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
                            >
                              {(student.firstName?.[0] || "").toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">
                          {student.gender?.toLowerCase() || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.admissionNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.dateOfBirth || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.parentName
                            ? <span className="text-gray-700">{student.parentName}</span>
                            : <span className="text-gray-300 italic text-xs">Not assigned</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Page {page + 1} of {totalPages} · {totalElements} total
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Add Student Modal ──────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-500" />
                Add New Student
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setAddError(null); setAddSuccess(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {typeof addError === "string" ? addError : JSON.stringify(addError)}
                </div>
              )}
              {addSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  {addSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                  <input required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Rahul" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                  <input required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Sharma" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input required type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="student@example.com" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                <input required type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Temporary password" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admission No.</label>
                  <input value={form.admissionNumber}
                    onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="ADM2024001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Roll Number</label>
                  <input type="number" value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                  <select value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {classroom && (
                <div className="p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700 border border-emerald-200">
                  Student will be added to <strong>Grade {classroom.grade} · Section {classroom.section}</strong>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowAddModal(false); setAddError(null); setAddSuccess(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {addLoading ? (
                    <><RefreshCw size={14} className="animate-spin" /> Adding...</>
                  ) : (
                    <><Save size={14} /> Add Student</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}