import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { classTeacherService } from "../services/teacherService";
import {
  BookMarked,
  Plus,
  ChevronLeft,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Save,
  User2,
} from "lucide-react";

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

export default function ClassTeacher_Subjects() {
  const navigate = useNavigate();

  const [classroom, setClassroom]   = useState(null);
  const [subjects, setSubjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [form, setForm]             = useState({ subjectName: "", teacherId: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [crRes, subRes] = await Promise.allSettled([
        classTeacherService.getMyClassroom(),
        classTeacherService.getSubjects(),
      ]);
      if (crRes.status === "fulfilled")  setClassroom(crRes.value.data);
      if (subRes.status === "fulfilled") setSubjects(subRes.value.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await classTeacherService.addSubject({
        subjectName: form.subjectName,
        teacherId: form.teacherId ? parseInt(form.teacherId) : null,
      });
      setSuccess(`"${form.subjectName}" added successfully!`);
      setForm({ subjectName: "", teacherId: "" });
      fetchAll();
    } catch (e) {
      setError(e?.response?.data || "Failed to add subject. It may already exist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <TeacherSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teachers/dashboard")}
              className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50 text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
              {classroom && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <GraduationCap size={13} className="text-emerald-500" />
                  Grade {classroom.grade} · Section {classroom.section}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => { setShowModal(true); setError(null); setSuccess(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add Subject
          </button>
        </div>

        {/* Subject Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow h-32 animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-16 text-center">
            <BookMarked size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No subjects yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Admin may have already added subjects, or add one manually below.
            </p>
            <button
              onClick={() => { setShowModal(true); setError(null); }}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((sub, i) => {
              const colorClass = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow p-5 border-t-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: "transparent" }}
                >
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold mb-3 ${colorClass}`}>
                    <BookMarked size={11} />
                    Subject
                  </div>
                  <h3 className="font-bold text-gray-800 text-base leading-tight">
                    {sub.subjectName}
                  </h3>
                  {sub.teacher && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <User2 size={11} />
                      {sub.teacher?.user?.fullName || `Teacher #${sub.teacher?.id}`}
                    </p>
                  )}
                  {!sub.teacher && (
                    <p className="mt-2 text-xs text-gray-300 italic">No teacher assigned</p>
                  )}
                </div>
              );
            })}

            {/* Add Subject tile */}
            <button
              onClick={() => { setShowModal(true); setError(null); setSuccess(null); }}
              className="bg-white rounded-xl shadow p-5 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-sm font-semibold">Add Subject</span>
            </button>
          </div>
        )}

        {/* Info note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <strong>Note:</strong> Subjects added by the School Admin for your classroom also appear here automatically.
        </div>
      </div>

      {/* ── Add Subject Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookMarked size={20} className="text-emerald-500" />
                Add Subject
              </h2>
              <button
                onClick={() => { setShowModal(false); setError(null); setSuccess(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Subject Name *
                </label>
                <input
                  required
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="e.g. Mathematics, Science, English"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Assign Teacher ID <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Leave blank to assign later"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get Teacher ID from the teachers list in School Admin panel.
                </p>
              </div>

              {classroom && (
                <div className="p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700 border border-emerald-200">
                  Will be added to <strong>Grade {classroom.grade} · Section {classroom.section}</strong>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(null); setSuccess(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={14} /> Add Subject</>
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